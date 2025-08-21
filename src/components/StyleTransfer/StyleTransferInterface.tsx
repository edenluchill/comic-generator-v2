"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStyleTransfer } from "@/hooks/useStyleTransfer";
import { Upload, Image, Palette, Sparkles, Download, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleTransferResult {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

interface StyleTransferInterfaceProps {
  onComplete?: (result: StyleTransferResult) => void;
}

export function StyleTransferInterface({ onComplete }: StyleTransferInterfaceProps) {
  const [contentImage, setContentImage] = useState<File | null>(null);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [contentPreview, setContentPreview] = useState<string>("");
  const [stylePreview, setStylePreview] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  const contentInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);
  
  const { transferStyle, isTransferring, progress, error } = useStyleTransfer();

  const handleImageUpload = (file: File, type: 'content' | 'style') => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'content') {
        setContentImage(file);
        setContentPreview(result);
      } else {
        setStyleImage(file);
        setStylePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransfer = async () => {
    if (!contentImage || !styleImage) {
      alert('Please upload both a content image and a style reference image');
      return;
    }

    try {
      const result = await transferStyle({
        baseImage: contentImage,
        styleReference: styleImage,
        prompt: customPrompt,
      });
      
      setResultImage(result.imageUrl);
      onComplete?.(result);
    } catch (error) {
      console.error('Style transfer failed:', error);
    }
  };

  const resetAll = () => {
    setContentImage(null);
    setStyleImage(null);
    setContentPreview("");
    setStylePreview("");
    setResultImage("");
    setCustomPrompt("");
    if (contentInputRef.current) contentInputRef.current.value = "";
    if (styleInputRef.current) styleInputRef.current.value = "";
  };

  const downloadResult = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'style-transfer-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Style Transfer
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transform your images with AI-powered style transfer. Upload a content image and a style reference to create stunning artistic transformations.
        </p>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Image Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Content Image</h3>
            <Badge variant="secondary" className="ml-auto">Step 1</Badge>
          </div>
          <p className="text-sm text-gray-600">
            This is the image you want to transform. It will keep its composition and subject matter.
          </p>
          
          <div className="space-y-4">
            <input
              ref={contentInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'content');
              }}
              className="hidden"
            />
            
            {contentPreview ? (
              <div className="relative group">
                <img
                  src={contentPreview}
                  alt="Content preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-blue-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => contentInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => contentInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <Upload className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-sm text-blue-600 font-medium">Upload Content Image</p>
                <p className="text-xs text-gray-500 mt-1">Click to select</p>
              </div>
            )}
          </div>
        </Card>

        {/* Style Reference Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Style Reference</h3>
            <Badge variant="secondary" className="ml-auto">Step 2</Badge>
          </div>
          <p className="text-sm text-gray-600">
            This image provides the artistic style. Your content image will be transformed to match this style.
          </p>
          
          <div className="space-y-4">
            <input
              ref={styleInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'style');
              }}
              className="hidden"
            />
            
            {stylePreview ? (
              <div className="relative group">
                <img
                  src={stylePreview}
                  alt="Style preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-purple-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => styleInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => styleInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
              >
                <Upload className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm text-purple-600 font-medium">Upload Style Reference</p>
                <p className="text-xs text-gray-500 mt-1">Click to select</p>
              </div>
            )}
          </div>
        </Card>

        {/* Result Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Result</h3>
            <Badge variant="secondary" className="ml-auto">Step 3</Badge>
          </div>
          <p className="text-sm text-gray-600">
            Your content image transformed with the style from the reference image.
          </p>
          
          <div className="space-y-4">
            {resultImage ? (
              <div className="relative group">
                <img
                  src={resultImage}
                  alt="Style transfer result"
                  className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={downloadResult}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <Sparkles className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Generated Result</p>
                <p className="text-xs text-gray-500 mt-1">Will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Custom Prompt Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Custom Instructions (Optional)</h3>
          </div>
          <p className="text-sm text-gray-600">
            Add specific instructions to guide the style transfer process. Leave empty to use default settings.
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Make it more vibrant and colorful', 'Apply a watercolor painting style', 'Keep the original lighting but change the art style'"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={handleTransfer}
          disabled={!contentImage || !styleImage || isTransferring}
          className={cn(
            "px-8 py-3 text-lg font-semibold",
            isTransferring ? "bg-purple-400" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          )}
        >
          {isTransferring ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Transferring Style...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Transfer Style
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={resetAll}
          disabled={isTransferring}
          className="px-8 py-3 text-lg"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Progress Bar */}
      {isTransferring && progress && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="font-medium">Processing...</span>
              <span className="text-sm text-gray-500 ml-auto">{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{progress.message}</p>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {resultImage && !isTransferring && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Style transfer completed successfully!</span>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800">How it works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <p className="font-medium">Upload Content Image</p>
                <p>This is the image you want to transform. It will keep its composition and subject matter.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <p className="font-medium">Upload Style Reference</p>
                <p>This image provides the artistic style. Your content image will be transformed to match this style.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <p className="font-medium">Generate Result</p>
                <p>AI will combine your content with the style reference to create a unique artistic transformation.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}



