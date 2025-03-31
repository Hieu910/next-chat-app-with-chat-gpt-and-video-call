import {v}  from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        image: v.string(),
        email: v.string(),  
        name: v.optional(v.string()),},
    handler: async (ctx, args) => {
        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            image: args.image,
            email: args.email,
            name: args.name || "",
            isOnline: true,
        });
    }
})

export const updateUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        image: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
			.unique();

		if (!user) {
			throw new ConvexError("User not found");
		}

        await ctx.db.patch(user._id, {
            image: args.image,
        });
    }
})

export const setUserOffline = internalMutation({
    args: {
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();
            if (!user) {
                throw new ConvexError("User not found");
            }
        await ctx.db.patch(user._id, {
            isOnline: false,
        });
    }
})

export const setUserOnline = internalMutation({
	args: { tokenIdentifier: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
			.unique();

		if (!user) {
			throw new ConvexError("User not found");
		}

		await ctx.db.patch(user._id, { isOnline: true });
	},
});

export const getUsers = query({
    args:{
       
    },
    handler: async (ctx, args) => {
        const authUser = await ctx.auth.getUserIdentity();
        if (!authUser) {
            throw new ConvexError("Unauthorized");
        }
        const users = await ctx.db.query("users").collect();
        return users.filter((user) => user.tokenIdentifier !== authUser.tokenIdentifier);
    }
})

export const getMe = query({
    args:{
       
    },
    handler: async (ctx, args) => {
        const authUser = await ctx.auth.getUserIdentity();
        if (!authUser) {
            throw new ConvexError("Unauthorized");
        }
        const user =await ctx.db.query("users")
        .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", authUser.tokenIdentifier))
        .unique();
         if (!user) {
            throw new ConvexError("User not found");
        }
        return user
    }

})


export const getGroupMembers = query({
    args: {conversationId: v.id("conversations")},
    handler: async (ctx,args) => {
        const conversation = await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("_id"), args.conversationId))
            .first()

        if (!conversation) {
            throw new ConvexError("Conversation not found");
        }

        const users = await ctx.db
            .query("users")
            .collect()
        const groupMembers = users.filter((user) => conversation.participants.includes(user._id))
        return groupMembers
    }   
})