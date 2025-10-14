# Database Setup Guide

This guide will help you set up PostgreSQL with Prisma for the Vini Fleet application.

## Prerequisites

1. **PostgreSQL Database**: Make sure you have PostgreSQL installed and running
2. **Node.js**: Version 18 or higher
3. **npm**: Latest version

## Installation

### 1. Install Dependencies

```bash
npm install prisma @prisma/client bcryptjs
npm install -D tsx @types/bcryptjs
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vini_fleet?schema=public"

# NextAuth.js (optional)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Database connection pool settings
DATABASE_CONNECTION_LIMIT=10
```

Replace the `DATABASE_URL` with your actual PostgreSQL connection string:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `localhost`: Your database host
- `5432`: Your PostgreSQL port (default is 5432)
- `vini_fleet`: Your database name

### 3. Database Initialization

Run the initialization script to set up your database:

```bash
npm run db:init
```

This will:
- Install dependencies
- Generate Prisma client
- Create and run migrations
- Seed the database with sample data

### 4. Alternative Setup Steps

If you prefer to run the steps manually:

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npx prisma migrate dev --name init

# Seed the database
npm run db:seed
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run db:init` | Complete database setup (recommended for first time) |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database and run all migrations |

## Database Schema

The database includes the following main entities:

### Users
- **Admin**: Full access to all features
- **CEO**: Full access to all features
- **Normal**: Limited access to assigned location only

### Locations
- **Port**: Shipping ports
- **Warehouse**: Storage facilities
- **Customs Office**: Customs processing locations
- **Dealership**: Vehicle dealerships
- **Delivery Point**: Final delivery locations

### Vehicles
- Complete vehicle information with tracking history
- Shipping and customs details
- Owner information
- Document management

## API Endpoints

### Admin Location Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/admin/locations` | Get all locations with filtering | Admin/CEO |
| POST | `/api/admin/locations` | Create new location | Admin/CEO |
| GET | `/api/admin/locations/[id]` | Get location by ID | Admin/CEO (Normal users can access their location) |
| PUT | `/api/admin/locations/[id]` | Update location | Admin/CEO |
| DELETE | `/api/admin/locations/[id]` | Delete location | Admin/CEO |
| GET | `/api/admin/locations/stats` | Get location statistics | Admin/CEO |

### Query Parameters

#### GET /api/admin/locations
- `search`: Search in name, city, country, contact name/email
- `type`: Filter by location type
- `status`: Filter by location status
- `city`: Filter by city
- `country`: Filter by country
- `sortBy`: Sort field (name, type, status, city, lastUpdated)
- `sortOrder`: Sort direction (asc, desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## Sample Data

The seed script creates:

- **5 Locations**: Port, Warehouse, Customs Office, Dealership, Delivery Point
- **2 Admin Users**: Admin and CEO roles
- **2 Normal Users**: Regular users assigned to specific locations

### Sample Login Credentials
- **Admin**: admin@vinifleet.com / admin123
- **CEO**: ceo@vinifleet.com / ceo123
- **User**: john.doe@vinifleet.com / user123
- **User**: jane.smith@vinifleet.com / user123

## Troubleshooting

### Common Issues

1. **Connection Error**: Verify your DATABASE_URL is correct
2. **Migration Failed**: Check if the database exists and is accessible
3. **Permission Denied**: Ensure your PostgreSQL user has necessary privileges

### Reset Database

If you need to start fresh:

```bash
npm run db:reset
```

This will drop all tables and recreate them with sample data.

## Development

### Viewing Data

Use Prisma Studio to view and edit your data:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555`

### Schema Changes

When you modify the Prisma schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe-your-change`
3. The migration will be created and applied automatically

## Production Deployment

For production deployment:

1. Set up your production PostgreSQL database
2. Update the `DATABASE_URL` environment variable
3. Run `npx prisma migrate deploy` to apply migrations
4. Optionally seed with production data

## Security Notes

- Never commit your `.env` file
- Use strong passwords for database users
- Restrict database access to your application servers only
- Regularly backup your database
