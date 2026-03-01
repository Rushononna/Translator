import React, { useRef, useState } from 'react';
import { Printer, Upload, Loader2, FileCheck, Eye, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel, TextRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface TextSection {
  type: 'text';
  content: string;
}

interface TableSection {
  type: 'table';
  headers: string[];
  rows: string[][];
}

type Section = TextSection | TableSection;

interface TabularWithTextData {
  title: string;
  sections: Section[];
  sealText?: string;
}

export function TabularWithTextView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const [data, setData] = useState<TabularWithTextData>({
    title: 'Document Title',
    sections: [
      { type: 'text', content: 'This is a sample text section. Upload a document to extract content.' },
      { 
        type: 'table', 
        headers: ['Column 1', 'Column 2', 'Column 3'], 
        rows: [
          ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
          ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
        ] 
      },
      { type: 'text', content: 'Another text section following the table.' }
    ],
    sealText: 'Sello de [Company Name](sello) 12345'
  });

  const handlePrintPdf = async () => {
    if (!contentRef.current) return;

    try {
      setIsGeneratingPdf(true);
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
            const element = clonedDoc.getElementById('document-page');
            if (element) {
                element.classList.remove('shadow-xl', 'mx-auto');
                
                // Fix text width to prevent reflow when we expand container
                // A4 (210mm) - Padding (20mm * 2) = 170mm
                const textElements = element.querySelectorAll('p, h1');
                textElements.forEach((el) => {
                    (el as HTMLElement).style.width = '170mm';
                });

                // Allow container to expand to fit wide tables
                element.style.width = 'fit-content';
                element.style.minWidth = '210mm';
                element.style.maxWidth = 'none'; // Override any max-width
                element.style.height = 'auto';
                element.style.minHeight = '297mm';
                element.style.margin = '0';
                element.style.padding = '20mm';
                element.style.transform = 'none';
                element.style.overflow = 'visible';

                // Make tables fully visible
                const tableWrappers = element.querySelectorAll('.table-wrapper');
                tableWrappers.forEach((el) => {
                    (el as HTMLElement).style.overflow = 'visible';
                    (el as HTMLElement).style.width = 'auto';
                });
            }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // If content is taller than A4, we might need multiple pages, but for simplicity 
      // in this "image snapshot" approach, we'll just scale or let it be one long image if needed.
      // Ideally, for multi-page content, we'd split it. For now, let's stick to single page logic or basic scaling.
      // If height > 297, add pages.
      
      let heightLeft = pdfImgHeight;
      let position = 0;
      const pageHeight = 297;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('tabular-text-document.pdf');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setIsGeneratingWord(true);

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: data.title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...data.sections.flatMap((section) => {
              if (section.type === 'text') {
                return [
                  new Paragraph({
                    children: [new TextRun({ text: section.content, size: 24 })], // 12pt font
                    spacing: { after: 200 },
                    alignment: AlignmentType.JUSTIFIED,
                  })
                ];
              } else if (section.type === 'table') {
                const tableRows = [
                  new TableRow({
                    children: section.headers.map(header => new TableCell({
                      children: [new Paragraph({ text: header, alignment: AlignmentType.CENTER, style: "strong" })],
                      width: { size: 100 / section.headers.length, type: WidthType.PERCENTAGE },
                      shading: { fill: "E0E0E0" }, // Light gray header
                    })),
                  }),
                  ...section.rows.map(row => new TableRow({
                    children: row.map(cell => new TableCell({
                      children: [new Paragraph(cell)],
                      width: { size: 100 / section.headers.length, type: WidthType.PERCENTAGE },
                    })),
                  }))
                ];

                return [
                  new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    }
                  }),
                  new Paragraph({ text: "", spacing: { after: 200 } }) // Spacer after table
                ];
              }
              return [];
            }),

            // Seal (Text representation)
            ...(data.sealText ? [
              new Paragraph({ text: "", spacing: { after: 400 } }),
              new Paragraph({
                children: [new TextRun({ text: data.sealText, italics: true, color: "DC2626" })],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
              })
            ] : []),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "tabular-text-document.docx");
    } catch (error: any) {
      console.error('Error generating Word doc:', error);
      alert(`Failed to generate Word document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const fileToGenerativePart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractData = async (file: File) => {
    try {
      setIsExtracting(true);
      const imagePart = await fileToGenerativePart(file);

      const prompt = `
        Analyze this document image. It may contain a mix of text paragraphs and tables.
        Extract the content and structure it into sections. Translate all content to Spanish.
        
        Required JSON Structure:
        {
          "title": "Document Title (Translate to Spanish)",
          "sections": [
            {
              "type": "text",
              "content": "Paragraph content translated to Spanish."
            },
            {
              "type": "table",
              "headers": ["Header 1", "Header 2", ...],
              "rows": [
                ["Row 1 Col 1", "Row 1 Col 2", ...],
                ["Row 2 Col 1", "Row 2 Col 2", ...]
              ]
            },
            ...
          ],
          "sealText": "Translate the text on the circular seal to Spanish. It should follow the format 'Sello de [Company Name](sello)' or 'Sello Especial de [Department] de [Company Name](sello)'. If there is a numeric code inside the seal, place it at the very end of the string."
        }

        Instructions:
        1. Identify the main title.
        2. Process the document from top to bottom.
        3. If you encounter a paragraph of text, create a "text" section.
        4. If you encounter a table, create a "table" section with headers and rows.
        5. Maintain the order of sections as they appear in the document.
        6. Translate all text content to Spanish.
        7. Extract any seal text found in the document and place it in the 'sealText' field.
        8. Ensure the output is valid JSON.
      `;

      // Reset to loading state
      setData({
        title: 'Extrayendo...',
        sections: [{ type: 'text', content: 'Procesando documento...' }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                imagePart,
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      console.log('Gemini Response:', text);

      try {
        const parsedData = JSON.parse(text);
        setData(parsedData);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        alert('Failed to parse extracted data. Please check the console.');
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      alert('Failed to extract data from the image. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await extractData(file);
    }
  };

  return (
    <div className="p-8 bg-[#f3f4f6] min-h-screen print:bg-white print:p-0">
      {/* Controls */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-end items-center gap-3 print:hidden">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
        />
        
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-[#16a34a] bg-[#f0fdf4] px-3 py-1.5 rounded-lg border border-[#bbf7d0] mr-auto">
            <FileCheck size={16} />
            <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
            <button 
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="ml-1 text-[#15803d] hover:text-[#14532d]"
            >
              ×
            </button>
          </div>
        )}

        {previewUrl && (
          <a 
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#ffffff] text-[#374151] border border-[#d1d5db] px-4 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors shadow-sm font-medium"
          >
            <Eye size={18} />
            View Original
          </a>
        )}

        <button 
          onClick={handleUploadClick}
          disabled={isExtracting}
          className="flex items-center gap-2 bg-[#ffffff] text-[#374151] border border-[#d1d5db] px-4 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors shadow-sm font-medium disabled:opacity-70"
        >
          {isExtracting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {selectedFile ? 'Change File' : 'Upload Document'}
        </button>
        
        <div className="flex gap-2">
            <button 
            onClick={handleDownloadWord}
            disabled={isGeneratingWord || isExtracting}
            className="flex items-center gap-2 bg-[#ffffff] text-[#2563eb] border border-[#2563eb] px-4 py-2 rounded-lg hover:bg-[#eff6ff] transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {isGeneratingWord ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <FileText size={18} />
            )}
            Word
            </button>
            <button 
            onClick={handlePrintPdf}
            disabled={isGeneratingPdf || isExtracting}
            className="flex items-center gap-2 bg-[#2563eb] text-[#ffffff] px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {isGeneratingPdf ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <Printer size={18} />
            )}
            PDF
            </button>
        </div>
      </div>

      {/* Document Page */}
      <div 
        id="document-page"
        ref={contentRef}
        className="max-w-[210mm] mx-auto bg-[#ffffff] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] print:shadow-none min-h-[297mm] w-[210mm] p-[20mm] relative font-sans text-[#111827] flex flex-col"
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        
        {/* Title */}
        <h1 className="text-center text-3xl font-bold mb-8 text-[#111827]">
            {data.title}
        </h1>

        {/* Content Sections */}
        <div className="space-y-6">
            {data.sections.map((section, index) => {
                if (section.type === 'text') {
                    return (
                        <p key={index} className="text-justify leading-relaxed text-[#1f2937] text-sm">
                            {section.content}
                        </p>
                    );
                } else if (section.type === 'table') {
                    return (
                        <div key={index} className="overflow-x-auto border border-[#d1d5db] rounded-sm mb-4 table-wrapper">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f9fafb]">
                                    <tr>
                                        {section.headers.map((header, hIndex) => (
                                            <th key={hIndex} className="px-3 py-2 text-left text-xs font-semibold text-[#111827] uppercase tracking-wider border-b border-[#d1d5db]">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#e5e7eb]">
                                    {section.rows.map((row, rIndex) => (
                                        <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}>
                                            {row.map((cell, cIndex) => (
                                                <td key={cIndex} className="px-3 py-2 text-xs text-[#374151] whitespace-pre-wrap border-r border-[#e5e7eb] last:border-r-0">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                return null;
            })}
        </div>
        
        {/* Seal - Written Format */}
        {data.sealText && (
          <div className="mt-8 text-right text-sm text-[#dc2626] italic">
              {data.sealText}
          </div>
        )}

      </div>
    </div>
  );
}
