import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report';
import type { ReportFilters } from '@/lib/services/report';
import { z } from 'zod';

// Validation schema for report data request
const reportDataSchema = z.object({
  reportType: z.enum(['inventory', 'status-summary', 'location-based']),
  filters: z.object({
    status: z.string().optional(),
    locationId: z.string().optional(),
    fuelType: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reportDataSchema.parse(body);

    const { reportType, filters = {} } = validatedData;

    let data;
    switch (reportType) {
      case 'inventory':
        data = await ReportService.generateInventoryReport(filters);
        break;
      case 'status-summary':
        data = await ReportService.generateStatusSummaryReport(filters);
        break;
      case 'location-based':
        data = await ReportService.generateLocationBasedReport(filters);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error generating report data:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report data' },
      { status: 500 }
    );
  }
}