"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  maxFiles?: number;
  existingImages?: string[];
  onImagesChange: (files: File[]) => void;
  onRemoveExisting?: (imageName: string) => void;
  disabled?: boolean;
  baseUrl?: string;
}

export default function ImageUpload({
  maxFiles = 20,
  existingImages = [],
  onImagesChange,
  onRemoveExisting,
  disabled = false,
  baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejected) => {
          const errors = rejected.errors.map((e: any) => e.message).join(", ");
          toast.error(`File ${rejected.file.name} rejected`, {
            description: errors,
          });
        });
      }

      // Check total files limit
      const totalFiles =
        existingImages.length + selectedFiles.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error("Too many files", {
          description: `You can only upload a maximum of ${maxFiles} images. Currently: ${existingImages.length} existing + ${selectedFiles.length} selected.`,
        });
        return;
      }

      // Add new files
      const newFiles = [...selectedFiles, ...acceptedFiles];
      setSelectedFiles(newFiles);
      onImagesChange(newFiles);

      // Create previews
      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => [...prev, ...newPreviews]);

      toast.success("Images added", {
        description: `${acceptedFiles.length} image(s) ready to upload`,
      });
    },
    [selectedFiles, existingImages.length, maxFiles, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
      },
      maxFiles: maxFiles - existingImages.length - selectedFiles.length,
      maxSize: 5 * 1024 * 1024, // 5MB
      disabled,
    });

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);

    toast.info("Image removed", {
      description: "Image removed from upload queue",
    });
  };

  const handleRemoveExisting = (imageName: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(imageName);
    }
  };

  const totalImages = existingImages.length + selectedFiles.length;
  const canAddMore = totalImages < maxFiles;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {canAddMore && (
        <Card
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragActive && "border-primary bg-primary/5",
            isDragReject && "border-destructive bg-destructive/5",
            disabled && "opacity-50 cursor-not-allowed",
            !isDragActive &&
              !isDragReject &&
              "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-primary animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? "Drop images here" : "Upload Property Images"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop images here, or click to select files
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supported formats: JPEG, PNG, WebP, GIF</p>
              <p>Maximum file size: 5MB per image</p>
              <p>
                Maximum {maxFiles} images total ({totalImages}/{maxFiles} used)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Existing Images ({existingImages.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((image, index) => {
              // Check if image is a full URL (Cloudinary) or local filename
              const isFullUrl =
                image.startsWith("http://") || image.startsWith("https://");
              const imageUrl = isFullUrl
                ? image
                : `${baseUrl}/uploads/${image}`;

              return (
                <div key={`existing-${index}`} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted">
                    <img
                      src={imageUrl}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  {onRemoveExisting && !disabled && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveExisting(image)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 text-center">
                    Image {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            New Images to Upload ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary">
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-xs py-1 px-2 text-center truncate">
                  {file.name}
                </div>
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-br">
                  NEW
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {(existingImages.length > 0 || selectedFiles.length > 0) && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">Total Images: </span>
            <span>
              {totalImages} / {maxFiles}
            </span>
            {selectedFiles.length > 0 && (
              <span className="text-muted-foreground ml-2">
                ({selectedFiles.length} new)
              </span>
            )}
          </div>
          {!canAddMore && (
            <div className="text-sm text-amber-600 font-medium">
              Maximum limit reached
            </div>
          )}
        </div>
      )}
    </div>
  );
}
