  // import { useState } from "react";
  // import { Card } from "@/components/ui/card";
  // import { Input } from "@/components/ui/input";
  // import { Button } from "@/components/ui/button";
  // import { Key, ExternalLink } from "lucide-react";
  // import { toast } from "sonner";

  // interface ApiKeyInputProps {
  //   onApiKeySubmit: (apiKey: string) => void;
  // }

  // export default function ApiKeyInput({ onApiKeySubmit }: ApiKeyInputProps) {
  //   const [apiKey, setApiKey] = useState("");

  //   const handleSubmit = () => {
  //     if (!apiKey.trim()) {
  //       toast.error("Please enter your OpenRouter API key");
  //       return;
  //     }
  //     onApiKeySubmit(apiKey.trim());
  //     toast.success("API key saved! You can now start asking questions.");
  //   };

  //   return (
  //     <Card className="w-full max-w-2xl mx-auto p-6 gradient-card shadow-card animate-fade-in">
  //       <div className="text-center space-y-4">
  //         <div className="flex items-center justify-center gap-2 mb-4">
  //           <div className="p-2 bg-primary/10 rounded-lg">
  //             <Key className="h-5 w-5 text-primary" />
  //           </div>
  //           <h2 className="text-xl font-semibold">Setup Required</h2>
  //         </div>
          
  //         <p className="text-muted-foreground mb-6">
  //           To use multiple AI models, please enter your OpenRouter API key. 
  //           This gives you access to Claude, GPT-4, Gemini, and more.
  //         </p>

  //         <div className="space-y-4">
  //           <div className="space-y-2">
  //             <label className="text-sm font-medium text-left block">
  //               OpenRouter API Key
  //             </label>
  //             <Input
  //               type="password"
  //               placeholder="sk-or-v1-..."
  //               value={apiKey}
  //               onChange={(e) => setApiKey(e.target.value)}
  //               className="border-2 focus:border-primary transition-smooth"
  //             />
  //           </div>

  //           <Button
  //             onClick={handleSubmit}
  //             className="w-full gradient-primary shadow-primary transition-smooth hover:opacity-90"
  //           >
  //             Save API Key & Continue
  //           </Button>
  //         </div>

  //         <div className="pt-4 border-t border-border">
  //           <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
  //             <span>Don't have an OpenRouter account?</span>
  //             <a
  //               href="https://openrouter.ai/keys"
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="inline-flex items-center gap-1 text-primary hover:underline"
  //             >
  //               Get your API key here
  //               <ExternalLink className="h-3 w-3" />
  //             </a>
  //           </div>
  //           <p className="text-xs text-muted-foreground mt-2">
  //             Your API key is stored locally and never sent to our servers
  //           </p>
  //         </div>
  //       </div>
  //     </Card>
  //   );
  // }