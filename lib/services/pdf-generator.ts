import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DeliveryNote } from '@/types';

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

export class DeliveryNotePDFGenerator {
  private doc: jsPDF;
  private options: PDFGeneratorOptions;

  constructor(options: PDFGeneratorOptions = {}) {
    this.doc = new jsPDF();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate a professional delivery note PDF
   */
  generate(deliveryNote: DeliveryNote): void {
    const { vehicles, owner, deliveryDate, generatedAt, notes } = deliveryNote;

    // Add header
    this.addHeader();

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

    // Add footer
    this.addFooter();

    // Generate filename
    const filename = `Delivery_Note_${owner.name.replace(/\s+/g, '_')}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;

    // Download the PDF
    this.doc.save(filename);
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

  private addTitle(): void {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('VEHICLE DELIVERY NOTE', 105, 46, { align: 'center' });
  }

  private addDeliveryInfo(deliveryDate: Date, generatedAt: Date): void {
    const yPos = 56;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Delivery Date
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Delivery Date:', 14, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(deliveryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), 50, yPos);

    // Generated Date
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Generated:', 120, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), 145, yPos);
  }

  private addOwnerDetails(owner: any): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Owner Information', 14, 68);

    // Owner details table
    autoTable(this.doc, {
      startY: 72,
      head: [],
      body: [
        ['Name', owner.name],
        ['Email', owner.email],
        ['Phone', owner.phone],
        ['Address', owner.address],
        ['Country', owner.country],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  private addVehiclesTable(vehicles: any[]): void {
    // Get Y position after owner table
    const finalY = (this.doc as any).lastAutoTable?.finalY || 130;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
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
        fillColor: [71, 85, 105],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 20 },
        6: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
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
    this.doc.text('Additional Notes', 14, yPos);

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const splitNotes = this.doc.splitTextToSize(notes, 182);
    this.doc.text(splitNotes, 14, yPos + 6);
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Signature section
      const finalY = (this.doc as any).lastAutoTable?.finalY || 200;
      const signatureY = Math.max(finalY + 20, 250);

      if (signatureY < 280) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        // Authorized signature
        this.doc.text('_________________________', 14, signatureY);
        this.doc.text('Authorized Signature', 14, signatureY + 5);
        this.doc.text('Date: ______________', 14, signatureY + 10);

        // Received by
        this.doc.text('_________________________', 120, signatureY);
        this.doc.text('Received By (Owner)', 120, signatureY + 5);
        this.doc.text('Date: ______________', 120, signatureY + 10);
      }

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
}

/**
 * Generate and download a delivery note PDF
 */
export function generateDeliveryNotePDF(
  deliveryNote: DeliveryNote,
  options?: PDFGeneratorOptions
): void {
  const generator = new DeliveryNotePDFGenerator(options);
  generator.generate(deliveryNote);
}

