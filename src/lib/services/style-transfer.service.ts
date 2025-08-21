import axios, { AxiosResponse } from "axios";
import { downloadAndStoreImage } from "@/lib/image-storage";

export interface StyleTransferOptions {
  baseImage: string; // base64 or URL
  styleReference: string; // base64 or URL
  prompt?: string;
  outputFormat?: "png" | "jpeg";
  aspectRatio?: string;
  seed?: number;
  userId?: string;
  onProgress?: (progress: number) => void;
}

export interface StyleTransferResult {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

export class StyleTransferService {
  private baseUrl: string = "https://api.bfl.ai/v1";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BFL_API_KEY || "b4101592-cdac-428d-8fdb-8e7f858228aa";
    if (!this.apiKey) {
      throw new Error("BFL API key is required for style transfer");
    }
  }

  /**
   * Transfer style from reference image to base image
   */
  async transferStyle(options: StyleTransferOptions): Promise<StyleTransferResult> {
    const {
      baseImage,
      styleReference,
      prompt,
      outputFormat = "png",
      aspectRatio,
      seed,
      userId,
      onProgress,
    } = options;

    // Generate a better prompt for style transfer
    const styleTransferPrompt = prompt || 
      "Transform the first image to match the artistic style, color palette, brushwork, and visual texture of the second image. " +
      "Maintain the original composition and subject matter of the first image, but apply the artistic style from the second image. " +
      "This should look like the first image was painted in the style of the second image.";

    try {
      console.log("Creating style transfer job...");
      console.log("API Key:", this.apiKey.substring(0, 8) + "...");
      console.log("Base URL:", this.baseUrl);
      
      // 1. Create the style transfer job
      const createResponse: AxiosResponse<{ polling_url: string; id: string }> = await axios.post(
        `${this.baseUrl}/flux-kontext-pro`,
        {
          prompt: styleTransferPrompt,
          input_image: baseImage,
          input_image_2: styleReference,
          output_format: outputFormat,
          ...(aspectRatio && { aspect_ratio: aspectRatio }),
          ...(seed && { seed }),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-key": this.apiKey,
            "accept": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("Create response status:", createResponse.status);
      console.log("Create response data:", createResponse.data);

      if (createResponse.status !== 200) {
        throw new Error(`Style transfer creation failed: ${createResponse.status} ${createResponse.statusText}`);
      }

      const { polling_url, id } = createResponse.data;
      console.log("Job ID:", id);
      console.log("Polling URL:", polling_url);

      // 2. Poll for completion
      const result = await this.pollForCompletion(polling_url, onProgress);

      // 3. Download and store the image
      let finalImageUrl = result.sample;
      
      if (userId) {
        // Store in Supabase if userId is provided
        finalImageUrl = await downloadAndStoreImage(
          result.sample,
          "generated-images",
          `users/${userId}/style-transfer`,
          `style_transfer_${Date.now()}.${outputFormat}`
        );
      }

      return {
        imageUrl: finalImageUrl,
        prompt: styleTransferPrompt,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Style transfer failed:", error);
      throw new Error(
        error instanceof Error
          ? `Style transfer failed: ${error.message}`
          : "Style transfer failed with unknown error"
      );
    }
  }

  /**
   * Poll for job completion
   */
  private async pollForCompletion(
    pollingUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<{ sample: string }> {
    let attempts = 0;
    const maxAttempts = 300; // 4 minutes max (300 * 800ms)
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5; // Stop after 5 consecutive errors (reduced from 10)

    console.log(`Starting to poll for completion at: ${pollingUrl}`);

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay to 1 second
      attempts++;

      try {
        console.log(`Poll attempt ${attempts}/${maxAttempts}`);
        
        const pollResponse: AxiosResponse<{
          status: string;
          result?: { sample: string };
          error?: string;
        }> = await axios.get(pollingUrl, {
          headers: {
            "x-key": this.apiKey,
            "accept": "application/json",
          },
          timeout: 15000, // Increased timeout to 15 seconds
        });

        const data = pollResponse.data;
        console.log(`Poll response status: ${data.status}`);

        if (data.status === "Ready" && data.result?.sample) {
          console.log("Style transfer completed successfully!");
          return data.result;
        }

        if (data.status === "Error" || data.status === "Failed") {
          throw new Error(`Style transfer failed: ${data.error || "Unknown error"}`);
        }

        // Reset consecutive errors on successful response
        consecutiveErrors = 0;

        // Update progress if callback provided
        if (onProgress) {
          const progress = Math.min((attempts / maxAttempts) * 100, 95); // Cap at 95% until complete
          onProgress(progress);
        }
      } catch (error) {
        consecutiveErrors++;
        
        // Check if it's a 500 error specifically
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 500) {
          const responseData = (error.response as { data?: unknown }).data;
          console.error(`Poll attempt ${attempts} failed with 500 error (consecutive errors: ${consecutiveErrors}):`, responseData);
        } else {
          console.error(`Poll attempt ${attempts} failed (consecutive errors: ${consecutiveErrors}):`, error);
        }
        
        // If we get too many consecutive errors, stop polling
        if (consecutiveErrors >= maxConsecutiveErrors) {
          throw new Error(`Style transfer failed after ${maxConsecutiveErrors} consecutive polling errors. This might be due to service issues or rate limiting.`);
        }
        
        // Add exponential backoff for errors
        if (consecutiveErrors > 1) {
          const backoffDelay = Math.min(1000 * Math.pow(2, consecutiveErrors - 1), 10000); // Max 10 seconds
          console.log(`Adding backoff delay of ${backoffDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw new Error("Style transfer timed out after 4 minutes");
  }

  /**
   * Convert file to base64
   */
  async fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString("base64")}`;
  }

  /**
   * Convert URL to base64
   */
  async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }
}

// Export singleton instance
export const styleTransferService = new StyleTransferService();
