'use client';

import { ThreadPrimitive, MessagePrimitive, ComposerPrimitive } from '@assistant-ui/react';
import { MarkdownText } from '@/components/assistant-ui/markdown-text';

function UserMessage() {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-end">
      <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-start">
      <div className="rounded-lg bg-muted px-4 py-2">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

export function Thread() {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
        <ThreadPrimitive.Empty>
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Start a conversation...</p>
          </div>
        </ThreadPrimitive.Empty>
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>
      <div className="border-t p-4">
        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input
            placeholder="Type your message..."
            className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2 flex justify-end">
            <ComposerPrimitive.Send asChild>
              <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                Send
              </button>
            </ComposerPrimitive.Send>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}
