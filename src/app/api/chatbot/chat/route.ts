import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini';
import type { ChatContext } from '@/types';

/**
 * POST /api/chatbot/chat
 * Handles chat messages and returns AI responses
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required',
        },
        { status: 400 }
      );
    }

    // Fetch context data
    const contextResponse = await fetch(
      `${request.nextUrl.origin}/api/chatbot/context`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!contextResponse.ok) {
      throw new Error('Failed to fetch context data');
    }

    const contextData = await contextResponse.json();
    
    if (!contextData.success) {
      throw new Error(contextData.error || 'Failed to load context');
    }

    const context: ChatContext = contextData.data;

    // Get AI response
    const aiResponse = await GeminiService.sendMessage(message, context);

    return NextResponse.json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

