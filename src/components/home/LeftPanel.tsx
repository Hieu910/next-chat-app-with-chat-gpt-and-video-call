import {
  ListFilter,
  LogOut,
  MessageSquareDiff,
  Search,
  User,
} from "lucide-react";
import { Input } from "../ui/input";
import ThemeSwitch from "./ThemeSwitch";
import Conversation from "./Conversation";
import { UserButton } from "@clerk/nextjs";
import UserListDialog from "./UserListDialog";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chatStore";
import { useEffect } from "react";

const LeftPanel = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const { setCurrentUser, currentUser } = useConversationStore();
  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip"
  );
  const me = useQuery(api.users.getMe, isAuthenticated ? undefined : "skip");

  useEffect(() => {
    if (me) {
      setCurrentUser(me);
    }
  }, [me, setCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex w-52 flex-col gap-4 p-5">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-4 w-28"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    );
  }
  return (
    <div className="w-1/4 border-gray-600 border-r">
      <div className="sticky top-0 bg-left-panel z-10">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3 items-center">
          <UserButton />

          <div className="flex items-center gap-3">
            {isAuthenticated && <UserListDialog />}
            <ThemeSwitch />
          </div>
        </div>
        <div className="p-3 flex items-center">
          {/* Search */}
          <div className="relative h-10 mx-3 flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search or start a new chat"
              className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
            />
          </div>
          <ListFilter className="cursor-pointer" />
        </div>
      </div>

      {/* Chat List */}
      <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
        {/* Conversations will go here*/}
        {conversations?.map((conversation) => (
          <Conversation
            key={conversation._id}
            conversation={conversation}
            me={currentUser}
          />
        ))}

        {conversations?.length === 0 && (
          <>
            <p className="text-center text-gray-500 text-sm mt-3">
              No conversations yet
            </p>
            <p className="text-center text-gray-500 text-sm mt-3 ">
              We understand {"you're"} an introvert, but {"you've"} got to start
              somewhere 😊
            </p>
          </>
        )}
      </div>
    </div>
  );
};
export default LeftPanel;
