import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";

export const supportAgent = new Agent(components.agent, {
    chat: openai.chat("gpt-4o-mini"),
    instructions: "You are a helpful support agent for HelpHub, a customer support platform. Your job is to assist users with their questions and issues related to the platform. Be friendly, concise, and provide accurate information based on the user's query.",
});