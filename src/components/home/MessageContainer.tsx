import { useRef,useEffect } from "react";
import ChatBubble from "./Chatbubble";
import { useConversationStore } from "@/store/chatStore";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const MessageContainer = () => {
  const { selectedConversation, currentUser } = useConversationStore();
  const messages = useQuery(api.messages.getMessages, {
    conversation: selectedConversation!._id,
  });

  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  return (
    <div className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark">
      <div className="mx-6 flex flex-col gap-3 h-full">
        {messages?.map((msg, idx) => (
          <div key={msg._id} ref={lastMessageRef}>
           	<ChatBubble message={msg} currentUser={currentUser} previousMessage={idx > 0 ? messages[idx - 1] : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default MessageContainer;
