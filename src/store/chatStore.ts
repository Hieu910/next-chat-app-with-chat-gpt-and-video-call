import { Id } from "../../convex/_generated/dataModel";
import { create } from "zustand";

export type Conversation = {
	_id: Id<"conversations">;
	image?: string;
	participants: Id<"users">[];
	isGroup: boolean;
	name?: string;
	groupImage?: string;
	groupName?: string;
	admin?: Id<"users">;
	isOnline?: boolean;
	lastMessage?: {
		_id: Id<"messages">;
		conversation: Id<"conversations">;
		content: string;
		sender: Id<"users">;
	};
};

export type User = {
    _id: Id<"users">;
    _creationTime: number;
    name?: string | undefined;
    image: string;
    email: string;
    tokenIdentifier: string;
    isOnline: boolean;
}

type ConversationStore = {
    currentUser: User | null;
	selectedConversation: Conversation | null;
    setCurrentUser: (user: User | null) => void;
	setSelectedConversation: (conversation: Conversation | null) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
    currentUser: null,
	selectedConversation: null,
    setCurrentUser: (user) => set({ currentUser: user }),
	setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
}));

export interface IMessage {
	_id: string;
	content: string;
	_creationTime: number;
	messageType: "text" | "image" | "video";
	sender: {
		_id: Id<"users">;
		image: string;
		name?: string;
		tokenIdentifier: string;
		email: string;
		_creationTime: number;
		isOnline: boolean;
	};
}