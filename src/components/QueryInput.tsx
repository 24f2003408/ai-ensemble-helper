import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, Send, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface QueryInputProps {
  onSubmit: (query: string, imageFile?: File) => void;
  isLoading?: boolean;
}

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!query.trim() && !imageFile) {
      toast.error("Please enter a question or upload an image");
      return;
    }
    onSubmit(query.trim(), imageFile || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 gradient-card shadow-card transition-smooth hover:shadow-card-hover">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Ask your question
          </label>
          <Textarea
            placeholder="Enter your assignment question here... (Ctrl+Enter to submit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none border-2 focus:border-primary transition-smooth"
            disabled={isLoading}
          />
        </div>

        {imagePreview && (
          <div className="relative">
            <div className="relative w-full max-w-xs mx-auto">
              <img
                src={imagePreview}
                alt="Uploaded question"
                className="w-full h-auto rounded-lg border-2 border-border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="transition-smooth hover:border-primary hover:text-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            {imageFile && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                {imageFile.name}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!query.trim() && !imageFile)}
            className="gradient-primary shadow-primary transition-smooth hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Get Answer
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Supports multiple choice questions and general assignment queries
        </p>
      </div>
    </Card>
  );
}