'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full mx-auto p-6">
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
                <Bot className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">AI Assistant</CardTitle>
            <CardDescription className="text-base mt-2">
              Coming Soon
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              This feature is currently under development and will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
