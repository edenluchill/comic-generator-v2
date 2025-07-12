export interface FluxConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface FluxGenerationOptions {
  prompt?: string;
  input_image?: string | null; // Base64 encoded image or URL to use with Kontext
  aspectRatio?: string;
  seed?: number;
  outputFormat?: "png" | "jpeg";
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface FluxGenerationResult {
  id: string;
  status: "pending" | "processing" | "Ready" | "Error" | "Failed";
  imageUrl?: string;
  pollingUrl?: string;
  generatedAt: string;
  prompt?: string;
  error?: string;
  progress?: number; // 0-100
}

export interface FluxAPIResponse {
  id: string;
  status: string;
  polling_url?: string;
  result?: {
    sample?: string;
  };
  error?: string;
  message?: string;
}

export interface FluxCharacterOptions {
  image: string; // base64 encoded image
  style?: "kawaii" | "minimalist" | "detailed";
  viewType?: "front" | "side" | "back" | "three-view";
}
