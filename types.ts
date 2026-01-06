// Core types for the vehicle tracking system

// Permission system types
export type PermissionKey =
  // Dashboard
  | 'view_dashboard'
  // Vehicles
  | 'view_vehicles'
  | 'add_vehicles'
  | 'edit_vehicles'
  | 'delete_vehicles'
  // Users
  | 'view_users'
  | 'add_users'
  | 'edit_users'
  | 'delete_users'
  // Owners
  | 'view_owners'
  | 'add_owners'
  | 'edit_owners'
  | 'delete_owners'
  // Sources
  | 'view_sources'
  | 'add_sources'
  | 'edit_sources'
  | 'delete_sources'
  // Locations
  | 'view_locations'
  | 'add_locations'
  | 'edit_locations'
  | 'delete_locations'
  // Delivery
  | 'view_delivery'
  | 'add_delivery'
  | 'edit_delivery'
  // Tracking
  | 'view_tracking'
  // Analytics
  | 'view_analytics'
  // Reports
  | 'view_reports'
  // Chatbot
  | 'view_chatbot';

export interface UserPermissions extends Record<PermissionKey, boolean> {}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: Role;
  location: Location;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  avatar?: string;
  password?: string; // For mock authentication
  permissions?: UserPermissions;
}

export interface ZitadelUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  preferredUsername: string;
  state: string;
}





export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  roles?: Role[]; // Deprecated: kept for backward compatibility
  requiredPermission?: PermissionKey;
  badge?: string;
  children?: NavigationItem[];
  description?: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  trim: string;
  engineType: string;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  weightKg: number;
  dimensions?: {
      lengthMm: number;
      widthMm: number;
      heightMm: number;
  };

  orderDate: Date;
  status: VehicleStatus;
  currentLocation: Location;
  estimatedDelivery: Date;
 
  customsDetails: {
      customsStatus: 'Pending' | 'In Progress' | 'Cleared' | 'Held';
      customsClearanceDate?: string;
      importDuty: number;
      customsNotes?: string;
      documents?: {
        id: string;
        name: string;
        url: string;
      }[],
  };

  owner: Owner;
  source?: Source;
  trackingHistory: TrackingEvent[];
  notes: string[];
  shippingDetails : shippingDetails;
  images?: VehicleImage[];
}

export interface  shippingDetails {
  id : string;
  originPort: string;
  destinationPort: string;
  shippingCompany: string;
  vesselName?: string;
  containerNumber?: string;
  bookingNumber: string;
  departureDate?: Date;
  expectedArrivalDate?: Date;
  documents?: {
    id: string;
    name: string;
    url: string;
  }[],
}

export interface VehicleImage {
  id: string;
  url?: string;
  alt: string;
  caption?: string;
  isPrimary?: boolean;
  data?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  idNumber: string;
}

export interface Source {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  idNumber: string;
}

export interface TrackingEvent {
  id: string;
  timestamp: Date;
  location: string;
  status: VehicleStatus;
  notes?: string;
}

export const VehicleStatus = {
  ORDERED: 'Ordered',
  IN_TRANSIT: 'In Transit',
  CLEARING_CUSTOMS: 'Clearing Customs',
  AT_PORT: 'At Port',
  IN_LOCAL_DELIVERY: 'In Local Delivery',
  DELIVERED: 'Delivered'
} as const;

export type VehicleStatus = typeof VehicleStatus[keyof typeof VehicleStatus];

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  coordinates: {
      latitude: number;
      longitude: number;
  };
  address: {
      street: string;
      city: string;
      state?: string;
      country: string;
      postalCode?: string;
  };
  contactDetails: {
      contactName?: string;
      phone?: string;
      email?: string;
  };
  status: LocationStatus;
  lastUpdated: string;
  notes?: string;
}

export const LocationType = {
  PORT: 'Port',
  WAREHOUSE: 'Warehouse',
  CUSTOMS_OFFICE: 'Customs Office',
  DEALERSHIP: 'Dealership',
  DELIVERY_POINT: 'Delivery Point'
} as const;

export type LocationType = typeof LocationType[keyof typeof LocationType];

export const LocationStatus = {
  OPERATIONAL: 'Operational',
  TEMPORARILY_CLOSED: 'Temporarily Closed',
  UNDER_MAINTENANCE: 'Under Maintenance'
} as const;

export type LocationStatus = typeof LocationStatus[keyof typeof LocationStatus];

export const Role = {
  ADMIN: 'Admin',
  NORMAL: 'Normal',
  CEO: 'CEO'
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface VehicleFormData {
  // Basic Vehicle Information
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  trim: string;
  engineType: string;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  weightKg: number;
  
  // Dimensions
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  
  // Dates
  orderDate: string;
  estimatedDelivery: string;
  
  // Status and Location
  status: VehicleStatus;
  currentLocationId: string;
  
  // Owner
  ownerId: string;
  
  
  sourceId?: string;
  
  // Shipping Details
  originPort: string;
  destinationPort: string;
  shippingCompany: string;
  vesselName: string;
  containerNumber: string;
  bookingNumber: string;
  departureDate: string;
  expectedArrivalDate: string;
  
  // Customs Details
  customsStatus: 'Pending' | 'In Progress' | 'Cleared' | 'Held';
  importDuty: number;
  customsNotes: string;
  
  // Notes
  notes: string;
  
  // Images
  images: File[];
  
  // Shipping Documents
  shippingDocuments: File[];
}

// Delivery Module Types
export interface DeliveryVehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  status: VehicleStatus;
  trim?: string;
  engineType?: string;
}

export interface DeliveryNote {
  id?: string;
  vehicles: DeliveryVehicle[];
  owner: Owner;
  deliveryDate: Date;
  generatedAt: Date;
  notes?: string;
  vehicleIds?: string[];
}

// AI Chatbot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  vehicles: Vehicle[];
  owners: Owner[];
  locations: Location[];
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

