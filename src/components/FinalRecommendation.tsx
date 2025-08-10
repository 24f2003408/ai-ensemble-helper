import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";
import { AIResponse } from "./AIResponseCard";

interface FinalRecommendationProps {
  responses: AIResponse[];
}

export default function FinalRecommendation({ responses }: FinalRecommendationProps) {
  const validResponses = responses.filter(r => !r.error && !r.isLoading);
  
  if (validResponses.length === 0) {
    return null;
  }

  // Find consensus or best answer with selected options
  const optionCounts = validResponses.reduce((acc, response) => {
    if (response.selectedOption) {
      acc[response.selectedOption] = (acc[response.selectedOption] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const answerCounts = validResponses.reduce((acc, response) => {
    acc[response.answer] = (acc[response.answer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Use option consensus if available, otherwise use answer consensus
  const useOptionConsensus = Object.keys(optionCounts).length > 0;
  const counts = useOptionConsensus ? optionCounts : answerCounts;
  const mostCommonAnswer = Object.entries(counts)
    .sort(([,a], [,b]) => b - a)[0];

  // Find the best response based on consensus
  const bestResponse = useOptionConsensus
    ? validResponses.find(r => r.selectedOption === mostCommonAnswer[0])
    : validResponses.find(r => r.answer === mostCommonAnswer[0]) ||
      validResponses.reduce((best, current) => 
        (current.confidence || 0) > (best.confidence || 0) ? current : best
      );

  if (!bestResponse) return null;

  const consensusCount = mostCommonAnswer[1];
  const totalResponses = validResponses.length;
  const consensusPercentage = (consensusCount / totalResponses) * 100;
  const isConsensus = consensusCount > 1;
  const agreementLevel = consensusPercentage >= 80 ? "strong" : 
                        consensusPercentage >= 60 ? "moderate" : "weak";

  return (
    <Card className="p-6 gradient-primary text-primary-foreground shadow-primary animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-foreground/20 rounded-lg">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Final Recommended Answer</h2>
          <p className="text-primary-foreground/80 text-sm">
            {isConsensus 
              ? `${consensusCount}/${totalResponses} AI models agree (${Math.round(consensusPercentage)}% consensus)`
              : "Best answer based on confidence analysis"
            }
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-primary-foreground/10 rounded-lg p-4">
          {bestResponse.selectedOption && (
            <Badge className="mb-3 bg-primary-foreground text-primary">
              Selected Option: {bestResponse.selectedOption}
            </Badge>
          )}
          <p className="text-lg font-medium mb-2">{bestResponse.answer}</p>
          {bestResponse.reasoning && (
            <p className="text-primary-foreground/90 text-sm leading-relaxed">
              {bestResponse.reasoning}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>
              {isConsensus ? `${agreementLevel} consensus` : "Best confidence score"}
            </span>
          </div>
          
          {bestResponse.confidence && (
            <Badge className="bg-primary-foreground/20 text-primary-foreground">
              {Math.round(bestResponse.confidence * 100)}% confident
            </Badge>
          )}
        </div>

        {!isConsensus && totalResponses > 1 && (
          <div className="bg-primary-foreground/10 rounded-lg p-3">
            <p className="text-xs text-primary-foreground/80">
              ⚠️ AI models provided different answers. This recommendation is based on the highest confidence score.
              Consider reviewing individual responses above for additional context.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}