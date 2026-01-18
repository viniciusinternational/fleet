import { db } from '@/lib/db';

/**
 * Settings Service
 * Provides CRUD operations for vehicle-related constants (makes, models, colors, transmissions)
 */
export class SettingsService {
  // Vehicle Makes
  static async getMakes(includeInactive = false) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      return await db.vehicleMake.findMany({
        where,
        include: {
          _count: {
            select: { models: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching makes:', error);
      throw error;
    }
  }

  static async getMakeById(id: string) {
    try {
      return await db.vehicleMake.findUnique({
        where: { id },
        include: {
          models: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching make by ID:', error);
      throw error;
    }
  }

  static async createMake(data: { name: string; isActive?: boolean }) {
    try {
      return await db.vehicleMake.create({
        data: {
          name: data.name,
          isActive: data.isActive ?? true,
        },
      });
    } catch (error) {
      console.error('Error creating make:', error);
      throw error;
    }
  }

  static async updateMake(id: string, data: { name?: string; isActive?: boolean }) {
    try {
      return await db.vehicleMake.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating make:', error);
      throw error;
    }
  }

  static async deleteMake(id: string) {
    try {
      return await db.vehicleMake.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting make:', error);
      throw error;
    }
  }

  // Vehicle Models
  static async getModels(makeId?: string, includeInactive = false) {
    try {
      const where: any = {};
      if (makeId) {
        where.makeId = makeId;
      }
      if (!includeInactive) {
        where.isActive = true;
      }

      return await db.vehicleModel.findMany({
        where,
        include: {
          make: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { make: { name: 'asc' } },
          { name: 'asc' },
        ],
      });
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  static async getModelById(id: string) {
    try {
      return await db.vehicleModel.findUnique({
        where: { id },
        include: {
          make: true,
        },
      });
    } catch (error) {
      console.error('Error fetching model by ID:', error);
      throw error;
    }
  }

  static async createModel(data: { name: string; makeId: string; isActive?: boolean }) {
    try {
      return await db.vehicleModel.create({
        data: {
          name: data.name,
          makeId: data.makeId,
          isActive: data.isActive ?? true,
        },
        include: {
          make: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  }

  static async updateModel(id: string, data: { name?: string; makeId?: string; isActive?: boolean }) {
    try {
      return await db.vehicleModel.update({
        where: { id },
        data,
        include: {
          make: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  }

  static async deleteModel(id: string) {
    try {
      return await db.vehicleModel.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  // Vehicle Colors
  static async getColors(includeInactive = false) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      return await db.vehicleColor.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  }

  static async getColorById(id: string) {
    try {
      return await db.vehicleColor.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching color by ID:', error);
      throw error;
    }
  }

  static async createColor(data: { name: string; hexCode?: string; isActive?: boolean }) {
    try {
      return await db.vehicleColor.create({
        data: {
          name: data.name,
          hexCode: data.hexCode,
          isActive: data.isActive ?? true,
        },
      });
    } catch (error) {
      console.error('Error creating color:', error);
      throw error;
    }
  }

  static async updateColor(id: string, data: { name?: string; hexCode?: string; isActive?: boolean }) {
    try {
      return await db.vehicleColor.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating color:', error);
      throw error;
    }
  }

  static async deleteColor(id: string) {
    try {
      return await db.vehicleColor.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting color:', error);
      throw error;
    }
  }

  // Transmission Types
  static async getTransmissionTypes(includeInactive = false) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      return await db.transmissionType.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching transmission types:', error);
      throw error;
    }
  }

  static async getTransmissionTypeById(id: string) {
    try {
      return await db.transmissionType.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching transmission type by ID:', error);
      throw error;
    }
  }

  static async createTransmissionType(data: { name: string; enumValue: string; isActive?: boolean }) {
    try {
      return await db.transmissionType.create({
        data: {
          name: data.name,
          enumValue: data.enumValue,
          isActive: data.isActive ?? true,
        },
      });
    } catch (error) {
      console.error('Error creating transmission type:', error);
      throw error;
    }
  }

  static async updateTransmissionType(id: string, data: { name?: string; enumValue?: string; isActive?: boolean }) {
    try {
      return await db.transmissionType.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating transmission type:', error);
      throw error;
    }
  }

  static async deleteTransmissionType(id: string) {
    try {
      return await db.transmissionType.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting transmission type:', error);
      throw error;
    }
  }

  // Engine Types
  static async getEngineTypes(includeInactive = false) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      return await db.engineType.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching engine types:', error);
      throw error;
    }
  }

  static async getEngineTypeById(id: string) {
    try {
      return await db.engineType.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching engine type by ID:', error);
      throw error;
    }
  }

  static async createEngineType(data: { name: string; isActive?: boolean }) {
    try {
      return await db.engineType.create({
        data: {
          name: data.name,
          isActive: data.isActive ?? true,
        },
      });
    } catch (error) {
      console.error('Error creating engine type:', error);
      throw error;
    }
  }

  static async updateEngineType(id: string, data: { name?: string; isActive?: boolean }) {
    try {
      return await db.engineType.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating engine type:', error);
      throw error;
    }
  }

  static async deleteEngineType(id: string) {
    try {
      return await db.engineType.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting engine type:', error);
      throw error;
    }
  }
}

