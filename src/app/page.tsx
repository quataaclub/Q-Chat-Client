'use client';
// import ChatHistoryList from '@/components/chat-window/ChatHistoryList';
// import NewChatButton from '@/components/chat-window/NewChatButton';
import { Button } from '@/components/ui/button';
// import { Sidebar, SidebarBody } from '@/components/ui/sidebar';
import Dashboard from '@/components/view/ConversationView';
import { cn } from '@/lib/utils';
import { useQchatStore } from '@/store/qchatStore';
import { IconLayoutSidebarLeftCollapseFilled } from '@tabler/icons-react';
// import { AnimatePresence } from 'motion/react';
import Image from 'next/image';
// import { useState } from 'react';

export default function Home() {
  // const [open, setOpen] = useState(true);
  const { conversationList } = useQchatStore();

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border-neutral-200 bg-gray-100 md:flex-row dark:bg-neutral-800/50',
        'h-screen',
      )}
    >
      {conversationList && conversationList.length < 1 && (
        <div className="pointer-events-none absolute inset-0 z-1 h-full w-full bg-[url(/images/Glow.svg)] bg-cover bg-no-repeat" />
      )}
      {/* <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col gap-8 overflow-x-hidden overflow-y-auto">
            <div className="flex h-min flex-col gap-8 px-2">
              <div className="flex items-center justify-between">
                {open ? <Logo /> : <LogoIcon open={open} setOpen={setOpen} />}
                {open && <CloseSidebarButton setOpen={setOpen} />}
              </div>
              <NewChatButton open={open} />
            </div>
            <AnimatePresence>{open && <ChatHistoryList />}</AnimatePresence>
          </div>
        </SidebarBody>
      </Sidebar> */}
      <Dashboard />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <Image
        src="../logo/Q.svg"
        className="h-9 w-9"
        width={60}
        height={60}
        alt="Q"
        draggable={false}
      />
      <span className="font-briColage text-3xl font-medium whitespace-pre text-black dark:text-white">
        chat
      </span>
    </a>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LogoIcon = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen?: (open: boolean) => void;
}) => {
  return (
    <button
      onClick={() => setOpen?.(!open)}
      className="relative z-20 flex cursor-pointer items-center space-x-2 py-1"
    >
      <Image
        src="../logo/Q.svg"
        className="h-9 w-9"
        width={60}
        height={60}
        alt="Q"
        draggable={false}
      />
    </button>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CloseSidebarButton = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  return (
    <Button
      onClick={() => setOpen(!open)}
      variant="ghost"
      size={'icon'}
      className="hover:dark:bg-popover z-10"
    >
      <IconLayoutSidebarLeftCollapseFilled
        stroke={2}
        size={20}
        className="min-h-6 min-w-6 text-neutral-200"
      />
    </Button>
  );
};
