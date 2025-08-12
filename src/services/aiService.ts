import OpenAI from 'openai';
import { AIResponse } from '@/components/AIResponseCard';

// OpenRouter configuration for multiple AI models
let openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "temp", // Will be set dynamically via setApiKey
  dangerouslyAllowBrowser: true
});

const AI_MODELS = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    displayName: "Claude 3.5 Sonnet"
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o", 
    displayName: "GPT-4o"
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    displayName: "Gemini Pro 1.5"
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct",
    name: "Llama 3.2 Vision",
    displayName: "Llama 3.2 Vision"
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    displayName: "Claude 3 Haiku"
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    displayName: "GPT-4o Mini"
  },
  {
    id: "meta-llama/llama-3.2-90b-vision-instruct",
    name: "Llama 3.2 90B Vision",
    displayName: "Llama 3.2 90B Vision"
  },
  {
    id: "qwen/qwen-2-vl-72b-instruct",
    name: "Qwen 2 VL 72B",
    displayName: "Qwen 2 VL 72B"
  },
  {
    id: "microsoft/phi-3.5-vision-instruct",
    name: "Phi 3.5 Vision",
    displayName: "Phi 3.5 Vision"
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    displayName: "DeepSeek Chat"
  }
];

export class AIService {
  private apiKey: string | null = null;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    // Create a new OpenAI client instance with the new API key
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async processQuery(query: string, imageFile?: File): Promise<AIResponse[]> {
    if (!this.apiKey) {
      throw new Error("API key not provided");
    }

    const systemPrompt = `You are an AI assistant helping with academic assignments. 

For multiple choice questions:
- Identify the correct option (A, B, C, D, etc.)
- Provide clear reasoning for your choice
- Be confident in your selection

For general questions:
- Provide a comprehensive, accurate answer
- Include step-by-step reasoning when applicable
- Be educational and helpful

Format your response as:
- Answer: [Your main answer]
- Reasoning: [Your detailed explanation]
- Confidence: [0.0-1.0 score]

If it's a multiple choice question, also include:
- Selected Option: [Letter of chosen option]`;

    let userMessage = query;
    
    // Handle image input
    if (imageFile) {
      const base64Image = await this.fileToBase64(imageFile);
      userMessage = `Please analyze this image and answer the question shown: ${query || "What is the question in this image and what is the answer?"}`;
    }

    const promises = AI_MODELS.map(async (model) => {
      try {
        const messages: any[] = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: imageFile 
              ? [
                  { type: "text", text: userMessage },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${imageFile.type};base64,${await this.fileToBase64(imageFile)}`
                    }
                  }
                ]
              : userMessage
          }
        ];

        const completion = await openai.chat.completions.create({
          model: model.id,
          messages,
          max_tokens: 1000,
          temperature: 0.3,
        });

        const response = completion.choices[0]?.message?.content || "";
        return this.parseAIResponse(response, model.displayName);
        
      } catch (error) {
        console.error(`Error with ${model.displayName}:`, error);
        return {
          modelName: model.displayName,
          answer: "",
          error: error instanceof Error ? error.message : "Unknown error occurred"
        };
      }
    });

    return Promise.all(promises);
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parseAIResponse(response: string, modelName: string): AIResponse {
    try {
      // Extract structured information from the response
      const answerMatch = response.match(/Answer:\s*(.+?)(?=\n|Reasoning:|Selected Option:|Confidence:|$)/s);
      const reasoningMatch = response.match(/Reasoning:\s*(.+?)(?=\n|Selected Option:|Confidence:|$)/s);
      const confidenceMatch = response.match(/Confidence:\s*([0-9.]+)/);
      const optionMatch = response.match(/Selected Option:\s*([A-Z])/);

      const answer = answerMatch?.[1]?.trim() || response.trim();
      const reasoning = reasoningMatch?.[1]?.trim();
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : undefined;
      const selectedOption = optionMatch?.[1];

      return {
        modelName,
        answer,
        reasoning,
        confidence,
        selectedOption
      };
    } catch (error) {
      // Fallback: use the entire response as the answer
      return {
        modelName,
        answer: response.trim(),
        reasoning: undefined,
        confidence: 0.5
      };
    }
  }
}

export const aiService = new AIService();
