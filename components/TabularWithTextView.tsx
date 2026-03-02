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

  const [pages, setPages] = useState<Section[][]>([]);

  // Pagination Constants
  const PAGE_HEIGHT = 900; // px (approx safe printable height for A4)
  const CHARS_PER_LINE = 100;
  const LINE_HEIGHT = 20;
  const TITLE_HEIGHT = 100;
  const TABLE_HEADER_HEIGHT = 50;
  const TABLE_ROW_BASE_HEIGHT = 35;
  const SEAL_HEIGHT = 100;

  React.useEffect(() => {
    const calculatePages = () => {
        const newPages: Section[][] = [];
        let currentSections: Section[] = [];
        let currentHeight = 0;

        // Initial padding
        currentHeight += 40;

        // Title on first page
        currentHeight += TITLE_HEIGHT;

        data.sections.forEach(section => {
            if (section.type === 'text') {
                const lines = Math.ceil(section.content.length / CHARS_PER_LINE);
                const height = Math.max(lines * LINE_HEIGHT + 20, 40); // Min height
                
                if (currentHeight + height > PAGE_HEIGHT) {
                    newPages.push(currentSections);
                    currentSections = [];
                    currentHeight = 40; // Reset height for new page
                }
                currentSections.push(section);
                currentHeight += height;
            } else if (section.type === 'table') {
                // Header cost
                if (currentHeight + TABLE_HEADER_HEIGHT + TABLE_ROW_BASE_HEIGHT > PAGE_HEIGHT) {
                    newPages.push(currentSections);
                    currentSections = [];
                    currentHeight = 40;
                }

                let currentTableRows: string[][] = [];
                let tableHeaderAdded = false;
                
                // If starting new table or continuing, we need header space
                if (!tableHeaderAdded) {
                    currentHeight += TABLE_HEADER_HEIGHT;
                    tableHeaderAdded = true;
                }

                section.rows.forEach((row) => {
                    // Estimate row height based on content
                    const maxCellLength = Math.max(...row.map(c => c.length || 0));
                    const lines = Math.ceil(maxCellLength / 25); // approx chars per col
                    const thisRowHeight = Math.max(TABLE_ROW_BASE_HEIGHT, lines * 16 + 16);

                    if (currentHeight + thisRowHeight > PAGE_HEIGHT) {
                        // Push current table part
                        currentSections.push({ 
                            type: 'table', 
                            headers: section.headers, 
                            rows: currentTableRows 
                        });
                        newPages.push(currentSections);
                        
                        // Start new page
                        currentSections = [];
                        currentTableRows = [];
                        currentHeight = 40 + TABLE_HEADER_HEIGHT; // New page padding + header
                    }
                    
                    currentTableRows.push(row);
                    currentHeight += thisRowHeight;
                });

                // Push remaining rows
                if (currentTableRows.length > 0) {
                    currentSections.push({ 
                        type: 'table', 
                        headers: section.headers, 
                        rows: currentTableRows 
                    });
                }
            }
        });

        // Check space for seal on last page
        if (data.sealText) {
            if (currentHeight + SEAL_HEIGHT > PAGE_HEIGHT) {
                newPages.push(currentSections);
                currentSections = [];
            }
        }

        if (currentSections.length > 0) {
            newPages.push(currentSections);
        }

        setPages(newPages);
    };

    calculatePages();
  }, [data]);

  const handlePrintPdf = async () => {
    const pageElements = document.querySelectorAll('[data-pdf-page]');
    if (!pageElements.length) return;

    try {
      setIsGeneratingPdf(true);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
              const element = clonedDoc.querySelector(`[data-page-id="${i}"]`) as HTMLElement;
              if (element) {
                  element.classList.remove('shadow-xl', 'mx-auto', 'my-8');
                  element.style.width = '210mm';
                  element.style.height = '297mm'; // Force A4 height
                  element.style.margin = '0';
                  element.style.padding = '20mm';
                  element.style.overflow = 'visible'; // Ensure content is visible
                  
                  // Fix text width
                  const textElements = element.querySelectorAll('p, h1');
                  textElements.forEach((el) => {
                      (el as HTMLElement).style.width = '170mm';
                  });

                  // Handle tables
                  const tableWrappers = element.querySelectorAll('.table-wrapper');
                  tableWrappers.forEach((el) => {
                      (el as HTMLElement).style.overflow = 'visible';
                      (el as HTMLElement).style.width = 'auto';
                      // Ensure table expands
                      const table = el.querySelector('table');
                      if (table) table.style.width = '100%';
                  });
              }
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfImgHeight);
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

      {/* Document Pages */}
      <div className="flex flex-col gap-8 print:gap-0">
        {pages.map((pageSections, pageIndex) => (
          <div 
            key={pageIndex}
            data-pdf-page="true"
            data-page-id={pageIndex}
            className="max-w-[210mm] mx-auto bg-[#ffffff] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] print:shadow-none min-h-[297mm] w-[210mm] p-[20mm] relative font-sans text-[#111827] flex flex-col"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          >
            
            {/* Title only on first page */}
            {pageIndex === 0 && (
                <h1 className="text-center text-3xl font-bold mb-8 text-[#111827]">
                    {data.title}
                </h1>
            )}

            {/* Content Sections */}
            <div className="space-y-6">
                {pageSections.map((section, index) => {
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
            
            {/* Seal - Written Format (Only on last page) */}
            {pageIndex === pages.length - 1 && data.sealText && (
              <div className="mt-auto pt-8 text-right text-sm text-[#dc2626] italic">
                  {data.sealText}
              </div>
            )}

            {/* Footer / Page Number */}
            <div className="mt-auto pt-4 flex justify-end text-[10px] text-[#6b7280] border-t border-[#e5e7eb]">
               <div>Página {pageIndex + 1} de {pages.length}</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
