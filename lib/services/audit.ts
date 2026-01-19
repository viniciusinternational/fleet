import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'USER_CREATED' | 'PERMISSION_CHANGE' | 'STATUS_CHANGE';
export type EntityType = 
  | 'User' 
  | 'Vehicle' 
  | 'Owner' 
  | 'Location' 
  | 'Source' 
  | 'DeliveryNote'
  | 'ShippingDetails'
  | 'VehicleDocument'
  | 'TrackingEvent'
  | 'VehicleImage'
  | 'VehicleMake'
  | 'VehicleModel'
  | 'VehicleColor'
  | 'TransmissionType'
  | 'EngineType';

export interface AuditLogInput {
  action: AuditAction;
  actorId: string;
  entityType: EntityType;
  entityId: string;
  before?: any;
  after?: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

export interface AuditLogFilters {
  entityType?: EntityType;
  entityId?: string;
  actorId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface AuditLogSortOptions {
  sortBy?: 'timestamp' | 'entityType' | 'action' | 'actorId';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogPaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Audit Service
 * Provides audit logging functionality to track all entity changes
 */
export class AuditService {
  /**
   * Log an audit event
   */
  static async logEvent(input: AuditLogInput): Promise<void> {
    try {
      // Exclude sensitive fields from before/after states
      const sanitizedBefore = input.before ? this.sanitizeData(input.before) : null;
      const sanitizedAfter = input.after ? this.sanitizeData(input.after) : null;

      await db.auditLog.create({
        data: {
          action: input.action,
          actorId: input.actorId,
          entityType: input.entityType,
          entityId: input.entityId,
          before: sanitizedBefore as Prisma.JsonValue,
          after: sanitizedAfter as Prisma.JsonValue,
          metadata: input.metadata as Prisma.JsonValue,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      // Don't throw - audit logging should not break the main operation
      console.error('Error logging audit event:', error);
    }
  }

  /**
   * Get audit logs with filtering, sorting, and pagination
   */
  static async getAuditLogs(
    filters: AuditLogFilters = {},
    sortOptions: AuditLogSortOptions = {},
    paginationOptions: AuditLogPaginationOptions = {}
  ) {
    const { page = 1, limit = 50 } = paginationOptions;
    const { sortBy = 'timestamp', sortOrder = 'desc' } = sortOptions;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'timestamp':
        orderBy.timestamp = sortOrder;
        break;
      case 'entityType':
        orderBy.entityType = sortOrder;
        break;
      case 'action':
        orderBy.action = sortOrder;
        break;
      case 'actorId':
        orderBy.actorId = sortOrder;
        break;
      default:
        orderBy.timestamp = sortOrder;
    }

    try {
      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            actor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        db.auditLog.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        logs,
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getAuditLogsByEntity(
    entityType: EntityType,
    entityId: string,
    paginationOptions: AuditLogPaginationOptions = {}
  ) {
    return this.getAuditLogs(
      { entityType, entityId },
      { sortBy: 'timestamp', sortOrder: 'desc' },
      paginationOptions
    );
  }

  /**
   * Get audit logs for a specific actor (user)
   */
  static async getAuditLogsByActor(
    actorId: string,
    paginationOptions: AuditLogPaginationOptions = {}
  ) {
    return this.getAuditLogs(
      { actorId },
      { sortBy: 'timestamp', sortOrder: 'desc' },
      paginationOptions
    );
  }

  /**
   * Get a single audit log by ID
   */
  static async getAuditLogById(id: string) {
    try {
      return await db.auditLog.findUnique({
        where: { id },
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return null;
    }
  }

  /**
   * Sanitize data to exclude sensitive fields
   */
  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Extract before state from entity (for UPDATE operations)
   */
  static async getBeforeState(entityType: EntityType, entityId: string): Promise<any> {
    try {
      switch (entityType) {
        case 'User':
          const user = await db.user.findUnique({
            where: { id: entityId },
            include: { location: true },
          });
          return user ? JSON.parse(JSON.stringify(user)) : null;
        
        case 'Vehicle':
          const vehicle = await db.vehicle.findUnique({
            where: { id: entityId },
            include: {
              owner: true,
              currentLocation: true,
              source: true,
            },
          });
          return vehicle ? JSON.parse(JSON.stringify(vehicle)) : null;
        
        case 'Owner':
          const owner = await db.owner.findUnique({
            where: { id: entityId },
          });
          return owner ? JSON.parse(JSON.stringify(owner)) : null;
        
        case 'Location':
          const location = await db.location.findUnique({
            where: { id: entityId },
          });
          return location ? JSON.parse(JSON.stringify(location)) : null;
        
        case 'Source':
          const source = await db.source.findUnique({
            where: { id: entityId },
          });
          return source ? JSON.parse(JSON.stringify(source)) : null;
        
        case 'DeliveryNote':
          const deliveryNote = await db.deliveryNote.findUnique({
            where: { id: entityId },
            include: { owner: true },
          });
          return deliveryNote ? JSON.parse(JSON.stringify(deliveryNote)) : null;
        
        case 'ShippingDetails':
          const shippingDetails = await db.shippingDetails.findUnique({
            where: { id: entityId },
            include: { vehicle: true },
          });
          return shippingDetails ? JSON.parse(JSON.stringify(shippingDetails)) : null;
        
        case 'VehicleDocument':
          const vehicleDocument = await db.vehicleDocument.findUnique({
            where: { id: entityId },
            include: { vehicle: true },
          });
          return vehicleDocument ? JSON.parse(JSON.stringify(vehicleDocument)) : null;
        
        case 'TrackingEvent':
          const trackingEvent = await db.trackingEvent.findUnique({
            where: { id: entityId },
            include: { vehicle: true },
          });
          return trackingEvent ? JSON.parse(JSON.stringify(trackingEvent)) : null;
        
        case 'VehicleImage':
          const vehicleImage = await db.vehicleImage.findUnique({
            where: { id: entityId },
            include: { vehicle: true },
          });
          return vehicleImage ? JSON.parse(JSON.stringify(vehicleImage)) : null;
        
        case 'VehicleMake':
          const vehicleMake = await db.vehicleMake.findUnique({
            where: { id: entityId },
            include: { models: true },
          });
          return vehicleMake ? JSON.parse(JSON.stringify(vehicleMake)) : null;
        
        case 'VehicleModel':
          const vehicleModel = await db.vehicleModel.findUnique({
            where: { id: entityId },
            include: { make: true },
          });
          return vehicleModel ? JSON.parse(JSON.stringify(vehicleModel)) : null;
        
        case 'VehicleColor':
          const vehicleColor = await db.vehicleColor.findUnique({
            where: { id: entityId },
          });
          return vehicleColor ? JSON.parse(JSON.stringify(vehicleColor)) : null;
        
        case 'TransmissionType':
          const transmissionType = await db.transmissionType.findUnique({
            where: { id: entityId },
          });
          return transmissionType ? JSON.parse(JSON.stringify(transmissionType)) : null;
        
        case 'EngineType':
          const engineType = await db.engineType.findUnique({
            where: { id: entityId },
          });
          return engineType ? JSON.parse(JSON.stringify(engineType)) : null;
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching before state for ${entityType}:${entityId}:`, error);
      return null;
    }
  }

  /**
   * Log a special action (LOGIN, USER_CREATED, PERMISSION_CHANGE)
   */
  static async logSpecialAction(
    action: 'LOGIN' | 'USER_CREATED' | 'PERMISSION_CHANGE',
    actorId: string,
    entityType: EntityType,
    entityId: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      [key: string]: any;
    },
    after?: any
  ): Promise<void> {
    await this.logEvent({
      action,
      actorId,
      entityType,
      entityId,
      after: after ? this.sanitizeData(after) : null,
      metadata,
    });
  }

  /**
   * Log a status change for an entity
   */
  static async logStatusChange(
    actorId: string,
    entityType: EntityType,
    entityId: string,
    beforeStatus: any,
    afterStatus: any,
    metadata?: {
      [key: string]: any;
    }
  ): Promise<void> {
    const beforeState = await this.getBeforeState(entityType, entityId);
    const afterState = beforeState ? { ...beforeState, status: afterStatus } : { status: afterStatus };

    await this.logEvent({
      action: 'STATUS_CHANGE',
      actorId,
      entityType,
      entityId,
      before: beforeState ? { ...beforeState, status: beforeStatus } : { status: beforeStatus },
      after: afterState,
      metadata: {
        ...metadata,
        statusChange: {
          from: beforeStatus,
          to: afterStatus,
        },
      },
    });
  }

  /**
   * Configuration for logging limitations
   */
  private static readonly LOGGING_CONFIG = {
    // Exclude read operations (GET requests)
    excludeReadOperations: true,
    // Entity types to exclude from logging (if any)
    excludedEntityTypes: [] as EntityType[],
    // Actions to exclude from logging (if any)
    excludedActions: [] as AuditAction[],
  };

  /**
   * Check if an operation should be logged based on configuration
   */
  static shouldLog(entityType: EntityType, action: AuditAction): boolean {
    if (this.LOGGING_CONFIG.excludedEntityTypes.includes(entityType)) {
      return false;
    }
    if (this.LOGGING_CONFIG.excludedActions.includes(action)) {
      return false;
    }
    // Read operations are excluded by default (no GET logging)
    return true;
  }
}
