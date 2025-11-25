import { PrismaClient, Role, LocationType, LocationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Port of Los Angeles',
        type: LocationType.PORT,
        latitude: 33.7366,
        longitude: -118.2685,
        street: '425 S Palos Verdes St',
        city: 'San Pedro',
        state: 'CA',
        country: 'United States',
        postalCode: '90731',
        contactName: 'John Smith',
        contactPhone: '+1-310-732-3508',
        contactEmail: 'operations@portofla.org',
        status: LocationStatus.OPERATIONAL,
        notes: 'Major container port facility',
      },
    }),
    prisma.location.create({
      data: {
        name: 'Long Beach Distribution Center',
        type: LocationType.WAREHOUSE,
        latitude: 33.7701,
        longitude: -118.1937,
        street: '1800 W 8th St',
        city: 'Long Beach',
        state: 'CA',
        country: 'United States',
        postalCode: '90813',
        contactName: 'Maria Garcia',
        contactPhone: '+1-562-437-1234',
        contactEmail: 'warehouse@lbdist.com',
        status: LocationStatus.OPERATIONAL,
        notes: 'Primary vehicle storage facility',
      },
    }),
    prisma.location.create({
      data: {
        name: 'Los Angeles Customs Office',
        type: LocationType.CUSTOMS_OFFICE,
        latitude: 33.9425,
        longitude: -118.4081,
        street: '300 S Ferry St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        postalCode: '90731',
        contactName: 'David Johnson',
        contactPhone: '+1-310-732-3500',
        contactEmail: 'customs@cbp.gov',
        status: LocationStatus.OPERATIONAL,
        notes: 'Customs and Border Protection office',
      },
    }),
    prisma.location.create({
      data: {
        name: 'Honda of Downtown LA',
        type: LocationType.DEALERSHIP,
        latitude: 34.0522,
        longitude: -118.2437,
        street: '1234 Main St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        postalCode: '90015',
        contactName: 'Sarah Wilson',
        contactPhone: '+1-213-555-0123',
        contactEmail: 'sales@hondadowntown.com',
        status: LocationStatus.OPERATIONAL,
        notes: 'Honda dealership and service center',
      },
    }),
    prisma.location.create({
      data: {
        name: 'Beverly Hills Delivery Hub',
        type: LocationType.DELIVERY_POINT,
        latitude: 34.0736,
        longitude: -118.4004,
        street: '456 Rodeo Dr',
        city: 'Beverly Hills',
        state: 'CA',
        country: 'United States',
        postalCode: '90210',
        contactName: 'Michael Brown',
        contactPhone: '+1-310-555-0456',
        contactEmail: 'delivery@beverlyhills.com',
        status: LocationStatus.TEMPORARILY_CLOSED,
        notes: 'Premium delivery location - temporarily closed for renovation',
      },
    }),
  ]);

  console.log(`✅ Created ${locations.length} locations`);

  // Create admin users
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Admin',
        
        username: 'admin',
        lastName: 'User',
        phone: '+234-7055793353',
        email: 'umar.jere@viniciusint.com',
        role: Role.ADMIN,
        locationId: locations[0].id,
        password: await bcrypt.hash('admin123', 12),
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
    }),
  //   prisma.user.create({
  //     data: {
  //       firstName: 'CEO',
  //       lastName: 'User',
  //       phone: '+1-555-0002',
  //       email: 'ceo@vinifleet.com',
  //       role: Role.CEO,
  //       locationId: locations[1].id,
  //       password: await bcrypt.hash('ceo123', 12),
  //       isActive: true,
  //       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  //     },
  //   }),
  // ]);

  // console.log(`✅ Created ${adminUsers.length} admin users`);

  // // Create normal users
  // const normalUsers = await Promise.all([
  //   prisma.user.create({
  //     data: {
  //       firstName: 'John',
  //       lastName: 'Doe',
  //       phone: '+1-555-1001',
  //       email: 'john.doe@vinifleet.com',
  //       role: Role.NORMAL,
  //       locationId: locations[0].id,
  //       password: await bcrypt.hash('user123', 12),
  //       isActive: true,
  //       avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  //     },
  //   }),
  //   prisma.user.create({
  //     data: {
  //       firstName: 'Jane',
  //       lastName: 'Smith',
  //       phone: '+1-555-1002',
  //       email: 'jane.smith@vinifleet.com',
  //       role: Role.NORMAL,
  //       locationId: locations[1].id,
  //       password: await bcrypt.hash('user123', 12),
  //       isActive: true,
  //       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  //     },
  //   }),
  ]);

  // console.log(`✅ Created ${normalUsers.length} normal users`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample login credentials:');
  console.log('Admin: admin@vinifleet.com / admin123');
  console.log('CEO: ceo@vinifleet.com / ceo123');
  console.log('User: john.doe@vinifleet.com / user123');
  console.log('User: jane.smith@vinifleet.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
