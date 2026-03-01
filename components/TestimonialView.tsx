import React, { useRef, useState } from 'react';
import { Printer, Upload, Loader2, FileCheck, Eye, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function TestimonialView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Testimonial Data State
  const [testimonialData, setTestimonialData] = useState({
    title: 'Certificado de Empleo',
    body: [
      'Por la presente se certifica que HOSSAINMUJAHIDUL, sexo Masculino, número de documento A13635969, ha estado trabajando en nuestra empresa desde el 15-05-2024 hasta la fecha, actualmente ocupa el puesto de Análisis de Datos - Gerente de Producto Senior en el departamento Departamento de Proyecto HOPEGOO.',
      'Se expide la presente constancia para los fines pertinentes.'
    ],
    sealText: 'Sello de Shanghai Chengmi Information Technology Co., Ltd.(sello)',
    signatureBlock: [
      { label: 'Nombre de la Empresa', value: 'Shanghai Chengmi Information Technology Co., Ltd.' },
      { label: 'Fecha', value: '15 de agosto de 2024' }
    ],
    footer: [
      { label: 'Dirección Detallada de la Empresa', value: 'Edificio Tongcheng Travel, No. 66 Honghui Road, Parque Industrial de Suzhou' },
      { label: 'Contacto de la Empresa', value: 'Centro de RR.HH. y Operaciones Organizacionales' },
      { label: 'Teléfono de la Empresa', value: '0512-80162199' }
    ]
  });

  const handlePrint = async () => {
    if (!certificateRef.current) return;

    console.log('Generating PDF with data:', testimonialData);

    try {
      setIsGeneratingPdf(true);
      
      // Scroll to top to ensure html2canvas captures correctly
      window.scrollTo(0, 0);
      
      // Delay to ensure any pending renders are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debugging
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
            const element = clonedDoc.getElementById('certificate-page');
            if (element) {
                // Remove shadow and centering for the PDF capture
                element.classList.remove('shadow-xl', 'mx-auto');
                // Force A4 width and ensure visibility
                element.style.width = '210mm';
                element.style.maxWidth = '210mm';
                element.style.height = 'auto';
                element.style.minHeight = '297mm';
                element.style.margin = '0';
                element.style.padding = '25mm'; // Ensure padding is preserved
                element.style.transform = 'none';
                element.style.overflow = 'visible';
            }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfImgHeight);
      pdf.save('testimonial-translated.pdf');
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
            // Title
            new Paragraph({
              text: testimonialData.title.replace(/\n/g, " "),
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Body
            ...(testimonialData.body || []).map(paragraph => 
              new Paragraph({
                children: [new TextRun({ text: paragraph, size: 24 })], // 12pt
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 720 }, // Indent
              })
            ),

            new Paragraph({ text: "", spacing: { after: 400 } }),

            // Seal (Text representation)
            ...(testimonialData.sealText ? [
              new Paragraph({
                children: [new TextRun({ text: testimonialData.sealText, italics: true, color: "DC2626" })],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
              })
            ] : []),

            // Signature Block
            ...(testimonialData.signatureBlock || []).map(item => 
              new Paragraph({
                children: [
                    new TextRun({ text: `${item.label}: `, bold: true }),
                    new TextRun({ text: item.value })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
              })
            ),

            new Paragraph({ text: "", spacing: { after: 400 } }),

            // Footer
            ...(testimonialData.footer || []).map(item => 
              new Paragraph({
                children: [
                    new TextRun({ text: `${item.label}: `, bold: true }),
                    new TextRun({ text: item.value })
                ],
                spacing: { after: 100 },
              })
            ),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "testimonial-translated.docx");
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
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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
        Analyze this document image (likely a certificate, testimonial, or letter). 
        Extract the content and translate it into Spanish, maintaining the original structure as much as possible.
        
        Required JSON Structure:
        {
          "title": "The main title of the document (e.g., 'Certificado de Empleo', 'Carta de Recomendación'). Translate to Spanish.",
          "body": [
            "Paragraph 1 translated to Spanish.",
            "Paragraph 2 translated to Spanish.",
            ...
          ],
          "sealText": "Translate the text on the circular seal to Spanish. It should follow the format 'Sello de [Company Name](sello)' or 'Sello Especial de [Department] de [Company Name](sello)'. If there is a numeric code inside the seal, place it at the very end of the string.",
          "signatureBlock": [
            { "label": "Label (e.g., Company Name, Date)", "value": "Value" },
            ...
          ],
          "footer": [
            { "label": "Label (e.g., Address, Phone)", "value": "Value" },
            ...
          ]
        }

        Instructions:
        1. Extract the main title.
        2. Extract the body text paragraph by paragraph. Translate smoothly to Spanish.
        3. Extract the signature area information (Company Name, Date, etc.) as key-value pairs.
        4. Extract the footer information (Address, Contact, etc.) as key-value pairs.
        5. If any section is missing in the original document, return an empty array or empty string for that field. Do NOT invent information.
        6. Ensure the output is valid JSON.
      `;

      // Reset to loading state
      setTestimonialData({
        title: 'Extrayendo...',
        body: ['Extrayendo contenido...'],
        sealText: '...',
        signatureBlock: [],
        footer: []
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
        const data = JSON.parse(text);
        setTestimonialData(data);
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
      console.log('File selected:', file.name);
      
      // Trigger extraction
      await extractData(file);
    }
  };

  return (
    <div className="p-8 bg-[#f3f4f6] min-h-screen print:bg-white print:p-0">
      {/* Controls - Hidden when printing */}
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
            onClick={handlePrint}
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

      {/* Certificate Page */}
      <div 
        id="certificate-page"
        ref={certificateRef}
        className="max-w-[210mm] mx-auto bg-[#ffffff] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] print:shadow-none min-h-[297mm] w-[210mm] p-[25mm] relative font-serif text-[#111827] flex flex-col"
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        
        {/* Header Logo - Removed */}
        <div className="mb-8">
            <div className="w-full h-[2px] bg-[#000000]"></div>
        </div>

        {/* Title */}
        {testimonialData.title && (
          <h1 className="text-center text-4xl font-bold mb-16 tracking-[0.15em] uppercase">
              {testimonialData.title.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                      {line}
                      {i < testimonialData.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
              ))}
          </h1>
        )}

        {/* Body Content */}
        <div className="text-xl leading-loose space-y-8 font-serif text-justify">
            {testimonialData.body && testimonialData.body.map((paragraph, index) => (
                <p key={index} className="indent-12">
                    {paragraph}
                </p>
            ))}
        </div>

        {/* Signature Section */}
        <div className="mt-auto mb-16 flex flex-col items-end relative pr-8">
            {/* Seal - Written Format */}
            {testimonialData.sealText && (
              <div className="mb-8 text-right text-sm text-[#dc2626] italic max-w-[300px]">
                  {testimonialData.sealText}
              </div>
            )}

            <div className="text-right z-10 space-y-3 font-serif text-lg">
                {testimonialData.signatureBlock && testimonialData.signatureBlock.map((item, index) => (
                    <div key={index}>
                        <span className="font-bold">{item.label}:</span> {item.value}
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        {testimonialData.footer && testimonialData.footer.length > 0 && (
          <div className="pt-12 border-t border-[#e5e7eb] text-sm space-y-3 text-[#4b5563] font-sans">
              {testimonialData.footer.map((item, index) => (
                  <div key={index} className="flex gap-4">
                      <span className="font-bold min-w-[260px]">{item.label}:</span>
                      <span>{item.value}</span>
                  </div>
              ))}
          </div>
        )}

      </div>
    </div>
  );
}
