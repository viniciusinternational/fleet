'use client';

import { useChatbotStore } from '@/store/chatbot';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingChatButton() {
  const { isOpen, toggleChat, messages } = useChatbotStore();
  const unreadCount = messages.length;

  return (
    <Button
      onClick={toggleChat}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl',
        'bg-primary hover:bg-primary/90',
        isOpen && 'rotate-0'
      )}
      title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-primary-foreground" />
      ) : (
        <>
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </Button>
  );
}

