"use client";

import { useState } from "react";
import { Sparkles, Brain, LoaderCircle, ArrowUp, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

export function CampaignAIChat({ campaignId }: { campaignId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I have loaded all conversion metrics and logs for this campaign. Ask me anything about performance, channel comparisons, or segment details."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await apiClient<{ response: string }>(`/api/campaigns/${campaignId}/ai-chat`, {
        method: "POST",
        body: JSON.stringify({ question: userMessage.text })
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: result.response
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I couldn't process your question right now. Please verify that the Gemini API keys are configured correctly."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/10 bg-white/75 shadow-lg dark:bg-white/5 flex flex-col h-[420px]">
      <CardHeader className="border-b border-border/60 bg-background/30 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-purple-500" />
            <CardTitle className="text-sm">Ask AI About This Campaign</CardTitle>
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
            Gemini Context Active
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="rounded-full bg-purple-500/10 p-1.5 text-purple-500 shrink-0">
                  <Brain className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-secondary border border-border/60 rounded-tl-none text-foreground/90"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 max-w-[85%] mr-auto">
              <div className="rounded-full bg-purple-500/10 p-1.5 text-purple-500 shrink-0 animate-spin">
                <LoaderCircle className="h-3.5 w-3.5" />
              </div>
              <div className="bg-secondary border border-border/60 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-muted-foreground animate-pulse">
                Analyzing logs and calculating performance metrics...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-border/60 p-3 bg-background/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: Why did dispatches fail? How is WhatsApp conversion?"
              className="flex-1 h-9 text-xs"
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="h-9 w-9 p-0 shrink-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
