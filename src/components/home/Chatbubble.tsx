import { MessageSeenSvg } from "@/lib/svg";
import { IMessage, useConversationStore } from "@/store/chatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Ban,Bot } from "lucide-react";
import DateIndicator from "./DateIndicator";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import ReactPlayer from "react-player";
import ChatAvatarActions from "./ChatAvatarAction";

type ChatBubbleProps = {
  message: IMessage;
  currentUser: any;
  previousMessage?: IMessage;
};

const ChatBubble = ({
  currentUser: me,
  message,
  previousMessage,
}: ChatBubbleProps) => {
  const date = new Date(message._creationTime);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const time = `${hour}:${minute}`;

  const { selectedConversation } = useConversationStore();
  const isMember =
    selectedConversation?.participants.includes(message.sender?._id) || false;
  const isGroup = selectedConversation?.isGroup;
  const fromMe = message.sender?._id === me._id;
  const fromAI = message.sender?.name === "ChatGPT";
  const bgClass = fromMe
    ? "bg-blue-500 text-white "
    : !fromAI
      ? "bg-teal-500 text-white"
      : "bg-gray-primary text-white";

  const [open, setOpen] = useState(false);

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return <TextMessage message={message} />;
      case "image":
        return (
          <ImageMessage message={message} handleClick={() => setOpen(true)} />
        );
      case "video":
        return <VideoMessage message={message} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`chat ${fromMe ? "chat-end" : "chat-start"}`}>
        {!fromMe && (
          <div
            className={`chat-image avatar ${message.sender.isOnline && isMember ? "online" : ""} `}
          >
            <div className="w-10 rounded-full">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Image
                    height={160}
                    width={160}
                    alt="Tailwind CSS chat bubble component"
                    src={message.sender?.image}
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {<ChatAvatarActions message={message} me={me} />}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        <div
          className={`chat-header flex gap-2 items-center mb-2 ${!fromMe ? "flex-row-reverse" : ""}`}
        >
          <time className="text-xs">
            <DateIndicator
              message={message}
              previousMessage={previousMessage}
            />
          </time>
          <>
            {message.sender.name || ""}{" "}
            {!isMember && !fromAI && isGroup && (
              <Ban size={16} className="text-red-500" />
            )}
          </>
        </div>
        <div className={`chat-bubble ${bgClass} `}>
          {renderMessageContent()}
          {open && (
            <ImageDialog
              src={message.content}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
        <div className="chat-footer opacity-50">
          <p className="text-[10px] self-end flex gap-1 items-center">
            {
              fromAI && <Bot size={16} className='' />
            }
            {time} {fromMe && <MessageSeenSvg />}
          </p>
        </div>
      </div>
    </>
  );
};
export default ChatBubble;

const VideoMessage = ({ message }: { message: IMessage }) => {
  return (
    <ReactPlayer
      url={message.content}
      width="250px"
      height="250px"
      controls={true}
      light={true}
    />
  );
};

const ImageMessage = ({
  message,
  handleClick,
}: {
  message: IMessage;
  handleClick: () => void;
}) => {
  return (
    <div className="w-[250px] h-[250px] m-2 relative">
      <Image
        src={message.content}
        fill
        className="cursor-pointer object-cover rounded"
        alt="image"
        onClick={handleClick}
      />
    </div>
  );
};

const ImageDialog = ({
  src,
  onClose,
  open,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="min-w-[750px]">
        <DialogDescription className="relative h-[450px] flex justify-center">
          <Image
            src={src}
            fill
            className="rounded-lg object-contain"
            alt="image"
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

const TextMessage = ({ message }: { message: IMessage }) => {
  const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

  return (
    <div>
      {isLink ? (
        <a
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className={`mr-2 text-sm font-light text-purple-200 underline hover:text-purple-400`}
        >
          {message.content}
        </a>
      ) : (
        <p className={`mr-2 text-sm font-light`}>{message.content}</p>
      )}
    </div>
  );
};
