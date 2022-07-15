import React, { Dispatch, FC, SetStateAction, useContext, useMemo } from 'react';
import { ApolloQueryResult, OperationVariables } from '@apollo/client';
import { None } from './OfferForm';
import NFTPreview from '@/components/NFTPreview';
import { DisplaySOL } from './CurrencyHelpers';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Button from './Button';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { Marketplace, initMarketplaceSDK, Nft } from '@holaplex/marketplace-js-sdk';
import { Wallet } from '@metaplex/js';
import { Action, MultiTransactionContext } from '../views/_global/MultiTransaction';
import { useAnalytics } from 'src/views/_global/AnalyticsProvider';
import { TOS_LINK } from '../modules/crossmint/constants';
import { useMutation } from 'react-query';
import { acceptTOS } from '../modules/crossmint';
import { solToLamports } from '../lib/utils/conversion';

interface SellFormSchema {
  amount: string;
}

interface SellFormProps {
  nft?: Nft;
  marketplace: Marketplace;
  refetch:
    | ((variables?: Partial<OperationVariables> | undefined) => Promise<ApolloQueryResult<None>>)
    | (() => void);
  loading: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: Boolean) => void);
}

const schema = zod.object({
  amount: zod
    .string()
    .nonempty({ message: `Must be an amount` })
    .regex(/^[0-9.]*$/, { message: `Must be a number` }),
});

export const FeeItem = ({
  sellerFeeBasisPoints,
  amount,
  title,
  result = false,
}: {
  result?: boolean;
  title: string;
  sellerFeeBasisPoints: number;
  amount: number;
}) => {
  return (
    <li className={`mb-0 mt-2 flex justify-between `}>
      <p className={`mb-0 text-base ${result ? `text-white` : `text-gray-300`}`}>{title}</p>
      <div className={`mb-0 flex justify-end`}>
        <p className={`mb-0 mr-2 text-base ${result ? `text-white` : `text-gray-300`}`}>
          {sellerFeeBasisPoints / 100}%
        </p>
        <DisplaySOL
          iconVariant={`small`}
          amount={amount}
          className={`text-base font-normal ${result ? `text-white` : `text-gray-300`}`}
        />
      </div>
    </li>
  );
};

const SellForm: FC<SellFormProps> = ({ nft, marketplace, refetch, loading, setOpen }) => {
  const { publicKey, signTransaction } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const sdk = useMemo(() => initMarketplaceSDK(connection, wallet as Wallet), [connection, wallet]);
  const { trackNFTEvent } = useAnalytics();

  const {
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<SellFormSchema>({
    resolver: zodResolver(schema),
  });

  const { mutate: acceptCrossmintTOS } = useMutation(acceptTOS, {
    onSuccess: (data) => {},
    onError: (err) => {
      console.log(err);
      toast.error(`Error whilst accepting Crossmint Terms of Service`);
    },
  });

  const { runActions, hasActionPending } = useContext(MultiTransactionContext);

  const listPrice = Number(watch('amount')) * LAMPORTS_PER_SOL;

  const auctionHouses = marketplace?.auctionHouses || [];
  const sellerFee = nft?.sellerFeeBasisPoints || 1000;
  const auctionHouseSellerFee = auctionHouses[0]?.sellerFeeBasisPoints || 200;
  const royalties = (listPrice * sellerFee) / 10000;
  const auctionHouseFee = (listPrice * auctionHouseSellerFee) / 10000;

  const onSell = async (amount: number) => {
    if (amount && nft) {
      await sdk
        .transaction()
        .add(sdk.listings(auctionHouses[0]).post({ amount: solToLamports(amount), nft }))
        .send();
    }
  };

  const sellTx = async ({ amount }: SellFormSchema) => {
    if (!publicKey || !signTransaction || !nft || !amount) {
      return;
    }
    acceptCrossmintTOS(publicKey.toBase58());
    const sellAmount = Number(amount);

    const newActions: Action[] = [
      {
        name: `Listing your NFT...`,
        id: `listNFT`,
        action: onSell,
        param: sellAmount,
      },
    ];

    trackNFTEvent('NFT Listed Init', sellAmount, nft);

    await runActions(newActions, {
      onActionSuccess: async () => {
        toast.success(`Confirmed listing success`);
        trackNFTEvent('NFT Listed Success', sellAmount, nft);
        await refetch();
      },
      onActionFailure: async (err) => {
        toast.error(err.message);
        await refetch();
      },
      onComplete: async () => {
        await refetch();
        setOpen(false);
      },
    });
  };

  if (!nft || !marketplace) {
    return null;
  }

  return (
    <div>
      {nft && <NFTPreview loading={loading} nft={nft as Nft | any} />}
      <div className={`mt-8 flex items-start justify-between`}>
        {Number(auctionHouses[0]?.stats?.floor) > 0 ? (
          <div className={`flex flex-col justify-start`}>
            <p className={`text-base font-medium text-gray-300`}>Floor price</p>
            <DisplaySOL className={`font-medium`} amount={Number(auctionHouses[0].stats?.floor)} />
          </div>
        ) : (
          <div className={`flex w-full`} />
        )}
        {Number(auctionHouses[0].stats?.average) > 0 ? (
          <div className={`flex flex-col justify-end`}>
            <p className={`text-base font-medium text-gray-300`}>Average sale price</p>
            <div className={`ml-2`}>
              <DisplaySOL
                className={`font-medium`}
                amount={Number(auctionHouses[0].stats?.average)}
              />
            </div>
          </div>
        ) : (
          <div className={`flex w-full`} />
        )}
      </div>
      <div className={`mt-8`}>
        <form className={`grow text-left`} onSubmit={handleSubmit(sellTx)}>
          <p className={`mb-2 text-base font-medium`}>Price</p>
          <div className={`sol-input mb-1 rounded-lg border-2 border-gray-800`}>
            <input
              {...register('amount', { required: true })}
              autoFocus
              className={`input w-full bg-gray-900 py-2 text-white`}
              placeholder="0.00"
            />
          </div>
          <div data-testid={`amount-error-msg`} className={`p-2`}>
            {errors.amount?.message && (
              <p className={`text-sm text-red-500`}>{errors.amount.message}</p>
            )}
          </div>
          <ul className={`mt-6 flex w-full flex-col`}>
            <FeeItem
              title={`Creator royalty`}
              sellerFeeBasisPoints={sellerFee}
              amount={royalties}
            />
            <FeeItem
              title={`Transaction fees`}
              sellerFeeBasisPoints={auctionHouseSellerFee}
              amount={auctionHouseFee}
            />

            <div className={`mt-5 border-t border-gray-700 pt-3`}>
              <FeeItem
                result={true}
                title={`You will receive`}
                sellerFeeBasisPoints={10000 - sellerFee - auctionHouseSellerFee}
                amount={listPrice - royalties - auctionHouseFee}
              />
            </div>
          </ul>
          <div className={`mt-12 w-full`}>
            <Button
              disabled={loading || isSubmitting}
              loading={loading || isSubmitting}
              htmlType={`submit`}
              block
              className={`w-full`}
            >
              List NFT
            </Button>
          </div>
          <div className={`mt-10 w-full`}>
            <p className={`m-0 text-center text-xs text-gray-300`}>
              By listing this NFT you are agreeing to Crossmint&apos;s{' '}
              <a href={TOS_LINK} target={`_blank`} className={`underline`}>
                Terms of Service
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellForm;
