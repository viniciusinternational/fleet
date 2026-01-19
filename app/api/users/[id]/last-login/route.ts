import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user';
import { AuditService } from '@/lib/services/audit';
import { db } from '@/lib/db';
import { Role } from '@/types';

// POST /api/users/[id]/last-login - Update user's last login timestamp and log to audit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the user's current state before update
    const beforeState = await AuditService.getBeforeState('User', id);
    
    if (!beforeState) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update lastLogin timestamp
    const now = new Date();
    
    // Get metadata from request (IP address, user agent, etc.)
    const metadata: any = {};
    
    // Try to get IP address from headers
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') || 
                     'unknown';
    metadata.ipAddress = ipAddress.split(',')[0].trim();

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';
    metadata.userAgent = userAgent;

    // Update user using UserService - this handles audit logging
    // Use Role.NORMAL since user is updating their own lastLogin
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        lastLogin: now,
      },
      include: {
        location: true,
      },
    });

    // Log the login event to audit log with metadata using LOGIN action
    await AuditService.logSpecialAction(
      'LOGIN',
      id, // The user logging in is the actor
      'User',
      id,
      metadata,
      JSON.parse(JSON.stringify(updatedUser))
    );

    // Map to User type using the private method via UserService
    // We'll fetch the user using the service to get the properly mapped type
    const user = await UserService.getUserById(id, Role.ADMIN, id);

    return NextResponse.json({ 
      success: true,
      user,
      lastLogin: now 
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update last login' },
      { status: 500 }
    );
  }
}
