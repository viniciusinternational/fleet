import { NextRequest, NextResponse } from 'next/server';
import { generateVehicleReportPDF } from '@/lib/services/pdf-report-generator';
import { z } from 'zod';
import { hasPermission } from '@/lib/permissions';

// Validation schema for report generation
const generateReportSchema = z.object({
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
    // TODO: Get user from authentication/session
    // For now, we'll allow access - in production, check for generate_reports permission
    // const user = await getCurrentUser(request);
    // if (!hasPermission(user, 'generate_reports')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const body = await request.json();
    const validatedData = generateReportSchema.parse(body);

    const { reportType, filters = {} } = validatedData;

    // Generate PDF
    const pdfBuffer = await generateVehicleReportPDF(reportType, filters);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Vehicle_Report_${reportType}_${timestamp}.pdf`;

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(pdfBuffer);

    // Return PDF with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    );
  }
}
