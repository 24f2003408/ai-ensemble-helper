import { useState, useEffect } from "react";
import { Brain, Sparkles, Zap, Cpu, Shield, Rocket } from "lucide-react";
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

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    aiService.setApiKey(key);
  };

  const handleApiKeyClear = () => {
    setApiKey(null);
  };

  const handleQuery = async (query: string, imageFile?: File) => {
    if (!apiKey) {
      toast.error("API key not set");
      return;
    }

    setIsLoading(true);
    setHasResults(true);

    const loadingResponses: AIResponse[] = [
      { modelName: "Claude 3.5 Sonnet", answer: "", isLoading: true },
      { modelName: "GPT-4o", answer: "", isLoading: true },
      { modelName: "Gemini Pro 1.5", answer: "", isLoading: true },
      { modelName: "Llama 3.2 Vision", answer: "", isLoading: true },
      { modelName: "Claude 3 Haiku", answer: "", isLoading: true },
    ];

    setResponses(loadingResponses);

    try {
      const results = await aiService.processQuery(query, imageFile);
      setResponses(results);

      const successCount = results.filter(r => !r.error).length;
      toast.success(`Received ${successCount} AI responses`);
    } catch (error) {
      console.error("Error processing query:", error);
      toast.error("Failed to process query.");
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
    return maxCount > 1
      ? Object.keys(answerCounts).find(answer => answerCounts[answer] === maxCount)
      : undefined;
  };

  const consensusAnswer = getConsensusAnswer();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm shadow-glow">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">
                AI Assignment Helper
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Harness the power of 10 cutting-edge AI models working in perfect harmony 
              to solve your academic challenges with unprecedented accuracy
            </p>
            <div className="flex items-center justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                <span>10 AI Models</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Smart Consensus</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 -mt-8 relative z-20">

        {/* API Key Configuration */}
        <div className="mb-8">
          <ApiKeyInput onApiKeySet={handleApiKeySet} onApiKeyClear={handleApiKeyClear} hasApiKey={!!apiKey} />
        </div>

        {/* Features */}
        {!hasResults && apiKey && (
          <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <div className="gradient-feature rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover transition-smooth">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">10 AI Models</h3>
              <p className="text-muted-foreground leading-relaxed">
                Claude, GPT-4, Gemini, Llama, Qwen, and more elite models collaborating 
                to provide the most comprehensive answers
              </p>
            </div>
            <div className="gradient-feature rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover transition-smooth">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Smart Consensus</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced algorithms analyze responses to identify patterns and 
                highlight the most reliable answers
              </p>
            </div>
            <div className="gradient-feature rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover transition-smooth">
              <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Visual Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload images, diagrams, or screenshots for comprehensive 
                visual problem-solving capabilities
              </p>
            </div>
          </div>
        )}

        {/* Query Input */}
        {apiKey && (
          <div className="mb-8">
            <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
          </div>
        )}

        {/* Results */}
        {hasResults && apiKey && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {responses.map((response, index) => (
                <AIResponseCard
                  key={`${response.modelName}-${index}`}
                  response={response}
                  consensusAnswer={consensusAnswer}
                />
              ))}
            </div>
            <FinalRecommendation responses={responses} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
