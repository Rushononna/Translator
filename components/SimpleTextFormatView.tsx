import React, { useRef, useState } from 'react';
import { Printer, Upload, Loader2, FileCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { transactions } from '../data/transactions';

export function SimpleTextFormatView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Pagination Configuration
  // Based on original document: Page 1 has ~41 rows, Page 2+ has ~52 rows
  const ITEMS_PER_PAGE_FIRST = 41;
  const ITEMS_PER_PAGE_OTHER = 52;

  // Calculate pages
  const pages = [];
  
  // First Page
  pages.push({
    pageNum: 1,
    transactions: transactions.slice(0, ITEMS_PER_PAGE_FIRST),
    isFirst: true
  });

  // Subsequent Pages
  let remainingTx = transactions.slice(ITEMS_PER_PAGE_FIRST);
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
  
  // Hardcoded total pages to match original document as requested
  const totalPages = 16; 

  const handlePrint = async () => {
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
      
      pdf.save('bank-statement-simple.pdf');
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
      console.log('File selected:', file.name);
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
              onClick={() => setSelectedFile(null)}
              className="ml-1 text-[#15803d] hover:text-[#14532d]"
            >
              ×
            </button>
          </div>
        )}

        <button 
          onClick={handleUploadClick}
          className="flex items-center gap-2 bg-white text-[#374151] border border-[#d1d5db] px-4 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors shadow-sm font-medium"
        >
          <Upload size={18} />
          {selectedFile ? 'Change File' : 'Upload Statement'}
        </button>
        <button 
          onClick={handlePrint}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Printer size={18} />
          )}
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Pages Container */}
      <div className="flex flex-col gap-8 print:gap-0">
        {pages.map((page, index) => (
          <div 
            key={index}
            data-pdf-page="true"
            data-page-id={index}
            className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none min-h-[297mm] w-[210mm] p-[15mm] relative text-[10px] leading-tight font-sans text-[#111827] flex flex-col"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
          >
            
            {/* Seal - Visible on every page */}
            <div className="border-[3px] border-[#dc2626] rounded-full w-36 h-36 flex items-center justify-center rotate-[-15deg] opacity-80 absolute top-10 right-10 pointer-events-none print:opacity-80 mix-blend-multiply bg-transparent">
              <div className="text-center text-[#dc2626] font-bold leading-none flex flex-col items-center justify-center h-full w-full p-2">
                <div className="text-[10px] tracking-tighter mb-1 scale-x-90">CHINA MERCHANTS</div>
                <div className="text-[10px] tracking-tighter mb-2 scale-x-90">BANK CO., LTD.</div>
                <div className="text-lg mb-1 font-serif tracking-widest scale-x-110">电子回单专用章</div>
                <div className="text-[9px] mb-1 scale-x-90">(Electronic Receipt Special Seal)</div>
                <div className="text-[9px] scale-x-90">673RM2C2</div>
              </div>
            </div>

            {/* Header Section - Only on First Page */}
            {page.isFirst && (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold text-[10px] leading-none pt-0.5">CMB</div>
                        <div>
                           <h1 className="text-xl font-bold text-[#1f2937] tracking-wide">CHINA MERCHANTS BANK</h1>
                           <div className="text-[8px] text-[#6b7280] tracking-wider">招商银行</div>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="border border-[#d1d5db] px-2 py-1 inline-block text-[10px] mt-2">
                        电子回单
                     </div>
                  </div>
                </div>

                <h2 className="text-center text-lg font-bold mb-6 border-b pb-2 border-[#e5e7eb]">
                  账户交易明细
                </h2>

                {/* Account Details Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-[9px]">
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">打印日期:</span>
                      <span className="font-medium">2024/03/21 15:12:51</span>
                   </div>
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">受理网点:</span>
                      <span className="font-medium">上海自贸试验区临港新片区支行</span>
                   </div>

                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">户名:</span>
                      <span className="font-medium">MUJAHIDUL HOSSAIN</span>
                   </div>
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">凭证种类:</span>
                      <span className="font-medium">金葵花IC卡</span>
                   </div>

                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">查询类型:</span>
                      <span className="font-medium">历史交易查询</span>
                   </div>
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">账户性质:</span>
                      <span className="font-medium">多币种</span>
                   </div>

                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">验证码:</span>
                      <span className="font-medium">673RM2C2</span>
                   </div>
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">开户网点:</span>
                      <span className="font-medium">上海金桥支行</span>
                   </div>

                   <div className="col-span-1 flex"></div>
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">账号:</span>
                      <span className="font-medium">6214860214983062</span>
                   </div>

                   <div className="col-span-1"></div>
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">起止日期:</span>
                      <span className="font-medium">2023/09/19 - 2024/03/21</span>
                   </div>
                </div>
              </>
            )}

            {/* Transactions Table */}
            <table className="w-full text-left border-collapse mb-4 table-fixed">
              <thead>
                <tr className="border-b border-t border-black text-[8px]">
                  <th className="py-1 font-medium w-[12%]">记账日期</th>
                  <th className="py-1 font-medium w-[6%]">币种</th>
                  <th className="py-1 font-medium text-right w-[10%]">收入金额</th>
                  <th className="py-1 font-medium text-right w-[10%]">支出金额</th>
                  <th className="py-1 font-medium text-right w-[12%]">联机余额</th>
                  <th className="py-1 font-medium pl-2 w-[12%]">交易摘要</th>
                  <th className="py-1 font-medium w-[20%]">交易对手信息</th>
                  <th className="py-1 font-medium w-[18%]">客户摘要信息</th>
                </tr>
              </thead>
              <tbody className="text-[8px]">
                {page.transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] print:hover:bg-transparent">
                    <td className="py-0.5 align-top">{tx.date}</td>
                    <td className="py-0.5 align-top">{tx.currency}</td>
                    <td className="py-0.5 align-top text-right">{tx.income !== '0.00' ? tx.income : '0.00'}</td>
                    <td className="py-0.5 align-top text-right">{tx.expense !== '0.00' ? tx.expense : '0.00'}</td>
                    <td className="py-0.5 align-top text-right">{tx.balance}</td>
                    <td className="py-0.5 align-top pl-2">{tx.summary}</td>
                    <td className="py-0.5 align-top pr-1 text-[#4b5563] break-words whitespace-normal leading-tight">{tx.counterparty}</td>
                    <td className="py-0.5 align-top text-[#4b5563] break-words whitespace-normal leading-tight">{tx.customerAbstract}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-auto pt-4 flex justify-between text-[8px] text-[#6b7280]">
               <div>经办用户: 037706</div>
               <div>页码: 第{page.pageNum} 页 总共{totalPages} 页</div>
               <div></div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
