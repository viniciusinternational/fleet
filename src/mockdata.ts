import type { Vehicle, Owner, Location, TrackingEvent, User } from './types';
import { VehicleStatus, LocationType, LocationStatus, Role } from './types';

// Mock Locations
export const mockLocations: Location[] = [
  // Lagos Locations
  {
    id: "loc-001",
    name: "Lagos Port Complex",
    type: LocationType.PORT,
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792
    },
    address: {
      street: "Port Access Road",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100001"
    },
    contactDetails: {
      contactName: "Port Manager",
      phone: "+234-1-234-5678",
      email: "info@lagosport.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T10:30:00Z",
    notes: "Main import port for vehicles in Nigeria"
  },
  {
    id: "loc-002",
    name: "Lagos Customs Office",
    type: LocationType.CUSTOMS_OFFICE,
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792
    },
    address: {
      street: "Customs Road, Apapa",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100002"
    },
    contactDetails: {
      contactName: "Customs Officer Adebayo",
      phone: "+234-1-234-5679",
      email: "customs.lagos@nigeria.gov.ng"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T09:15:00Z",
    notes: "Primary customs clearance for Lagos region"
  },
  {
    id: "loc-003",
    name: "Lagos Central Warehouse",
    type: LocationType.WAREHOUSE,
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792
    },
    address: {
      street: "Industrial Area, Ikeja",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100003"
    },
    contactDetails: {
      contactName: "Warehouse Manager",
      phone: "+234-1-234-5680",
      email: "warehouse@lagoslogistics.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T08:45:00Z",
    notes: "Central storage facility for Lagos vehicle distribution"
  },
  {
    id: "loc-004",
    name: "Lagos Premium Motors",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792
    },
    address: {
      street: "Victoria Island",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100004"
    },
    contactDetails: {
      contactName: "Sales Manager",
      phone: "+234-1-234-5681",
      email: "sales@lagospremiummotors.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T11:20:00Z",
    notes: "Premium vehicle dealership in Lagos"
  },
  {
    id: "loc-005",
    name: "Lagos Delivery Center",
    type: LocationType.DELIVERY_POINT,
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792
    },
    address: {
      street: "Lekki Expressway",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100005"
    },
    contactDetails: {
      contactName: "Delivery Coordinator",
      phone: "+234-1-234-5682",
      email: "delivery@lagosautocenter.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T12:00:00Z",
    notes: "Final delivery point for Lagos customers"
  },
  // Kano Locations
  {
    id: "loc-006",
    name: "Kano Customs Office",
    type: LocationType.CUSTOMS_OFFICE,
    coordinates: {
      latitude: 11.9914,
      longitude: 8.5313
    },
    address: {
      street: "Customs Road, Nasarawa GRA",
      city: "Kano",
      state: "Kano",
      country: "Nigeria",
      postalCode: "700001"
    },
    contactDetails: {
      contactName: "Customs Officer Bello",
      phone: "+234-64-123-4567",
      email: "customs.kano@nigeria.gov.ng"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T09:15:00Z",
    notes: "Primary customs clearance for Kano region"
  },
  {
    id: "loc-007",
    name: "Kano Central Warehouse",
    type: LocationType.WAREHOUSE,
    coordinates: {
      latitude: 11.9914,
      longitude: 8.5313
    },
    address: {
      street: "Industrial Area, Bompai",
      city: "Kano",
      state: "Kano",
      country: "Nigeria",
      postalCode: "700002"
    },
    contactDetails: {
      contactName: "Warehouse Manager",
      phone: "+234-64-987-6543",
      email: "warehouse@kanologistics.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T08:45:00Z",
    notes: "Central storage facility for Kano vehicle distribution"
  },
  {
    id: "loc-008",
    name: "Kano Premium Motors",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 11.9914,
      longitude: 8.5313
    },
    address: {
      street: "Murtala Mohammed Way",
      city: "Kano",
      state: "Kano",
      country: "Nigeria",
      postalCode: "700003"
    },
    contactDetails: {
      contactName: "Sales Manager",
      phone: "+234-64-555-0124",
      email: "sales@kanopremiummotors.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T11:20:00Z",
    notes: "Premium vehicle dealership in Kano"
  },
  {
    id: "loc-009",
    name: "Kano Delivery Center",
    type: LocationType.DELIVERY_POINT,
    coordinates: {
      latitude: 11.9914,
      longitude: 8.5313
    },
    address: {
      street: "Ahmadu Bello Way",
      city: "Kano",
      state: "Kano",
      country: "Nigeria",
      postalCode: "700004"
    },
    contactDetails: {
      contactName: "Delivery Coordinator",
      phone: "+234-64-555-0125",
      email: "delivery@kanoautocenter.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T12:00:00Z",
    notes: "Final delivery point for Kano customers"
  },
  {
    id: "loc-010",
    name: "Kano Auto Mall",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 11.9914,
      longitude: 8.5313
    },
    address: {
      street: "Zaria Road",
      city: "Kano",
      state: "Kano",
      country: "Nigeria",
      postalCode: "700005"
    },
    contactDetails: {
      contactName: "Mall Manager",
      phone: "+234-64-555-0126",
      email: "info@kanoautomall.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T13:00:00Z",
    notes: "Multi-brand auto dealership in Kano"
  },
  // Abuja Locations
  {
    id: "loc-011",
    name: "Abuja Customs Office",
    type: LocationType.CUSTOMS_OFFICE,
    coordinates: {
      latitude: 9.0765,
      longitude: 7.3986
    },
    address: {
      street: "Customs Road, Garki",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      postalCode: "900001"
    },
    contactDetails: {
      contactName: "Customs Officer Musa",
      phone: "+234-9-234-5678",
      email: "customs.abuja@nigeria.gov.ng"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T09:30:00Z",
    notes: "Primary customs clearance for Abuja region"
  },
  {
    id: "loc-012",
    name: "Abuja Central Warehouse",
    type: LocationType.WAREHOUSE,
    coordinates: {
      latitude: 9.0765,
      longitude: 7.3986
    },
    address: {
      street: "Industrial Area, Suleja",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      postalCode: "900002"
    },
    contactDetails: {
      contactName: "Warehouse Manager",
      phone: "+234-9-234-5679",
      email: "warehouse@abujalogistics.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T08:30:00Z",
    notes: "Central storage facility for Abuja vehicle distribution"
  },
  {
    id: "loc-013",
    name: "Abuja Premium Motors",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 9.0765,
      longitude: 7.3986
    },
    address: {
      street: "Wuse 2",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      postalCode: "900003"
    },
    contactDetails: {
      contactName: "Sales Manager",
      phone: "+234-9-234-5680",
      email: "sales@abujapremiummotors.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T11:45:00Z",
    notes: "Premium vehicle dealership in Abuja"
  },
  {
    id: "loc-014",
    name: "Abuja Delivery Center",
    type: LocationType.DELIVERY_POINT,
    coordinates: {
      latitude: 9.0765,
      longitude: 7.3986
    },
    address: {
      street: "Maitama",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      postalCode: "900004"
    },
    contactDetails: {
      contactName: "Delivery Coordinator",
      phone: "+234-9-234-5681",
      email: "delivery@abujaautocenter.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T12:15:00Z",
    notes: "Final delivery point for Abuja customers"
  },
  {
    id: "loc-015",
    name: "Abuja Auto Hub",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 9.0765,
      longitude: 7.3986
    },
    address: {
      street: "Asokoro",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      postalCode: "900005"
    },
    contactDetails: {
      contactName: "Hub Manager",
      phone: "+234-9-234-5682",
      email: "info@abujaautohub.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T13:30:00Z",
    notes: "Multi-brand auto dealership in Abuja"
  },
  // Kaduna Locations
  {
    id: "loc-016",
    name: "Kaduna Customs Office",
    type: LocationType.CUSTOMS_OFFICE,
    coordinates: {
      latitude: 10.5200,
      longitude: 7.4382
    },
    address: {
      street: "Customs Road, Kaduna North",
      city: "Kaduna",
      state: "Kaduna",
      country: "Nigeria",
      postalCode: "800001"
    },
    contactDetails: {
      contactName: "Customs Officer Sani",
      phone: "+234-62-123-4567",
      email: "customs.kaduna@nigeria.gov.ng"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T09:45:00Z",
    notes: "Primary customs clearance for Kaduna region"
  },
  {
    id: "loc-017",
    name: "Kaduna Central Warehouse",
    type: LocationType.WAREHOUSE,
    coordinates: {
      latitude: 10.5200,
      longitude: 7.4382
    },
    address: {
      street: "Industrial Area, Kakuri",
      city: "Kaduna",
      state: "Kaduna",
      country: "Nigeria",
      postalCode: "800002"
    },
    contactDetails: {
      contactName: "Warehouse Manager",
      phone: "+234-62-123-4568",
      email: "warehouse@kadunalogistics.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T08:15:00Z",
    notes: "Central storage facility for Kaduna vehicle distribution"
  },
  {
    id: "loc-018",
    name: "Kaduna Premium Motors",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 10.5200,
      longitude: 7.4382
    },
    address: {
      street: "Ali Akilu Road",
      city: "Kaduna",
      state: "Kaduna",
      country: "Nigeria",
      postalCode: "800003"
    },
    contactDetails: {
      contactName: "Sales Manager",
      phone: "+234-62-123-4569",
      email: "sales@kadunapremiummotors.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T11:30:00Z",
    notes: "Premium vehicle dealership in Kaduna"
  },
  {
    id: "loc-019",
    name: "Kaduna Delivery Center",
    type: LocationType.DELIVERY_POINT,
    coordinates: {
      latitude: 10.5200,
      longitude: 7.4382
    },
    address: {
      street: "Ungwan Rimi",
      city: "Kaduna",
      state: "Kaduna",
      country: "Nigeria",
      postalCode: "800004"
    },
    contactDetails: {
      contactName: "Delivery Coordinator",
      phone: "+234-62-123-4570",
      email: "delivery@kadunaautocenter.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T12:30:00Z",
    notes: "Final delivery point for Kaduna customers"
  },
  {
    id: "loc-020",
    name: "Kaduna Auto Plaza",
    type: LocationType.DEALERSHIP,
    coordinates: {
      latitude: 10.5200,
      longitude: 7.4382
    },
    address: {
      street: "Independence Way",
      city: "Kaduna",
      state: "Kaduna",
      country: "Nigeria",
      postalCode: "800005"
    },
    contactDetails: {
      contactName: "Plaza Manager",
      phone: "+234-62-123-4571",
      email: "info@kadunaautoplaza.com"
    },
    status: LocationStatus.OPERATIONAL,
    lastUpdated: "2024-01-15T13:45:00Z",
    notes: "Multi-brand auto dealership in Kaduna"
  }
];

// Mock Users with Authentication Data
export const mockUsers: User[] = [
  // Admin Users
  {
    id: "user-001",
    fullname: "Ahmed Bello",
    phone: "+234-1-234-5678",
    email: "admin@company.com",
    password: "admin123",
    role: Role.ADMIN,
    location: mockLocations[0],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    lastLogin: new Date("2024-01-15T10:30:00Z"),
    isActive: true,
    avatar: "AB"
  },
  {
    id: "user-002",
    fullname: "Usman Abdullahi",
    phone: "+234-64-555-0125",
    email: "admin2@company.com",
    password: "admin456",
    role: Role.ADMIN,
    location: mockLocations[5],
    createdAt: new Date("2024-01-05T00:00:00Z"),
    lastLogin: new Date("2024-01-15T11:45:00Z"),
    isActive: true,
    avatar: "UA"
  },
  {
    id: "user-003",
    fullname: "Ibrahim Sani",
    phone: "+234-9-234-5678",
    email: "admin3@company.com",
    password: "admin789",
    role: Role.ADMIN,
    location: mockLocations[10],
    createdAt: new Date("2024-01-06T00:00:00Z"),
    lastLogin: new Date("2024-01-15T12:00:00Z"),
    isActive: true,
    avatar: "IS"
  },
  {
    id: "user-004",
    fullname: "Musa Garba",
    phone: "+234-62-123-4567",
    email: "admin4@company.com",
    password: "admin012",
    role: Role.ADMIN,
    location: mockLocations[15],
    createdAt: new Date("2024-01-07T00:00:00Z"),
    lastLogin: new Date("2024-01-15T12:15:00Z"),
    isActive: true,
    avatar: "MG"
  },
  // CEO Users
  {
    id: "user-005",
    fullname: "Mohammed Ibrahim",
    phone: "+234-64-987-6543",
    email: "ceo@company.com",
    password: "ceo123",
    role: Role.CEO,
    location: mockLocations[1],
    createdAt: new Date("2024-01-03T00:00:00Z"),
    lastLogin: new Date("2024-01-15T09:15:00Z"),
    isActive: true,
    avatar: "MI"
  },
  {
    id: "user-006",
    fullname: "Aminu Dantata",
    phone: "+234-64-111-2222",
    email: "ceo2@company.com",
    password: "ceo456",
    role: Role.CEO,
    location: mockLocations[6],
    createdAt: new Date("2024-01-08T00:00:00Z"),
    lastLogin: new Date("2024-01-15T13:00:00Z"),
    isActive: true,
    avatar: "AD"
  },
  // Normal Users - Lagos
  {
    id: "user-007",
    fullname: "Fatima Yusuf",
    phone: "+234-1-234-5679",
    email: "user@company.com",
    password: "user123",
    role: Role.NORMAL,
    location: mockLocations[1],
    createdAt: new Date("2024-01-02T00:00:00Z"),
    lastLogin: new Date("2024-01-14T15:45:00Z"),
    isActive: true,
    avatar: "FY"
  },
  {
    id: "user-008",
    fullname: "Aisha Hassan",
    phone: "+234-1-234-5680",
    email: "normal@company.com",
    password: "normal123",
    role: Role.NORMAL,
    location: mockLocations[2],
    createdAt: new Date("2024-01-04T00:00:00Z"),
    lastLogin: new Date("2024-01-13T14:20:00Z"),
    isActive: true,
    avatar: "AH"
  },
  {
    id: "user-009",
    fullname: "Hassan Bello",
    phone: "+234-1-234-5681",
    email: "hassan@company.com",
    password: "hassan123",
    role: Role.NORMAL,
    location: mockLocations[3],
    createdAt: new Date("2024-01-09T00:00:00Z"),
    lastLogin: new Date("2024-01-14T16:30:00Z"),
    isActive: true,
    avatar: "HB"
  },
  {
    id: "user-010",
    fullname: "Zainab Mohammed",
    phone: "+234-1-234-5682",
    email: "zainab@company.com",
    password: "zainab123",
    role: Role.NORMAL,
    location: mockLocations[4],
    createdAt: new Date("2024-01-10T00:00:00Z"),
    lastLogin: new Date("2024-01-14T17:00:00Z"),
    isActive: true,
    avatar: "ZM"
  },
  // Normal Users - Kano
  {
    id: "user-011",
    fullname: "Aminu Sani",
    phone: "+234-64-123-4568",
    email: "aminu@company.com",
    password: "aminu123",
    role: Role.NORMAL,
    location: mockLocations[6],
    createdAt: new Date("2024-01-11T00:00:00Z"),
    lastLogin: new Date("2024-01-14T18:00:00Z"),
    isActive: true,
    avatar: "AS"
  },
  {
    id: "user-012",
    fullname: "Hauwa Ibrahim",
    phone: "+234-64-123-4569",
    email: "hauwa@company.com",
    password: "hauwa123",
    role: Role.NORMAL,
    location: mockLocations[7],
    createdAt: new Date("2024-01-12T00:00:00Z"),
    lastLogin: new Date("2024-01-14T18:30:00Z"),
    isActive: true,
    avatar: "HI"
  },
  {
    id: "user-013",
    fullname: "Yusuf Garba",
    phone: "+234-64-123-4570",
    email: "yusuf@company.com",
    password: "yusuf123",
    role: Role.NORMAL,
    location: mockLocations[8],
    createdAt: new Date("2024-01-13T00:00:00Z"),
    lastLogin: new Date("2024-01-14T19:00:00Z"),
    isActive: true,
    avatar: "YG"
  },
  {
    id: "user-014",
    fullname: "Khadija Abdullahi",
    phone: "+234-64-123-4571",
    email: "khadija@company.com",
    password: "khadija123",
    role: Role.NORMAL,
    location: mockLocations[9],
    createdAt: new Date("2024-01-14T00:00:00Z"),
    lastLogin: new Date("2024-01-14T19:30:00Z"),
    isActive: true,
    avatar: "KA"
  },
  {
    id: "user-015",
    fullname: "Sani Bello",
    phone: "+234-64-123-4572",
    email: "sani@company.com",
    password: "sani123",
    role: Role.NORMAL,
    location: mockLocations[5],
    createdAt: new Date("2024-01-15T00:00:00Z"),
    lastLogin: new Date("2024-01-15T08:00:00Z"),
    isActive: true,
    avatar: "SB"
  },
  // Normal Users - Abuja
  {
    id: "user-016",
    fullname: "Musa Ibrahim",
    phone: "+234-9-234-5679",
    email: "musa@company.com",
    password: "musa123",
    role: Role.NORMAL,
    location: mockLocations[11],
    createdAt: new Date("2024-01-16T00:00:00Z"),
    lastLogin: new Date("2024-01-15T09:00:00Z"),
    isActive: true,
    avatar: "MI"
  },
  {
    id: "user-017",
    fullname: "Aisha Musa",
    phone: "+234-9-234-5680",
    email: "aisha.musa@company.com",
    password: "aisha123",
    role: Role.NORMAL,
    location: mockLocations[12],
    createdAt: new Date("2024-01-17T00:00:00Z"),
    lastLogin: new Date("2024-01-15T09:30:00Z"),
    isActive: true,
    avatar: "AM"
  },
  {
    id: "user-018",
    fullname: "Ibrahim Garba",
    phone: "+234-9-234-5681",
    email: "ibrahim.garba@company.com",
    password: "ibrahim123",
    role: Role.NORMAL,
    location: mockLocations[13],
    createdAt: new Date("2024-01-18T00:00:00Z"),
    lastLogin: new Date("2024-01-15T10:00:00Z"),
    isActive: true,
    avatar: "IG"
  },
  {
    id: "user-019",
    fullname: "Fatima Sani",
    phone: "+234-9-234-5682",
    email: "fatima.sani@company.com",
    password: "fatima123",
    role: Role.NORMAL,
    location: mockLocations[14],
    createdAt: new Date("2024-01-19T00:00:00Z"),
    lastLogin: new Date("2024-01-15T10:30:00Z"),
    isActive: true,
    avatar: "FS"
  },
  {
    id: "user-020",
    fullname: "Usman Bello",
    phone: "+234-9-234-5683",
    email: "usman.bello@company.com",
    password: "usman123",
    role: Role.NORMAL,
    location: mockLocations[10],
    createdAt: new Date("2024-01-20T00:00:00Z"),
    lastLogin: new Date("2024-01-15T11:00:00Z"),
    isActive: true,
    avatar: "UB"
  },
  // Normal Users - Kaduna
  {
    id: "user-021",
    fullname: "Sani Mohammed",
    phone: "+234-62-123-4568",
    email: "sani.mohammed@company.com",
    password: "sani.mohammed123",
    role: Role.NORMAL,
    location: mockLocations[16],
    createdAt: new Date("2024-01-21T00:00:00Z"),
    lastLogin: new Date("2024-01-15T11:30:00Z"),
    isActive: true,
    avatar: "SM"
  },
  {
    id: "user-022",
    fullname: "Hauwa Garba",
    phone: "+234-62-123-4569",
    email: "hauwa.garba@company.com",
    password: "hauwa.garba123",
    role: Role.NORMAL,
    location: mockLocations[17],
    createdAt: new Date("2024-01-22T00:00:00Z"),
    lastLogin: new Date("2024-01-15T12:00:00Z"),
    isActive: true,
    avatar: "HG"
  },
  {
    id: "user-023",
    fullname: "Yusuf Ibrahim",
    phone: "+234-62-123-4570",
    email: "yusuf.ibrahim@company.com",
    password: "yusuf.ibrahim123",
    role: Role.NORMAL,
    location: mockLocations[18],
    createdAt: new Date("2024-01-23T00:00:00Z"),
    lastLogin: new Date("2024-01-15T12:30:00Z"),
    isActive: true,
    avatar: "YI"
  },
  {
    id: "user-024",
    fullname: "Khadija Sani",
    phone: "+234-62-123-4571",
    email: "khadija.sani@company.com",
    password: "khadija.sani123",
    role: Role.NORMAL,
    location: mockLocations[19],
    createdAt: new Date("2024-01-24T00:00:00Z"),
    lastLogin: new Date("2024-01-15T13:00:00Z"),
    isActive: true,
    avatar: "KS"
  },
  {
    id: "user-025",
    fullname: "Aminu Abdullahi",
    phone: "+234-62-123-4572",
    email: "aminu.abdullahi@company.com",
    password: "aminu.abdullahi123",
    role: Role.NORMAL,
    location: mockLocations[15],
    createdAt: new Date("2024-01-25T00:00:00Z"),
    lastLogin: new Date("2024-01-15T13:30:00Z"),
    isActive: true,
    avatar: "AA"
  }
];

// Mock Authentication Functions
export const mockAuthService = {
  // Simulate login with email and password
  login: async (email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Generate mock tokens
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
    
    // Update last login
    user.lastLogin = new Date();
    
    return {
      user: { ...user, password: undefined }, // Remove password from returned user
      token,
      refreshToken
    };
  },
  
  // Simulate token refresh
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you'd validate the refresh token
    // For now, we just ignore the input refreshToken and generate new ones
    console.log('Refreshing token:', refreshToken);
    const newToken = `mock-jwt-token-refreshed-${Date.now()}`;
    const newRefreshToken = `mock-refresh-token-refreshed-${Date.now()}`;
    
    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  },
  
  // Get user by token (simulate token validation)
  getUserByToken: async (token: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Extract user ID from mock token
    const userId = token.split('-')[3];
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user || !user.isActive) {
      return null;
    }
    
    return { ...user, password: undefined };
  }
};

// Quick login credentials for easy testing
export const quickLoginCredentials = {
  admin: { email: "admin@company.com", password: "admin123" },
  admin2: { email: "admin2@company.com", password: "admin456" },
  admin3: { email: "admin3@company.com", password: "admin789" },
  admin4: { email: "admin4@company.com", password: "admin012" },
  user: { email: "user@company.com", password: "user123" },
  user2: { email: "normal@company.com", password: "normal123" },
  user3: { email: "hassan@company.com", password: "hassan123" },
  user4: { email: "zainab@company.com", password: "zainab123" },
  user5: { email: "aminu@company.com", password: "aminu123" },
  user6: { email: "hauwa@company.com", password: "hauwa123" },
  user7: { email: "yusuf@company.com", password: "yusuf123" },
  user8: { email: "khadija@company.com", password: "khadija123" },
  user9: { email: "sani@company.com", password: "sani123" },
  user10: { email: "musa@company.com", password: "musa123" },
  ceo: { email: "ceo@company.com", password: "ceo123" },
  ceo2: { email: "ceo2@company.com", password: "ceo456" },
};

// Mock Owners
export const mockOwners: Owner[] = [
  // Kano Owners
  {
    id: "owner-001",
    name: "Alhaji Sani Bello",
    email: "alhaji.sani@email.com",
    phone: "+234-64-111-2222",
    address: "123 Murtala Mohammed Way, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-123456789"
  },
  {
    id: "owner-002",
    name: "Hajiya Amina Yusuf",
    email: "hajiya.amina@email.com",
    phone: "+234-64-222-3333",
    address: "456 Ahmadu Bello Way, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-987654321"
  },
  {
    id: "owner-003",
    name: "Alhaji Ibrahim Hassan",
    email: "alhaji.ibrahim@email.com",
    phone: "+234-64-333-4444",
    address: "789 Nasarawa GRA, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-456789123"
  },
  {
    id: "owner-004",
    name: "Hajiya Fatima Abdullahi",
    email: "hajiya.fatima@email.com",
    phone: "+234-64-444-5555",
    address: "321 Bompai Industrial Area, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-789123456"
  },
  {
    id: "owner-005",
    name: "Alhaji Usman Mohammed",
    email: "alhaji.usman@email.com",
    phone: "+234-64-555-6666",
    address: "654 Customs Road, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-321654987"
  },
  {
    id: "owner-006",
    name: "Alhaji Musa Garba",
    email: "alhaji.musa@email.com",
    phone: "+234-64-666-7777",
    address: "987 Zaria Road, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-654987321"
  },
  {
    id: "owner-007",
    name: "Hajiya Khadija Sani",
    email: "hajiya.khadija@email.com",
    phone: "+234-64-777-8888",
    address: "147 Gwammaja, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-987321654"
  },
  {
    id: "owner-008",
    name: "Alhaji Aminu Dantata",
    email: "alhaji.aminu@email.com",
    phone: "+234-64-888-9999",
    address: "258 Sabon Gari, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-321987654"
  },
  {
    id: "owner-009",
    name: "Hajiya Hauwa Ibrahim",
    email: "hajiya.hauwa@email.com",
    phone: "+234-64-999-0000",
    address: "369 Fagge, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-654321987"
  },
  {
    id: "owner-010",
    name: "Alhaji Yusuf Bello",
    email: "alhaji.yusuf@email.com",
    phone: "+234-64-000-1111",
    address: "741 Tarauni, Kano, Kano State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-987654123"
  },
  // Abuja Owners
  {
    id: "owner-011",
    name: "Alhaji Ibrahim Musa",
    email: "alhaji.ibrahim.musa@email.com",
    phone: "+234-9-111-2222",
    address: "123 Wuse 2, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-111222333"
  },
  {
    id: "owner-012",
    name: "Hajiya Aisha Garba",
    email: "hajiya.aisha.garba@email.com",
    phone: "+234-9-222-3333",
    address: "456 Maitama, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-222333444"
  },
  {
    id: "owner-013",
    name: "Alhaji Sani Mohammed",
    email: "alhaji.sani.mohammed@email.com",
    phone: "+234-9-333-4444",
    address: "789 Asokoro, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-333444555"
  },
  {
    id: "owner-014",
    name: "Hajiya Fatima Abdullahi",
    email: "hajiya.fatima.abdullahi@email.com",
    phone: "+234-9-444-5555",
    address: "321 Garki, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-444555666"
  },
  {
    id: "owner-015",
    name: "Alhaji Usman Bello",
    email: "alhaji.usman.bello@email.com",
    phone: "+234-9-555-6666",
    address: "654 Utako, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-555666777"
  },
  {
    id: "owner-016",
    name: "Hajiya Zainab Sani",
    email: "hajiya.zainab.sani@email.com",
    phone: "+234-9-666-7777",
    address: "987 Jabi, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-666777888"
  },
  {
    id: "owner-017",
    name: "Alhaji Aminu Ibrahim",
    email: "alhaji.aminu.ibrahim@email.com",
    phone: "+234-9-777-8888",
    address: "147 Gwarinpa, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-777888999"
  },
  {
    id: "owner-018",
    name: "Hajiya Khadija Musa",
    email: "hajiya.khadija.musa@email.com",
    phone: "+234-9-888-9999",
    address: "258 Kubwa, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-888999000"
  },
  {
    id: "owner-019",
    name: "Alhaji Hassan Garba",
    email: "alhaji.hassan.garba@email.com",
    phone: "+234-9-999-0000",
    address: "369 Lugbe, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-999000111"
  },
  {
    id: "owner-020",
    name: "Hajiya Aisha Mohammed",
    email: "hajiya.aisha.mohammed@email.com",
    phone: "+234-9-000-1111",
    address: "741 Nyanya, Abuja, FCT, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-000111222"
  },
  // Kaduna Owners
  {
    id: "owner-021",
    name: "Alhaji Musa Ibrahim",
    email: "alhaji.musa.ibrahim@email.com",
    phone: "+234-62-111-2222",
    address: "123 Ali Akilu Road, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-111222333"
  },
  {
    id: "owner-022",
    name: "Hajiya Hauwa Sani",
    email: "hajiya.hauwa.sani@email.com",
    phone: "+234-62-222-3333",
    address: "456 Independence Way, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-222333444"
  },
  {
    id: "owner-023",
    name: "Alhaji Yusuf Garba",
    email: "alhaji.yusuf.garba@email.com",
    phone: "+234-62-333-4444",
    address: "789 Ungwan Rimi, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-333444555"
  },
  {
    id: "owner-024",
    name: "Hajiya Khadija Abdullahi",
    email: "hajiya.khadija.abdullahi@email.com",
    phone: "+234-62-444-5555",
    address: "321 Malali, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-444555666"
  },
  {
    id: "owner-025",
    name: "Alhaji Aminu Bello",
    email: "alhaji.aminu.bello@email.com",
    phone: "+234-62-555-6666",
    address: "654 Tudun Wada, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-555666777"
  },
  {
    id: "owner-026",
    name: "Hajiya Fatima Mohammed",
    email: "hajiya.fatima.mohammed@email.com",
    phone: "+234-62-666-7777",
    address: "987 Rigasa, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-666777888"
  },
  {
    id: "owner-027",
    name: "Alhaji Ibrahim Hassan",
    email: "alhaji.ibrahim.hassan@email.com",
    phone: "+234-62-777-8888",
    address: "147 Sabon Tasha, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-777888999"
  },
  {
    id: "owner-028",
    name: "Hajiya Aisha Yusuf",
    email: "hajiya.aisha.yusuf@email.com",
    phone: "+234-62-888-9999",
    address: "258 Kawo, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-888999000"
  },
  {
    id: "owner-029",
    name: "Alhaji Sani Musa",
    email: "alhaji.sani.musa@email.com",
    phone: "+234-62-999-0000",
    address: "369 Nasarawa, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-999000111"
  },
  {
    id: "owner-030",
    name: "Hajiya Zainab Garba",
    email: "hajiya.zainab.garba@email.com",
    phone: "+234-62-000-1111",
    address: "741 Barnawa, Kaduna, Kaduna State, Nigeria",
    nationality: "Nigerian",
    idNumber: "NG-000111222"
  }
];

// Mock Tracking Events
export const generateTrackingEvents = (vehicleId: string): TrackingEvent[] => {
  const events: TrackingEvent[] = [
    {
      id: `${vehicleId}-event-001`,
      timestamp: new Date("2024-01-10T08:00:00Z"),
      location: "Lagos Port Complex, Nigeria",
      status: VehicleStatus.ORDERED,
      notes: "Vehicle ordered and production confirmed"
    },
    {
      id: `${vehicleId}-event-002`,
      timestamp: new Date("2024-01-12T14:30:00Z"),
      location: "Lagos Port Complex, Nigeria",
      status: VehicleStatus.IN_TRANSIT,
      notes: "Vehicle loaded onto vessel MV Nigeria Star"
    },
    {
      id: `${vehicleId}-event-003`,
      timestamp: new Date("2024-01-15T09:15:00Z"),
      location: "Lagos Port Complex, Nigeria",
      status: VehicleStatus.AT_PORT,
      notes: "Vessel arrived at Lagos Port"
    },
    {
      id: `${vehicleId}-event-004`,
      timestamp: new Date("2024-01-16T11:00:00Z"),
      location: "Kano Customs Office, Nigeria",
      status: VehicleStatus.CLEARING_CUSTOMS,
      notes: "Customs clearance in progress"
    },
    {
      id: `${vehicleId}-event-005`,
      timestamp: new Date("2024-01-17T16:45:00Z"),
      location: "Kano Central Warehouse, Nigeria",
      status: VehicleStatus.IN_LOCAL_DELIVERY,
      notes: "Vehicle cleared customs, en route to Kano warehouse"
    }
  ];
  
  return events;
};

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: "veh-001",
    vin: "1HGBH41JXMN109186",
    make: "Honda",
    model: "Civic",
    year: 2024,
    color: "Crystal Black Pearl",
    trim: "Sport Touring",
    engineType: "1.5L Turbo",
    fuelType: "Gasoline",
    weightKg: 1350,
    dimensions: {
      lengthMm: 4630,
      widthMm: 1800,
      heightMm: 1415
    },
    orderDate: new Date("2024-01-05T10:00:00Z"),
    status: VehicleStatus.IN_LOCAL_DELIVERY,
    currentLocation: mockLocations[2],
    estimatedDelivery: new Date("2024-01-20T14:00:00Z"),
    shippingDetails: {
      id: "ship-001",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Kano Central Warehouse, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Nigeria Star",
      containerNumber: "NGL1234567",
      bookingNumber: "BKG-2024-001",
      departureDate: new Date("2024-01-12T16:00:00Z"),
      expectedArrivalDate: new Date("2024-01-15T08:00:00Z"),
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    customsDetails: {
      customsStatus: "Cleared",
      customsClearanceDate: "2024-01-16T14:30:00Z",
      importDuty: 2500,
      customsNotes: "All documentation verified, duty paid",
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    owner: mockOwners[0],
    trackingHistory: generateTrackingEvents("veh-001"),
    notes: ["Premium package included", "Customer requested ceramic coating", "Delivery to Kano address"],
    images: [
      {
        id: "img-001-1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Honda Civic Sport Touring - Front View",
        caption: "Front view showing the sleek design",
        isPrimary: true
      },
      {
        id: "img-001-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Honda Civic Sport Touring - Side View",
        caption: "Side profile with sporty lines"
      },
      {
        id: "img-001-3",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Honda Civic Sport Touring - Interior",
        caption: "Premium interior with modern features"
      }
    ]
  },
  {
    id: "veh-002",
    vin: "5YJSA1E47HF000001",
    make: "Tesla",
    model: "Model S",
    year: 2024,
    color: "Deep Blue Metallic",
    trim: "Plaid",
    engineType: "Triple Motor",
    fuelType: "Electric",
    weightKg: 2241,
    dimensions: {
      lengthMm: 4979,
      widthMm: 1964,
      heightMm: 1445
    },
    orderDate: new Date("2024-01-03T14:30:00Z"),
    status: VehicleStatus.CLEARING_CUSTOMS,
    currentLocation: mockLocations[1],
    estimatedDelivery: new Date("2024-01-22T16:00:00Z"),
    shippingDetails: {
      id: "ship-002",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Kano Customs Office, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Kano Express",
      containerNumber: "NGL9876543",
      bookingNumber: "BKG-2024-002",
      departureDate: new Date("2024-01-10T12:00:00Z"),
      expectedArrivalDate: new Date("2024-01-15T10:00:00Z"),
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    customsDetails: {
      customsStatus: "In Progress",
      customsClearanceDate: undefined,
      importDuty: 3200,
      customsNotes: "Additional inspection required for electric vehicle",
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    owner: mockOwners[1],
    trackingHistory: generateTrackingEvents("veh-002"),
    notes: ["Autopilot enabled", "Premium interior package", "21-inch wheels"],
    images: [
      {
        id: "img-002-1",
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model S Plaid - Front View",
        caption: "Sleek front design with signature Tesla styling",
        isPrimary: true
      },
      {
        id: "img-002-2",
        url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model S Plaid - Side View",
        caption: "Elegant side profile with aerodynamic design"
      },
      {
        id: "img-002-3",
        url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model S Plaid - Interior",
        caption: "Minimalist interior with large touchscreen"
      }
    ]
  },
  {
    id: "veh-003",
    vin: "WBA8E9G50LNT12345",
    make: "BMW",
    model: "X5",
    year: 2024,
    color: "Alpine White",
    trim: "xDrive40i",
    engineType: "3.0L TwinPower Turbo",
    fuelType: "Gasoline",
    weightKg: 2180,
    dimensions: {
      lengthMm: 4922,
      widthMm: 2004,
      heightMm: 1745
    },
    orderDate: new Date("2024-01-01T09:15:00Z"),
    status: VehicleStatus.AT_PORT,
    currentLocation: mockLocations[0],
    estimatedDelivery: new Date("2024-01-25T12:00:00Z"),
    shippingDetails: {
      id: "ship-003",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Kano Premium Motors, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Kano Premium",
      containerNumber: "NGL5678901",
      bookingNumber: "BKG-2024-003",
      departureDate: new Date("2024-01-08T08:00:00Z"),
      expectedArrivalDate: new Date("2024-01-15T06:00:00Z"),
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    customsDetails: {
      customsStatus: "Pending",
      customsClearanceDate: undefined,
      importDuty: 2800,
      customsNotes: "Standard clearance process",
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    owner: mockOwners[2],
    trackingHistory: generateTrackingEvents("veh-003"),
    notes: ["M Sport package", "Premium audio system", "Panoramic sunroof"],
    images: [
      {
        id: "img-003-1",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 BMW X5 xDrive40i - Front View",
        caption: "Front view showing BMW's signature kidney grille",
        isPrimary: true
      },
      {
        id: "img-003-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 BMW X5 xDrive40i - Side View",
        caption: "Side profile with M Sport styling"
      },
      {
        id: "img-003-3",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 BMW X5 xDrive40i - Interior",
        caption: "Luxurious interior with premium materials"
      }
    ]
  },
  {
    id: "veh-004",
    vin: "1FADP3K2XKL123456",
    make: "Ford",
    model: "Mustang",
    year: 2024,
    color: "Race Red",
    trim: "GT Premium",
    engineType: "5.0L V8",
    fuelType: "Gasoline",
    weightKg: 1750,
    dimensions: {
      lengthMm: 4789,
      widthMm: 1916,
      heightMm: 1382
    },
    orderDate: new Date("2024-01-07T16:45:00Z"),
    status: VehicleStatus.IN_TRANSIT,
    currentLocation: mockLocations[0],
    estimatedDelivery: new Date("2024-01-28T10:00:00Z"),
    shippingDetails: {
      id: "ship-004",
      originPort: "Yokohama Port, Japan",
      destinationPort: "Los Angeles Port, USA",
      shippingCompany: "NYK Line",
      vesselName: "MV NYK Vega",
      containerNumber: "NYKL2345678",
      bookingNumber: "BKG-2024-004",
      departureDate: new Date("2024-01-14T10:00:00Z"),
      expectedArrivalDate: new Date("2024-01-21T08:00:00Z"),
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    customsDetails: {
      customsStatus: "Pending",
      customsClearanceDate: undefined,
      importDuty: 2100,
      customsNotes: "Standard import process",
      documents: [{
        id: "doc-001",
        name: "Bill of Lading",
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    owner: mockOwners[3],
    trackingHistory: generateTrackingEvents("veh-004"),
    notes: ["Performance package", "Recaro seats", "Magnetic ride control"],
    images: [
      {
        id: "img-004-1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford Mustang GT Premium - Front View",
        caption: "Aggressive front design with signature Mustang styling",
        isPrimary: true
      },
      {
        id: "img-004-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford Mustang GT Premium - Side View",
        caption: "Muscular side profile with performance stance"
      },
      {
        id: "img-004-3",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford Mustang GT Premium - Interior",
        caption: "Sporty interior with Recaro seats"
      }
    ]
  },
  {
    id: "veh-005",
    vin: "JN1BZ4BH8MM123456",
    make: "Nissan",
    model: "GT-R",
    year: 2024,
    color: "Super Silver",
    trim: "Premium",
    engineType: "3.8L Twin-Turbo V6",
    fuelType: "Gasoline",
    weightKg: 1740,
    dimensions: {
      lengthMm: 4710,
      widthMm: 1895,
      heightMm: 1370
    },
    orderDate: new Date("2024-01-02T11:20:00Z"),
    status: VehicleStatus.DELIVERED,
    currentLocation: mockLocations[4],
    estimatedDelivery: new Date("2024-01-18T15:00:00Z"),
    shippingDetails: {
      id: "ship-005",
      originPort: "Yokohama Port, Japan",
      destinationPort: "Los Angeles Port, USA",
      shippingCompany: "Mitsui O.S.K. Lines",
      vesselName: "MV Pacific Star",
      containerNumber: "MSCU3456789",
      bookingNumber: "BKG-2024-005",
      departureDate: new Date("2024-01-09T14:00:00Z"),
      expectedArrivalDate: new Date("2024-01-12T08:00:00Z"),
      documents:  [{
        id: "doc-001",
        name: "Bill of Lading", 
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    customsDetails: {
      customsStatus: "Cleared",
      customsClearanceDate: "2024-01-13T16:45:00Z",
      importDuty: 2900,
      customsNotes: "All documentation verified, duty paid",
      documents:  [{
        id: "doc-001",
        name: "Bill of Lading", 
        url: "https://example.com/bill-of-lading.pdf"
      }]
    },
    owner: mockOwners[4],
    trackingHistory: generateTrackingEvents("veh-005"),
    notes: ["Track edition package", "Carbon fiber components", "Brembo brakes", "Successfully delivered to customer"]
  },
  // Additional vehicles for more data
  {
    id: "veh-006",
    vin: "1FTFW1ET5DFC12345",
    make: "Ford",
    model: "F-150",
    year: 2024,
    color: "Oxford White",
    trim: "Lariat",
    engineType: "3.5L EcoBoost V6",
    fuelType: "Gasoline",
    weightKg: 2200,
    dimensions: { lengthMm: 5910, widthMm: 2029, heightMm: 1992 },
    orderDate: new Date("2024-01-08T12:00:00Z"),
    status: VehicleStatus.IN_TRANSIT,
    currentLocation: mockLocations[0],
    estimatedDelivery: new Date("2024-01-30T14:00:00Z"),
    shippingDetails: {
      id: "ship-006",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Kano Central Warehouse, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Kano Express",
      containerNumber: "NGL2345678",
      bookingNumber: "BKG-2024-006",
      departureDate: new Date("2024-01-15T10:00:00Z"),
      expectedArrivalDate: new Date("2024-01-18T08:00:00Z"),
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    customsDetails: {
      customsStatus: "Pending",
      customsClearanceDate: undefined,
      importDuty: 1800,
      customsNotes: "Standard clearance process",
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    owner: mockOwners[5],
    trackingHistory: generateTrackingEvents("veh-006"),
    notes: ["4WD package", "Towing package", "Premium audio"],
    images: [
      {
        id: "img-006-1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford F-150 Lariat - Front View",
        caption: "Tough front design with Ford's signature grille",
        isPrimary: true
      },
      {
        id: "img-006-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford F-150 Lariat - Side View",
        caption: "Robust side profile with 4WD capabilities"
      },
      {
        id: "img-006-3",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford F-150 Lariat - Interior",
        caption: "Spacious interior with premium features"
      }
    ]
  },
  {
    id: "veh-007",
    vin: "1HGBH41JXMN109187",
    make: "Honda",
    model: "Accord",
    year: 2024,
    color: "Platinum White Pearl",
    trim: "Sport",
    engineType: "1.5L Turbo",
    fuelType: "Gasoline",
    weightKg: 1450,
    dimensions: { lengthMm: 4906, widthMm: 1862, heightMm: 1449 },
    orderDate: new Date("2024-01-09T14:30:00Z"),
    status: VehicleStatus.AT_PORT,
    currentLocation: mockLocations[0],
    estimatedDelivery: new Date("2024-02-02T16:00:00Z"),
    shippingDetails: {
      id: "ship-007",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Abuja Central Warehouse, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Abuja Star",
      containerNumber: "NGL3456789",
      bookingNumber: "BKG-2024-007",
      departureDate: new Date("2024-01-16T12:00:00Z"),
      expectedArrivalDate: new Date("2024-01-19T10:00:00Z"),
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    customsDetails: {
      customsStatus: "Pending",
      customsClearanceDate: undefined,
      importDuty: 2200,
      customsNotes: "Standard clearance process",
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    owner: mockOwners[10],
    trackingHistory: generateTrackingEvents("veh-007"),
    notes: ["Sport package", "Honda Sensing", "Wireless charging"],
    images: [
      {
        id: "img-007-1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Honda Accord Sport - Front View",
        caption: "Sleek front design with Honda's modern styling",
        isPrimary: true
      },
      {
        id: "img-007-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Honda Accord Sport - Side View",
        caption: "Elegant side profile with sport package"
      },
      {
        id: "img-007-3",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Honda Accord Sport - Interior",
        caption: "Modern interior with Honda Sensing technology"
      }
    ]
  },
  {
    id: "veh-008",
    vin: "5YJSA1E47HF000002",
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    color: "Pearl White Multi-Coat",
    trim: "Long Range",
    engineType: "Dual Motor",
    fuelType: "Electric",
    weightKg: 1847,
    dimensions: { lengthMm: 4694, widthMm: 1850, heightMm: 1443 },
    orderDate: new Date("2024-01-10T16:45:00Z"),
    status: VehicleStatus.CLEARING_CUSTOMS,
    currentLocation: mockLocations[15],
    estimatedDelivery: new Date("2024-02-05T12:00:00Z"),
    shippingDetails: {
      id: "ship-008",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Kaduna Customs Office, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Kaduna Express",
      containerNumber: "NGL4567890",
      bookingNumber: "BKG-2024-008",
      departureDate: new Date("2024-01-17T14:00:00Z"),
      expectedArrivalDate: new Date("2024-01-20T12:00:00Z"),
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    customsDetails: {
      customsStatus: "In Progress",
      customsClearanceDate: undefined,
      importDuty: 2800,
      customsNotes: "Additional inspection required for electric vehicle",
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    owner: mockOwners[20],
    trackingHistory: generateTrackingEvents("veh-008"),
    notes: ["Autopilot enabled", "Premium interior", "19-inch wheels"],
    images: [
      {
        id: "img-008-1",
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model 3 Long Range - Front View",
        caption: "Clean front design with Tesla's signature look",
        isPrimary: true
      },
      {
        id: "img-008-2",
        url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model 3 Long Range - Side View",
        caption: "Sleek side profile with aerodynamic efficiency"
      },
      {
        id: "img-008-3",
        url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model 3 Long Range - Interior",
        caption: "Modern interior with premium materials"
      },
      {
        id: "img-008-4",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Tesla Model 3 Long Range - Dashboard",
        caption: "Minimalist dashboard with large touchscreen"
      }
    ]
  },
  {
    id: "veh-009",
    vin: "WBA8E9G50LNT12346",
    make: "BMW",
    model: "X3",
    year: 2024,
    color: "Jet Black",
    trim: "xDrive30i",
    engineType: "2.0L TwinPower Turbo",
    fuelType: "Gasoline",
    weightKg: 1850,
    dimensions: { lengthMm: 4708, widthMm: 1891, heightMm: 1676 },
    orderDate: new Date("2024-01-11T11:20:00Z"),
    status: VehicleStatus.IN_LOCAL_DELIVERY,
    currentLocation: mockLocations[6],
    estimatedDelivery: new Date("2024-01-25T15:00:00Z"),
    shippingDetails: {
      id: "ship-009",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Kano Central Warehouse, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Kano Premium",
      containerNumber: "NGL5678901",
      bookingNumber: "BKG-2024-009",
      departureDate: new Date("2024-01-18T08:00:00Z"),
      expectedArrivalDate: new Date("2024-01-21T06:00:00Z"),
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    customsDetails: {
      customsStatus: "Cleared",
      customsClearanceDate: "2024-01-22T14:30:00Z",
      importDuty: 2600,
      customsNotes: "All documentation verified, duty paid",
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    owner: mockOwners[6],
    trackingHistory: generateTrackingEvents("veh-009"),
    notes: ["M Sport package", "Premium audio system", "Panoramic sunroof"],
    images: [
      {
        id: "img-009-1",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 BMW X3 xDrive30i - Front View",
        caption: "Compact SUV with BMW's signature design",
        isPrimary: true
      },
      {
        id: "img-009-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 BMW X3 xDrive30i - Side View",
        caption: "Sporty side profile with M Sport package"
      },
      {
        id: "img-009-3",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 BMW X3 xDrive30i - Interior",
        caption: "Premium interior with panoramic sunroof"
      }
    ]
  },
  {
    id: "veh-010",
    vin: "1FADP3K2XKL123457",
    make: "Ford",
    model: "Explorer",
    year: 2024,
    color: "Agate Black Metallic",
    trim: "ST",
    engineType: "3.0L EcoBoost V6",
    fuelType: "Gasoline",
    weightKg: 2100,
    dimensions: { lengthMm: 5006, widthMm: 2004, heightMm: 1778 },
    orderDate: new Date("2024-01-12T13:15:00Z"),
    status: VehicleStatus.DELIVERED,
    currentLocation: mockLocations[13],
    estimatedDelivery: new Date("2024-01-20T10:00:00Z"),
    shippingDetails: {
      id: "ship-010",
      originPort: "Lagos Port Complex, Nigeria",
      destinationPort: "Abuja Delivery Center, Nigeria",
      shippingCompany: "Nigerian Shipping Lines",
      vesselName: "MV Abuja Express",
      containerNumber: "NGL6789012",
      bookingNumber: "BKG-2024-010",
      departureDate: new Date("2024-01-19T10:00:00Z"),
      expectedArrivalDate: new Date("2024-01-22T08:00:00Z"),
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    customsDetails: {
      customsStatus: "Cleared",
      customsClearanceDate: "2024-01-23T16:45:00Z",
      importDuty: 2400,
      customsNotes: "All documentation verified, duty paid",
      documents: [{ id: "doc-001", name: "Bill of Lading", url: "https://example.com/bill-of-lading.pdf" }]
    },
    owner: mockOwners[11],
    trackingHistory: generateTrackingEvents("veh-010"),
    notes: ["ST Performance package", "B&O audio system", "21-inch wheels", "Successfully delivered to customer"],
    images: [
      {
        id: "img-010-1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford Explorer ST - Front View",
        caption: "Powerful front design with ST Performance styling",
        isPrimary: true
      },
      {
        id: "img-010-2",
        url: "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford Explorer ST - Side View",
        caption: "Commanding side profile with 21-inch wheels"
      },
      {
        id: "img-010-3",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
        alt: "2024 Ford Explorer ST - Interior",
        caption: "Spacious interior with B&O audio system"
      }
    ]
  }
];

// Export all mock data
export const mockData = {
  users: mockUsers,
  locations: mockLocations,
  owners: mockOwners,
  vehicles: mockVehicles
};

// Helper function to get vehicle by ID
export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find(vehicle => vehicle.id === id);
};

// Helper function to get vehicles by status
export const getVehiclesByStatus = (status: VehicleStatus): Vehicle[] => {
  return mockVehicles.filter(vehicle => vehicle.status === status);
};

// Helper function to get vehicles by owner
export const getVehiclesByOwner = (ownerId: string): Vehicle[] => {
  return mockVehicles.filter(vehicle => vehicle.owner.id === ownerId);
};

// Helper function to get vehicles at location
export const getVehiclesAtLocation = (locationId: string): Vehicle[] => {
  return mockVehicles.filter(vehicle => vehicle.currentLocation.id === locationId);
};
