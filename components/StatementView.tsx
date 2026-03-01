import React, { useRef, useState } from 'react';
import { Printer, Upload, Loader2, FileCheck, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";

interface Transaction {
  date: string;
  currency: string;
  income: string;
  expense: string;
  balance: string;
  summary: string;
  counterparty: string;
  customerAbstract: string;
}

interface Total {
  currency: string;
  totalIncome: string;
  totalExpense: string;
}

interface StatementData {
  header: {
    date: string;
    acceptanceBranch: string;
    name: string;
    voucherType: string;
    verificationCode: string;
    openingBranch: string;
    accountNumber: string;
    transactionPeriod: string;
    currencyType: string;
    consultationType: string;
  };
  transactions: Transaction[];
  totals: Total[];
}

const INITIAL_DATA: StatementData = {
  header: {
    date: '',
    acceptanceBranch: '',
    name: '',
    voucherType: '',
    verificationCode: '',
    openingBranch: '',
    accountNumber: '',
    transactionPeriod: '',
    currencyType: '',
    consultationType: ''
  },
  transactions: [],
  totals: []
};

export function StatementView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [statementData, setStatementData] = useState<StatementData>(INITIAL_DATA);

  // Pagination Configuration
  // Based on screenshot: Page 1 has ~25 rows, Page 2+ has ~30 rows
  const ITEMS_PER_PAGE_FIRST = 25;
  const ITEMS_PER_PAGE_OTHER = 30;

  async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const extractData = async (file: File) => {
    setIsExtracting(true);
    setStatementData(INITIAL_DATA); // Reset data

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment configuration.");
      }
      
      const genAI = new GoogleGenAI({ apiKey });
      const imagePart = await fileToGenerativePart(file);

      const prompt = `
        You are an expert OCR and translation assistant. 
        Extract data from this China Merchants Bank Statement (image or PDF) and translate it into Spanish.
        
        Return ONLY a valid JSON object with this structure:
        {
          "header": {
            "date": "Date of printing/generation (Fecha)",
            "acceptanceBranch": "Acceptance Branch (Sucursal de Aceptación)",
            "name": "Account Name (Nombre)",
            "voucherType": "Voucher Type (Tipo de Comprobante)",
            "verificationCode": "Verification Code (Cód. Verificación)",
            "openingBranch": "Opening Branch (Sucursal de Apertura)",
            "accountNumber": "Account Number (Número de Cuenta)",
            "transactionPeriod": "Transaction Period (Periodo de Transacción)",
            "currencyType": "Currency Type (Tipo de Moneda)",
            "consultationType": "Consultation Type (Tipo de Consulta)"
          },
          "transactions": [
            {
              "date": "Transaction Date (YYYY/MM/DD)",
              "currency": "Currency (CNY, USD, etc)",
              "income": "Income Amount (Ingresos) - '0.00' if empty",
              "expense": "Expense Amount (Egresos) - '0.00' if empty",
              "balance": "Balance (Saldo)",
              "summary": "Transaction Summary (Resumen) - Translate to Spanish",
              "counterparty": "Counterparty Info (Info. Contraparte) - Keep names/IDs, translate descriptions",
              "customerAbstract": "Customer Abstract (Resumen del Cliente) - Translate to Spanish"
            }
          ],
          "totals": [
            {
              "currency": "Currency (e.g., CNY, USD, EUR)",
              "totalIncome": "Total Income Amount",
              "totalExpense": "Total Expense Amount"
            }
          ]
        }

        Important:
        1. Translate all descriptive text to Spanish (e.g., "Payment" -> "Pago", "Transfer" -> "Transferencia").
        2. Keep proper names (people, companies) and IDs unchanged.
        3. Ensure all numbers are formatted exactly as in the document (e.g., "1,000.00").
        4. If a field is missing, use empty string "".
        5. Extract ALL transactions visible in the image.
        6. Extract ALL totals for ALL currencies shown at the bottom of the statement.
      `;

      // Add a timeout to the API call (increased to 3 minutes)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 180000)
      );

      const apiCallPromise = genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: {
          parts: [imagePart, { text: prompt }],
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const response = await Promise.race([apiCallPromise, timeoutPromise]) as any;

      const text = response.text;
      if (text) {
        try {
          const data = JSON.parse(text);
          setStatementData(data);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          alert("Failed to parse extracted data. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error extracting data:", error);
      alert(`Error extracting data: ${error.message || "Unknown error"}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Calculate pages
  const pages = [];
  const transactionsList = statementData.transactions.length > 0 ? statementData.transactions : [];
  
  if (transactionsList.length > 0) {
      // First Page
      pages.push({
        pageNum: 1,
        transactions: transactionsList.slice(0, ITEMS_PER_PAGE_FIRST),
        isFirst: true
      });

      // Subsequent Pages
      let remainingTx = transactionsList.slice(ITEMS_PER_PAGE_FIRST);
      let currentPage = 2;
      while (remainingTx.length > 0) {
        pages.push({
            pageNum: currentPage,
            transactions: remainingTx.slice(0, ITEMS_PER_PAGE_OTHER),
            isFirst: false
        });
        remainingTx = remainingTx.slice(ITEMS_PER_PAGE_OTHER);
        currentPage++;
      }
  } else {
      // Empty page if no data yet
      pages.push({
          pageNum: 1,
          transactions: [],
          isFirst: true
      });
  }
  
  const totalPages = pages.length;

  const handlePrint = async () => {
    const pageElements = document.querySelectorAll('[data-pdf-page]');
    if (!pageElements.length) return;

    try {
      setIsGeneratingPdf(true);
      
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait
      const pdfWidth = 210; // A4 Portrait width in mm
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
              const element = clonedDoc.body.querySelector(`[data-page-id="${i}"]`) as HTMLElement;
              if (element) {
                  element.style.color = '#111827';
                  element.style.backgroundColor = '#ffffff';
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
      
      pdf.save('bank-statement-translated.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      extractData(file); // Trigger extraction
    }
  };

  return (
    <div className="p-8 bg-[#f3f4f6] min-h-screen print:bg-[#ffffff] print:p-0">
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
                setStatementData(INITIAL_DATA);
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
          className="flex items-center gap-2 bg-[#ffffff] text-[#374151] border border-[#d1d5db] px-4 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors shadow-sm font-medium"
        >
          <Upload size={18} />
          {selectedFile ? 'Change File' : 'Upload Statement'}
        </button>
        <button 
          onClick={handlePrint}
          disabled={isGeneratingPdf || isExtracting || statementData.transactions.length === 0}
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

      {/* Loading State */}
      {isExtracting && (
        <div className="max-w-[210mm] mx-auto mb-8 bg-white p-8 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
            <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Extrayendo datos del estado de cuenta...</h3>
            <p className="text-gray-500 mt-2">Esto puede tomar unos segundos.</p>
        </div>
      )}

      {/* Pages Container */}
      {!isExtracting && (
      <div className="flex flex-col gap-8 print:gap-0">
        {pages.map((page, index) => (
          <div 
            key={index}
            data-pdf-page="true"
            data-page-id={index}
            className="max-w-[210mm] mx-auto bg-[#ffffff] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] print:shadow-none min-h-[297mm] w-[210mm] p-[10mm] relative text-[10px] leading-tight font-sans text-[#111827] flex flex-col"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          >
            
            {/* Header Section - Only on First Page */}
            {page.isFirst && (
              <>
                <h1 className="text-center text-xl font-medium mb-1 mt-4 tracking-wide text-[#000000]">
                  DETALLE HISTÓRICO DE TRANSACCIONES DE CUENTA
                </h1>
                
                {/* Seal Text */}
                <div className="text-center text-[10px] text-[#000000] mb-8">
                    Sello especial para recibo electronico de China Merchants Bank Co., Ltd. ({statementData.header.verificationCode || 'AH6P6MTC'})
                </div>

                {/* Account Details Grid */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-4 text-[9px] border-b border-[#000000] pb-4">
                   {/* Row 1 */}
                   <div className="flex">
                      <span className="font-bold mr-2">Fecha:</span>
                      <span>{statementData.header.date || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Sucursal de Aceptación:</span>
                      <span>{statementData.header.acceptanceBranch || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Sucursal de Apertura:</span>
                      <span>{statementData.header.openingBranch || 'Extrayendo...'}</span>
                   </div>

                   {/* Row 2 */}
                   <div className="flex">
                      <span className="font-bold mr-2">Nombre:</span>
                      <span>{statementData.header.name || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Tipo de Comprobante:</span>
                      <span>{statementData.header.voucherType || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Número de Cuenta:</span>
                      <span>{statementData.header.accountNumber || 'Extrayendo...'}</span>
                   </div>

                   {/* Row 3 */}
                   <div className="flex">
                      <span className="font-bold mr-2">Tipo de Consulta:</span>
                      <span>{statementData.header.consultationType || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Tipo de Cuenta:</span>
                      <span>{statementData.header.currencyType || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Periodo de Transacción:</span>
                      <span>{statementData.header.transactionPeriod || 'Extrayendo...'}</span>
                   </div>

                   {/* Row 4 */}
                   <div className="flex">
                      <span className="font-bold mr-2">Cód. Verificación:</span>
                      <span>{statementData.header.verificationCode || 'Extrayendo...'}</span>
                   </div>
                   <div className="flex">
                      <span className="font-bold mr-2">Tipo de Moneda:</span>
                      <span>{statementData.totals.currency || 'Todas las Monedas'}</span>
                   </div>
                   <div className="flex">
                      {/* Empty cell */}
                   </div>
                </div>
                
                <div className="text-[9px] mb-4 text-[#000000]">
                    Este documento de transacción es para la consulta, verificación y conciliación del cliente. Por favor, preste atención al uso.
                </div>
              </>
            )}

            {/* Transactions Table */}
            <table className="w-full text-left border-collapse mb-4 table-fixed">
              <thead>
                <tr className="border-b border-t border-[#000000] text-[8px]">
                  <th className="py-1 font-medium w-[10%]">Fecha</th>
                  <th className="py-1 font-medium w-[5%]">Moneda</th>
                  <th className="py-1 font-medium text-right w-[10%]">Ingresos</th>
                  <th className="py-1 font-medium text-right w-[10%]">Egresos</th>
                  <th className="py-1 font-medium text-right w-[12%]">Saldo</th>
                  <th className="py-1 font-medium pl-2 w-[15%]">Resumen</th>
                  <th className="py-1 font-medium w-[20%]">Info. Contraparte</th>
                  <th className="py-1 font-medium w-[18%]">Resumen del Cliente</th>
                </tr>
              </thead>
              <tbody className="text-[8px]">
                {page.transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] print:hover:bg-transparent">
                    <td className="py-1 align-top break-words">{tx.date}</td>
                    <td className="py-1 align-top">{tx.currency}</td>
                    <td className="py-1 align-top text-right">{tx.income !== '0.00' ? tx.income : '0.00'}</td>
                    <td className="py-1 align-top text-right">{tx.expense !== '0.00' ? tx.expense : '0.00'}</td>
                    <td className="py-1 align-top text-right">{tx.balance}</td>
                    <td className="py-1 align-top pl-2 break-words">{tx.summary}</td>
                    <td className="py-1 align-top pr-2 text-[#4b5563] break-words whitespace-normal leading-tight">{tx.counterparty}</td>
                    <td className="py-1 align-top text-[#4b5563] break-words whitespace-normal leading-tight">{tx.customerAbstract}</td>
                  </tr>
                ))}
                {page.transactions.length === 0 && (
                    <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                            {isExtracting ? 'Cargando transacciones...' : 'No hay transacciones para mostrar.'}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>

            {/* Total Section - Only on Last Page */}
            {index === pages.length - 1 && statementData.totals && statementData.totals.length > 0 && (
                <div className="border-t border-b border-[#000000] py-2 mb-8 text-[9px]">
                    <div className="flex justify-between font-bold mb-2">
                        <div className="w-[20%]">Estadísticas Totales</div>
                        <div className="w-[20%] text-right">Total Ingresos (+)</div>
                        <div className="w-[20%] text-right">Total Egresos (-)</div>
                        <div className="w-[40%]"></div>
                    </div>
                    {statementData.totals.map((total, idx) => (
                        <div key={idx} className="flex justify-between">
                            <div className="w-[20%]">{total.currency}</div>
                            <div className="w-[20%] text-right">{total.totalIncome}</div>
                            <div className="w-[20%] text-right">{total.totalExpense}</div>
                            <div className="w-[40%]"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4 flex justify-between text-[9px] text-[#000000] border-t border-[#000000]">
               <div>Operador: 044628</div>
               <div>Página: {page.pageNum} de {totalPages}</div>
            </div>

          </div>
        ))}
        </div>
      )}
    </div>
  );
}
