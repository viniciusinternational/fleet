'use client';

import { AssistantModule } from '@/components/assistant-ui/assistant-module';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full mx-auto p-6">
      <AssistantModule />
    </div>
  );
}
