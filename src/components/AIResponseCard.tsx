import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Brain, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIResponse {
  modelName: string;
  answer: string;
  reasoning?: string;
  confidence?: number;
  error?: string;
  isLoading?: boolean;
  selectedOption?: string;
}

interface AIResponseCardProps {
  response: AIResponse;
  consensusAnswer?: string;
  isHighlighted?: boolean;
}

export default function AIResponseCard({ 
  response, 
  consensusAnswer, 
  isHighlighted 
}: AIResponseCardProps) {
  const isConsensus = consensusAnswer && response.answer === consensusAnswer;
  const isConflict = consensusAnswer && response.answer !== consensusAnswer && !response.error;

  const getCardVariant = () => {
    if (response.error) return "destructive";
    if (isConsensus) return "success";
    if (isConflict) return "warning";
    return "default";
  };

  const getIcon = () => {
    if (response.isLoading) return <Clock className="h-4 w-4 animate-spin" />;
    if (response.error) return <AlertCircle className="h-4 w-4" />;
    if (isConsensus) return <CheckCircle className="h-4 w-4" />;
    return <Brain className="h-4 w-4" />;
  };

  const getCardClasses = () => {
    const base = "transition-smooth hover:shadow-card-hover";
    
    if (response.error) {
      return cn(base, "border-destructive/20 bg-destructive/5");
    }
    if (isConsensus) {
      return cn(base, "border-success/20 bg-success-light/30");
    }
    if (isConflict) {
      return cn(base, "border-warning/20 bg-warning-light/30");
    }
    if (isHighlighted) {
      return cn(base, "border-primary/20 bg-primary-light/30");
    }
    return cn(base, "gradient-card shadow-card");
  };

  return (
    <Card className={cn("p-4 space-y-3 animate-scale-in", getCardClasses())}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-foreground">{response.modelName}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {response.confidence && (
            <Badge variant="outline" className="text-xs">
              {Math.round(response.confidence * 100)}% confident
            </Badge>
          )}
          
          {isConsensus && (
            <Badge className="bg-success text-success-foreground">
              Consensus
            </Badge>
          )}
          
          {isConflict && (
            <Badge className="bg-warning text-warning-foreground">
              Different
            </Badge>
          )}
        </div>
      </div>

      {response.isLoading ? (
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      ) : response.error ? (
        <div className="text-destructive">
          <p className="font-medium">Error occurred</p>
          <p className="text-sm opacity-80">{response.error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="font-medium text-foreground mb-1">Answer:</p>
            <div className="bg-muted/30 rounded-lg p-3">
              {response.selectedOption && (
                <Badge variant="outline" className="mb-2">
                  Option: {response.selectedOption}
                </Badge>
              )}
              <p className="text-foreground">{response.answer}</p>
            </div>
          </div>

          {response.reasoning && (
            <div>
              <p className="font-medium text-foreground mb-1">Reasoning:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {response.reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}