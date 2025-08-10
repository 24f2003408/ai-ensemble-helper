import { useState, useEffect } from "react";
import { Brain, Sparkles, Zap } from "lucide-react";
import QueryInput from "@/components/QueryInput";
import AIResponseCard, { AIResponse } from "@/components/AIResponseCard";
import FinalRecommendation from "@/components/FinalRecommendation";
import ApiKeyInput from "@/components/ApiKeyInput";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    // Check for stored API key
    const storedKey = localStorage.getItem("openrouter_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      aiService.setApiKey(storedKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
    aiService.setApiKey(key);
  };

  const handleQuery = async (query: string, imageFile?: File) => {
    if (!apiKey) {
      toast.error("Please set up your API key first");
      return;
    }

    setIsLoading(true);
    setHasResults(true);
    
    // Initialize loading states
    const loadingResponses: AIResponse[] = [
      { modelName: "Claude 3 Sonnet", answer: "", isLoading: true },
      { modelName: "GPT-4 Turbo", answer: "", isLoading: true },
      { modelName: "Gemini Pro", answer: "", isLoading: true },
      { modelName: "Mixtral 8x7B", answer: "", isLoading: true },
    ];
    
    setResponses(loadingResponses);

    try {
      const results = await aiService.processQuery(query, imageFile);
      setResponses(results);
      
      const successCount = results.filter(r => !r.error).length;
      toast.success(`Received ${successCount} AI responses`);
    } catch (error) {
      console.error("Error processing query:", error);
      toast.error("Failed to process query. Please check your API key and try again.");
      setResponses([]);
      setHasResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getConsensusAnswer = () => {
    const validResponses = responses.filter(r => !r.error && !r.isLoading);
    if (validResponses.length < 2) return undefined;

    const answerCounts = validResponses.reduce((acc, response) => {
      acc[response.answer] = (acc[response.answer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(answerCounts));
    return maxCount > 1 ? Object.keys(answerCounts).find(answer => answerCounts[answer] === maxCount) : undefined;
  };

  const consensusAnswer = getConsensusAnswer();

  if (!apiKey) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI Assignment Helper
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers from multiple AI models simultaneously. Perfect for assignments, MCQs, and academic questions.
            </p>
          </div>
          
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Assignment Helper
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers from multiple AI models simultaneously and find the best solution
          </p>
        </div>

        {/* Features */}
        {!hasResults && (
          <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multiple AI Models</h3>
              <p className="text-sm text-muted-foreground">
                Claude, GPT-4, Gemini, and Mixtral working together
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-success/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Smart Consensus</h3>
              <p className="text-sm text-muted-foreground">
                Automatically detects agreement and highlights the best answer
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-warning/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Image Support</h3>
              <p className="text-sm text-muted-foreground">
                Upload images with questions for visual problem solving
              </p>
            </div>
          </div>
        )}

        {/* Query Input */}
        <div className="mb-8">
          <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
        </div>

        {/* Results */}
        {hasResults && (
          <div className="space-y-6">
            {/* AI Responses */}
            <div className="grid gap-4 md:grid-cols-2">
              {responses.map((response, index) => (
                <AIResponseCard
                  key={`${response.modelName}-${index}`}
                  response={response}
                  consensusAnswer={consensusAnswer}
                />
              ))}
            </div>

            {/* Final Recommendation */}
            <FinalRecommendation responses={responses} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
