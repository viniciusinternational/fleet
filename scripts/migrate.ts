#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migrations
    console.log('🗄️ Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
