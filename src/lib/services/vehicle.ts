import { PrismaClient } from '@prisma/client';
import type { Vehicle } from '@/types';

const prisma = new PrismaClient();

/**
 * Vehicle Service
 * Provides CRUD operations for vehicles with database integration
 */
export class VehicleService {
  
  /**
   * Get all vehicles with optional filtering and pagination
   */
  static async getVehicles(params: {
      search?: string;
    status?: string;
    sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
  } = {}) {
    const {
      search = '',
      status = 'all',
      sortBy = 'orderDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { vin: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { year: { equals: parseInt(search) || undefined } },
      ];
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    // Build orderBy clause with fallback for consistent sorting
    let orderBy: any = {};
    
    if (sortBy === 'orderDate') {
      // For orderDate, add id as secondary sort to ensure consistent ordering
      // CUIDs are generated with timestamps, so newer IDs will be later alphabetically
      orderBy = [
        { orderDate: sortOrder },
        { id: 'desc' } // Always show newest first as tiebreaker
      ];
    } else {
      orderBy[sortBy] = sortOrder;
    }
    
    try {
      // Get vehicles with pagination
      const [vehicles, total] = await Promise.all([
        prisma.vehicle.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            currentLocation: {
              select: {
                id: true,
                name: true,
                type: true,
                city: true,
                country: true,
              },
            },
            vehicleImages: true, // Include vehicle images
          },
        }),
        prisma.vehicle.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      
      // Transform vehicles to include images array
      const transformedVehicles = vehicles.map(vehicle => ({
        ...vehicle,
        images: vehicle.vehicleImages || [], // Keep as VehicleImage[] objects
      }));

      return {
        vehicles: transformedVehicles as any[], // Type assertion to avoid complex type issues
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Get vehicle by ID
   */
  static async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          owner: true,
          currentLocation: true,
          shippingDetails: true,
          vehicleImages: true, // Include vehicle images
        },
      });
      
      if (!vehicle) return null;
      
      // Transform the data to match the Vehicle interface
      const transformedVehicle = {
        ...vehicle,
        images: vehicle.vehicleImages || [], // Keep as VehicleImage[] objects
      };
      
      return transformedVehicle as any; // Type assertion to avoid complex type issues
    } catch (error) {
      console.error('Error fetching vehicle by ID:', error);
      return null;
    }
  }

  /**
   * Get recent vehicles (for dashboard)
   */
  static async getRecentVehicles(limit: number = 5): Promise<Vehicle[]> {
    try {
      const vehicles = await prisma.vehicle.findMany({
        take: limit,
        orderBy: {
          orderDate: 'desc',
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          currentLocation: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
              country: true,
            },
          },
          vehicleImages: true, // Include vehicle images
        },
      });

      // Transform vehicles to include images array
      const transformedVehicles = vehicles.map(vehicle => ({
        ...vehicle,
        images: vehicle.vehicleImages || [], // Keep as VehicleImage[] objects
      }));
      
      return transformedVehicles as any[]; // Type assertion to avoid complex type issues
    } catch (error) {
      console.error('Error fetching recent vehicles:', error);
      return [];
    }
  }

  /**
   * Get vehicle statistics
   */
  static async getVehicleStats() {
    try {
      // Get basic counts
      const [
        totalVehicles,
        vehiclesByStatus,
        recentVehicles,
      ] = await Promise.all([
        // Total vehicles count
        prisma.vehicle.count(),
        
        // Vehicles by status
        prisma.vehicle.groupBy({
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
        
        // Recent vehicles (last 30 days)
        prisma.vehicle.count({
          where: {
            orderDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        }),
      ]);
      
      // Format status stats
      const statusBreakdown = vehiclesByStatus.map(stat => ({
        status: stat.status,
        count: stat._count.status,
        percentage: totalVehicles > 0 
          ? Math.round((stat._count.status / totalVehicles) * 100) 
          : 0,
      }));
      
      return {
        overview: {
          totalVehicles,
          recentVehicles,
          recentVehiclesPercentage: totalVehicles > 0 
            ? Math.round((recentVehicles / totalVehicles) * 100) 
            : 0,
        },
        status: {
          breakdown: statusBreakdown,
        },
      };
    } catch (error) {
      console.error('Error fetching vehicle statistics:', error);
      throw error;
    }
  }

  /**
   * Create new vehicle
   */
  static async createVehicle(vehicleData: any): Promise<any> {
    try {
      const newVehicle = await prisma.vehicle.create({
        data: vehicleData,
      });
      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Update vehicle
   */
  static async updateVehicle(id: string, vehicleData: any): Promise<any> {
    try {
      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data: vehicleData,
      });
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return null;
    }
  }

  /**
   * Delete vehicle
   */
  static async deleteVehicle(id: string): Promise<boolean> {
    try {
      await prisma.vehicle.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  }


  /**
   * Create vehicle images
   */
  static async createVehicleImages(vehicleId: string, imageUrls: string[]) {
    try {
      const vehicleImages = await Promise.all(
        imageUrls.map((url, index) => 
          prisma.vehicleImage.create({
            data: {
              url: url,
              alt: `Vehicle image ${index + 1}`,
              isPrimary: index === 0, // First image is primary
              vehicle: {
                connect: { id: vehicleId }
              },
            },
          })
        )
      );

      return vehicleImages;
    } catch (error) {
      console.error('Error creating vehicle images:', error);
      throw error;
    }
  }
}