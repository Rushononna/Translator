import React, { useRef, useState } from 'react';
import { Printer, Upload, Loader2, FileCheck, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function SimpleTextFormatView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Certificate Data State
  const [certificateData, setCertificateData] = useState({
    name: 'HOSSAINMUJAHIDUL',
    gender: 'Masculino',
    idNumber: 'A13635969',
    startDate: '15-05-2024',
    position: 'Análisis de Datos - Gerente de Producto Senior',
    department: 'Departamento de Proyecto HOPEGOO',
    companyName: 'Shanghai Chengmi Information Technology Co., Ltd.',
    issueDate: '15 de agosto de 2024',
    sealText: '上海程咪信息技术有限公司',
    salary: ''
  });

  const handlePrint = async () => {
    if (!certificateRef.current) return;

    console.log('Generating PDF with data:', certificateData);

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
      pdf.save('certificado-empleo.pdf');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPdf(false);
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
        Analyze this employment certificate/testimonial image. Extract the following information and translate the values to Spanish.
        
        Required JSON Structure:
        {
          "name": "Employee Name",
          "gender": "Masculino/Femenino (If not stated, try to infer from context, otherwise use 'N/A')",
          "idNumber": "Passport or ID Number",
          "startDate": "Start Date (DD-MM-YYYY)",
          "position": "Job Title (Translated to Spanish)",
          "department": "Department Name (Translated to Spanish)",
          "companyName": "Company Name (Keep original)",
          "issueDate": "Date of Issue (e.g., 15 de agosto de 2024)",
          "sealText": "Text on the circular seal (Keep original language)",
          "salary": "Monthly Salary (e.g., 34910 RMB) - Optional"
        }

        If a field is not found, use "N/A". Ensure the output is valid JSON.
      `;

      // Reset to loading state/placeholders to show something is happening
      setCertificateData(prev => ({
        ...prev,
        name: 'Extrayendo...',
        gender: '...',
        idNumber: '...',
        startDate: '...',
        position: '...',
        department: '...',
        companyName: '...',
        issueDate: '...',
        sealText: '...',
        salary: '...'
      }));

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
        setCertificateData(prev => ({
          ...prev,
          ...data
        }));
      } catch (e) {
        console.error('JSON Parse Error:', e);
        alert('Failed to parse extracted data. Please check the console.');
        // Revert to default or leave as is? Better to leave as is or show error state.
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
          <button 
            onClick={() => window.open(previewUrl, '_blank')}
            className="flex items-center gap-2 bg-[#ffffff] text-[#374151] border border-[#d1d5db] px-4 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors shadow-sm font-medium"
          >
            <Eye size={18} />
            View Original
          </button>
        )}

        <button 
          onClick={handleUploadClick}
          disabled={isExtracting}
          className="flex items-center gap-2 bg-[#ffffff] text-[#374151] border border-[#d1d5db] px-4 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors shadow-sm font-medium disabled:opacity-70"
        >
          {isExtracting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {selectedFile ? 'Change File' : 'Upload Document'}
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
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Certificate Page */}
      <div 
        id="certificate-page"
        ref={certificateRef}
        className="max-w-[210mm] mx-auto bg-[#ffffff] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] print:shadow-none min-h-[297mm] w-[210mm] p-[25mm] relative font-serif text-[#111827] flex flex-col"
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        
        {/* Header Logo */}
        <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
                {/* Logo Icon */}
                <div className="bg-[#000000] text-[#ffffff] rounded-full p-1.5 flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 8C21 8 19 12 15 12C11 12 9 10 9 10C9 10 10 14 14 16C18 18 21 16 21 16" stroke="none" />
                        <path d="M3 10C3 10 6 8 10 8C14 8 16 10 16 10" stroke="none" />
                        <path d="M12 6C12 6 14 4 17 4" stroke="none" />
                        <circle cx="5" cy="10" r="2" />
                    </svg>
                </div>
                <span className="text-3xl font-bold tracking-wide font-sans mt-1">同程旅行</span>
            </div>
            <div className="w-full h-[2px] bg-[#000000]"></div>
        </div>

        {/* Title */}
        <h1 className="text-center text-6xl font-bold mb-24 tracking-[0.15em] uppercase">
            Certificado de<br/>Empleo
        </h1>

        {/* Body Content */}
        <div className="text-2xl leading-loose space-y-12 font-serif text-justify">
            <p className="indent-16">
                Por la presente se certifica que <span className="font-bold px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.name}</span>, 
                {certificateData.gender !== 'N/A' && (
                  <> sexo <span className="px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.gender}</span>,</>
                )} 
                número de documento <span className="px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.idNumber}</span>, 
                ha estado trabajando en nuestra empresa desde el <span className="px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.startDate}</span> hasta la fecha, 
                actualmente ocupa el puesto de <span className="px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.position}</span> en el departamento <span className="px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.department}</span>.
                {certificateData.salary && (
                  <> Su salario mensual es de <span className="px-2 underline underline-offset-8 decoration-1 decoration-[#000000]">{certificateData.salary}</span>.</>
                )}
            </p>

            <p className="mt-20 indent-16">
                Se expide la presente constancia para los fines pertinentes.
            </p>
        </div>

        {/* Signature Section */}
        <div className="mt-auto mb-20 flex flex-col items-end relative pr-10">
            {/* Seal */}
            <div className="absolute top-[-80px] right-[20px] w-56 h-56 border-[6px] border-[#dc2626] rounded-full flex items-center justify-center opacity-90 rotate-[-15deg] pointer-events-none">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Star */}
                    <div className="text-[#dc2626] text-8xl mb-4">★</div>
                    {/* Circular Text */}
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <path id="curve" d="M 14, 50 A 36, 36 0 1, 1 86, 50" fill="transparent" />
                        <text className="fill-[#dc2626] font-bold text-[7px] tracking-widest">
                            <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                {certificateData.sealText}
                            </textPath>
                        </text>
                    </svg>
                </div>
            </div>

            <div className="text-right z-10 space-y-4 font-serif text-xl">
                <div className="mb-6">
                    <span className="font-bold">Nombre de la Empresa:</span> {certificateData.companyName}
                </div>
                <div>
                    <span className="font-bold">Fecha:</span> {certificateData.issueDate}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-[#e5e7eb] text-sm space-y-3 text-[#4b5563] font-sans">
            <div className="flex gap-4">
                <span className="font-bold min-w-[260px]">Dirección Detallada de la Empresa:</span>
                <span>Edificio Tongcheng Travel, No. 66 Honghui Road, Parque Industrial de Suzhou</span>
            </div>
            <div className="flex gap-4">
                <span className="font-bold min-w-[260px]">Contacto de la Empresa:</span>
                <span>Centro de RR.HH. y Operaciones Organizacionales</span>
            </div>
            <div className="flex gap-4">
                <span className="font-bold min-w-[260px]">Teléfono de la Empresa:</span>
                <span>0512-80162199</span>
            </div>
        </div>

      </div>
    </div>
  );
}
