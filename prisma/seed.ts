import { PrismaClient } from '@prisma/client';
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

  await prisma.user.deleteMany();
  console.log('  ✓ Cleared users');

  await prisma.owner.deleteMany();
  console.log('  ✓ Cleared owners');

  await prisma.location.deleteMany();
  console.log('  ✓ Cleared locations');

  console.log('✅ Database cleared successfully!\n');

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Vinicius Int',
        type: 'PORT',
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

  console.log(`✅ Created ${locations.length} locations`);

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
