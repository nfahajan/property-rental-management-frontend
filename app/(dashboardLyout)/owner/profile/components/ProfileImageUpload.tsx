"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Loader2, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  firstName?: string;
  lastName?: string;
}

export default function ProfileImageUpload({
  currentImage,
  onImageChange,
  disabled = false,
  firstName = "",
  lastName = "",
}: ProfileImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejected) => {
          const errors = rejected.errors.map((e: any) => e.message).join(", ");
          toast.error(`File rejected`, {
            description: errors,
          });
        });
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Revoke old preview URL
        if (preview) {
          URL.revokeObjectURL(preview);
        }

        setSelectedFile(file);
        const newPreview = URL.createObjectURL(file);
        setPreview(newPreview);
        onImageChange(file);

        toast.success("Image selected", {
          description: "Profile image ready to upload",
        });
      }
    },
    [preview, onImageChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled,
    multiple: false,
  });

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    onImageChange(null);

    toast.info("Image removed", {
      description: "Profile image removed",
    });
  };

  const displayImage = preview || currentImage;

  // Generate initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName?.trim().charAt(0).toUpperCase() || "";
    const lastInitial = lastName?.trim().charAt(0).toUpperCase() || "";
    return firstInitial + lastInitial;
  };

  const initials = getInitials();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Profile Image Display */}
      <div className="relative">
        <div
          className={cn(
            "w-32 h-32 rounded-full overflow-hidden border-4 border-muted",
            "flex items-center justify-center",
            isDragActive && "border-primary",
            displayImage
              ? "bg-muted"
              : "bg-gradient-to-br from-primary/80 to-primary"
          )}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-user.jpg";
              }}
            />
          ) : initials ? (
            <span className="text-4xl font-bold text-white">{initials}</span>
          ) : (
            <User className="w-16 h-16 text-muted-foreground" />
          )}
        </div>

        {/* Upload Button Overlay */}
        {!disabled && (
          <div
            {...getRootProps()}
            className={cn(
              "absolute inset-0 rounded-full cursor-pointer",
              "flex items-center justify-center",
              "bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
              isDragActive && "opacity-100 bg-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              const input = document.querySelector(
                'input[type="file"]'
              ) as HTMLInputElement;
              input?.click();
            }}
            disabled={disabled}
          >
            <Camera className="w-4 h-4 mr-2" />
            {displayImage ? "Change Photo" : "Upload Photo"}
          </Button>

          {(preview || selectedFile) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Upload Info - Only show in edit mode */}
      {!disabled && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, at least 200x200px
          </p>
          <p className="text-xs text-muted-foreground">
            Max file size: 5MB (JPG, PNG, WEBP)
          </p>
        </div>
      )}
    </div>
  );
}
