import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { LocationService } from '@/lib/services/location';
import { OwnerService } from '@/lib/services/owner';
import { UserService } from '@/lib/services/user';
import { SourceService } from '@/lib/services/source';
import { db } from '@/lib/db';
import type { VehicleStatus, FuelType, CustomsStatus } from '@prisma/client';

// GET /api/dashboard/stats - Get comprehensive dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter = (startDate || endDate) ? {
      orderDate: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      }
    } : {};

    // Fetch all stats in parallel for better performance
    const [
      vehicleStats,
      locationStats,
      ownerStats,
      userStats,
      sourceStats,
      recentVehicles,
      allVehicles,
      allLocations,
      allOwners,
      allDeliveryNotes,
    ] = await Promise.all([
      VehicleService.getVehicleStats(),
      LocationService.getLocationStats(),
      OwnerService.getOwnerStats(),
      UserService.getUserStats('Admin'),
      SourceService.getSourceStats(),
      VehicleService.getRecentVehicles(5),
      db.vehicle.findMany({
        where: dateFilter,
        include: {
          currentLocation: true,
          owner: true,
          source: true,
        },
      }),
      db.location.findMany({
        include: {
          vehicles: true,
        },
      }),
      db.owner.findMany({
        include: {
          vehicles: true,
        },
      }),
      db.deliveryNote.findMany({
        include: {
          owner: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      }),
    ]);

    // Vehicle analytics
    const vehiclesByFuelType = allVehicles.reduce((acc, v) => {
      acc[v.fuelType] = (acc[v.fuelType] || 0) + 1;
      return acc;
    }, {} as Record<FuelType, number>);

    const vehiclesByCustomsStatus = allVehicles.reduce((acc, v) => {
      acc[v.customsStatus] = (acc[v.customsStatus] || 0) + 1;
      return acc;
    }, {} as Record<CustomsStatus, number>);

    // Make distribution
    const vehiclesByMake = allVehicles.reduce((acc, v) => {
      acc[v.make] = (acc[v.make] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Color distribution
    const vehiclesByColor = allVehicles.reduce((acc, v) => {
      acc[v.color] = (acc[v.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Model distribution
    const vehiclesByModel = allVehicles.reduce((acc, v) => {
      acc[v.model] = (acc[v.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transmission distribution
    const vehiclesByTransmission = allVehicles.reduce((acc, v) => {
      if (v.transmission) {
        acc[v.transmission] = (acc[v.transmission] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Make/Model combinations
    const vehiclesByMakeModel = allVehicles.reduce((acc, v) => {
      const key = `${v.make}|${v.model}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Vehicles by location
    const vehiclesByLocation = allLocations.map(location => {
      const vehiclesAtLocation = allVehicles.filter(v => v.currentLocationId === location.id);
      const deliveredVehicles = vehiclesAtLocation.filter(v => v.status === 'DELIVERED');
      const averageDeliveryTime = deliveredVehicles.length > 0
        ? deliveredVehicles.reduce((sum, v) => {
            const orderDate = new Date(v.orderDate);
            const deliveryDate = new Date(v.estimatedDelivery);
            return sum + (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / deliveredVehicles.length
        : 0;

      return {
        locationId: location.id,
        locationName: location.name,
        locationType: location.type,
        city: location.city,
        country: location.country,
        vehicleCount: vehiclesAtLocation.length,
        averageDeliveryTime: Math.round(averageDeliveryTime),
              totalImportDuties: vehiclesAtLocation.reduce((sum, v) => sum + (v.importDuty || 0), 0),
      };
    }).sort((a, b) => b.vehicleCount - a.vehicleCount);

    // Vehicles by owner nationality
    const vehiclesByOwnerNationality = allOwners.reduce((acc, owner) => {
      if (!acc[owner.nationality]) {
        acc[owner.nationality] = {
          nationality: owner.nationality,
          vehicleCount: 0,
          ownerCount: 0,
        };
      }
      acc[owner.nationality].vehicleCount += owner.vehicles.length;
      acc[owner.nationality].ownerCount += 1;
      return acc;
    }, {} as Record<string, { nationality: string; vehicleCount: number; ownerCount: number }>);

    // Top owners by vehicle count
    const topOwners = allOwners
      .map(owner => ({
        ownerId: owner.id,
        ownerName: owner.name,
        vehicleCount: owner.vehicles.length,
        nationality: owner.nationality,
      }))
      .sort((a, b) => b.vehicleCount - a.vehicleCount)
      .slice(0, 10);

    // Vehicles by source
    const vehiclesBySource = allVehicles
      .filter(v => v.sourceId)
      .reduce((acc, v) => {
        if (v.source) {
          const sourceId = v.source.id;
          if (!acc[sourceId]) {
            acc[sourceId] = {
              sourceId: v.source.id,
              sourceName: v.source.name,
              nationality: v.source.nationality,
              vehicleCount: 0,
            };
          }
          acc[sourceId].vehicleCount += 1;
        }
        return acc;
      }, {} as Record<string, { sourceId: string; sourceName: string; nationality: string; vehicleCount: number }>);

    const topSources = Object.values(vehiclesBySource)
      .sort((a, b) => b.vehicleCount - a.vehicleCount)
      .slice(0, 10);

    // Customs performance by location
    const customsOffices = allLocations.filter(loc => loc.type === 'CUSTOMS_OFFICE');
    const customsPerformance = customsOffices.map(location => {
      const vehiclesAtLocation = allVehicles.filter(v => v.currentLocationId === location.id);
      const clearedVehicles = vehiclesAtLocation.filter(v => v.customsStatus === 'CLEARED');
      const averageClearanceTime = clearedVehicles.length > 0
        ? clearedVehicles.reduce((sum, v) => {
            const orderDate = new Date(v.orderDate);
            const clearanceDate = v.customsClearanceDate ? new Date(v.customsClearanceDate) : new Date();
            return sum + (clearanceDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / clearedVehicles.length
        : 0;

      return {
        locationId: location.id,
        locationName: location.name,
        averageClearanceTime: Math.round(averageClearanceTime),
        totalVehicles: vehiclesAtLocation.length,
        successRate: vehiclesAtLocation.length > 0
          ? Math.round((clearedVehicles.length / vehiclesAtLocation.length) * 100)
          : 0,
      };
    }).filter(cp => cp.totalVehicles > 0);

    // Delivery notes statistics
    const deliveryStats = {
      total: allDeliveryNotes.length,
      totalVehiclesDelivered: allDeliveryNotes.reduce((sum, note) => {
        const vehicleIds = note.vehicleIds as string[];
        return sum + (Array.isArray(vehicleIds) ? vehicleIds.length : 0);
      }, 0),
      averageVehiclesPerDelivery: allDeliveryNotes.length > 0
        ? allDeliveryNotes.reduce((sum, note) => {
            const vehicleIds = note.vehicleIds as string[];
            return sum + (Array.isArray(vehicleIds) ? vehicleIds.length : 0);
          }, 0) / allDeliveryNotes.length
        : 0,
      recentDeliveries: allDeliveryNotes.slice(0, 5).map(note => ({
        id: note.id,
        ownerName: note.owner.name,
        vehicleCount: Array.isArray(note.vehicleIds) ? note.vehicleIds.length : 0,
        deliveryDate: note.deliveryDate,
      })),
    };

    // Users by location
    const usersByLocation = await db.user.groupBy({
      by: ['locationId'],
      _count: {
        locationId: true,
      },
    });

    const usersByLocationWithDetails = usersByLocation.map(stat => {
      const location = allLocations.find(l => l.id === stat.locationId);
      return {
        locationId: stat.locationId,
        locationName: location?.name || 'Unknown',
        userCount: stat._count.locationId,
      };
    });

    // Time series data (monthly aggregation)
    const monthlyData: Record<string, { month: string; orders: number; deliveries: number; importDuties: number }> = {};
    
    allVehicles.forEach(vehicle => {
      const orderDate = new Date(vehicle.orderDate);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          orders: 0,
          deliveries: 0,
          importDuties: 0,
        };
      }
      
      monthlyData[monthKey].orders += 1;
      monthlyData[monthKey].importDuties += vehicle.importDuty;
      
      if (vehicle.status === 'DELIVERED') {
        monthlyData[monthKey].deliveries += 1;
      }
    });

    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, data]) => data);

    // Aggregate the comprehensive dashboard stats
    const dashboardStats = {
      overview: {
        totalVehicles: vehicleStats.overview.totalVehicles,
        totalUsers: userStats.total,
        totalLocations: locationStats.overview.totalLocations,
        totalOwners: ownerStats.overview.totalOwners,
        totalSources: sourceStats.overview.totalSources,
        totalDeliveryNotes: deliveryStats.total,
        activeUsers: userStats.active,
        inactiveUsers: userStats.inactive,
      },
      modules: {
        vehicles: {
          ...vehicleStats,
          fuelType: {
            breakdown: Object.entries(vehiclesByFuelType).map(([type, count]) => ({
              type,
              count,
              percentage: vehicleStats.overview.totalVehicles > 0
                ? Math.round((count / vehicleStats.overview.totalVehicles) * 100)
                : 0,
            })),
          },
          customsStatus: {
            breakdown: Object.entries(vehiclesByCustomsStatus).map(([status, count]) => ({
              status,
              count,
              percentage: vehicleStats.overview.totalVehicles > 0
                ? Math.round((count / vehicleStats.overview.totalVehicles) * 100)
                : 0,
            })),
          },
          make: {
            breakdown: Object.entries(vehiclesByMake).map(([make, count]) => ({
              make,
              count,
              percentage: vehicleStats.overview.totalVehicles > 0
                ? Math.round((count / vehicleStats.overview.totalVehicles) * 100)
                : 0,
            })).sort((a, b) => b.count - a.count),
          },
          color: {
            breakdown: Object.entries(vehiclesByColor).map(([color, count]) => ({
              color,
              count,
              percentage: vehicleStats.overview.totalVehicles > 0
                ? Math.round((count / vehicleStats.overview.totalVehicles) * 100)
                : 0,
            })).sort((a, b) => b.count - a.count),
          },
          model: {
            breakdown: Object.entries(vehiclesByModel).map(([model, count]) => ({
              model,
              count,
              percentage: vehicleStats.overview.totalVehicles > 0
                ? Math.round((count / vehicleStats.overview.totalVehicles) * 100)
                : 0,
            })).sort((a, b) => b.count - a.count),
          },
          transmission: {
            breakdown: Object.entries(vehiclesByTransmission).map(([transmission, count]) => ({
              transmission,
              count,
              percentage: vehicleStats.overview.totalVehicles > 0
                ? Math.round((count / vehicleStats.overview.totalVehicles) * 100)
                : 0,
            })).sort((a, b) => b.count - a.count),
          },
          makeModelCombinations: {
            breakdown: Object.entries(vehiclesByMakeModel)
              .map(([key, count]) => {
                const [make, model] = key.split('|');
                return { make, model, count };
              })
              .sort((a, b) => b.count - a.count),
          },
        },
        locations: locationStats,
        owners: ownerStats,
        users: userStats,
        sources: sourceStats,
        deliveryNotes: deliveryStats,
      },
      crossModule: {
        vehiclesByLocation,
        vehiclesByOwnerNationality: Object.values(vehiclesByOwnerNationality).sort((a, b) => b.vehicleCount - a.vehicleCount),
        topOwners,
        topSources,
        customsPerformance,
        usersByLocation: usersByLocationWithDetails,
      },
      trends: {
        monthlyTrends,
      },
      recent: {
        recentVehicles: recentVehicles,
        recentVehiclesCount: recentVehicles.length,
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
