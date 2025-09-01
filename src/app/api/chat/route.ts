"use server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  smoothStream,
  streamText,
  UIMessage,
} from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Convert messages and handle images
    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system:
        "You are a helpful assistant specialized in comic generation and creative storytelling. You can analyze images and help create engaging stories and comics.",
      messages: modelMessages,
      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: "word", // optional: defaults to 'word'
      }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
