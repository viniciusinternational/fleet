import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportService } from './report';
import type { ReportFilters } from './report';
import { generateQRCodeDataURL, getBaseUrl } from '@/lib/utils/qr-code';
import { generateReportToken } from '@/lib/utils/report-token';

export interface PDFGeneratorOptions {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  logoUrl?: string;
  baseUrl?: string;
}

const DEFAULT_OPTIONS: PDFGeneratorOptions = {
  companyName: 'Vinicius International',
  companyAddress: '13B Shettima Mongonu Crescent, Utako, Abuja, Nigeria',
  companyPhone: '',
  companyEmail: 'info@viniciusint.com',
  logoUrl: '/logo/vinicius-logo.png',
  baseUrl: typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:3000',
};

export type ReportType = 'inventory' | 'status-summary' | 'location-based';

export class VehicleReportPDFGenerator {
  private doc: jsPDF;
  private options: PDFGeneratorOptions;
  private logoImage: string | null = null;
  private watermarkImage: string | null = null;

  constructor(options: PDFGeneratorOptions = {}) {
    this.doc = new jsPDF();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Load logo image as base64 data URL
   */
  private async loadLogoImage(): Promise<void> {
    if (this.logoImage) return;

    try {
      const logoUrl = this.options.logoUrl || '/logo/vinicius-logo.png';
      const baseUrl = this.options.baseUrl || getBaseUrl();
      const fullUrl = logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`;

      const response = await fetch(fullUrl);
      if (!response.ok) {
        console.warn('Could not load logo image, using text fallback');
        return;
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        // Server-side: convert buffer to base64
        if (typeof window === 'undefined' || typeof FileReader === 'undefined') {
          blob.arrayBuffer().then(buffer => {
            const base64 = Buffer.from(buffer).toString('base64');
            this.logoImage = `data:${blob.type || 'image/png'};base64,${base64}`;
            resolve();
          }).catch(reject);
        } else {
          // Client-side: use FileReader
          const reader = new FileReader();
          reader.onloadend = () => {
            this.logoImage = reader.result as string;
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }
      });
    } catch (error) {
      console.warn('Error loading logo:', error);
    }
  }

  /**
   * Create watermark image from logo
   */
  private async loadWatermarkImage(): Promise<void> {
    if (this.watermarkImage || !this.logoImage) return;

    // Skip watermark creation on server-side (no DOM APIs)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      const img = new Image();
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }

            const scale = 3;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            this.watermarkImage = canvas.toDataURL();
            resolve();
          } catch (error) {
            console.warn('Error creating watermark:', error);
            resolve(); // Continue without watermark
          }
        };
        img.onerror = () => {
          console.warn('Error loading image for watermark');
          resolve(); // Continue without watermark
        };
        img.src = this.logoImage;
      });
    } catch (error) {
      console.warn('Error creating watermark:', error);
    }
  }

  /**
   * Generate PDF based on report type
   */
  async generate(
    reportType: ReportType,
    filters: ReportFilters = {}
  ): Promise<ArrayBuffer> {
    // Load logo and watermark images
    await this.loadLogoImage();
    await this.loadWatermarkImage();

    let result: ArrayBuffer;
    switch (reportType) {
      case 'inventory':
        result = await this.generateInventoryReport(filters);
        break;
      case 'status-summary':
        result = await this.generateStatusSummaryReport(filters);
        break;
      case 'location-based':
        result = await this.generateLocationBasedReport(filters);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    // Add QR code and watermark after content is generated
    await this.addQRCode(reportType, filters);
    this.addFooter(); // Footer includes watermark

    return this.doc.output('arraybuffer') as ArrayBuffer;
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
    await this.addHeader();

    // Add title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 38, 38);
    this.doc.text('VEHICLE INVENTORY REPORT', 105, 52, { align: 'center' });
    
    // Add underline
    this.doc.setDrawColor(220, 38, 38);
    this.doc.setLineWidth(0.5);
    this.doc.line(60, 54, 150, 54);

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
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 35 },
        8: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
      styles: { 
        overflow: 'linebreak', 
        cellWidth: 'wrap',
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
      },
    });

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
    await this.addHeader();

    // Add title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 38, 38);
    this.doc.text('VEHICLE STATUS SUMMARY REPORT', 105, 52, { align: 'center' });
    
    // Add underline
    this.doc.setDrawColor(220, 38, 38);
    this.doc.setLineWidth(0.5);
    this.doc.line(50, 54, 160, 54);

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
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      styles: {
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
      },
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
      this.doc.setTextColor(29, 41, 55);
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
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [31, 41, 55],
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        margin: { left: 14, right: 14 },
        styles: { 
          overflow: 'linebreak', 
          cellWidth: 'wrap',
          lineColor: [229, 231, 235],
          lineWidth: 0.3,
        },
      });

      currentY = (this.doc as any).lastAutoTable?.finalY || currentY + 50;
    }

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
    await this.addHeader();

    // Add title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 38, 38);
    this.doc.text('VEHICLE LOCATION-BASED REPORT', 105, 52, { align: 'center' });
    
    // Add underline
    this.doc.setDrawColor(220, 38, 38);
    this.doc.setLineWidth(0.5);
    this.doc.line(45, 54, 165, 54);

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
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      styles: {
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
      },
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
      this.doc.setTextColor(29, 41, 55);
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
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [31, 41, 55],
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        margin: { left: 14, right: 14 },
        styles: { 
          overflow: 'linebreak', 
          cellWidth: 'wrap',
          lineColor: [229, 231, 235],
          lineWidth: 0.3,
        },
      });

      currentY = (this.doc as any).lastAutoTable?.finalY || currentY + 50;
    }

    return this.doc.output('arraybuffer') as ArrayBuffer;
  }

  private async addHeader(): Promise<void> {
    const { companyName, companyAddress, companyEmail } = this.options;

    const logoWidth = 45;
    const logoHeight = 18;
    const logoX = 14;
    const logoY = 10;

    if (this.logoImage) {
      try {
        this.doc.addImage(this.logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Error adding logo image:', error);
      }
    }

    const textX = this.logoImage ? logoX + logoWidth + 8 : 14;
    const textY = logoY + 6;

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55);
    this.doc.text(companyName || 'Vinicius International', textX, textY);

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text(companyAddress || '', textX, textY + 5);
    this.doc.text(`Email: ${companyEmail}`, textX, textY + 9);

    this.doc.setDrawColor(220, 38, 38);
    this.doc.setLineWidth(0.8);
    this.doc.line(14, logoY + logoHeight + 4, 196, logoY + logoHeight + 4);
  }

  private addSummaryInfo(
    totalCount: number,
    filteredCount: number,
    generatedAt: Date
  ): void {
    const yPos = 60;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55);
    this.doc.text('Total Vehicles:', 14, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text(totalCount.toString(), 60, yPos);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55);
    this.doc.text('Filtered Count:', 100, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text(filteredCount.toString(), 155, yPos);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55);
    this.doc.text('Generated:', 14, yPos + 6);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
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

  private async addQRCode(
    reportType: ReportType,
    filters: ReportFilters
  ): Promise<void> {
    try {
      // Generate token for report
      const token = generateReportToken({
        reportType,
        filters,
        timestamp: Date.now(),
      });

      const baseUrl = this.options.baseUrl || getBaseUrl();
      const viewUrl = `${baseUrl}/view/report?token=${token}`;

      const qrDataURL = await generateQRCodeDataURL(viewUrl, {
        size: 150,
        margin: 2,
        errorCorrectionLevel: 'M',
      });

      // Position QR code on first page
      this.doc.setPage(1);
      const qrSize = 35;
      const qrX = 196 - qrSize - 14;
      const qrY = 280 - qrSize;

      this.doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      const textWidth = this.doc.getTextWidth('Scan for online view');
      this.doc.text(
        'Scan for online view',
        qrX + (qrSize - textWidth) / 2,
        qrY + qrSize + 4
      );
    } catch (error) {
      console.warn('Error adding QR code:', error);
    }
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Add watermark
      if (this.watermarkImage) {
        try {
          const pageWidth = this.doc.internal.pageSize.getWidth();
          const pageHeight = this.doc.internal.pageSize.getHeight();
          const watermarkWidth = 120;
          const watermarkHeight = 60;
          const watermarkX = (pageWidth - watermarkWidth) / 2;
          const watermarkY = (pageHeight - watermarkHeight) / 2;

          this.doc.addImage(
            this.watermarkImage,
            'PNG',
            watermarkX,
            watermarkY,
            watermarkWidth,
            watermarkHeight,
            undefined,
            'FAST'
          );
        } catch (error) {
          console.warn('Error adding watermark:', error);
        }
      }

      // Page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );

      // Footer line
      this.doc.setDrawColor(229, 231, 235);
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
