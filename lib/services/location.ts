import type { Location } from '@/types';
import { AuditService } from './audit';
import { db } from '@/lib/db';

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
        db.location.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        db.location.count({ where }),
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      // Transform database results to match Location type
      const transformedLocations: Location[] = locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        type: loc.type.toLowerCase().replace('_', ' ') as any,
        coordinates: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        address: {
          street: loc.street,
          city: loc.city,
          state: loc.state || undefined,
          country: loc.country,
          postalCode: loc.postalCode || undefined,
        },
        contactDetails: {
          contactName: loc.contactName || undefined,
          phone: loc.contactPhone || undefined,
          email: loc.contactEmail || undefined,
        },
        status: loc.status.toLowerCase() as any,
        lastUpdated: loc.lastUpdated.toISOString(),
        notes: loc.notes || undefined,
      }));

      return {
        locations: transformedLocations,
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
      const location = await db.location.findUnique({
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
        db.location.count(),
        
        // Locations by type
        db.location.groupBy({
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
        db.location.groupBy({
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
        db.location.count({
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
  static async createLocation(locationData: Omit<Location, 'id'>, actorId?: string): Promise<Location> {
    try {
      // Transform nested Location data to flat structure for database
      const flatData = {
        name: locationData.name,
        type: locationData.type.toUpperCase().replace(' ', '_') as any,
        latitude: locationData.coordinates.latitude,
        longitude: locationData.coordinates.longitude,
        street: locationData.address.street,
        city: locationData.address.city,
        state: locationData.address.state,
        country: locationData.address.country,
        postalCode: locationData.address.postalCode,
        contactName: locationData.contactDetails.contactName,
        contactPhone: locationData.contactDetails.phone,
        contactEmail: locationData.contactDetails.email,
        status: locationData.status.toUpperCase() as any,
        lastUpdated: locationData.lastUpdated,
        notes: locationData.notes,
      };

      const newLocation = await db.location.create({
        data: flatData,
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'CREATE',
          actorId,
          entityType: 'Location',
          entityId: newLocation.id,
          after: JSON.parse(JSON.stringify(newLocation)),
        });
      }

      // Transform back to Location type
      return {
        id: newLocation.id,
        name: newLocation.name,
        type: newLocation.type.toLowerCase().replace('_', ' ') as any,
        coordinates: {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        },
        address: {
          street: newLocation.street,
          city: newLocation.city,
          state: newLocation.state || undefined,
          country: newLocation.country,
          postalCode: newLocation.postalCode || undefined,
        },
        contactDetails: {
          contactName: newLocation.contactName || undefined,
          phone: newLocation.contactPhone || undefined,
          email: newLocation.contactEmail || undefined,
        },
        status: newLocation.status.toLowerCase() as any,
        lastUpdated: newLocation.lastUpdated.toISOString(),
        notes: newLocation.notes || undefined,
      };
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Update location
   */
  static async updateLocation(id: string, locationData: Partial<Omit<Location, 'id'>>, actorId?: string): Promise<Location | null> {
    try {
      // Get before state for audit log
      const beforeState = actorId ? await AuditService.getBeforeState('Location', id) : null;
      const beforeStatus = beforeState?.status;

      // Transform nested Location data to flat structure for database
      const flatData: any = {};
      
      if (locationData.name) flatData.name = locationData.name;
      if (locationData.type) flatData.type = locationData.type.toUpperCase().replace(' ', '_');
      if (locationData.coordinates) {
        flatData.latitude = locationData.coordinates.latitude;
        flatData.longitude = locationData.coordinates.longitude;
      }
      if (locationData.address) {
        flatData.street = locationData.address.street;
        flatData.city = locationData.address.city;
        flatData.state = locationData.address.state;
        flatData.country = locationData.address.country;
        flatData.postalCode = locationData.address.postalCode;
      }
      if (locationData.contactDetails) {
        flatData.contactName = locationData.contactDetails.contactName;
        flatData.contactPhone = locationData.contactDetails.phone;
        flatData.contactEmail = locationData.contactDetails.email;
      }
      if (locationData.status) flatData.status = locationData.status.toUpperCase();
      if (locationData.lastUpdated) flatData.lastUpdated = new Date(locationData.lastUpdated);
      if (locationData.notes !== undefined) flatData.notes = locationData.notes;

      const updatedLocation = await db.location.update({
        where: { id },
        data: flatData,
      });

      // Log audit events
      if (actorId) {
        const afterState = JSON.parse(JSON.stringify(updatedLocation));
        const afterStatus = afterState?.status;

        // Check if status changed
        if (locationData.status && beforeStatus && beforeStatus !== afterStatus) {
          // Log status change separately
          await AuditService.logStatusChange(
            actorId,
            'Location',
            updatedLocation.id,
            beforeStatus,
            afterStatus,
            {
              locationName: updatedLocation.name,
              locationType: updatedLocation.type,
            }
          );
        }

        // Log general update
        await AuditService.logEvent({
          action: 'UPDATE',
          actorId,
          entityType: 'Location',
          entityId: updatedLocation.id,
          before: beforeState,
          after: afterState,
        });
      }

      // Transform back to Location type
      return {
        id: updatedLocation.id,
        name: updatedLocation.name,
        type: updatedLocation.type.toLowerCase().replace('_', ' ') as any,
        coordinates: {
          latitude: updatedLocation.latitude,
          longitude: updatedLocation.longitude,
        },
        address: {
          street: updatedLocation.street,
          city: updatedLocation.city,
          state: updatedLocation.state || undefined,
          country: updatedLocation.country,
          postalCode: updatedLocation.postalCode || undefined,
        },
        contactDetails: {
          contactName: updatedLocation.contactName || undefined,
          phone: updatedLocation.contactPhone || undefined,
          email: updatedLocation.contactEmail || undefined,
        },
        status: updatedLocation.status.toLowerCase() as any,
        lastUpdated: updatedLocation.lastUpdated.toISOString(),
        notes: updatedLocation.notes || undefined,
      };
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }

  /**
   * Delete location
   */
  static async deleteLocation(id: string, actorId?: string): Promise<boolean> {
    try {
      // Get before state for audit log
      const beforeState = actorId ? await AuditService.getBeforeState('Location', id) : null;

      await db.location.delete({
        where: { id },
      });

      // Log audit event
      if (actorId) {
        await AuditService.logEvent({
          action: 'DELETE',
          actorId,
          entityType: 'Location',
          entityId: id,
          before: beforeState,
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }
}