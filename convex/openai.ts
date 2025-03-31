import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const apiKey = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
   
  });


  const pollinationBase = "https://image.pollinations.ai/prompt/"
export const chat = action({
	args: {
		messageBody: v.string(),
		conversation: v.id("conversations"),
	},
	handler: async (ctx, args) => {
		const res = await openai.chat.completions.create({
			model: "deepseek/deepseek-r1", 
			messages: [
				{
					role: "system",
					content: "You are a terse bot in a group chat responding to questions with 1-sentence answers",
				},
				{
					role: "user",
					content: args.messageBody,
				},
			],
           
		});

		const messageContent = res.choices[0].message.content;

		await ctx.runMutation(api.messages.sendChatGPTMessage, {
			content: messageContent ?? "I'm sorry, I don't have a response for that",
			conversation: args.conversation,
			messageType: "text",
		});
	},
});

export const pollination = action({
	args: {
		conversation: v.id("conversations"),
		messageBody: v.string(),
	},
	handler: async (ctx, args) => {
        const modifiedString = args.messageBody.slice(12);
        const res = await fetch(`${pollinationBase}${modifiedString}`);
    
        const blob = await res.blob();
    
        const storageId = await ctx.storage.store(blob);
        const imageUrl = (await ctx.storage.getUrl(storageId)) as string;
       
		await ctx.runMutation(api.messages.sendChatGPTMessage, {
			content: imageUrl ?? "/poopenai.png",
			conversation: args.conversation,
			messageType: "image",
		});
	},
});

