'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk';
import { ThreadList } from '@/components/assistant-ui/thread-list';
import { Thread } from '@/components/assistant-ui/thread';

interface AssistantModuleProps {
  apiUrl?: string;
}

export function AssistantModule({ apiUrl }: AssistantModuleProps) {
  // Get API URL from environment variable or prop, default to /api/chat
  const chatApiUrl = apiUrl || process.env.NEXT_PUBLIC_ASSISTANT_API_URL || '/api/chat';

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: chatApiUrl,
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full flex-col">
        <ThreadList />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
