import { NextRequest, NextResponse } from 'next/server';
import type { ZitadelUser } from '@/types';
import { Role } from '@/types';
import { UserService } from '@/lib/services/user';

// API Response Types
interface AuthAPIUser {
  userId: string;
  username: string;
  state: string;
  human?: {
    profile?: {
      givenName?: string;
      familyName?: string;
      displayName?: string;
    };
    email?: {
      email: string;
    };
  };
}

interface AuthAPIResponse {
  ok: boolean;
  data: {
    result: AuthAPIUser[];
  };
}

// GET /api/users/zitadel - Fetch users from auth API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch users from auth API
    const response = await fetch('https://auth.viniciusint.com/api/v1/zitadel/auth/user');
    
    if (!response.ok) {
      throw new Error('Failed to fetch users from auth API');
    }

    const data: AuthAPIResponse = await response.json();

    if (!data.ok || !data.data?.result) {
      throw new Error('Invalid response from auth API');
    }

    // Transform API response to ZitadelUser format
    let users: ZitadelUser[] = data.data.result
      .filter(user => user.human) // Only human users
      .map((user): ZitadelUser => {
        const human = user.human!;
        const profile = human.profile || {};
        const email = human.email || { email: '' };

        return {
          id: user.userId,
          email: email.email,
          firstName: profile.givenName || '',
          lastName: profile.familyName || '',
          displayName: profile.displayName || `${profile.givenName || ''} ${profile.familyName || ''}`.trim() || user.username,
          preferredUsername: user.username,
          state: user.state,
        };
      });

    // Client-side search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.displayName.toLowerCase().includes(searchLower) ||
        user.preferredUsername?.toLowerCase().includes(searchLower)
      );
    }

    // Apply limit
    users = users.slice(0, limit);

    return NextResponse.json({
      ok: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users from auth API:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

// POST /api/users/zitadel - Create user from Zitadel
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const body = await request.json();
    const { zitadelUserId, phone, locationId, role, permissions } = body;

    // Validate required fields
    if (!zitadelUserId || !phone || !locationId) {
      return NextResponse.json(
        { error: 'Missing required fields: zitadelUserId, phone, and locationId are required' },
        { status: 400 }
      );
    }

    // Fetch the specific Zitadel user
    const response = await fetch('https://auth.viniciusint.com/api/v1/zitadel/auth/user');
    
    if (!response.ok) {
      throw new Error('Failed to fetch users from auth API');
    }

    const data: AuthAPIResponse = await response.json();

    if (!data.ok || !data.data?.result) {
      throw new Error('Invalid response from auth API');
    }

    // Find the specific Zitadel user
    const zitadelUserData = data.data.result.find(user => user.userId === zitadelUserId);

    if (!zitadelUserData || !zitadelUserData.human) {
      return NextResponse.json(
        { error: 'Zitadel user not found' },
        { status: 404 }
      );
    }

    const human = zitadelUserData.human;
    const profile = human.profile || {};
    const email = human.email || { email: '' };

    // Map Zitadel user to our User model
    const userData = {
      firstName: profile.givenName || '',
      lastName: profile.familyName || '',
      email: email.email,
      phone: phone,
      role: (role || Role.NORMAL) as Role,
      locationId: locationId,
      isActive: true,
      permissions: permissions,
    };

    // Validate that we have required fields
    if (!userData.firstName || !userData.lastName || !userData.email) {
      return NextResponse.json(
        { error: 'Zitadel user is missing required fields (firstName, lastName, or email)' },
        { status: 400 }
      );
    }

    // Create user using UserService
    const user = await UserService.createUser(userData, userRole);

    return NextResponse.json({
      ok: true,
      data: user,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user from Zitadel:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to create user from Zitadel',
      },
      { status: 500 }
    );
  }
}

