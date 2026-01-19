import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user';
import { Role } from '@/types';
import { getActorId } from '@/lib/utils/get-actor-id';

// GET /api/users - Get all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const { searchParams } = new URL(request.url);
    
    const filters = {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') as any || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      locationId: searchParams.get('locationId') || undefined,
    };

    const sortOptions = {
      sortBy: searchParams.get('sortBy') as any || 'firstName',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc',
    };

    const paginationOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await UserService.getUsers(
      filters,
      sortOptions,
      paginationOptions,
      userRole
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const body = await request.json();
    
    // Extract actorId from request
    const actorId = await getActorId(request) || body.actorId || undefined;
    
    const user = await UserService.createUser(body, userRole, actorId);
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 400 }
    );
  }
}
