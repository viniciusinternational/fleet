import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user';
import { Role } from '@/types';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Get user role and ID from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    const requestingUserId = undefined; // This should come from your auth system
    console.log('getUserById', {userRole, requestingUserId, params});
    const user = await UserService.getUserById(
      id,
      userRole,
      requestingUserId
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Get user role and ID from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    const requestingUserId = undefined; // This should come from your auth system
    
    const body = await request.json();
    
    const user = await UserService.updateUser(
      { id, ...body },
      userRole,
      requestingUserId
    );
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    await UserService.deleteUser(id, userRole);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 400 }
    );
  }
}
