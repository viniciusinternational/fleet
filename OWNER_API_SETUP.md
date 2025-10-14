# Owner API Setup Guide

This guide explains how to set up and use the real Owner API with database integration.

## 🚀 Quick Start

### 1. Database Setup

First, make sure your database is set up and migrations are applied:

```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate dev --name add-shipping-details-and-owner-timestamps

# (Optional) Reset database if you want to start fresh
npx prisma migrate reset
```

### 2. Seed the Database

Run the migration script to populate the database with mock owner data:

```bash
# Using tsx (recommended)
npx tsx scripts/migrate-owners.ts

# Or using ts-node
npx ts-node scripts/migrate-owners.ts
```

### 3. Environment Variables

Make sure your `.env` file has the database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/vini_fleet"
NEXT_PUBLIC_API_URL="" # Leave empty for same-origin requests
```

## 📚 API Endpoints

### Owners

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owners` | List all owners with pagination, search, and filtering |
| POST | `/api/owners` | Create a new owner |
| GET | `/api/owners/[id]` | Get owner by ID |
| PUT | `/api/owners/[id]` | Update owner by ID |
| DELETE | `/api/owners/[id]` | Delete owner by ID |
| GET | `/api/owners/by-email?email=...` | Find owner by email |
| GET | `/api/owners/stats` | Get owner statistics |

### Query Parameters for GET /api/owners

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in name, email, phone, or ID number
- `nationality` - Filter by nationality
- `sortBy` - Sort field (name, email, phone, nationality)
- `sortOrder` - Sort direction (asc, desc)

### Example API Calls

```bash
# Get all owners with pagination
curl "http://localhost:3000/api/owners?page=1&limit=5"

# Search owners
curl "http://localhost:3000/api/owners?search=john&nationality=Nigerian"

# Get owner statistics
curl "http://localhost:3000/api/owners/stats"

# Create a new owner
curl -X POST "http://localhost:3000/api/owners" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+234-123-456-7890",
    "address": "123 Main St, Lagos, Nigeria",
    "nationality": "Nigerian",
    "idNumber": "NG-123456789"
  }'
```

## 🔧 Service Layer

The service layer (`/src/lib/services/owner.ts`) provides a clean interface for frontend components:

```typescript
import { getOwners, createOwner, getOwnerById } from '@/lib/services/owner';

// Get paginated owners
const { owners, total, totalPages } = await getOwners({
  search: 'john',
  nationality: 'Nigerian',
  page: 1,
  limit: 10
});

// Create a new owner
const newOwner = await createOwner({
  name: 'John Doe',
  email: 'john@example.com',
  // ... other fields
});

// Get owner by ID
const owner = await getOwnerById('owner-123');
```

## 📊 Database Schema

### Owner Model

```prisma
model Owner {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String
  address     String
  nationality String
  idNumber    String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  vehicles    Vehicle[]
  
  @@map("owners")
}
```

### ShippingDetails Model

```prisma
model ShippingDetails {
  id                  String   @id @default(cuid())
  originPort          String
  destinationPort     String
  shippingCompany     String
  vesselName          String?
  containerNumber     String?
  bookingNumber       String
  departureDate       DateTime?
  expectedArrivalDate DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  vehicle             Vehicle?
  
  @@map("shipping_details")
}
```

## 🛡️ Validation & Error Handling

The API includes comprehensive validation using Zod schemas:

- **Input Validation**: All inputs are validated before processing
- **Duplicate Prevention**: Email and ID number uniqueness checks
- **Error Responses**: Consistent error format with appropriate HTTP status codes
- **Type Safety**: Full TypeScript support throughout

## 🔄 Migration from Mock Data

The migration script (`scripts/migrate-owners.ts`) helps transition from mock data:

1. **Checks for existing data** to avoid duplicates
2. **Creates owners in batches** for better performance
3. **Provides statistics** after migration
4. **Handles errors gracefully**

## 🧪 Testing the API

You can test the API endpoints using:

1. **Browser**: Visit the endpoints directly
2. **curl**: Use the examples above
3. **Postman/Insomnia**: Import the endpoints
4. **Frontend**: The service layer handles all API calls

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correct
2. **Migration Errors**: Run `npx prisma migrate reset` to start fresh
3. **Duplicate Data**: The migration script skips duplicates automatically
4. **API Errors**: Check the browser console and server logs

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=prisma:*
```

## 📈 Performance Considerations

- **Pagination**: All list endpoints support pagination
- **Indexing**: Database indexes on frequently queried fields
- **Batch Operations**: Migration script uses batch processing
- **Error Handling**: Graceful error handling prevents crashes

## 🔮 Next Steps

1. **Update Frontend**: Modify existing pages to use the new API
2. **Add Authentication**: Implement user authentication for API access
3. **Add Logging**: Implement comprehensive logging
4. **Add Tests**: Create unit and integration tests
5. **Add Caching**: Implement Redis caching for better performance

## 📞 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify your database connection
3. Ensure all migrations are applied
4. Check the API endpoint responses in browser dev tools


