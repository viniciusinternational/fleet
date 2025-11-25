import { db } from '@/lib/db';
import { User, Role, Location } from '@/types';
import { Prisma } from '@prisma/client';

/**
 * User Service
 * Provides CRUD operations for users with role-based access control
 */
export class UserService {
  
  /**
   * Check if user has admin privileges
   */
  private static hasAdminAccess(userRole: Role): boolean {
    return userRole === Role.ADMIN || userRole === Role.CEO;
  }

  /**
   * Map UI Role to Prisma enum
   */
  private static mapUIRoleToPrisma(uiRole: Role): string {
    const roleMap: Record<Role, string> = {
      'Admin': 'ADMIN',
      'Normal': 'NORMAL',
      'CEO': 'CEO'
    };
    return roleMap[uiRole];
  }

  /**
   * Map Prisma enum to UI Role
   */
  private static mapPrismaRoleToUI(prismaRole: string): Role {
    const roleMap: Record<string, Role> = {
      'ADMIN': 'Admin',
      'NORMAL': 'Normal',
      'CEO': 'CEO'
    };
    return roleMap[prismaRole] || 'Normal';
  }

  /**
   * Create a new user (Admin/CEO only)
   */
  static async createUser(
    input: Partial<User> & { 
      firstName: string; 
      lastName: string;
      email: string; 
      phone: string; 
      role: Role; 
      locationId: string 
    }, 
    userRole: Role
  ): Promise<User> {
    if (!this.hasAdminAccess(userRole)) {
      throw new Error('Insufficient permissions: Admin or CEO role required');
    }

    try {
      const user = await db.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          role: this.mapUIRoleToPrisma(input.role) as any,
          locationId: input.locationId,
          password: input.password,
          isActive: input.isActive ?? true,
          avatar: input.avatar,
          createdAt: new Date(),
        },
      });

      return this.mapPrismaUserToType(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A user with this email already exists');
        }
      }
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(
    userId: string, 
    userRole: Role,
    requestingUserId?: string
  ): Promise<User | null> {
    console.log('getUserById', {userId, userRole, requestingUserId});
    // Normal users can only access their own profile
    if (userRole === Role.NORMAL && requestingUserId !== userId) {
      throw new Error('Insufficient permissions: Can only access your own profile');
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
      },
    });

    return user ? this.mapPrismaUserToType(user) : null;
  }

  /**
   * Get user by email (Admin/CEO only)
   */
  static async getUserByEmail(
    email: string,
    userRole: Role
  ): Promise<User | null> {
    if (!this.hasAdminAccess(userRole)) {
      throw new Error('Insufficient permissions: Admin or CEO role required');
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        location: true,
      },
    });

    return user ? this.mapPrismaUserToType(user) : null;
  }

  /**
   * Get all users with filtering, sorting, and pagination (Admin/CEO only)
   */
  static async getUsers(
    filters: {
      search?: string;
      role?: Role;
      isActive?: boolean;
      locationId?: string;
    } = {},
    sortOptions: {
      sortBy?: 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'lastLogin';
      sortOrder?: 'asc' | 'desc';
    } = {},
    paginationOptions: {
      page?: number;
      limit?: number;
    } = {},
    userRole: Role
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    if (!this.hasAdminAccess(userRole)) {
      throw new Error('Insufficient permissions: Admin or CEO role required');
    }

    const { page = 1, limit = 10 } = paginationOptions;
    const { sortBy = 'firstName', sortOrder = 'asc' } = sortOptions;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = this.mapUIRoleToPrisma(filters.role) as any;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    // Build orderBy clause
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'firstName':
        orderBy.firstName = sortOrder;
        break;
      case 'lastName':
        orderBy.lastName = sortOrder;
        break;
      case 'email':
        orderBy.email = sortOrder;
        break;
      case 'role':
        orderBy.role = sortOrder;
        break;
      case 'createdAt':
        orderBy.createdAt = sortOrder;
        break;
      case 'lastLogin':
        orderBy.lastLogin = sortOrder;
        break;
      default:
        orderBy.firstName = sortOrder;
    }

    try {
      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            location: true,
          },
        }),
        db.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users.map(user => this.mapPrismaUserToType(user)),
        total,
        totalPages,
      };
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Update user (Admin/CEO can update any, Normal users can only update themselves)
   */
  static async updateUser(
    input: Partial<User> & { id: string; locationId?: string }, 
    userRole: Role,
    requestingUserId?: string
  ): Promise<User> {
    // Normal users can only update their own profile
    if (userRole === Role.NORMAL && requestingUserId !== input.id) {
      throw new Error('Insufficient permissions: Can only update your own profile');
    }

    const { id, ...updateData } = input;

    try {
      const user = await db.user.update({
        where: { id },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          phone: updateData.phone,
          role: updateData.role ? this.mapUIRoleToPrisma(updateData.role) as any : undefined,
          locationId: updateData.locationId || updateData.location?.id,
          isActive: updateData.isActive,
          avatar: updateData.avatar,
          password: updateData.password,
          lastLogin: updateData.lastLogin ? new Date(updateData.lastLogin) : undefined,
        },
        include: {
          location: true,
        },
      });

      return this.mapPrismaUserToType(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A user with this email already exists');
        }
      }
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user (Admin/CEO only)
   */
  static async deleteUser(
    userId: string, 
    userRole: Role
  ): Promise<void> {
    if (!this.hasAdminAccess(userRole)) {
      throw new Error('Insufficient permissions: Admin or CEO role required');
    }

    try {
      await db.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get user statistics (Admin/CEO only)
   */
  static async getUserStats(userRole: Role): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<Role, number>;
  }> {
    if (!this.hasAdminAccess(userRole)) {
      throw new Error('Insufficient permissions: Admin or CEO role required');
    }

    try {
      const [total, active, roleStats] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true } }),
        db.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
      ]);

      const inactive = total - active;

      const byRole = roleStats.reduce((acc, stat) => {
        const uiRole = this.mapPrismaRoleToUI(stat.role);
        acc[uiRole] = stat._count.role;
        return acc;
      }, {} as Record<Role, number>);

      return { total, active, inactive, byRole };
    } catch (error) {
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Map Prisma user to our User type
   */
  private static mapPrismaUserToType(prismaUser: any): User {
    return {
      id: prismaUser.id,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      phone: prismaUser.phone,
      email: prismaUser.email,
      role: this.mapPrismaRoleToUI(prismaUser.role),
      location: prismaUser.location ? {
        id: prismaUser.location.id,
        name: prismaUser.location.name,
        type: prismaUser.location.type,
        coordinates: {
          latitude: prismaUser.location.latitude,
          longitude: prismaUser.location.longitude,
        },
        address: {
          street: prismaUser.location.street,
          city: prismaUser.location.city,
          state: prismaUser.location.state,
          country: prismaUser.location.country,
          postalCode: prismaUser.location.postalCode,
        },
        contactDetails: {
          contactName: prismaUser.location.contactName,
          phone: prismaUser.location.contactPhone,
          email: prismaUser.location.contactEmail,
        },
        status: prismaUser.location.status,
        lastUpdated: prismaUser.location.lastUpdated.toISOString(),
        notes: prismaUser.location.notes,
      } as Location : {} as Location,
      createdAt: prismaUser.createdAt,
      lastLogin: prismaUser.lastLogin,
      isActive: prismaUser.isActive,
      avatar: prismaUser.avatar,
      password: prismaUser.password,
    };
  }
}
