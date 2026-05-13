"use client";

import React, { useState, useEffect, useRef } from "react";
import { sendMessage, getHistory, startNewChat, clearChat } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartPulse, Plus, Trash2, Send, Bot, User, ShieldAlert } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHistory().then((data) => {
      if (data && data.messages) setMessages(data.messages);
    });
  }, []);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const res = await sendMessage(input);
    if (res && res.response) {
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
      setInput("");
    }
    setLoading(false);
  }

  async function handleNewChat() {
    await startNewChat();
    setMessages([]);
    setInput("");
  }

  async function handleClear() {
    await clearChat();
    setMessages([]);
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-card border-r border-border shadow-[4px_0_24px_rgba(20,29,35,0.04)] p-6 z-10">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 text-primary">
            <HeartPulse size={32} />
          </div>
          <h1 className="font-bold text-xl text-foreground">CareMate AI</h1>
          <span className="text-sm text-muted-foreground mt-1">Clinical Assistant v3.0</span>
          
          <Button
            onClick={handleNewChat}
            className="mt-6 w-full h-12 gap-2 font-semibold shadow-md"
          >
            <Plus size={18} /> New Consultation
          </Button>
        </div>
        
        <div className="mt-auto space-y-4">
          <div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
            <ShieldAlert className="inline-block mr-2 mb-1 text-primary" size={16} />
            Your medical queries are encrypted and processed securely.
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-background relative">
        {/* Header */}
        <header className="flex-none h-20 w-full flex items-center justify-between px-6 lg:px-12 bg-card/80 backdrop-blur-md border-b border-border z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-primary">
              <HeartPulse size={20} />
            </div>
            <h2 className="font-bold text-xl text-foreground">
              Virtual Doctor
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
              title="Clear conversation"
            >
              <Trash2 size={16} className="mr-2" /> Clear
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-12">
          <div className="max-w-3xl mx-auto flex flex-col space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-80 mt-10">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Bot size={40} className="text-primary" />
                </div>
                <h3 className="font-bold text-2xl mb-2 text-foreground">Welcome to CareMate</h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  I'm your AI-powered clinical assistant. Describe your symptoms or ask a medical question, and I will provide preliminary insights.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground hidden md:flex" : "bg-secondary text-secondary-foreground"}`}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div
                      className={`px-5 py-4 rounded-2xl shadow-sm text-base leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card text-foreground rounded-bl-sm border border-border/50"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} className="h-4"></div>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 lg:p-6 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-card shadow-[0_8px_24px_rgba(20,29,35,0.08)] rounded-[16px] p-2 border border-border/50">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms or ask a question..."
                className="flex-1 bg-transparent border-none shadow-none h-12 focus-visible:ring-0 px-4 text-base"
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-10 w-10 p-0 rounded-xl bg-primary text-primary-foreground shrink-0 transition-transform active:scale-95 ml-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send size={18} className="ml-1" />
                )}
              </Button>
            </div>
            
            <div className="text-center mt-3">
              <span className="text-xs text-muted-foreground font-medium">
                Clinical AI can make mistakes. Always consult healthcare professionals for medical advice.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
