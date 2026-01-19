import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DeliveryNote } from '@/types';
import { generateQRCodeDataURL, getBaseUrl } from '@/lib/utils/qr-code';

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

export class DeliveryNotePDFGenerator {
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

      // Fetch the image
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
      // Continue without logo
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
      // Create a canvas to make the logo transparent for watermark
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

            // Make watermark larger (3x original)
            const scale = 3;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.globalAlpha = 0.1; // 10% opacity
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
   * Generate a professional delivery note PDF
   */
  async generate(deliveryNote: DeliveryNote): Promise<void> {
    const { vehicles, owner, deliveryDate, generatedAt, notes } = deliveryNote;

    // Load logo and watermark images
    await this.loadLogoImage();
    await this.loadWatermarkImage();

    // Add watermark to all pages (will be applied in footer)
    const pageCount = this.doc.getNumberOfPages();
    
    // Add header
    await this.addHeader();

    // Add document title
    this.addTitle();

    // Add delivery information
    this.addDeliveryInfo(deliveryDate, generatedAt);

    // Add owner details
    this.addOwnerDetails(owner);

    // Add vehicles table
    this.addVehiclesTable(vehicles);

    // Add notes if provided
    if (notes) {
      this.addNotes(notes);
    }

    // Add QR code (only on first page)
    await this.addQRCode(deliveryNote);

    // Add footer (includes watermark)
    this.addFooter();

    // Generate filename
    const filename = `Delivery_Note_${owner.name.replace(/\s+/g, '_')}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;

    // Download the PDF
    this.doc.save(filename);
  }

  private async addHeader(): Promise<void> {
    const { companyName, companyAddress, companyEmail } = this.options;

    const logoWidth = 45; // mm
    const logoHeight = 18; // mm
    const logoX = 14;
    const logoY = 10;

    // Add logo if available
    if (this.logoImage) {
      try {
        this.doc.addImage(this.logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Error adding logo image:', error);
      }
    }

    // Company name (next to logo or standalone)
    const textX = this.logoImage ? logoX + logoWidth + 8 : 14;
    const textY = logoY + 6;
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55); // Dark gray #1F2937
    this.doc.text(companyName || 'Vinicius International', textX, textY);

    // Company details
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81); // #374151
    this.doc.text(companyAddress || '', textX, textY + 5);
    this.doc.text(`Email: ${companyEmail}`, textX, textY + 9);

    // Horizontal line with color
    this.doc.setDrawColor(220, 38, 38); // Red #DC2626
    this.doc.setLineWidth(0.8);
    this.doc.line(14, logoY + logoHeight + 4, 196, logoY + logoHeight + 4);
  }

  private addTitle(): void {
    const yPos = 50;
    
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 38, 38); // Red #DC2626
    this.doc.text('VEHICLE DELIVERY NOTE', 105, yPos, { align: 'center' });
    
    // Add underline
    this.doc.setDrawColor(220, 38, 38);
    this.doc.setLineWidth(0.5);
    this.doc.line(70, yPos + 2, 140, yPos + 2);
  }

  private addDeliveryInfo(deliveryDate: Date, generatedAt: Date): void {
    const yPos = 60;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81); // Medium gray

    // Delivery Date
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55); // Dark gray
    this.doc.text('Delivery Date:', 14, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text(new Date(deliveryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), 50, yPos);

    // Generated Date
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55);
    this.doc.text('Generated:', 120, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text(new Date(generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), 145, yPos);
  }

  private addOwnerDetails(owner: any): void {
    const startY = 72;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55); // Dark gray
    this.doc.text('Owner Information', 14, startY);

    // Owner details table
    autoTable(this.doc, {
      startY: startY + 4,
      head: [],
      body: [
        ['Name', owner.name],
        ['Email', owner.email],
        ['Phone', owner.phone || 'N/A'],
        ['Address', owner.address || 'N/A'],
        ['Country', owner.country || 'N/A'],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55], // Dark gray
      },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          cellWidth: 40,
          fillColor: [249, 250, 251], // Light gray background
        },
        1: { 
          cellWidth: 'auto',
        },
      },
      margin: { left: 14, right: 14 },
      styles: {
        lineColor: [229, 231, 235], // Light gray borders
        lineWidth: 0.3,
      },
    });
  }

  private addVehiclesTable(vehicles: any[]): void {
    // Get Y position after owner table
    const finalY = (this.doc as any).lastAutoTable?.finalY || 130;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55); // Dark gray
    this.doc.text('Vehicle Details', 14, finalY + 10);

    // Vehicles table
    const tableData = vehicles.map((vehicle, index) => [
      (index + 1).toString(),
      vehicle.vin,
      vehicle.make,
      vehicle.model,
      vehicle.year.toString(),
      vehicle.color,
      vehicle.status,
    ]);

    autoTable(this.doc, {
      startY: finalY + 14,
      head: [['#', 'VIN', 'Make', 'Model', 'Year', 'Color', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105], // Slate gray
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55], // Dark gray
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Light gray #F9FAFB
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 35, fontStyle: 'normal' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 20 },
        6: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
      styles: {
        lineColor: [229, 231, 235], // Light gray borders #E5E7EB
        lineWidth: 0.3,
      },
    });
  }

  private addNotes(notes: string): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 200;

    // Check if we need a new page
    if (finalY > 250) {
      this.doc.addPage();
      this.addNotesContent(notes, 20);
    } else {
      this.addNotesContent(notes, finalY + 10);
    }
  }

  private addNotesContent(notes: string, yPos: number): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(29, 41, 55); // Dark gray
    this.doc.text('Additional Notes', 14, yPos);

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81); // Medium gray
    const splitNotes = this.doc.splitTextToSize(notes, 182);
    this.doc.text(splitNotes, 14, yPos + 6);
  }

  private async addQRCode(deliveryNote: DeliveryNote): Promise<void> {
    if (!deliveryNote.id) return;

    try {
      const baseUrl = this.options.baseUrl || getBaseUrl();
      const viewUrl = `${baseUrl}/view/delivery/${deliveryNote.id}`;

      // Generate QR code
      const qrDataURL = await generateQRCodeDataURL(viewUrl, {
        size: 150,
        margin: 2,
        errorCorrectionLevel: 'M',
      });

      // Position QR code in bottom right of first page
      const qrSize = 35; // mm
      const qrX = 196 - qrSize - 14; // Right margin
      const qrY = 280 - qrSize; // Bottom area

      this.doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      // Add text below QR code
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128); // Gray
      const textWidth = this.doc.getTextWidth('Scan for online view');
      this.doc.text(
        'Scan for online view',
        qrX + (qrSize - textWidth) / 2,
        qrY + qrSize + 4
      );
    } catch (error) {
      console.warn('Error adding QR code:', error);
      // Continue without QR code
    }
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Add watermark if available
      if (this.watermarkImage) {
        try {
          // Center the watermark on the page
          const pageWidth = this.doc.internal.pageSize.getWidth();
          const pageHeight = this.doc.internal.pageSize.getHeight();
          const watermarkWidth = 120; // mm
          const watermarkHeight = 60; // mm
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
            'FAST' // Faster rendering
          );
        } catch (error) {
          console.warn('Error adding watermark:', error);
        }
      }

      // Signature section
      const finalY = (this.doc as any).lastAutoTable?.finalY || 200;
      const signatureY = Math.max(finalY + 20, 240);

      // Only add signature on last page or if there's space
      if (i === pageCount && signatureY < 275) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(31, 41, 55); // Dark gray

        // Authorized signature
        this.doc.text('_________________________', 14, signatureY);
        this.doc.text('Authorized Signature', 14, signatureY + 5);
        this.doc.text('Date: ______________', 14, signatureY + 10);

        // Received by (only if enough space)
        if (signatureY < 260) {
          this.doc.text('_________________________', 120, signatureY);
          this.doc.text('Received By (Owner)', 120, signatureY + 5);
          this.doc.text('Date: ______________', 120, signatureY + 10);
        }
      }

      // Page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(107, 114, 128); // Gray
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );

      // Footer line
      this.doc.setDrawColor(229, 231, 235); // Light gray
      this.doc.setLineWidth(0.3);
      this.doc.line(14, 287, 196, 287);
    }
  }
}

/**
 * Generate and download a delivery note PDF
 */
export async function generateDeliveryNotePDF(
  deliveryNote: DeliveryNote,
  options?: PDFGeneratorOptions
): Promise<void> {
  const generator = new DeliveryNotePDFGenerator(options);
  await generator.generate(deliveryNote);
}

