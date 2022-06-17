import { useMakeConnection } from '@/common/hooks/useMakeConnection';
import { useRevokeConnection } from '@/common/hooks/useRevokeConnection';
import { IProfile } from '@/modules/feed/feed.interfaces';
import { useAnalytics } from '@/common/context/AnalyticsProvider';
import { shortenAddress, showFirstAndLastFour } from '@/modules/utils/string';
import { AnchorWallet, useLocalStorage } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';
import { Button5 } from '../elements/Button2';
import { FailureToast } from '../elements/FailureToast';
import { SuccessToast } from '../elements/SuccessToast';
import { ProfileDataProvider } from '@/common/context/ProfileData';
import { useConnection } from '@solana/wallet-adapter-react';
import React, { FC, useState, useEffect, useMemo, useRef, Fragment, RefObject } from 'react';
import Button from '@/components/elements/Button';
import * as web3 from '@solana/web3.js';
import { Mailbox, MessageAccount } from '@usedispatch/client';
import { ProfileHandle, ProfilePFP } from '@/common/components/feed/FeedCard';
import classNames from 'classnames';
import { useConnectedWalletProfile } from '@/common/context/ConnectedWalletProfileProvider';
import { PencilAltIcon } from '@heroicons/react/outline';
import { User } from '../feed/feed.utils';
import { Combobox } from '@headlessui/react';
import {
  useProfileSearchLazyQuery,
  ProfileSearchQuery,
  useGetProfilesQuery,
} from 'src/graphql/indexerTypes';
import { DebounceInput } from 'react-debounce-input';
import { ProfileSearchItem } from '../search/SearchItems';
import { Avatar } from '../elements/Avatar';
import ProfileSearchCombobox from './ProfileSearchCombobox';

interface ProfileMessagesInterface {
  publicKey: string;
  mailbox: Mailbox | undefined;
  conversations: {
    [conversationId: string]: MessageAccount[];
  };
  mailboxAddress: web3.PublicKey | null;
  receiver?: any;
  uniqueSenders: string[];
  addMessageToConversation: (conversationId: string, msg: MessageAccount) => void;
}

