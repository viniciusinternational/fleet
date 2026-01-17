import { LocationType, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('🧹 Clearing existing data...');

  // Delete all data in correct order to respect foreign key constraints
  await prisma.deliveryNote.deleteMany();
  console.log('  ✓ Cleared delivery notes');

  await prisma.vehicleDocument.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.trackingEvent.deleteMany();
  console.log('  ✓ Cleared vehicle related data');

  await prisma.vehicle.deleteMany();
  console.log('  ✓ Cleared vehicles');

  await prisma.shippingDetails.deleteMany();
  console.log('  ✓ Cleared shipping details');

  await prisma.auditLog.deleteMany();
  console.log('  ✓ Cleared audit logs');

  await prisma.user.deleteMany();
  console.log('  ✓ Cleared users');

  await prisma.owner.deleteMany();
  console.log('  ✓ Cleared owners');

  await prisma.source.deleteMany();
  console.log('  ✓ Cleared sources');

  await prisma.location.deleteMany();
  console.log('  ✓ Cleared locations');

  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleMake.deleteMany();
  await prisma.vehicleColor.deleteMany();
  await prisma.transmissionType.deleteMany();
  console.log('  ✓ Cleared settings data');

  console.log('✅ Database cleared successfully!\n');

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Vinicius International HQ',
        type: LocationType.WAREHOUSE,
        latitude: 33.7366,
        longitude: -118.2685,
        street: '425 S Palos Verdes St, Abuja, Nigeria',
        city: 'Abuja',
        state: 'Abuja',
        country: 'Nigeria',
        postalCode: '10001',
        contactName: 'Umar Jere',
        contactPhone: '+234-7055793353',
        contactEmail: 'umar.jere@viniciusint.com',
        status: 'OPERATIONAL',
        notes: 'Major container port facility',
      },
    }),
  ]);

  // console.log(`✅ Created ${locations.length} locations`);

  // // Create sources
  // const sources = await Promise.all([
  //   prisma.source.create({
  //     data: {
  //       name: 'John Smith',
  //       email: 'john.smith@example.com',
  //       phone: '+1-555-0123',
  //       address: '123 Maple Ave, New York, NY',
  //       country: 'United States',
  //     },
  //   }),
  //   prisma.source.create({
  //     data: {
  //       name: 'Maria Garcia',
  //       email: 'maria.garcia@example.com',
  //       phone: '+34-912-345-678',
  //       address: 'Calle Mayor 1, Madrid, Spain',
  //       country: 'Spain',
  //     },
  //   }),
  //   prisma.source.create({
  //     data: {
  //       name: 'Yuki Tanaka',
  //       email: 'yuki.tanaka@example.com',
  //       phone: '+81-3-1234-5678',
  //       address: '1-2-3 Shibuya, Tokyo, Japan',
  //       country: 'Japan',
  //     },
  //   }),
  // ]);

  // console.log(`✅ Created ${sources.length} sources`);

  // Seed Vehicle Makes
  const makesData = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi',
    'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Jeep', 'Dodge', 'Ram',
    'GMC', 'Cadillac', 'Lexus', 'Acura', 'Infiniti', 'Lincoln', 'Buick', 'Chrysler',
    'Volvo', 'Porsche', 'Tesla', 'Land Rover', 'Jaguar', 'Mini', 'Mitsubishi', 'Genesis',
    'Alfa Romeo', 'Fiat', 'Maserati', 'Bentley', 'Rolls-Royce', 'Ferrari', 'Lamborghini',
    'McLaren', 'Aston Martin', 'Suzuki', 'Isuzu', 'Other'
  ];

  const makes = await Promise.all(
    makesData.map(name => 
      prisma.vehicleMake.create({
        data: { name, isActive: true }
      })
    )
  );
  console.log(`✅ Created ${makes.length} vehicle makes`);

  // Seed Vehicle Models
  const modelsData: Record<string, string[]> = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna', 'Tacoma', 'Tundra', '4Runner', 'Sequoia', 'Land Cruiser', 'Avalon', 'Venza', 'C-HR', 'Yaris', 'GR86', 'Supra'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline', 'Passport', 'HR-V', 'Fit', 'Insight', 'Clarity'],
    'Ford': ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Bronco Sport', 'Mach-E', 'Transit', 'EcoSport'],
    'Chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Suburban', 'Traverse', 'Malibu', 'Impala', 'Camaro', 'Corvette', 'Trax', 'Blazer', 'Colorado', 'Bolt'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Murano', 'Maxima', 'Leaf', 'Kicks', 'Versa'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'X2', 'X4', 'X6', 'Z4', 'i4', 'iX', 'M3', 'M5'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'GLA', 'GLB', 'G-Class', 'AMG GT', 'EQC', 'EQS'],
    'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'R8'],
    'Volkswagen': ['Jetta', 'Passat', 'Atlas', 'Tiguan', 'Arteon', 'Golf', 'ID.4', 'Taos', 'Touareg'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Ioniq', 'Nexo'],
    'Kia': ['Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride', 'Rio', 'Stinger', 'Soul', 'EV6', 'Niro'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'CX-30', 'CX-50', 'MX-5 Miata'],
    'Subaru': ['Outback', 'Forester', 'Crosstrek', 'Ascent', 'Impreza', 'Legacy', 'WRX', 'BRZ'],
    'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer', 'Grand Wagoneer'],
    'Dodge': ['Challenger', 'Charger', 'Durango', 'Journey', 'Grand Caravan'],
    'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
    'GMC': ['Sierra', 'Yukon', 'Yukon XL', 'Acadia', 'Terrain', 'Canyon'],
    'Cadillac': ['Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5', 'CT6', 'Lyriq'],
    'Lexus': ['ES', 'IS', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'RC', 'LC'],
    'Acura': ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX'],
    'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80'],
    'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
    'Buick': ['Encore', 'Envision', 'Enclave'],
    'Chrysler': ['300', 'Pacifica', 'Voyager'],
    'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
    'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
    'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
    'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Discovery', 'Discovery Sport', 'Defender'],
    'Jaguar': ['XE', 'XF', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type'],
    'Mini': ['Cooper', 'Countryman', 'Clubman', 'Paceman'],
    'Mitsubishi': ['Outlander', 'Eclipse Cross', 'Mirage', 'Outlander Sport'],
    'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
    'Alfa Romeo': ['Giulia', 'Stelvio', '4C'],
    'Fiat': ['500', '500X', '500L', '124 Spider'],
    'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'MC20'],
    'Bentley': ['Continental', 'Bentayga', 'Flying Spur'],
    'Rolls-Royce': ['Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Phantom'],
    'Ferrari': ['488', 'F8', 'SF90', 'Roma', 'Portofino', 'GTC4Lusso'],
    'Lamborghini': ['Huracán', 'Aventador', 'Urus'],
    'McLaren': ['570S', '720S', 'GT', 'Artura'],
    'Aston Martin': ['DB11', 'Vantage', 'DBS', 'DBX'],
    'Suzuki': ['Swift', 'SX4', 'Grand Vitara', 'Kizashi'],
    'Isuzu': ['D-Max', 'MU-X'],
    'Other': ['Other']
  };

  const modelPromises = [];
  for (const [makeName, modelNames] of Object.entries(modelsData)) {
    const make = makes.find(m => m.name === makeName);
    if (make) {
      for (const modelName of modelNames) {
        modelPromises.push({
          name: modelName,
          makeId: make.id,
          isActive: true
        });
      }
    }
  }

  // Process models in batches to avoid connection pool exhaustion
  const BATCH_SIZE = 20;
  const createdModels = [];
  for (let i = 0; i < modelPromises.length; i += BATCH_SIZE) {
    const batch = modelPromises.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(data => prisma.vehicleModel.create({ data }))
    );
    createdModels.push(...batchResults);
    console.log(`  ✓ Created batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} models)`);
  }
  console.log(`✅ Created ${createdModels.length} vehicle models`);

  // Seed Vehicle Colors
  const colorsData = [
    { name: 'White', hexCode: '#FFFFFF' },
    { name: 'Black', hexCode: '#000000' },
    { name: 'Silver', hexCode: '#C0C0C0' },
    { name: 'Gray', hexCode: '#808080' },
    { name: 'Red', hexCode: '#FF0000' },
    { name: 'Blue', hexCode: '#0000FF' },
    { name: 'Green', hexCode: '#008000' },
    { name: 'Brown', hexCode: '#A52A2A' },
    { name: 'Beige', hexCode: '#F5F5DC' },
    { name: 'Gold', hexCode: '#FFD700' },
    { name: 'Orange', hexCode: '#FFA500' },
    { name: 'Yellow', hexCode: '#FFFF00' },
    { name: 'Purple', hexCode: '#800080' },
    { name: 'Pink', hexCode: '#FFC0CB' },
    { name: 'Maroon', hexCode: '#800000' },
    { name: 'Navy', hexCode: '#000080' },
    { name: 'Turquoise', hexCode: '#40E0D0' },
    { name: 'Tan', hexCode: '#D2B48C' },
    { name: 'Cream', hexCode: '#FFFDD0' },
    { name: 'Burgundy', hexCode: '#800020' }
  ];

  const colors = await Promise.all(
    colorsData.map(color => 
      prisma.vehicleColor.create({
        data: { name: color.name, hexCode: color.hexCode, isActive: true }
      })
    )
  );
  console.log(`✅ Created ${colors.length} vehicle colors`);

  // Seed Transmission Types
  const transmissionsData = [
    { name: 'Manual', enumValue: 'MANUAL' },
    { name: 'Automatic', enumValue: 'AUTOMATIC' },
    { name: 'CVT', enumValue: 'CVT' },
    { name: 'Dual-Clutch', enumValue: 'DUAL_CLUTCH' },
    { name: 'Semi-Automatic', enumValue: 'SEMI_AUTOMATIC' }
  ];

  const transmissions = await Promise.all(
    transmissionsData.map(trans => 
      prisma.transmissionType.create({
        data: { name: trans.name, enumValue: trans.enumValue, isActive: true }
      })
    )
  );
  console.log(`✅ Created ${transmissions.length} transmission types`);

  // Create admin users with all permissions
  const allPermissions = {
    // Dashboard
    view_dashboard: true,
    // Vehicles
    view_vehicles: true,
    add_vehicles: true,
    edit_vehicles: true,
    delete_vehicles: true,
    // Users
    view_users: true,
    add_users: true,
    edit_users: true,
    delete_users: true,
    // Owners
    view_owners: true,
    add_owners: true,
    edit_owners: true,
    delete_owners: true,
    // Sources
    view_sources: true,
    add_sources: true,
    edit_sources: true,
    delete_sources: true,
    // Locations
    view_locations: true,
    add_locations: true,
    edit_locations: true,
    delete_locations: true,
    // Delivery
    view_delivery: true,
    add_delivery: true,
    edit_delivery: true,
    // Tracking
    view_tracking: true,
    // Analytics
    view_analytics: true,
    // Reports
    view_reports: true,
    // Chatbot
    view_chatbot: true,
    // Audit Logs
    view_audit_logs: true,
    // Settings
    view_settings: true,
    add_settings: true,
    edit_settings: true,
    delete_settings: true,
  };

  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+234-7055793353',
        email: 'umar.jere@viniciusint.com',
        role: 'ADMIN',
        locationId: locations[0].id,
        password: await bcrypt.hash('admin123', 12),
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        permissions: allPermissions,
      },
    }),
  ]);

  console.log(`✅ Created ${adminUsers.length} admin users`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample login credentials:');
  console.log('Admin: umar.jere@viniciusint.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
