"use server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  streamText,
  UIMessage,
} from "ai";
import { createComicGenerationTool } from "@/lib/ai/tools";
import { authenticateRequest } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const { user, error: authError } = await authenticateRequest(req);
    if (authError || !user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert messages and handle images
    const modelMessages = convertToModelMessages(messages);

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: google("gemini-2.5-flash"),
          system:
            "You are a helpful assistant specialized in comic generation and creative storytelling. You can analyze images, help create engaging stories, and generate complete 5-page comics from user stories. When users want to create a comic, use the generateComic tool to create a full 5-page comic with detailed scenes and images. The user ID is: " +
            (user.id || "anonymous"),
          messages: modelMessages,
          tools: {
            generateComic: createComicGenerationTool({
              userId: user.id,
              dataStream,
            }),
          },
          experimental_transform: smoothStream({
            delayInMs: 20, // optional: defaults to 10ms
            chunking: "word", // optional: defaults to 'word'
          }),
        });

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
