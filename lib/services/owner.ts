import type { Owner } from '@/types';
import { AuditService } from './audit';
import { db } from '@/lib/db';

/**
 * Owner Service
 * Provides CRUD operations for owners with database integration
 */
export class OwnerService {
  
  /**
   * Get all owners with optional filtering and pagination
   */
  static async getOwners(params: {
    search?: string;
    nationality?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const {
      search = '',
      nationality = 'all',
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (nationality && nationality !== 'all') {
      where.nationality = nationality;
    }
    
    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    try {
      // Get owners with pagination
      const [owners, total] = await Promise.all([
        db.owner.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            vehicles: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                status: true,
              },
            },
          },
        }),
        db.owner.count({ where }),
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        owners: owners as Owner[],
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }
  }

  /**
   * Get owner by ID
   */
  static async getOwnerById(id: string): Promise<Owner | null> {
    try {
      const owner = await db.owner.findUnique({
        where: { id },
        include: {
          vehicles: {
            select: {
              id: true,
              vin: true,
              make: true,
              model: true,
              year: true,
              color: true,
              status: true,
              orderDate: true,
              estimatedDelivery: true,
              currentLocation: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  city: true,
                  country: true,
                },
              },
            },
          },
        },
      });
      
      return owner as Owner | null;
    } catch (error) {
      console.error('Error fetching owner by ID:', error);
      return null;
    }
  }

  /**
   * Create new owner
   */
  static async createOwner(ownerData: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>, actorId?: string): Promise<Owner> {
    try {
      const newOwner = await db.owner.create({
        data: ownerData,
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'CREATE',
          actorId,
          entityType: 'Owner',
          entityId: newOwner.id,
          after: JSON.parse(JSON.stringify(newOwner)),
        });
      }

      return newOwner;
    } catch (error) {
      console.error('Error creating owner:', error);
      throw error;
    }
  }

  /**
   * Update owner
   */
  static async updateOwner(id: string, ownerData: Partial<Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>>, actorId?: string): Promise<Owner | null> {
    try {
      // Get before state for audit log
      const beforeState = actorId ? await AuditService.getBeforeState('Owner', id) : null;

      const updatedOwner = await db.owner.update({
        where: { id },
        data: ownerData,
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'UPDATE',
          actorId,
          entityType: 'Owner',
          entityId: updatedOwner.id,
          before: beforeState,
          after: JSON.parse(JSON.stringify(updatedOwner)),
        });
      }

      return updatedOwner;
    } catch (error) {
      console.error('Error updating owner:', error);
      return null;
    }
  }

  /**
   * Delete owner
   */
  static async deleteOwner(id: string, actorId?: string): Promise<boolean> {
    try {
      // Get before state for audit log
      const beforeState = actorId ? await AuditService.getBeforeState('Owner', id) : null;

      await db.owner.delete({
        where: { id },
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'DELETE',
          actorId,
          entityType: 'Owner',
          entityId: id,
          before: beforeState,
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting owner:', error);
      return false;
    }
  }

  /**
   * Get owner statistics
   */
  static async getOwnerStats() {
    try {
      // Get basic counts
      const [
        totalOwners,
        ownersWithVehicles,
        ownersWithoutVehicles,
        nationalityStats,
        recentOwners,
      ] = await Promise.all([
        // Total owners count
        db.owner.count(),
        
        // Owners with vehicles
        db.owner.count({
          where: {
            vehicles: {
              some: {},
            },
          },
        }),
        
        // Owners without vehicles
        db.owner.count({
          where: {
            vehicles: {
              none: {},
            },
          },
        }),
        
        // Nationality distribution
        db.owner.groupBy({
          by: ['nationality'],
          _count: {
            nationality: true,
          },
          orderBy: {
            _count: {
              nationality: 'desc',
            },
          },
        }),
        
        // Recent owners (last 30 days)
        db.owner.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        }),
      ]);
      
      // Calculate percentages
      const ownersWithVehiclesPercentage = totalOwners > 0 
        ? Math.round((ownersWithVehicles / totalOwners) * 100) 
        : 0;
      
      const ownersWithoutVehiclesPercentage = totalOwners > 0 
        ? Math.round((ownersWithoutVehicles / totalOwners) * 100) 
        : 0;
      
      // Format nationality stats
      const nationalityBreakdown = nationalityStats.map(stat => ({
        nationality: stat.nationality,
        count: stat._count.nationality,
        percentage: totalOwners > 0 
          ? Math.round((stat._count.nationality / totalOwners) * 100) 
          : 0,
      }));
      
      // Get top nationalities (top 5)
      const topNationalities = nationalityBreakdown.slice(0, 5);
      
      // Simplified vehicle stats for now
      const vehicleStats = {
        ownersWith1Vehicle: 0,
        ownersWith2To5Vehicles: 0,
        ownersWithMoreThan5Vehicles: 0,
        averageVehiclesPerOwner: 0,
      };
      
      return {
        overview: {
          totalOwners,
          ownersWithVehicles,
          ownersWithoutVehicles,
          ownersWithVehiclesPercentage,
          ownersWithoutVehiclesPercentage,
        },
        nationality: {
          totalNationalities: nationalityStats.length,
          topNationalities,
          breakdown: nationalityBreakdown,
        },
        vehicles: vehicleStats,
        recent: {
          recentOwners,
          note: 'Owners created in the last 30 days',
        },
      };
    } catch (error) {
      console.error('Error fetching owner statistics:', error);
      throw error;
    }
  }

  /**
   * Get unique nationalities for filter options
   */
  static async getNationalities() {
    try {
      const nationalityStats = await db.owner.groupBy({
        by: ['nationality'],
        _count: {
          nationality: true,
        },
        orderBy: {
          nationality: 'asc',
        },
      });
      
      return nationalityStats.map(stat => stat.nationality);
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      return [];
    }
  }

  /**
   * Get owner by email
   */
  static async getOwnerByEmail(email: string): Promise<Owner | null> {
    try {
      const owner = await db.owner.findFirst({
        where: { email },
      });
      return owner;
    } catch (error) {
      console.error('Error fetching owner by email:', error);
      return null;
    }
  }
}