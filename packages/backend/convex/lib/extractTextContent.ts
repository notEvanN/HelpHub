import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
    image: openai.chat("gpt-4o-mini"),
    pdf: openai.chat("gpt-4o-mini"),
    html: openai.chat("gpt-4o-mini"),

} as const;

const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
] as const;

const SYSTEM_PROMPTS = {
    image: "You turn images into text. You should describe the image in detail, including any text that appears in the image. You should not make up any information that is not present in the image. If it is not a document, describe it",
    pdf: "You turn PDF documents into text. You should extract the text from the PDF and return it as a string. You should not make up any information that is not present in the PDF.",
    html: "You turn HTML documents into text/markdown. You should extract the text from the HTML and return it as a string. You should not make up any information that is not present in the HTML.",
};

export type ExtractTextContentArgs = {
    storageId : Id<"_storage">;
    filename: string;
    bytes?: ArrayBuffer;
    mimeType: string;
};

export async function extractTextContent(
    ctx: { storage: StorageActionWriter },
    args: ExtractTextContentArgs,
): Promise<string> {
    const { storageId, filename, bytes, mimeType } = args;

    const url = await ctx.storage.getUrl(storageId);
    assert(url, "Failed to get URL for storageId: " + storageId);

    if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
        return extractImageText(url);
    }

    if (mimeType.toLowerCase().includes("pdf")) {
        return extractPdfText(url, mimeType, filename);
    }

    if (mimeType.toLowerCase().includes("text")) {
        return extractTextFileContent(ctx, storageId, bytes, mimeType);
    }

    throw new Error("Unsuported MIME type: ${mimeType}");
};

async function extractTextFileContent(
    ctx: { storage: StorageActionWriter },
    storageId: Id<"_storage">,
    bytes: ArrayBuffer | undefined,
    mimeType: string,
): Promise<string> {
    const arrayBuffer = 
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

    if (!arrayBuffer) {
        throw new Error("Failed to get file content");
    }

    const text = new TextDecoder().decode(arrayBuffer);

    if (mimeType.toLowerCase() !== "text/plain") {
        const result = await generateText({
            model: AI_MODELS.html,
            system: SYSTEM_PROMPTS.html,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text" , text },
                        {
                            type: "text",
                            text: "Extract the text and print it in a markdown format without explaining you'll do so."
                        },
                    ],
                },
            ],
        });

        return result.text;
    }

    return text;
};

async function extractPdfText(url: string, mimeType: string, filename: string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.pdf,
        system: SYSTEM_PROMPTS.pdf,
        messages: [
            {
                role: "user",
                content: [
                    { type: "file", data: new URL(url), mimeType, filename },
                    {
                        type: "text",
                        text: "Please extract the text from this PDF and return it as a string. You should not make up any information that is not present in the PDF and do it without explaining you'll do so.",
                    }
                ]
            }
        ]
    });

    return result.text;
};

async function extractImageText(url: string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.image,
        system: SYSTEM_PROMPTS.image,
        messages: [
            {
                role: "user",
                content: [{ type: "image", image: new URL(url) }],
            },
        ],
    });

    return result.text;
}