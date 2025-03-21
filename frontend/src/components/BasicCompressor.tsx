"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ImageIcon, DownloadIcon, CompressIcon } from "@/components/ui/icons";

export default function BasicCompressor() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState([75]); // Default quality 75%
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setOriginalImage(file);
    setCompressedPreview(null);
    setCompressedBlob(null);

    // Create preview for the original image
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Compress the image using canvas
  const compressImage = useCallback(async () => {
    if (!originalImage || !originalPreview) {
      toast.error("Please select an image first");
      return;
    }

    setIsCompressing(true);
    setProgress(10);

    try {
      // Simulate a bit of progress for better UX
      const progressTimer = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create an image element
      const img = new Image();
      img.src = originalPreview;

      // Process the image when it's loaded
      img.onload = () => {
        // Create a canvas with the image dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          toast.error("Your browser doesn't support image compression");
          setIsCompressing(false);
          clearInterval(progressTimer);
          return;
        }

        // Set the canvas dimensions to maintain aspect ratio
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a compressed blob
        canvas.toBlob((blob) => {
          if (!blob) {
            toast.error("Failed to compress image");
            setIsCompressing(false);
            clearInterval(progressTimer);
            return;
          }

          // Create a preview for the compressed image
          const reader = new FileReader();
          reader.onload = (e) => {
            setCompressedPreview(e.target?.result as string);
            setCompressedBlob(blob);
            setIsCompressing(false);
            setProgress(100);
            clearInterval(progressTimer);

            toast.success("Image compressed successfully!");
          };
          reader.readAsDataURL(blob);
        }, originalImage.type, quality[0] / 100);
      };

      // Handle errors
      img.onerror = () => {
        toast.error("Failed to load image for compression");
        setIsCompressing(false);
        clearInterval(progressTimer);
      };

    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Failed to compress image");
      setIsCompressing(false);
    }
  }, [originalImage, originalPreview, quality]);

  // Download the compressed image
  const downloadImage = useCallback(() => {
    if (!compressedBlob || !originalImage) return;

    try {
      // Create a download link
      const url = URL.createObjectURL(compressedBlob);
      const link = document.createElement('a');

      // Extract file extension from original filename
      const extension = originalImage.name.split('.').pop() || 'jpg';
      const baseName = originalImage.name.replace(`.${extension}`, '');

      link.href = url;
      link.download = `${baseName}-compressed.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  }, [compressedBlob, originalImage]);

  // Calculate sizes
  const originalSize = originalImage ? formatFileSize(originalImage.size) : '0 KB';
  const compressedSize = compressedBlob ? formatFileSize(compressedBlob.size) : '0 KB';
  const reduction = (originalImage && compressedBlob)
    ? Math.round((1 - (compressedBlob.size / originalImage.size)) * 100)
    : 0;

  return (
    <div className="container mx-auto p-4 py-8 max-w-5xl">
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <ImageIcon size={48} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Image Compressor</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Compress your images without losing quality
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                  Upload Image
                </label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={isCompressing}
                />
              </div>

              {originalImage && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Compression Quality: {quality[0]}%
                  </label>
                  <Slider
                    disabled={isCompressing}
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    step={1}
                  />
                </div>
              )}

              {originalImage && (
                <Button
                  onClick={compressImage}
                  disabled={isCompressing || !originalImage}
                  className="w-full"
                >
                  {isCompressing ? (
                    "Compressing..."
                  ) : (
                    <>
                      <CompressIcon className="mr-2 h-4 w-4" /> Compress Image
                    </>
                  )}
                </Button>
              )}

              {isCompressing && (
                <div className="space-y-2">
                  <div className="text-sm text-center">
                    Compressing: {progress}%
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {originalImage && originalPreview && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Original Image</h3>
                <div className="aspect-auto overflow-hidden rounded-md mb-4">
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="w-full h-auto object-contain max-h-[300px]"
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Size: {originalSize}
                </div>
              </CardContent>
            </Card>

            {compressedPreview && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-2">Compressed Image</h3>
                  <div className="aspect-auto overflow-hidden rounded-md mb-4">
                    <img
                      src={compressedPreview}
                      alt="Compressed"
                      className="w-full h-auto object-contain max-h-[300px]"
                    />
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="text-gray-500 dark:text-gray-400">
                      Size: {compressedSize}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      Reduction: {reduction}%
                    </div>
                    <Button
                      onClick={downloadImage}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" /> Download Compressed Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
