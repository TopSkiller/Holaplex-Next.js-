import { ActivityContent } from '@/common/components/elements/ActivityContent';
import Image from 'next/image';
import { useAppHeaderSettings } from '@/common/components/elements/AppHeaderSettingsProvider';
import { WalletPill } from '@/common/components/elements/WalletIndicator';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWalletProfileLazyQuery } from 'src/graphql/indexerTypes';
import { useTwitterHandle } from '@/common/hooks/useTwitterHandle';
import { useRouter } from 'next/router';
import { PublicKey } from '@solana/web3.js';
import { mq } from '@/common/styles/MediaQuery';

const ActivityLanding = () => {
  const router = useRouter();
  const { wallet } = router.query;
  const publicKey = wallet ? new PublicKey(wallet as string) : null;
  const { toggleDisableMarginBottom } = useAppHeaderSettings();
  const [didToggleDisableMarginBottom, setDidToggleDisableMarginBottom] = useState(false);
  const [queryWalletProfile, walletProfile] = useWalletProfileLazyQuery();
  const { data: twitterHandle } = useTwitterHandle(publicKey);

  useEffect(() => {
    if (!twitterHandle) return;
    queryWalletProfile({
      variables: {
        handle: twitterHandle,
      },
    });
  }, [queryWalletProfile, twitterHandle]);

  useEffect(() => {
    if (!didToggleDisableMarginBottom) {
      setDidToggleDisableMarginBottom(true);
      toggleDisableMarginBottom();
    }
  }, [didToggleDisableMarginBottom, toggleDisableMarginBottom]);

  const bannerUrl = walletProfile.data?.profile?.bannerImageUrl;
  const imageUrl = walletProfile.data?.profile?.profileImageUrlHighres;
  const textOverride = twitterHandle;

  const bannerBackgroundImage = !!bannerUrl
    ? `url(${bannerUrl})`
    : 'url(/images/gradients/gradient-5.png)'; // TODO: Fetch from wallet (DERIVE).
  const profilePictureImage = imageUrl ?? '/images/gradients/gradient-3.png'; // TODO: Fetch from wallet [here-too] (DERIVE).

  return (
    <>
      <HeadingContainer>
        <Banner style={{ backgroundImage: bannerBackgroundImage }} />
      </HeadingContainer>
      <ContentCol>
        <Profile>
          <ProfilePictureContainer>
            <ProfilePicture src={profilePictureImage} width={PFP_SIZE} height={PFP_SIZE} />
          </ProfilePictureContainer>
          <WalletPillContainer>
            <WalletPill disableBackground textOverride={textOverride} />
          </WalletPillContainer>
        </Profile>
        <ActivityContentWrapper>
          <ActivityContent publicKey={publicKey} />
        </ActivityContentWrapper>
      </ContentCol>
    </>
  );
};

export default ActivityLanding;

const PFP_SIZE = 90;
const BOX_SIZE = 1400;

const WalletPillContainer = styled.div`
  margin-top: 80px;
`;

const Profile = styled.div`
  padding-left: calc(20px + 0.5rem);
  min-width: 348px;
  position: relative;
  ${mq('md')} {
    padding-left: calc(${PFP_SIZE}px + 0.5rem);
  }
`;

const ActivityContentWrapper = styled.section`
  margin-top: ${PFP_SIZE / 2}px;
`;

const ContentCol = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  padding-right: 20px;
  ${mq('md')} {
    padding-left: ${PFP_SIZE - 40}px;
    padding-right: ${PFP_SIZE - 40}px;
    max-width: ${BOX_SIZE}px;
    flex-direction: row;
  }
  ${mq('lg')} {
    padding-left: ${PFP_SIZE - 20}px;
    padding-right: ${PFP_SIZE - 20}px;
  }
`;

const HeadingContainer = styled.header``;

const ProfilePictureContainer = styled.div`
  position: absolute;
  top: ${-PFP_SIZE / 2}px;
  left: 20px;
  ${mq('md')} {
    left: 90px;
  }
  @media (min-width: ${BOX_SIZE - PFP_SIZE}) {
    left: 0px;
  }
`;

const ProfilePicture = styled(Image)`
  border-radius: 50%;
  border: 5px solid #161616 !important;
`;

const Banner = styled.div`
  width: 100%;
  height: 265px;
  background-repeat: no-repeat;
  background-size: cover;
  ${mq('lg')} {
    background-attachment: fixed;
    background-size: 100%;
  }
`;
