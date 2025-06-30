export interface SketchGenerationRequest {
  image: File;
  prompt: string;
  style: "simple" | "detailed" | "cute";
}

export interface SketchResult {
  imageUrl: string;
  prompt: string;
  style: string;
  generatedAt: string;
}

export interface StableDiffusionConfig {
  apiUrl: string;
  apiKey?: string;
  defaultParams: {
    width: number;
    height: number;
    steps: number;
    cfg_scale: number;
    sampler_name: string;
  };
}
