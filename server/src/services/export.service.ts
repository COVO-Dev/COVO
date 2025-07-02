// services/export.service.ts
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Transaction } from '../models/transaction.model';
import { Writable } from 'stream';

export class ExportService {
    async generateCSV(transactions: any[]): Promise<string> {
        const parser = new Parser();
        return parser.parse(transactions);
    }

    async generatePDF(transactions: any[], stream: Writable): Promise<void> {
        const doc = new PDFDocument();
        doc.pipe(stream);

        doc.fontSize(16).text('Transaction List', { underline: true });
        doc.moveDown();

        transactions.forEach((tx, idx) => {
            doc.fontSize(12).text(`${idx + 1}. Campaign: ${tx.campaignId?.title || 'N/A'}`);
            doc.text(`   Amount: ₦${tx.totalAmount}`);
            doc.text(`   Status: ${tx.paymentStatus}`);
            doc.text(`   Date: ${new Date(tx.createdAt).toLocaleDateString()}`);
            doc.moveDown();
        });

        doc.end();
    }
}

export const exportService = new ExportService();
