# Delivery Module Documentation

## Overview
A comprehensive delivery note generation system that allows admin users to create professional PDF delivery notes for multiple vehicles and a single owner.

## Features Implemented

### 1. **Vehicle Selection**
- Searchable and filterable vehicle table
- Multi-select capability with checkboxes
- Real-time search by VIN, make, model, color, or owner name
- Status-based filtering (Ordered, In Transit, Clearing Customs, etc.)
- Visual feedback for selected vehicles

### 2. **Owner Selection**
- Searchable dropdown for owner selection
- Displays owner details including email, phone, address, and nationality
- Visual preview of selected owner information

### 3. **Selected Vehicles Management**
- Real-time list of selected vehicles
- Individual vehicle removal capability
- Count badge showing total selected vehicles
- Detailed vehicle information display

### 4. **PDF Generation**
- Professional PDF delivery notes with:
  - Company header with contact information
  - Delivery and generation dates
  - Owner information table
  - Detailed vehicle information table (VIN, make, model, year, color, status)
  - Signature fields for authorized personnel and owner
  - Page numbers and footer
- Automatic download of generated PDF
- Customizable company information

## File Structure

```
src/
├── app/
│   └── admin/
│       └── delivery/
│           ├── page.tsx                    # Main delivery page
│           └── loading.tsx                 # Loading state
├── components/
│   ├── delivery/
│   │   ├── owner-selector.tsx             # Owner search/selection
│   │   ├── selected-vehicles-list.tsx     # Display selected vehicles
│   │   └── vehicle-selection-table.tsx    # Vehicle search & selection table
│   └── ui/
│       └── command.tsx                     # Command/search component
├── lib/
│   ├── services/
│   │   └── pdf-generator.ts               # PDF generation utility
│   └── navigation.ts                       # Updated with delivery link
└── types.ts                                # Updated with delivery types
```

## Usage

### Accessing the Module
1. Log in as an **Admin** user
2. Navigate to **Delivery Notes** in the sidebar navigation
3. The page is located at `/admin/delivery`

### Creating a Delivery Note

#### Step 1: Select Vehicles
1. Use the search bar to filter vehicles by:
   - VIN number
   - Make/Model
   - Color
   - Owner name
2. Use the status filter to narrow results
3. Check the boxes next to vehicles you want to include
4. Selected vehicles appear in the left panel

#### Step 2: Review Selected Vehicles
1. View all selected vehicles in the "Selected Vehicles" card
2. Remove any vehicle by clicking the X button
3. Verify all required vehicles are included

#### Step 3: Select Owner and Delivery Date
1. Click the "Select owner..." dropdown
2. Search for and select the owner
3. Set the delivery date (defaults to today)

#### Step 4: Generate PDF
1. Ensure you have:
   - At least one vehicle selected
   - An owner selected
2. Click "Generate Delivery Note" button
3. PDF will automatically download to your device

### PDF Content
The generated PDF includes:
- **Header Section**
  - Company name, address, and contact information
  - Document title: "VEHICLE DELIVERY NOTE"
  
- **Delivery Information**
  - Delivery date
  - Generation date/timestamp
  
- **Owner Details Table**
  - Name
  - Email
  - Phone
  - Address
  - Nationality
  - ID Number
  
- **Vehicle Details Table**
  - Serial number (#)
  - VIN
  - Make
  - Model
  - Year
  - Color
  - Current status
  
- **Signature Section**
  - Authorized signature field with date
  - Received by (Owner) signature field with date
  
- **Footer**
  - Page numbers
  - Professional border line

## Technical Details

### Dependencies Added
- `jspdf` - Core PDF generation library
- `jspdf-autotable` - Table formatting for professional layouts

### API Endpoints Used
- `GET /api/vehicles?limit=1000` - Fetches all vehicles for selection
- `GET /api/owners?limit=1000` - Fetches all owners for selection

### Type Definitions
```typescript
interface DeliveryVehicle {
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

interface DeliveryNote {
  vehicles: DeliveryVehicle[];
  owner: Owner;
  deliveryDate: Date;
  generatedAt: Date;
  notes?: string;
}
```

### Customization

#### Company Information
To customize the company information in PDFs, edit `src/lib/services/pdf-generator.ts`:

```typescript
const DEFAULT_OPTIONS: PDFGeneratorOptions = {
  companyName: 'Your Company Name',
  companyAddress: 'Your Address',
  companyPhone: 'Your Phone',
  companyEmail: 'your@email.com',
};
```

## Future Enhancements (Optional)
- [ ] Save delivery notes to database for record-keeping
- [ ] Email delivery notes to owners
- [ ] Print delivery notes directly
- [ ] Add custom notes field to delivery notes
- [ ] Batch delivery note generation
- [ ] Export delivery history
- [ ] Add vehicle images to PDF
- [ ] Digital signature capability

## Notes
- Delivery notes are generated client-side (no server processing)
- No data is saved to the database (PDF only)
- Multiple vehicles can be delivered to a single owner per note
- The form resets after successful PDF generation
- Professional PDF formatting with consistent styling

## Support
For issues or questions, please contact the development team.

