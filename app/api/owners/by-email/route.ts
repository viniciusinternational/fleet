import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OwnerService } from '@/lib/services/owner';

// Validation schema for email parameter
const emailSchema = z.string().email('Invalid email format');

// GET /api/owners/by-email?email=example@email.com - Find owner by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const validatedEmail = emailSchema.parse(email);
    
    const owner = await OwnerService.getOwnerByEmail(validatedEmail);
    
    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: owner,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('Error fetching owner by email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owner' },
      { status: 500 }
    );
  }
}


