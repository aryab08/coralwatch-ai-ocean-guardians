import { useState } from "react";
import { ArrowLeft, Upload, Activity, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const CoralHealth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Convert base64 to blob
      const base64Data = selectedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'coral.jpg');

      const response = await fetch('https://degree-checker-01-coral-health-orchestrator.hf.space/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Coral health analysis has been completed successfully.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Coral Health Check</h1>
            <p className="text-lg text-muted-foreground">
              Upload an image to analyze coral health and detect potential diseases
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Upload Coral Image</CardTitle>
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
                      alt="Uploaded coral"
                      className="max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setAnalysisResult(null);
                        }}
                        disabled={isAnalyzing}
                      >
                        Remove Image
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze Health'
                        )}
                      </Button>
                    </div>

                    {analysisResult && (
                      <Card className="mt-6 border-emerald-200">
                        <CardHeader>
                          <CardTitle className="text-emerald-600">Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                            {JSON.stringify(analysisResult, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
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

export default CoralHealth;
