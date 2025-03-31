import { IMessage, useConversationStore } from "@/store/chatStore";
import { useMutation } from "convex/react";
import { LogOut, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import React from "react";

type ChatAvatarActionsProps = {
  message: IMessage;
  me: any;
};

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();

  const isMember = selectedConversation?.participants.includes(
    message.sender._id
  );
  const kickUser = useMutation(api.conversations.kickUser);
  const createConversation = useMutation(api.conversations.createConversation);
  const fromAI = message.sender?.name === "ChatGPT";
  const isGroup = selectedConversation?.isGroup;

  const handleKickUser = async (e: React.MouseEvent) => {
    if (fromAI) return;
    e.stopPropagation();
    if (!selectedConversation) return;
    try {
      await kickUser({
        conversationId: selectedConversation._id,
        userId: message.sender._id,
      });

      setSelectedConversation({
        ...selectedConversation,
        participants: selectedConversation.participants.filter(
          (id) => id !== message.sender._id
        ),
      });
    } catch (error) {
      toast.error("Failed to kick user");
    }
  };

  const handleCreateConversation = async () => {
    if (fromAI) return;

    try {
      const conversationId = await createConversation({
        isGroup: false,
        participants: [me._id, message.sender._id],
      });

      setSelectedConversation({
        _id: conversationId,
        name: message.sender.name,
        participants: [me._id, message.sender._id],
        isGroup: false,
        isOnline: message.sender.isOnline,
        image: message.sender.image,
      });
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  return (
    <ul className="menu bg-transparent  w-full">
      <li>
        <div
          className="flex items-center justify-around w-full"
          onClick={handleCreateConversation}
        >
          <span className="text-sm">Chat</span>
          <MessageCircle size={16} className="text-blue-400" />
        </div>
      </li>
      <li>
        {isGroup && isMember && selectedConversation?.admin === me._id && (
          <div
            className="flex items-center justify-around w-full"
            onClick={handleKickUser}
          >
            <span className="text-sm">Kick</span>
            <LogOut size={16} className="text-red-500" />
          </div>
        )}
      </li>
    </ul>
    // <div className="text-[11px] p-3 flex gap-4 w-full flex-col justify-between font-bold cursor-pointer group">

    //

    //
    // </div>
  );
};
export default ChatAvatarActions;
