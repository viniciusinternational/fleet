import { db } from '@/lib/db';
import type { VehicleStatus, FuelType } from '@prisma/client';

export interface ReportFilters {
  status?: string; // VehicleStatus or 'all'
  locationId?: string;
  fuelType?: string; // FuelType or 'all'
  make?: string;
  model?: string;
}

/**
 * Report Service
 * Provides methods to fetch vehicle data for different report types
 */
export class ReportService {
  /**
   * Build where clause from filters
   */
  private static buildWhereClause(filters: ReportFilters): any {
    const where: any = {};

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.locationId && filters.locationId !== 'all') {
      where.currentLocationId = filters.locationId;
    }

    if (filters.fuelType && filters.fuelType !== 'all') {
      where.fuelType = filters.fuelType.toUpperCase();
    }

    if (filters.make) {
      where.make = { contains: filters.make, mode: 'insensitive' };
    }

    if (filters.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }

    return where;
  }

  /**
   * Get filtered vehicles for inventory report
   */
  static async generateInventoryReport(filters: ReportFilters = {}) {
    try {
      const where = this.buildWhereClause(filters);

      const vehicles = await db.vehicle.findMany({
        where,
        orderBy: [
          { orderDate: 'desc' },
          { id: 'desc' }
        ],
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
        },
      });

      const totalCount = await db.vehicle.count({ where: {} });
      const filteredCount = await db.vehicle.count({ where });

      return {
        vehicles,
        totalCount,
        filteredCount,
      };
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw error;
    }
  }

  /**
   * Get vehicles grouped by status for status summary report
   */
  static async generateStatusSummaryReport(filters: ReportFilters = {}) {
    try {
      const where = this.buildWhereClause(filters);

      // Get vehicles grouped by status
      const statusGroups = await db.vehicle.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
        orderBy: {
          _count: {
            status: 'desc',
          },
        },
      });

      // Get total count for percentage calculation
      const totalCount = await db.vehicle.count({ where });

      // Get detailed vehicles grouped by status
      const allVehicles = await db.vehicle.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { orderDate: 'desc' },
        ],
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
        },
      });

      // Group vehicles by status
      const vehiclesByStatus = allVehicles.reduce((acc, vehicle) => {
        const status = vehicle.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(vehicle);
        return acc;
      }, {} as Record<string, typeof allVehicles>);

      // Calculate summary with percentages
      const summary = statusGroups.map(group => ({
        status: group.status,
        count: group._count.status,
        percentage: totalCount > 0 
          ? Math.round((group._count.status / totalCount) * 100 * 100) / 100 
          : 0,
      }));

      return {
        summary,
        vehiclesByStatus,
        totalCount,
      };
    } catch (error) {
      console.error('Error generating status summary report:', error);
      throw error;
    }
  }

  /**
   * Get vehicles grouped by location for location-based report
   */
  static async generateLocationBasedReport(filters: ReportFilters = {}) {
    try {
      const where = this.buildWhereClause(filters);

      // Get vehicles with location information
      const vehicles = await db.vehicle.findMany({
        where,
        orderBy: [
          { currentLocationId: 'asc' },
          { orderDate: 'desc' },
        ],
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
              street: true,
              state: true,
              postalCode: true,
            },
          },
        },
      });

      // Get location summary (count per location)
      const locationGroups = await db.vehicle.groupBy({
        by: ['currentLocationId'],
        where,
        _count: {
          currentLocationId: true,
        },
        orderBy: {
          _count: {
            currentLocationId: 'desc',
          },
        },
      });

      // Get location details for summary
      const locationIds = locationGroups.map(g => g.currentLocationId);
      const locations = await db.location.findMany({
        where: {
          id: { in: locationIds },
        },
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          country: true,
        },
      });

      // Create location summary with names
      const locationSummary = locationGroups.map(group => {
        const location = locations.find(l => l.id === group.currentLocationId);
        return {
          locationId: group.currentLocationId,
          locationName: location?.name || 'Unknown Location',
          locationType: location?.type || 'Unknown',
          count: group._count.currentLocationId,
        };
      });

      // Group vehicles by location
      const vehiclesByLocation = vehicles.reduce((acc, vehicle) => {
        const locationId = vehicle.currentLocationId;
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(vehicle);
        return acc;
      }, {} as Record<string, typeof vehicles>);

      return {
        locationSummary,
        vehiclesByLocation,
        totalCount: vehicles.length,
      };
    } catch (error) {
      console.error('Error generating location-based report:', error);
      throw error;
    }
  }
}
