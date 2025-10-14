#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🗄️ Creating database migration...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    console.log('🌱 Seeding database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Database initialization completed successfully!');
    console.log('📊 You can view your database in Prisma Studio by running: npx prisma studio');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