export const ProfileMessages = ({ publicKey, ...props }: ProfileMessagesInterface) => {
  const [lastTxId, setLastTxId] = useState<string>('');
  const [receiver, setReceiver] = useState<string>(props.receiver ?? '');
  const [newMessageText, setNewMessageText] = useState('');
  const { mailbox, conversations, uniqueSenders, mailboxAddress, addMessageToConversation } = props;
  // const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [recipient, setRecipient] = useState<User | null>(null);
  // const [messagesInConversation, setMessagesInConversation] = useState<MessageAccount[]>([]);

  const contacts = [...new Set(uniqueSenders.concat(Object.keys(conversations)))];

  useEffect(() => {
    if (props.receiver && !recipient) {
      setRecipient({
        address: props.receiver,
      });
    }
  }, [props.receiver]);
  const [messageTransactionInProgress, setmessageTransactionInProgress] = useState(false);

  const { connectedProfile } = useConnectedWalletProfile();

  const messagesInConversation: MessageAccount[] =
    (recipient?.address && conversations[recipient.address]) || [];

  const recipientInput = useRef<HTMLInputElement>(null);
  const newMessageInput = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const { data } = useGetProfilesQuery({
    variables: {
      addresses: contacts,
    },
  });

  const enrichedContacts = useMemo(
    () =>
      (
        data?.wallets.slice() ||
        contacts.map((c) => ({
          address: c,
        }))
      ).sort((c1, c2) => {
        const conversation1 = conversations[c1.address];
        const timeOfLastMessageInConvo1 =
          conversation1[conversation1.length - 1].data.ts?.getTime();
        const conversation2 = conversations[c2.address];
        const timeOfLastMessageInConvo2 =
          conversation2[conversation2.length - 1].data.ts?.getTime();

        return timeOfLastMessageInConvo1 && timeOfLastMessageInConvo2
          ? timeOfLastMessageInConvo2 - timeOfLastMessageInConvo1
          : 0;
      }),

    [data?.wallets, contacts]
  );

  const sendMessage = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!mailbox || messageTransactionInProgress) {
      alert('wallet is not connected, not sending message');
      return;
    }

    if (!recipient) return;
    const receiverPublicKey: web3.PublicKey = new web3.PublicKey(recipient.address);

    // TODO: can add a subject here via a new form element
    setmessageTransactionInProgress(true);

    // this is actually email, not IM

    // might be able to switch this to the

    // the messages listener can be used to notify people of new messages (as long as they stay on the site.). Should probably be put in the provider. Might be possible to integrate with dialect or notify in the future
    mailbox
      .sendMessage(
        'Holaplex chat', // should be user defined
        newMessageText,
        receiverPublicKey!,
        {}, // options // might be used in the future to add attatchements to message
        {
          ns: 'holaplex', // should be lowercase
        }
      )
      .then((tx) => {
        setLastTxId(tx);
        addMessageToConversation(recipient.address, {
          sender: new web3.PublicKey(publicKey),
          messageId: 10, // TODO make random
          receiver: receiverPublicKey,
          data: {
            body: newMessageText,
            ts: new Date(),
          },
        } as MessageAccount);
        setNewMessageText('');
      })
      .catch((error: any) => {
        alert('send failed');
        console.log('error :', error);

        // This is how to retrieve the title and error message
        // for a popup dialog when something fails

        /* setModalInfo({
         *   title:
         *         error.error?.code === 4001
         *         ? error.error?.message
         *         : "Something went wrong",
         *   type:
         *         error.error?.code === 4001
         *         ? MessageType.warning
         *         : MessageType.error,
         * }); */
      })
      .finally(() => {
        setmessageTransactionInProgress(false);
      });
  };

  // messages grouped by time and person
  const messageBlocks: MessageAccount[][] = createMessageBlocks(messagesInConversation);
  // TODO Add in delete messages
  return (
    <div className="-mt-20 flex h-full max-h-screen  pt-20 ">
      {/* Conversations / Contacts */}
      <div className="relative  flex  w-full  max-w-md flex-col border-t border-r border-gray-800 transition-all hover:min-w-fit ">
        <div className="flex items-center justify-between p-5 ">
          <ProfilePFP
            user={{
              address: connectedProfile?.pubkey!,
              profile: connectedProfile?.profile,
            }}
          />
          <h1>Messages</h1>
          <span
            onClick={() => {
              // start new conversation
              setReceiver('');

              setRecipient(null);
              recipientInput?.current?.focus();
            }}
            className=" flex cursor-pointer items-center rounded-full p-3 shadow-lg shadow-black transition-all hover:scale-125  "
          >
            <PencilAltIcon className="h-4 w-4 text-white " aria-hidden="true" />
          </span>
        </div>
        <div className="spacy-y-6 h-full overflow-auto px-5">
          {recipient && !enrichedContacts.some((c) => c.address === recipient.address) && (
            <Contact selected={true} user={recipient} />
          )}
          {enrichedContacts.length ? (
            enrichedContacts.map((contact) => (
              <Contact
                key={contact.address}
                selected={recipient?.address === contact.address}
                user={contact}
                onSelect={() => {
                  setReceiver(contact.address);
                  setRecipient(contact);
                }}
              />
            ))
          ) : (
            <div className="my-auto flex grow flex-col items-center justify-center px-4">
              Start a conversation to see it appear here
            </div>
          )}
        </div>
      </div>
      {/* Messages */}
      <div className=" flex grow flex-col justify-between border-t border-gray-800 ">
        <div className="flex items-center space-x-4 border-b border-gray-800  p-5">
          {recipient ? (
            <>
              <ProfilePFP user={recipient} />
              <h2> {recipient.profile?.handle || shortenAddress(recipient.address)} </h2>
            </>
          ) : (
            <>
              <span>To:</span>
              <div className="w-full">
                <ProfileSearchCombobox
                  setRecipient={(r: User) => {
                    setRecipient(r);
                    newMessageInput.current?.focus();
                  }}
                />
              </div>
            </>
          )}
        </div>
        <div className="h-full space-y-4 overflow-auto p-4">
          {messageBlocks.map((block, index) => (
            <MessageBlock key={index} messageBlock={block} myPubkey={publicKey} />
          ))}
          {messagesInConversation.every(
            (m) => m.sender.toBase58() === messagesInConversation[0].sender.toBase58()
          ) ? (
            <div className="mx-auto max-w-md rounded-full p-4 shadow-lg shadow-black">
              Until the other sender responds, your messages will only be available in this browser.
            </div>
          ) : null}
        </div>

        <form
          className="mt-full flex items-center justify-between space-x-4 border-t border-gray-800 p-5 pb-10"
          onSubmit={sendMessage}
        >
          {newMessageText.length < 100 ? (
            <input
              name="message"
              ref={newMessageInput as RefObject<HTMLInputElement>}
              disabled={messageTransactionInProgress || !recipient?.address}
              className="w-full resize-none rounded-lg  bg-gray-900 px-4 py-2 text-white ring-1  ring-gray-800  focus:ring-white disabled:bg-gray-800 "
              placeholder={'Message ' + shortenAddress(recipient?.address || '') + '...'}
              value={newMessageText}
              autoFocus={true}
              onChange={(e) => setNewMessageText(e.target.value)}
              onFocus={function (e) {
                var val = e.target.value;
                e.target.value = '';
                e.target.value = val;
              }}
            />
          ) : (
            <textarea
              name="message"
              ref={newMessageInput as RefObject<HTMLTextAreaElement>}
              disabled={messageTransactionInProgress || !recipient?.address}
              className="w-full resize-none rounded-lg  bg-gray-900 px-4 py-2 text-white ring-1  ring-gray-800  focus:ring-white"
              placeholder={'Message ' + shortenAddress(recipient?.address || '') + '...'}
              value={newMessageText}
              autoFocus={true}
              onChange={(e) => setNewMessageText(e.target.value)}
              onFocus={function (e) {
                var val = e.target.value;
                e.target.value = '';
                e.target.value = val;
              }}
            />
          )}

          <div className="top-2 right-2">
            <Button5 loading={messageTransactionInProgress} v="secondary" type="submit">
              Send
            </Button5>
          </div>
        </form>
      </div>
    </div>
  );
};

