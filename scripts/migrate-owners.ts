#!/usr/bin/env tsx

/**
 * Migration script for Owner API implementation
 * This script helps migrate from mock data to real database
 */

import { PrismaClient } from '@prisma/client';
import { mockOwners } from '../src/mockdata';

const prisma = new PrismaClient();

async function migrateOwners() {
  console.log('🚀 Starting Owner migration...');
  
  try {
    // Check if owners already exist
    const existingOwnersCount = await prisma.owner.count();
    
    if (existingOwnersCount > 0) {
      console.log(`⚠️  Found ${existingOwnersCount} existing owners in database.`);
      console.log('   Skipping migration to avoid duplicates.');
      console.log('   If you want to reset the database, run: npx prisma migrate reset');
      return;
    }
    
    console.log('📝 Migrating mock owners to database...');
    
    // Create owners in batches to avoid overwhelming the database
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < mockOwners.length; i += batchSize) {
      batches.push(mockOwners.slice(i, i + batchSize));
    }
    
    let totalCreated = 0;
    
    for (const batch of batches) {
      const createdOwners = await prisma.owner.createMany({
        data: batch.map(owner => ({
          id: owner.id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          address: owner.address,
          nationality: owner.nationality,
          idNumber: owner.idNumber,
          // createdAt and updatedAt will be automatically set by the database
        })),
        skipDuplicates: true,
      });
      
      totalCreated += createdOwners.count;
      console.log(`✅ Created ${createdOwners.count} owners (Total: ${totalCreated})`);
    }
    
    console.log(`🎉 Migration completed! Created ${totalCreated} owners.`);
    
    // Verify the migration
    const finalCount = await prisma.owner.count();
    console.log(`📊 Total owners in database: ${finalCount}`);
    
    // Show some statistics
    const nationalityStats = await prisma.owner.groupBy({
      by: ['nationality'],
      _count: {
        nationality: true,
      },
      orderBy: {
        _count: {
          nationality: 'desc',
        },
      },
    });
    
    console.log('\n📈 Nationality distribution:');
    nationalityStats.forEach(stat => {
      console.log(`   ${stat.nationality}: ${stat._count.nationality} owners`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await migrateOwners();
    process.exit(0);
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  main();
}

export { migrateOwners };
