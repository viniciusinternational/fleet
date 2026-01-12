import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportService } from './report';
import type { ReportFilters } from './report';

export interface PDFGeneratorOptions {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

const DEFAULT_OPTIONS: PDFGeneratorOptions = {
  companyName: 'Fleet Management System',
  companyAddress: '123 Business Ave, Lagos, Nigeria',
  companyPhone: '+234 123 456 7890',
  companyEmail: 'info@fleetmanagement.com',
};

export type ReportType = 'inventory' | 'status-summary' | 'location-based';

export class VehicleReportPDFGenerator {
  private doc: jsPDF;
  private options: PDFGeneratorOptions;

  constructor(options: PDFGeneratorOptions = {}) {
    this.doc = new jsPDF();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate PDF based on report type
   */
  async generate(
    reportType: ReportType,
    filters: ReportFilters = {}
  ): Promise<ArrayBuffer> {
    switch (reportType) {
      case 'inventory':
        return this.generateInventoryReport(filters);
      case 'status-summary':
        return this.generateStatusSummaryReport(filters);
      case 'location-based':
        return this.generateLocationBasedReport(filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Generate inventory list report PDF
   */
  private async generateInventoryReport(
    filters: ReportFilters
  ): Promise<ArrayBuffer> {
    const data = await ReportService.generateInventoryReport(filters);
    const { vehicles, totalCount, filteredCount } = data;

    // Add header
    this.addHeader();

    // Add title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('VEHICLE INVENTORY REPORT', 105, 50, { align: 'center' });

    // Add summary info
    this.addSummaryInfo(totalCount, filteredCount, new Date());

    // Add vehicles table
    const tableData = vehicles.map((vehicle) => [
      vehicle.vin,
      vehicle.make,
      vehicle.model,
      vehicle.year.toString(),
      vehicle.color,
      this.formatStatus(vehicle.status),
      vehicle.currentLocation?.name || 'N/A',
      vehicle.owner.name,
      this.formatFuelType(vehicle.fuelType),
    ]);

    autoTable(this.doc, {
      startY: 75,
      head: [['VIN', 'Make', 'Model', 'Year', 'Color', 'Status', 'Location', 'Owner', 'Fuel Type']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 35 }, // VIN
        1: { cellWidth: 25 }, // Make
        2: { cellWidth: 25 }, // Model
        3: { cellWidth: 15, halign: 'center' }, // Year
        4: { cellWidth: 20 }, // Color
        5: { cellWidth: 30 }, // Status
        6: { cellWidth: 30 }, // Location
        7: { cellWidth: 35 }, // Owner
        8: { cellWidth: 25 }, // Fuel Type
      },
      margin: { left: 14, right: 14 },
      styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    });

    // Add footer
    this.addFooter();

    return this.doc.output('arraybuffer') as Uint8Array;
  }

  /**
   * Generate status summary report PDF
   */
  private async generateStatusSummaryReport(
    filters: ReportFilters
  ): Promise<ArrayBuffer> {
    const data = await ReportService.generateStatusSummaryReport(filters);
    const { summary, vehiclesByStatus, totalCount } = data;

    // Add header
    this.addHeader();

    // Add title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('VEHICLE STATUS SUMMARY REPORT', 105, 50, { align: 'center' });

    // Add summary info
    this.addSummaryInfo(totalCount, totalCount, new Date());

    // Add status summary table
    const summaryData = summary.map((item) => [
      this.formatStatus(item.status),
      item.count.toString(),
      `${item.percentage}%`,
    ]);

    autoTable(this.doc, {
      startY: 75,
      head: [['Status', 'Count', 'Percentage']],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    // Add detailed breakdown by status
    let currentY = (this.doc as any).lastAutoTable?.finalY || 100;
    
    for (const statusGroup of summary) {
      const status = statusGroup.status;
      const vehicles = vehiclesByStatus[status] || [];

      if (vehicles.length === 0) continue;

      // Check if we need a new page
      if (currentY > 250) {
        this.doc.addPage();
        currentY = 20;
      }

      // Add status section header
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${this.formatStatus(status)} (${vehicles.length} vehicles)`, 14, currentY + 15);

      // Create table data for this status
      const tableData = vehicles.map((vehicle) => [
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.year.toString(),
        vehicle.color,
        vehicle.currentLocation?.name || 'N/A',
        vehicle.owner.name,
      ]);

      autoTable(this.doc, {
        startY: currentY + 20,
        head: [['VIN', 'Make', 'Model', 'Year', 'Color', 'Location', 'Owner']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [71, 85, 105],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8,
        },
        margin: { left: 14, right: 14 },
        styles: { overflow: 'linebreak', cellWidth: 'wrap' },
      });

      currentY = (this.doc as any).lastAutoTable?.finalY || currentY + 50;
    }

    // Add footer
    this.addFooter();

    return this.doc.output('arraybuffer') as ArrayBuffer;
  }

  /**
   * Generate location-based report PDF
   */
  private async generateLocationBasedReport(
    filters: ReportFilters
  ): Promise<ArrayBuffer> {
    const data = await ReportService.generateLocationBasedReport(filters);
    const { locationSummary, vehiclesByLocation, totalCount } = data;

    // Add header
    this.addHeader();

    // Add title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('VEHICLE LOCATION-BASED REPORT', 105, 50, { align: 'center' });

    // Add summary info
    this.addSummaryInfo(totalCount, totalCount, new Date());

    // Add location summary table
    const summaryData = locationSummary.map((item) => [
      item.locationName,
      item.locationType,
      item.count.toString(),
    ]);

    autoTable(this.doc, {
      startY: 75,
      head: [['Location', 'Type', 'Vehicle Count']],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    // Add detailed breakdown by location
    let currentY = (this.doc as any).lastAutoTable?.finalY || 100;

    for (const locationInfo of locationSummary) {
      const locationId = locationInfo.locationId;
      const vehicles = vehiclesByLocation[locationId] || [];

      if (vehicles.length === 0) continue;

      // Check if we need a new page
      if (currentY > 250) {
        this.doc.addPage();
        currentY = 20;
      }

      // Add location section header
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${locationInfo.locationName} (${vehicles.length} vehicles)`, 14, currentY + 15);

      // Create table data for this location
      const tableData = vehicles.map((vehicle) => [
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.year.toString(),
        vehicle.color,
        this.formatStatus(vehicle.status),
        vehicle.owner.name,
      ]);

      autoTable(this.doc, {
        startY: currentY + 20,
        head: [['VIN', 'Make', 'Model', 'Year', 'Color', 'Status', 'Owner']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [71, 85, 105],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8,
        },
        margin: { left: 14, right: 14 },
        styles: { overflow: 'linebreak', cellWidth: 'wrap' },
      });

      currentY = (this.doc as any).lastAutoTable?.finalY || currentY + 50;
    }

    // Add footer
    this.addFooter();

    return this.doc.output('arraybuffer') as ArrayBuffer;
  }

  private addHeader(): void {
    const { companyName, companyAddress, companyPhone, companyEmail } = this.options;

    // Company name
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyName || '', 14, 20);

    // Company details
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(companyAddress || '', 14, 27);
    this.doc.text(`Phone: ${companyPhone} | Email: ${companyEmail}`, 14, 32);

    // Horizontal line
    this.doc.setLineWidth(0.5);
    this.doc.line(14, 36, 196, 36);
  }

  private addSummaryInfo(
    totalCount: number,
    filteredCount: number,
    generatedAt: Date
  ): void {
    const yPos = 60;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Total Count
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Total Vehicles:', 14, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(totalCount.toString(), 60, yPos);

    // Filtered Count
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Filtered Count:', 100, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(filteredCount.toString(), 155, yPos);

    // Generated Date
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Generated:', 14, yPos + 6);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      generatedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      60,
      yPos + 6
    );
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );

      // Footer line
      this.doc.setLineWidth(0.3);
      this.doc.line(14, 287, 196, 287);
    }
  }

  private formatStatus(status: string): string {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatFuelType(fuelType: string): string {
    return fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase();
  }
}

/**
 * Generate and return a vehicle report PDF
 */
export async function generateVehicleReportPDF(
  reportType: ReportType,
  filters: ReportFilters = {},
  options?: PDFGeneratorOptions
): Promise<ArrayBuffer> {
  const generator = new VehicleReportPDFGenerator(options);
  return generator.generate(reportType, filters);
}