function Contact(props: { selected: boolean; onSelect?: () => void; user: User }): JSX.Element {
  return (
    <div
      id={props.user.address}
      className={classNames(
        ' flex cursor-pointer items-center space-x-2 rounded-md  px-2 py-2',
        props.selected && 'bg-gray-800'
      )}
      onClick={props.onSelect}
    >
      <ProfilePFP user={props.user} />

      <div className="text-base">
        {props.user.profile?.handle ?? shortenAddress(props.user.address)}
      </div>
    </div>
  );
}

const ONE_WEEK_IN_MS = 7 * 24 * 3600 * 1000;

function MessageBlock(props: { myPubkey: string; messageBlock: MessageAccount[] }) {
  const sender = props.messageBlock[0].sender.toBase58();
  const iAmSender = sender === props.myPubkey;
  const msgIsForMe = !iAmSender;

  const ts = props.messageBlock[0].data.ts;
  const moreThanAWeekAgo = ts && Date.now() - ts.getTime() > ONE_WEEK_IN_MS;
  const timestamp = ts
    ? DateTime.fromJSDate(ts).toFormat(
        moreThanAWeekAgo
          ? 'ff' // Jun 9, 2022, 6:19 PM
          : 'cccc t' // "Friday 3:03 PM"
      )
    : null;

  const [firstMsg, ...rest] = props.messageBlock;
  const msgBaseClasses = classNames(
    'px-6 py-4 max-w-prose rounded-[40px] ',
    msgIsForMe ? 'bg-gray-800 text-white ml-4' : ' text-black mr-4',
    iAmSender && 'bg-colorful-gradient bg-repeat-round '
  );

  const lastMsgIndex = rest.length - 1;

  return (
    <div className={classNames('flex items-end ', iAmSender ? 'flex-row-reverse' : '')}>
      <ProfilePFP user={{ address: sender }} />
      <div
        className={classNames(
          'flex flex-col  space-y-2   text-white opacity-90',
          msgIsForMe ? 'items-start' : 'items-end '
        )}
      >
        {ts && <div className="ml-6 text-xs text-gray-300">{timestamp}</div>}
        <div
          className={classNames(
            msgBaseClasses,

            msgIsForMe ? 'rounded-bl-none' : 'rounded-br-none'
          )}
        >
          {firstMsg.data.body}
        </div>
        {rest.map((msg, i) => (
          <div
            key={msg.messageId + msg.data.body}
            className={classNames(
              msgBaseClasses,
              i !== lastMsgIndex ? (msgIsForMe ? 'rounded-l-none' : 'rounded-r-none') : null,
              i === lastMsgIndex ? (msgIsForMe ? 'rounded-tl-none' : 'rounded-tr-none') : null
            )}
          >
            {msg.data.body}
          </div>
        ))}
      </div>
    </div>
  );
}

function createMessageBlocks(messagesInConversation: MessageAccount[]) {
  const messageBlocks: MessageAccount[][] = [];
  let currentBlockIndex = -1;

  messagesInConversation.forEach((curMsg, i, conversation) => {
    const prevMsg = conversation[i - 1];

    const nextMsg = conversation[i + 1];
    console.log('msg block', {
      curMsg,
      nextMsg,
      conversation,
    });
    const timeOfPrevMsg = prevMsg?.data?.ts?.getTime();
    const timeOfCurMsg = curMsg.data?.ts?.getTime();
    const timeOfNextMsg = nextMsg?.data?.ts?.getTime();
    const prevSenderIsSame = prevMsg?.sender.toBase58() == curMsg.sender.toBase58();
    const messageIsWithin4HoursOfLast =
      timeOfCurMsg && timeOfPrevMsg && timeOfCurMsg - timeOfPrevMsg < 4 * 3600_000;
    if (
      prevSenderIsSame &&
      messageIsWithin4HoursOfLast
      // (curMsg.sender.toBase58() === nextMsg?.sender.toBase58() && ) ||
      // (!nextMsg && curMsg.sender.toBase58() === prevMsg.sender.toBase58())
      //   && // same sender
      // (!nextMsg || (timeOfCurMsg && timeOfNextMsg && timeOfNextMsg - timeOfCurMsg < 4 * 3600_000)) // less than 4 hours apart
    ) {
      // add to current msg block
      if (!messageBlocks[currentBlockIndex]) {
        messageBlocks[currentBlockIndex] = [];
      }

      messageBlocks[currentBlockIndex].push(curMsg);
    } else {
      // create a new msg block
      messageBlocks.push([curMsg]);
      currentBlockIndex++;
    }
  }, []);

  return messageBlocks;
}
