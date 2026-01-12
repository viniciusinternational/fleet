import type { Vehicle } from '@/types';
import { AuditService } from './audit';
import { db } from '@/lib/db';

type VehicleImageInput = {
  data?: string; // Optional - can be empty for S3 URLs
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
  url: string; // Required - S3 URL
};

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
        db.vehicle.findMany({
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
                street: true,
                city: true,
                state: true,
                country: true,
                postalCode: true,
                latitude: true,
                longitude: true,
              },
            },
            vehicleImages: {
              select: {
                id: true,
                alt: true,
                caption: true,
                isPrimary: true,
                url: true,
              },
            }, // Exclude base64 payloads for list queries
          },
        }),
        db.vehicle.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      
      // Transform vehicles to include images array and transform location structure
      const transformedVehicles = vehicles.map(vehicle => ({
        ...vehicle,
        images: vehicle.vehicleImages || [], // Keep as VehicleImage[] objects
        currentLocation: vehicle.currentLocation ? {
          ...vehicle.currentLocation,
          coordinates: {
            latitude: vehicle.currentLocation.latitude,
            longitude: vehicle.currentLocation.longitude,
          },
          address: {
            street: vehicle.currentLocation.street,
            city: vehicle.currentLocation.city,
            state: vehicle.currentLocation.state || undefined,
            country: vehicle.currentLocation.country,
            postalCode: vehicle.currentLocation.postalCode || undefined,
          },
        } : null,
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
      const vehicle = await db.vehicle.findUnique({
        where: { id },
        include: {
          owner: true,
          currentLocation: true,
          shippingDetails: true,
          vehicleImages: {
            select: {
              id: true,
              alt: true,
              caption: true,
              isPrimary: true,
              url: true,
            },
          }, // Default to metadata only; base64 fetched on demand
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
   * Get vehicle by VIN
   */
  static async getVehicleByVin(vin: string) {
    try {
      return db.vehicle.findUnique({
        where: { vin },
      });
    } catch (error) {
      console.error('Error fetching vehicle by VIN:', error);
      return null;
    }
  }

  /**
   * Get recent vehicles (for dashboard)
   */
  static async getRecentVehicles(limit: number = 5): Promise<Vehicle[]> {
    try {
      const vehicles = await db.vehicle.findMany({
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
              street: true,
              city: true,
              state: true,
              country: true,
              postalCode: true,
              latitude: true,
              longitude: true,
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
        db.vehicle.count(),
        
        // Vehicles by status
        db.vehicle.groupBy({
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
        db.vehicle.count({
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
  static async createVehicle(vehicleData: any, actorId?: string): Promise<any> {
    try {
      const newVehicle = await db.vehicle.create({
        data: vehicleData,
        include: {
          owner: true,
          currentLocation: true,
          source: true,
        },
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'CREATE',
          actorId,
          entityType: 'Vehicle',
          entityId: newVehicle.id,
          after: JSON.parse(JSON.stringify(newVehicle)),
        });
      }

      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Update vehicle
   */
  static async updateVehicle(id: string, vehicleData: any, actorId?: string): Promise<any> {
    try {
      // Get before state for audit log
      const beforeState = actorId ? await AuditService.getBeforeState('Vehicle', id) : null;

      const updatedVehicle = await db.vehicle.update({
        where: { id },
        data: vehicleData,
        include: {
          owner: true,
          currentLocation: true,
          source: true,
        },
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'UPDATE',
          actorId,
          entityType: 'Vehicle',
          entityId: updatedVehicle.id,
          before: beforeState,
          after: JSON.parse(JSON.stringify(updatedVehicle)),
        });
      }

      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return null;
    }
  }

  /**
   * Delete vehicle
   */
  static async deleteVehicle(id: string, actorId?: string): Promise<boolean> {
    try {
      // Get before state for audit log
      const beforeState = actorId ? await AuditService.getBeforeState('Vehicle', id) : null;

      await db.vehicle.delete({
        where: { id },
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'DELETE',
          actorId,
          entityType: 'Vehicle',
          entityId: id,
          before: beforeState,
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  }


  /**
   * Create vehicle images
   */
  static async getVehicleImages(
    vehicleId: string,
    options: { includeData?: boolean } = {}
  ) {
    const { includeData = false } = options;

    try {
      const images = await db.vehicleImage.findMany({
        where: { vehicleId },
        orderBy: [
          { isPrimary: 'desc' },
          { id: 'asc' },
        ],
        select: includeData
          ? {
              id: true,
              alt: true,
              caption: true,
              isPrimary: true,
              url: true,
              data: true,
            }
          : {
              id: true,
              alt: true,
              caption: true,
              isPrimary: true,
              url: true,
            },
      });

      return images;
    } catch (error) {
      console.error('Error fetching vehicle images:', error);
      throw error;
    }
  }

  static async createVehicleImages(vehicleId: string, images: VehicleImageInput[]) {
    try {
      const normalizedImages = images.map((image, index) => ({
        data: image.data ?? '', // Empty string for S3 URLs (no base64 storage)
        alt: image.alt ?? `Vehicle image ${index + 1}`,
        caption: image.caption ?? null,
        isPrimary: image.isPrimary ?? index === 0,
        url: image.url, // S3 URL is required
      }));

      const createdImages = await Promise.all(
        normalizedImages.map((image) =>
          db.vehicleImage.create({
            data: {
              url: image.url,
              alt: image.alt,
              caption: image.caption,
              isPrimary: image.isPrimary,
              data: image.data, // Empty string for S3 URLs
              vehicle: {
                connect: { id: vehicleId },
              },
            },
          })
        )
      );

      return createdImages;
    } catch (error) {
      console.error('Error creating vehicle images:', error);
      throw error;
    }
  }

  static async replaceVehicleImages(vehicleId: string, images: VehicleImageInput[]) {
    try {
      await db.vehicleImage.deleteMany({
        where: { vehicleId },
      });

      if (images.length === 0) {
        return [];
      }

      return this.createVehicleImages(vehicleId, images);
    } catch (error) {
      console.error('Error replacing vehicle images:', error);
      throw error;
    }
  }
}