import { useState } from "react";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const DetectDebris = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-4">
              <Trash2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Detect Debris</h1>
            <p className="text-lg text-muted-foreground">
              Upload an image to identify and track debris in coral reef environments
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Upload Reef Image</CardTitle>
              <CardDescription>
                Supported formats: JPG, PNG, WEBP (Max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                {selectedImage ? (
                  <div className="space-y-6">
                    <img
                      src={selectedImage}
                      alt="Uploaded reef"
                      className="max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedImage(null)}
                      >
                        Remove Image
                      </Button>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                        Detect Debris
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      Drag & Drop Your Image
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      or click to browse from your device
                    </p>
                    <label htmlFor="image-upload">
                      <Button asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DetectDebris;
