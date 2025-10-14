import { PrismaClient } from '@prisma/client';
import type { Location } from '@/types';

const prisma = new PrismaClient();

/**
 * Location Service
 * Provides CRUD operations for locations with database integration
 */
export class LocationService {
  
  /**
   * Get all locations with optional filtering and pagination
   */
  static async getLocations(params: {
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const {
      search = '',
      type = 'all',
      status = 'all',
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
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    try {
      // Get locations with pagination
      const [locations, total] = await Promise.all([
        prisma.location.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.location.count({ where }),
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        locations: locations as Location[],
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  /**
   * Get location by ID
   */
  static async getLocationById(id: string): Promise<Location | null> {
    try {
      const location = await prisma.location.findUnique({
        where: { id },
      });
      
      return location as Location | null;
    } catch (error) {
      console.error('Error fetching location by ID:', error);
      return null;
    }
  }

  /**
   * Get location statistics
   */
  static async getLocationStats() {
    try {
      // Get basic counts
      const [
        totalLocations,
        locationsByType,
        locationsByStatus,
        recentLocations,
      ] = await Promise.all([
        // Total locations count
        prisma.location.count(),
        
        // Locations by type
        prisma.location.groupBy({
          by: ['type'],
          _count: {
            type: true,
          },
          orderBy: {
            _count: {
              type: 'desc',
            },
          },
        }),
        
        // Locations by status
        prisma.location.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
          orderBy: {
            _count: {
              status: 'desc',
            },
          },
        }),
        
        // Recent locations (last 30 days)
        prisma.location.count({
          where: {
            lastUpdated: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        }),
      ]);
      
      // Format type stats
      const typeBreakdown = locationsByType.map(stat => ({
        type: stat.type,
        count: stat._count.type,
        percentage: totalLocations > 0 
          ? Math.round((stat._count.type / totalLocations) * 100) 
          : 0,
      }));
      
      // Format status stats
      const statusBreakdown = locationsByStatus.map(stat => ({
        status: stat.status,
        count: stat._count.status,
        percentage: totalLocations > 0 
          ? Math.round((stat._count.status / totalLocations) * 100) 
          : 0,
      }));
      
      return {
        overview: {
          totalLocations,
          recentLocations,
          recentLocationsPercentage: totalLocations > 0 
            ? Math.round((recentLocations / totalLocations) * 100) 
            : 0,
        },
        type: {
          breakdown: typeBreakdown,
        },
        status: {
          breakdown: statusBreakdown,
        },
      };
    } catch (error) {
      console.error('Error fetching location statistics:', error);
      throw error;
    }
  }

  /**
   * Create new location
   */
  static async createLocation(locationData: Omit<Location, 'id'>): Promise<Location> {
    try {
      const newLocation = await prisma.location.create({
        data: locationData,
      });
      return newLocation;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Update location
   */
  static async updateLocation(id: string, locationData: Partial<Omit<Location, 'id'>>): Promise<Location | null> {
    try {
      const updatedLocation = await prisma.location.update({
        where: { id },
        data: locationData,
      });
      return updatedLocation;
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }

  /**
   * Delete location
   */
  static async deleteLocation(id: string): Promise<boolean> {
    try {
      await prisma.location.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }
}