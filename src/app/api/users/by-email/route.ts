import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user';
import { Role } from '@/types';

// GET /api/users/by-email - Get user by email
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = await UserService.getUserByEmail(email, userRole);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
