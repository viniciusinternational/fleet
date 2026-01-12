import type { Source } from '@/types';
import { db } from '@/lib/db';

/**
 * Source Service
 * Provides CRUD operations for sources with database integration
 */
export class SourceService {
  
  /**
   * Get all sources with optional filtering and pagination
   */
  static async getSources(params: {
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
      // Get sources with pagination
      const [sources, total] = await Promise.all([
        db.source.findMany({
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
        db.source.count({ where }),
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        sources: sources as Source[],
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  }

  /**
   * Get source by ID
   */
  static async getSourceById(id: string): Promise<Source | null> {
    try {
      const source = await db.source.findUnique({
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
      
      return source as Source | null;
    } catch (error) {
      console.error('Error fetching source by ID:', error);
      return null;
    }
  }

  /**
   * Create new source
   */
  static async createSource(sourceData: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>): Promise<Source> {
    try {
      const newSource = await db.source.create({
        data: sourceData,
      });
      return newSource;
    } catch (error) {
      console.error('Error creating source:', error);
      throw error;
    }
  }

  /**
   * Update source
   */
  static async updateSource(id: string, sourceData: Partial<Omit<Source, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Source | null> {
    try {
      const updatedSource = await db.source.update({
        where: { id },
        data: sourceData,
      });
      return updatedSource;
    } catch (error) {
      console.error('Error updating source:', error);
      return null;
    }
  }

  /**
   * Delete source
   */
  static async deleteSource(id: string): Promise<boolean> {
    try {
      await db.source.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting source:', error);
      return false;
    }
  }

  /**
   * Get source statistics
   */
  static async getSourceStats() {
    try {
      // Get basic counts
      const [
        totalSources,
        sourcesWithVehicles,
        sourcesWithoutVehicles,
        nationalityStats,
        recentSources,
      ] = await Promise.all([
        // Total sources count
        db.source.count(),
        
        // Sources with vehicles
        db.source.count({
          where: {
            vehicles: {
              some: {},
            },
          },
        }),
        
        // Sources without vehicles
        db.source.count({
          where: {
            vehicles: {
              none: {},
            },
          },
        }),
        
        // Nationality distribution
        db.source.groupBy({
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
        
        // Recent sources (last 30 days)
        db.source.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        }),
      ]);
      
      // Calculate percentages
      const sourcesWithVehiclesPercentage = totalSources > 0 
        ? Math.round((sourcesWithVehicles / totalSources) * 100) 
        : 0;
      
      const sourcesWithoutVehiclesPercentage = totalSources > 0 
        ? Math.round((sourcesWithoutVehicles / totalSources) * 100) 
        : 0;
      
      // Format nationality stats
      const nationalityBreakdown = nationalityStats.map(stat => ({
        nationality: stat.nationality,
        count: stat._count.nationality,
        percentage: totalSources > 0 
          ? Math.round((stat._count.nationality / totalSources) * 100) 
          : 0,
      }));
      
      // Get top nationalities (top 5)
      const topNationalities = nationalityBreakdown.slice(0, 5);
      
      // Simplified vehicle stats for now
      const vehicleStats = {
        sourcesWith1Vehicle: 0,
        sourcesWith2To5Vehicles: 0,
        sourcesWithMoreThan5Vehicles: 0,
        averageVehiclesPerSource: 0,
      };
      
      return {
        overview: {
          totalSources,
          sourcesWithVehicles,
          sourcesWithoutVehicles,
          sourcesWithVehiclesPercentage,
          sourcesWithoutVehiclesPercentage,
        },
        nationality: {
          totalNationalities: nationalityStats.length,
          topNationalities,
          breakdown: nationalityBreakdown,
        },
        vehicles: vehicleStats,
        recent: {
          recentSources,
          note: 'Sources created in the last 30 days',
        },
      };
    } catch (error) {
      console.error('Error fetching source statistics:', error);
      throw error;
    }
  }

  /**
   * Get unique nationalities for filter options
   */
  static async getNationalities() {
    try {
      const nationalityStats = await db.source.groupBy({
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
   * Get source by email
   */
  static async getSourceByEmail(email: string): Promise<Source | null> {
    try {
      const source = await db.source.findFirst({
        where: { email },
      });
      return source;
    } catch (error) {
      console.error('Error fetching source by email:', error);
      return null;
    }
  }
}

