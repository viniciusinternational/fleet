'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatbotStore } from '@/store/chatbot';
import { Message } from '@/components/chatbot/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatbotPage() {
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  } = useChatbotStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    await sendMessage(message);
  };

  const handleClearMessages = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      clearMessages();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fleet AI Assistant</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online and ready to help
            </p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearMessages}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <svg
                    className="w-12 h-12 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">
                  Welcome to Fleet AI
                </h3>
                <p className="text-base text-muted-foreground mb-8 max-w-2xl">
                  Ask me anything about your vehicles, owners, or locations. I have access to your complete fleet data and can help you find information quickly.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                  <Card className="text-left hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    setInput("Show me all vehicles in transit");
                    inputRef.current?.focus();
                  }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                        </svg>
                        Vehicle Status
                      </CardTitle>
                      <CardDescription className="text-xs">
                        "Show me all vehicles in transit"
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="text-left hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    setInput("Which owners have the most vehicles?");
                    inputRef.current?.focus();
                  }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        Owner Analysis
                      </CardTitle>
                      <CardDescription className="text-xs">
                        "Which owners have the most vehicles?"
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="text-left hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    setInput("List all operational locations");
                    inputRef.current?.focus();
                  }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        Location Info
                      </CardTitle>
                      <CardDescription className="text-xs">
                        "List all operational locations"
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="text-left hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    setInput("What vehicles are clearing customs?");
                    inputRef.current?.focus();
                  }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        Customs Status
                      </CardTitle>
                      <CardDescription className="text-xs">
                        "What vehicles are clearing customs?"
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-3 text-muted-foreground mb-4 bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm">AI is analyzing your data...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-6 bg-card">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about vehicles, owners, or locations..."
                disabled={isLoading}
                className="flex-1 bg-background h-12 text-base"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="lg"
                className="px-6 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              AI responses may not always be accurate. Verify critical information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

