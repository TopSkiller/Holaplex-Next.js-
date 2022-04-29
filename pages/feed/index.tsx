import { ReactElement, useState } from 'react';
import { ActivityContent } from '@/common/components/elements/ActivityContent';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { PublicKey } from '@solana/web3.js';
import { showFirstAndLastFour } from '@/modules/utils/string';
import { ProfileContainer } from '@/common/components/elements/ProfileContainer';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';

import FeedLayout from '@/layouts/FeedLayout';
import { useFeedQuery } from 'src/graphql/indexerTypes';
import { FeedCard } from '@/common/components/feed/FeedCard';
import { InView } from 'react-intersection-observer';
import { TailSpin } from 'react-loader-spinner';
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   return {
//     props: {
//     },
//   };
// };

// export const FEED_ITEMS: IFeedItem[] = [
//   {
//     id: 'asdf',
//     type: 'OUTBID',
//     timestamp: '2022-03-14T15:00:00Z',
//     sourceUser: PROFILES.wga,
//     toUser: PROFILES.kayla, //
//     solAmount: 20,
//     nft: {
//       creator: PROFILES.sleepr,
//       address: 'sjjxjcjvxcv',
//       imageURL:
//         'https://assets.holaplex.tools/ipfs/bafybeich4igoclnufqimgeghk3blqpqhdjzu6ilhuvd4hje5kcvlh2wpiu?width=600',
//       name: 'Afternoon Surprise',
//       storeSubdomain: 'sleepr',
//     },
//   },
//   {
//     id: 'asssdf',
//     type: 'BID_MADE',
//     timestamp: '2022-03-14T10:00:00Z',
//     sourceUser: PROFILES.wga,
//     solAmount: 20,
//     nft: {
//       creator: [PROFILES.sik],
//       address: 'sjjxjcjvxcvsfafasdf',
//       imageURL:
//         'https://assets.holaplex.tools/ipfs/bafybeidpfnobrzwdj53nlpdd2ryz4yignl4viloxkjb2a2rnpuo5a27ppq?width=600',
//       name: 'Battle of Hoth',
//       storeSubdomain: 'sika',
//     },
//   },
//   {
//     id: 'asssdfasdasd',
//     type: 'SALE_PRIMARY',
//     timestamp: '2022-03-12T10:00:00Z',
//     sourceUser: PROFILES.wga,
//     solAmount: 18,
//     nft: NFTS.yoshida,
//   },
// ];

// FBNrpSJiM2FCTATss2N6gN9hxaNr6EqsLvrGBAi9cKW7 // folluther
// 2BNABAPHhYAxjpWRoKKnTsWT24jELuvadmZALvP6WvY4 // ghostfried
// GJMCz6W1mcjZZD8jK5kNSPzKWDVTD4vHZCgm8kCdiVNS // kayla
// 2fLigDC5sgXmcVMzQUz3vBqoHSj2yCbAJW1oYX8qbyoR // belle
// NWswq7QR7E1i1jkdkddHQUFtRPihqBmJ7MfnMCcUf4H // kris

const FEED_EVENTS = [
  {
    __typename: 'FollowEvent',
    feedEventId: '4dd91759-9f97-4984-9666-b71e33c9ffab',
    graphConnectionAddress: '4fM9YQhdvavfPViNbm7AxwWGjmyTCnTbEMYdCQTdiLSo',
    createdAt: '2022-04-26T14:47:44.819201+00:00',
    connection: {
      address: '4fM9YQhdvavfPViNbm7AxwWGjmyTCnTbEMYdCQTdiLSo',
      from: {
        address: 'NWswq7QR7E1i1jkdkddHQUFtRPihqBmJ7MfnMCcUf4H',
        profile: null,
      },
      to: {
        address: '2fLigDC5sgXmcVMzQUz3vBqoHSj2yCbAJW1oYX8qbyoR',
        profile: {
          handle: 'belle__sol',
        },
      },
    },
  },
  {
    __typename: 'FollowEvent',
    feedEventId: '4dd91759-9f97-4984-9666-b71e33c9ffsab',
    graphConnectionAddress: '4fM9YQhdvavfPViNbm7AxwWGjmyTCnTbEMYdCQTadiLSo',
    createdAt: '2022-04-27T14:47:44.819201+00:00',
    connection: {
      address: '4fM9YQhdvavfPViNbm7AxwWGjmyTCnTbEMYdCQTdiLSo',
      from: {
        address: '2fLigDC5sgXmcVMzQUz3vBqoHSj2yCbAJW1oYX8qbyoR',
        profile: null,
      },
      to: {
        address: 'NWswq7QR7E1i1jkdkddHQUFtRPihqBmJ7MfnMCcUf4H',
        profile: {
          handle: 'belle__sol',
        },
      },
    },
  },
  {
    __typename: 'OfferEvent',
    feedEventId: '94d2a65b-6547-4b09-ad02-ee8dba82da79',
    createdAt: '2022-04-25T20:39:53.332329+00:00',
    offer: {
      buyer: 'GJMCz6W1mcjZZD8jK5kNSPzKWDVTD4vHZCgm8kCdiVNS',
      price: 250000000,
      nft: {
        address: '4SET3vVDsCHYCYQaRrWrDHBJojkLtAxvMe18suPr7Ycf',
        name: 'DreamerKid',
        image:
          'https://assets2.holaplex.tools/ipfs/bafkreiahhvowe5lfdtdjsltyvvgy6emen3lfrzfrszv5g5jzmapalw2mda?width=600',
        // 'https://assets.holaplex.tools/ipfs/bafybeich4igoclnufqimgeghk3blqpqhdjzu6ilhuvd4hje5kcvlh2wpiu?width=600',
        description: 'my description',
        creators: [
          {
            address: 'asdfasdf',
            twitterHandle: 'fffffff',
          },
        ],
        mintAddress: 'fasdfasdfsaf',
      },
    },
  },
  {
    __typename: 'PurchaseEvent',
    feedEventId: 'asdfasdf',
    createdAt: '2022-04-25T15:30:43',
    purchase: {
      buyer: 'NWswq7QR7E1i1jkdkddHQUFtRPihqBmJ7MfnMCcUf4H',
      seller: '3XzWJgu5WEU3GV3mHkWKDYtMXVybUhGeFt7N6uwkcezF',
      price: 1500000000000,
      nft: {
        name: 'Somyed',
        image:
          'https://assets.holaplex.tools/ipfs/bafybeich4igoclnufqimgeghk3blqpqhdjzu6ilhuvd4hje5kcvlh2wpiu?width=600',
        description: 'asdfasdf',
      },
    },
  },
  {
    __typename: 'MintEvent',
    feedEventId: 'asdfasdfsss',
    createdAt: '2022-04-25T11:30:43',
    nft: {
      name: 'Yogi',
      image:
        'https://assets.holaplex.tools/ipfs/bafybeidpfnobrzwdj53nlpdd2ryz4yignl4viloxkjb2a2rnpuo5a27ppq?width=600',
      description: 'asdfasdasdasdf',
      creators: [
        {
          address: 'NWswq7QR7E1i1jkdkddHQUFtRPihqBmJ7MfnMCcUf4H',
          profile: {
            handle: 'kristianeboe',
            pfp: 'https://pbs.twimg.com/profile_images/1502268999316525059/nZNPG8GX_bigger.jpg',
          },
        },
      ],
    },
  },
];

export const INFINITE_SCROLL_AMOUNT_INCREMENT = 2;

const FeedPage = () => {
  const anchorWallet = useAnchorWallet();
  const myPubkey = anchorWallet?.publicKey.toBase58();
  const { data, loading, called, fetchMore } = useFeedQuery({
    fetchPolicy: `no-cache`,
    variables: {
      address: myPubkey,
      offset: 0,
      limit: 1000,
    },
  });

  const [hasMore, setHasMore] = useState(true);
  // const [feedEvents, setFeedEvents] = useState(data?.feedEvents || []);
  const feedEvents = data?.feedEvents ?? [];

  if (!myPubkey) return null;

  console.log('feed', {
    data,
    loading,
  });

  async function loadMore(inView: boolean) {
    console.log('load more feed', {
      inView,
      loading,
      feeedEvetnsN: feedEvents.length,
    });
    if (!inView || loading || feedEvents.length <= 0) {
      return;
    }

    const { data: newData } = await fetchMore({
      variables: {
        address: myPubkey,
        limit: INFINITE_SCROLL_AMOUNT_INCREMENT,
        offset: feedEvents.length + INFINITE_SCROLL_AMOUNT_INCREMENT,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const prevFeedEvents = feedEvents; // prev.feedEvents;
        const moreFeedEvents = fetchMoreResult.feedEvents;
        if (moreFeedEvents.length === 0) {
          setHasMore(false);
        }

        console.log('update query', {
          prevFeedEventsN: prevFeedEvents?.length,
          moreFeedEventsN: moreFeedEvents?.length,
        });

        fetchMoreResult.feedEvents = prevFeedEvents.concat(moreFeedEvents);

        return { ...fetchMoreResult };
      },
    });
    // setFeedEvents(newData.feedEvents);
    console.log('newData', {
      feedEvents,
      newData,
      feedEventsN: feedEvents.length,
      newDataN: newData.feedEvents.length,
    });
  }

  function getFeedItems(feedEvents: typeof data.feedEvents) {
    const feedItems = [];
    let i = 0;
    while (i < feedEvents.length) {
      const cur = feedEvents[i];
      const next = feedEvents[i + 1];
      feedItems.push(cur);

      if (
        cur.__typename === 'MintEvent' &&
        next.__typename === 'MintEvent' &&
        cur.nft?.creators[0].address === next.nft?.creators[0].address
      ) {
        const aggregateEvent = { items: [] };
        let j = i + 1;
        while (
          feedEvents[j] &&
          feedEvents[j].__typename === 'MintEvent' &&
          feedEvents[j].nft.creators[0].address === cur.nft?.creators[0].address
        ) {
          aggregateEvent.items.push(feedEvents[j]);
          j++;
        }
        feedItems.push({
          id: 'agg_' + cur.feedEventId,
          createdAt: cur.createdAt,
          __typename: 'Aggregate',
          ...aggregateEvent,
          eventsAggregated: aggregateEvent.items.length,
        });
        i = j;
      } else {
        i++;
      }
    }

    return feedItems;
  }

  // const feedItems = data?.feedEvents.reduce((acc, feedEvent, i) => {}, []);
  const feedItems = getFeedItems(data?.feedEvents || []);

  return (
    <>
      <Head>
        <title>Personal feed | Holaplex</title>
        <meta
          property="description"
          key="description"
          content="Your personalized feed for all things Holaplex and Solana"
        />
      </Head>

      <div className="space-y-20">
        {
          // @ts-ignore
          feedItems.map((fEvent) => (
            // @ts-ignore
            <FeedCard key={fEvent.feedEventId} event={fEvent} anchorWallet={anchorWallet} />
          ))
        }
      </div>
      {hasMore && (
        <div>
          <InView threshold={0.1} onChange={loadMore}>
            <div className={`my-6 flex w-full items-center justify-center font-bold`}>
              <TailSpin height={50} width={50} color={`grey`} ariaLabel={`loading-nfts`} />
            </div>
          </InView>
        </div>
      )}
    </>
  );
};

export default FeedPage;

FeedPage.getLayout = function getLayout(page: ReactElement) {
  return <FeedLayout>{page}</FeedLayout>;
};
