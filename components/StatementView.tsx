import React, { useRef, useState } from 'react';
import { Printer, Upload, Loader2, FileCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

const transactions: Transaction[] = [
  {
    date: '2023/09/19',
    currency: 'CNY',
    income: '0.00',
    expense: '100.00',
    balance: '69,851.24',
    summary: 'Pago Rápido',
    counterparty: '1800002761 Recarga Móvil',
    customerAbstract: 'Tenpay - Recarga Móvil'
  },
  {
    date: '2023/09/19',
    currency: 'CNY',
    income: '0.00',
    expense: '49.89',
    balance: '69,801.35',
    summary: 'Pago Rápido',
    counterparty: '477910 China Unicom',
    customerAbstract: 'Alipay - China Unicom'
  },
  {
    date: '2023/09/20',
    currency: 'CNY',
    income: '0.00',
    expense: '117.99',
    balance: '69,683.36',
    summary: 'Pago Rápido',
    counterparty: '1238342501 Comerciante JD.com',
    customerAbstract: 'Tenpay - Comerciante JD.com'
  },
  {
    date: '2023/09/20',
    currency: 'CNY',
    income: '0.00',
    expense: '7.00',
    balance: '69,676.36',
    summary: 'Pago Rápido',
    counterparty: '5006387004 Desayuno Seguro',
    customerAbstract: 'Tenpay - Desayuno Seguro'
  },
  {
    date: '2023/09/20',
    currency: 'CNY',
    income: '0.00',
    expense: '4,000.00',
    balance: '65,676.36',
    summary: 'Transferencia',
    counterparty: '622908211588863917 QIAN ZONGFEN',
    customerAbstract: 'NonResident+Transferencia'
  },
  {
    date: '2023/09/20',
    currency: 'CNY',
    income: '0.00',
    expense: '56.00',
    balance: '65,620.36',
    summary: 'Pago Rápido',
    counterparty: '589725568 Tienda Yihuayuan Dishuihu',
    customerAbstract: 'Tenpay - Tienda Yihuayuan Dishuihu'
  },
  {
    date: '2023/09/21',
    currency: 'CNY',
    income: '9.53',
    expense: '0.00',
    balance: '65,629.89',
    summary: 'Liquidación Intereses',
    counterparty: '912156520611009810 Intereses a Pagar',
    customerAbstract: 'Liquidación: 9.53 Impuesto: 0'
  },
  {
    date: '2023/09/21',
    currency: 'CNY',
    income: '0.00',
    expense: '30.00',
    balance: '65,599.89',
    summary: 'Pago Rápido',
    counterparty: '1395005602 Shanghai Starbucks Coffee',
    customerAbstract: 'Tenpay - Shanghai Starbucks Coffee'
  },
  {
    date: '2023/09/22',
    currency: 'CNY',
    income: '0.00',
    expense: '19.50',
    balance: '65,580.39',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/09/22',
    currency: 'CNY',
    income: '0.00',
    expense: '14.75',
    balance: '65,565.64',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/09/22',
    currency: 'CNY',
    income: '0.00',
    expense: '960.00',
    balance: '64,605.64',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/09/22',
    currency: 'CNY',
    income: '0.00',
    expense: '100.00',
    balance: '64,505.64',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/09/23',
    currency: 'CNY',
    income: '0.00',
    expense: '25.00',
    balance: '64,480.64',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/09/23',
    currency: 'CNY',
    income: '0.00',
    expense: '10.00',
    balance: '64,470.64',
    summary: 'Pago Rápido',
    counterparty: '460527691 UnionPay',
    customerAbstract: 'Tenpay - UnionPay'
  },
  {
    date: '2023/09/24',
    currency: 'CNY',
    income: '0.00',
    expense: '21.00',
    balance: '64,449.64',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/09/24',
    currency: 'CNY',
    income: '0.00',
    expense: '16.90',
    balance: '64,432.74',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Pago WeChat - Comerciante Pinduoduo'
  },
  {
    date: '2023/09/24',
    currency: 'CNY',
    income: '16.90',
    expense: '0.00',
    balance: '64,449.64',
    summary: 'Reembolso Rápido UnionPay',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Reembolso'
  },
  // Page 2 Sample
  {
    date: '2023/09/27',
    currency: 'CNY',
    income: '0.00',
    expense: '20.00',
    balance: '53,814.12',
    summary: 'Pago Rápido',
    counterparty: '459070535 Fideos de Res Tradicionales',
    customerAbstract: 'Tenpay - Fideos de Res Tradicionales'
  },
  {
    date: '2023/09/27',
    currency: 'CNY',
    income: '0.00',
    expense: '9.90',
    balance: '53,804.22',
    summary: 'Pago Rápido',
    counterparty: '1611788718 Luckin Coffee',
    customerAbstract: 'Tenpay - Luckin Coffee'
  },
  {
    date: '2023/09/27',
    currency: 'CNY',
    income: '0.00',
    expense: '117.80',
    balance: '53,686.42',
    summary: 'Pago Rápido',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Comerciante Pinduoduo'
  },
  {
    date: '2023/09/27',
    currency: 'CNY',
    income: '117.80',
    expense: '0.00',
    balance: '53,804.22',
    summary: 'Reembolso Rápido',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Reembolso'
  },
  {
    date: '2023/09/27',
    currency: 'CNY',
    income: '0.00',
    expense: '22.40',
    balance: '53,781.82',
    summary: 'Pago Rápido',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Comerciante Pinduoduo'
  },
  {
    date: '2023/09/27',
    currency: 'CNY',
    income: '0.00',
    expense: '105.00',
    balance: '53,676.82',
    summary: 'Pago Rápido',
    counterparty: '2088041604924802 Suzhou Bamadun',
    customerAbstract: 'Alipay - Suzhou Bamadun Daily Necessities Co., Ltd.'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '10.10',
    balance: '53,666.72',
    summary: 'Pago Rápido',
    counterparty: 'SHLGGP3005 Shanghai Lin-gang Water Supply',
    customerAbstract: 'Alipay - Shanghai Lin-gang Water Supply Co., Ltd.'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '80.90',
    balance: '53,585.82',
    summary: 'Pago Rápido',
    counterparty: 'SHLGGP3005 Shanghai Lin-gang Water Supply',
    customerAbstract: 'Alipay - Shanghai Lin-gang Water Supply Co., Ltd.'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '37.00',
    balance: '53,548.82',
    summary: 'Pago Rápido UnionPay',
    counterparty: '888331049000001 State Grid Shanghai Electric Power',
    customerAbstract: 'Alipay - State Grid Shanghai Electric Power Company (Bill Payment)'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '147.00',
    balance: '53,401.82',
    summary: 'Pago Rápido',
    counterparty: 'SHANGHELE State Grid Shanghai Electric Power',
    customerAbstract: 'Alipay - State Grid Shanghai Electric Power Company (Bill Payment)'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '168.70',
    balance: '53,233.12',
    summary: 'Pago Rápido',
    counterparty: 'SHANGHELE State Grid Shanghai Electric Power',
    customerAbstract: 'Alipay - State Grid Shanghai Electric Power Company (Bill Payment)'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '19.90',
    balance: '53,213.22',
    summary: 'Pago Rápido',
    counterparty: '1604459733 Tim Hortons Coffee',
    customerAbstract: 'Tenpay - Tim Hortons Coffee'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '119.00',
    balance: '53,094.22',
    summary: 'Pago Rápido',
    counterparty: '2088502953696452 Zheng Meimei',
    customerAbstract: 'Alipay - Zheng Meimei'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '29.00',
    balance: '53,065.22',
    summary: 'Pago Rápido',
    counterparty: '482986909 Quanjia FamilyMart',
    customerAbstract: 'Tenpay - Quanjia FamilyMart'
  },
  {
    date: '2023/09/28',
    currency: 'CNY',
    income: '0.00',
    expense: '10.00',
    balance: '53,055.22',
    summary: 'Pago Rápido',
    counterparty: '539004412 92310115MABWKK5T9L',
    customerAbstract: 'Tenpay - 92310115MABWKK5T9L'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '3.00',
    balance: '53,052.22',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Pago WeChat - Transferencia'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '27.00',
    balance: '53,025.22',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Pago WeChat - Transferencia'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '20.00',
    balance: '53,005.22',
    summary: 'Pago Rápido',
    counterparty: '1502989001 Shanghai Public Transport Card',
    customerAbstract: 'Tenpay - Shanghai Public Transport Card App'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '900.00',
    balance: '52,105.22',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '30.00',
    balance: '52,075.22',
    summary: 'Pago Rápido UnionPay',
    counterparty: '215500690 Alipay',
    customerAbstract: 'Alipay - Pago - Shanghai Public Transport Card Co., Ltd.'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '12.90',
    balance: '52,062.32',
    summary: 'Pago Rápido',
    counterparty: '283342307 Outlets (Shanghai)',
    customerAbstract: 'Tenpay - Outlets (Shanghai)'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '19.40',
    balance: '52,042.92',
    summary: 'Pago Rápido',
    counterparty: '1572850671 Youhui Tequan',
    customerAbstract: 'Tenpay - Youhui Tequan'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '64.80',
    balance: '51,978.12',
    summary: 'Pago Rápido',
    counterparty: '298374 Shanghai Chengxi International Travel',
    customerAbstract: 'Alipay - Shanghai Chengxi International Travel Service'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '64.80',
    expense: '0.00',
    balance: '52,042.92',
    summary: 'Reembolso Rápido',
    counterparty: '298374 Shanghai Chengxi International Travel',
    customerAbstract: 'Alipay - Shanghai Chengxi International Travel Service'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '87.45',
    balance: '51,955.47',
    summary: 'Pago Rápido',
    counterparty: '246494750 Meituan Platform Merchant',
    customerAbstract: 'Tenpay - Meituan Platform Merchant'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '14.00',
    balance: '51,941.47',
    summary: 'Pago Rápido',
    counterparty: '1223301701 Shanghai Xiduo Convenience',
    customerAbstract: 'Tenpay - Shanghai Xiduo Convenience Store'
  },
  {
    date: '2023/09/29',
    currency: 'CNY',
    income: '0.00',
    expense: '3.00',
    balance: '51,938.47',
    summary: 'Pago Rápido',
    counterparty: '1223301701 Shanghai Xiduo Convenience',
    customerAbstract: 'Tenpay - Shanghai Xiduo Convenience Store'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '300.00',
    balance: '51,638.47',
    summary: 'Pago Rápido UnionPay',
    counterparty: '534409087 Individual Account Deposit',
    customerAbstract: 'Tenpay - Pago WeChat - Individual Account Deposit'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '5.00',
    balance: '51,633.47',
    summary: 'Pago Rápido',
    counterparty: '1000049901 QR Code Payment',
    customerAbstract: 'Tenpay - QR Code Payment'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '24.50',
    balance: '51,608.97',
    summary: 'Pago Rápido',
    counterparty: '246494750 Meituan Platform Merchant',
    customerAbstract: 'Tenpay - Meituan Platform Merchant'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '3,580.00',
    balance: '48,028.97',
    summary: 'Pago Rápido UnionPay',
    counterparty: '215500690 Alipay',
    customerAbstract: 'Alipay - Payment - Consumption - Shanghai Puxi Auto Service'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '150.00',
    balance: '47,878.97',
    summary: 'Pago Rápido',
    counterparty: '1547993321 Sanqiao Gas Station',
    customerAbstract: 'Tenpay - Sanqiao Gas Station'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '24.00',
    balance: '47,854.97',
    summary: 'Pago Rápido',
    counterparty: '1000039801 WeChat Red Packet',
    customerAbstract: 'Tenpay - WeChat Red Packet'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '85.30',
    balance: '47,769.67',
    summary: 'Pago Rápido',
    counterparty: '1520510501 Taco Bell',
    customerAbstract: 'Tenpay - Taco Bell'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '38.80',
    balance: '47,730.87',
    summary: 'Pago Rápido',
    counterparty: '1520510501 Taco Bell',
    customerAbstract: 'Tenpay - Taco Bell'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '38.80',
    expense: '0.00',
    balance: '47,769.67',
    summary: 'Reembolso Rápido',
    counterparty: '1520510501 Taco Bell',
    customerAbstract: 'Tenpay - Taco Bell'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '16.50',
    balance: '47,753.17',
    summary: 'Pago Rápido',
    counterparty: '500842240 Hangzhou Qianxi Network',
    customerAbstract: 'Tenpay - Hangzhou Qianxi Network Technology'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '16.80',
    balance: '47,736.37',
    summary: 'Pago Rápido',
    counterparty: '283342307 Outlets (Shanghai)',
    customerAbstract: 'Tenpay - Outlets (Shanghai)'
  },
  {
    date: '2023/09/30',
    currency: 'CNY',
    income: '0.00',
    expense: '28.00',
    balance: '47,708.37',
    summary: 'Pago Rápido',
    counterparty: '1535735411 Binjiang Optical New Village',
    customerAbstract: 'Tenpay - Binjiang Optical New Village'
  },
  {
    date: '2023/10/01',
    currency: 'CNY',
    income: '0.00',
    expense: '4,900.00',
    balance: '42,808.37',
    summary: 'Transferencia',
    counterparty: '4026743135391305 HOSSAIN MUJAHIDUL',
    customerAbstract: 'NonResident+Transferencia'
  },
  {
    date: '2023/10/01',
    currency: 'CNY',
    income: '0.00',
    expense: '35.33',
    balance: '42,773.04',
    summary: 'Pago Rápido',
    counterparty: '1216845401 Meituan',
    customerAbstract: 'Tenpay - Meituan'
  },
  {
    date: '2023/10/01',
    currency: 'CNY',
    income: '0.00',
    expense: '133.00',
    balance: '42,640.04',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1251965401 Lianhua Supermarket',
    customerAbstract: 'Tenpay - Pago WeChat - Lianhua Supermarket'
  },
  {
    date: '2023/10/01',
    currency: 'CNY',
    income: '0.00',
    expense: '49.90',
    balance: '42,590.14',
    summary: 'Pago Rápido',
    counterparty: '1534503381 China Mobile',
    customerAbstract: 'Tenpay - China Mobile'
  },
  {
    date: '2023/10/01',
    currency: 'CNY',
    income: '0.00',
    expense: '112.22',
    balance: '42,477.92',
    summary: 'Pago Rápido',
    counterparty: '1238342501 Comerciante JD.com',
    customerAbstract: 'Tenpay - Comerciante JD.com'
  },
  {
    date: '2023/10/01',
    currency: 'CNY',
    income: '0.00',
    expense: '200.00',
    balance: '42,277.92',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '19.90',
    balance: '42,258.02',
    summary: 'Pago Rápido',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Comerciante Pinduoduo'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '29.02',
    expense: '0.00',
    balance: '42,287.04',
    summary: 'Reembolso Rápido',
    counterparty: '1238342501 Comerciante JD.com',
    customerAbstract: 'Tenpay - Comerciante JD.com'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '18.00',
    balance: '42,269.04',
    summary: 'Pago Rápido',
    counterparty: '1647773622 Xiaoyang Shengjian',
    customerAbstract: 'Tenpay - Xiaoyang Shengjian'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '82.00',
    balance: '42,187.04',
    summary: 'Pago Rápido',
    counterparty: '596432809 Guxiang Mama',
    customerAbstract: 'Tenpay - Guxiang Mama'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '42.70',
    balance: '42,144.34',
    summary: 'Pago Rápido',
    counterparty: '581147648 Hi Fried Rice',
    customerAbstract: 'Tenpay - Hi Fried Rice'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '40.80',
    balance: '42,103.54',
    summary: 'Pago Rápido UnionPay',
    counterparty: '581147648 Hi Fried Rice',
    customerAbstract: 'Tenpay - Pago WeChat - Hi Fried Rice'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '22.00',
    balance: '42,081.54',
    summary: 'Pago Rápido',
    counterparty: '549845985 Molai Suancaiyu',
    customerAbstract: 'Tenpay - Molai Suancaiyu'
  },
  {
    date: '2023/10/02',
    currency: 'CNY',
    income: '0.00',
    expense: '100.00',
    balance: '41,981.54',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/03',
    currency: 'CNY',
    income: '0.00',
    expense: '8.00',
    balance: '41,973.54',
    summary: 'Pago Rápido',
    counterparty: '1218536701 Shenzhen City Road Network',
    customerAbstract: 'Tenpay - Shenzhen City Road Network'
  },
  {
    date: '2023/10/03',
    currency: 'CNY',
    income: '0.00',
    expense: '6.60',
    balance: '41,966.94',
    summary: 'Pago Rápido UnionPay',
    counterparty: '500842240 Hangzhou Qianxi Network',
    customerAbstract: 'Tenpay - Pago WeChat - Hangzhou Qianxi Network'
  },
  {
    date: '2023/10/03',
    currency: 'CNY',
    income: '0.00',
    expense: '43.14',
    balance: '41,923.80',
    summary: 'Pago Rápido',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Comerciante Pinduoduo'
  },
  {
    date: '2023/10/03',
    currency: 'CNY',
    income: '0.00',
    expense: '25.80',
    balance: '41,898.00',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1319713401 Comerciante Pinduoduo',
    customerAbstract: 'Tenpay - Pago WeChat - Comerciante Pinduoduo'
  },
  {
    date: '2023/10/03',
    currency: 'CNY',
    income: '0.00',
    expense: '10.90',
    balance: '41,887.10',
    summary: 'Pago Rápido',
    counterparty: '500842240 Hangzhou Qianxi Network',
    customerAbstract: 'Tenpay - Hangzhou Qianxi Network'
  },
  {
    date: '2023/10/03',
    currency: 'CNY',
    income: '0.00',
    expense: '18.00',
    balance: '41,869.10',
    summary: 'Pago Rápido',
    counterparty: '549845985 Molai Suancaiyu',
    customerAbstract: 'Tenpay - Molai Suancaiyu'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '4.00',
    balance: '41,865.10',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '12.90',
    balance: '41,852.20',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Pago WeChat - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '3.00',
    balance: '41,849.20',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Pago WeChat - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '5.00',
    balance: '41,844.20',
    summary: 'Pago Rápido',
    counterparty: '1000049901 QR Code Payment',
    customerAbstract: 'Tenpay - QR Code Payment'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '26.00',
    balance: '41,818.20',
    summary: 'Pago Rápido',
    counterparty: '1000039901 WeChat Red Packet',
    customerAbstract: 'Tenpay - WeChat Red Packet'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '50.00',
    balance: '41,768.20',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Pago WeChat - Transferencia'
  },
  {
    date: '2023/10/04',
    currency: 'CNY',
    income: '0.00',
    expense: '56.00',
    balance: '41,712.20',
    summary: 'Pago Rápido',
    counterparty: '1000049901 QR Code Payment',
    customerAbstract: 'Tenpay - QR Code Payment'
  },
  {
    date: '2023/10/05',
    currency: 'CNY',
    income: '0.00',
    expense: '200.00',
    balance: '41,512.20',
    summary: 'Pago Rápido',
    counterparty: '1314928601 Shanghai Petrochemical',
    customerAbstract: 'Tenpay - Shanghai Petrochemical'
  },
  {
    date: '2023/10/05',
    currency: 'CNY',
    income: '0.00',
    expense: '6.60',
    balance: '41,505.60',
    summary: 'Pago Rápido',
    counterparty: '500842240 Hangzhou Qianxi Network',
    customerAbstract: 'Tenpay - Hangzhou Qianxi Network'
  },
  {
    date: '2023/10/05',
    currency: 'CNY',
    income: '0.00',
    expense: '49.90',
    balance: '41,455.70',
    summary: 'Pago Rápido',
    counterparty: '1489408822 Shanghai Science & Tech',
    customerAbstract: 'Tenpay - Shanghai Science & Tech'
  },
  {
    date: '2023/10/05',
    currency: 'CNY',
    income: '0.00',
    expense: '105.77',
    balance: '41,349.93',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1238342501 Comerciante JD.com',
    customerAbstract: 'Tenpay - Pago WeChat - Comerciante JD.com'
  },
  {
    date: '2023/10/05',
    currency: 'CNY',
    income: '0.00',
    expense: '10.25',
    balance: '41,339.68',
    summary: 'Pago Rápido',
    counterparty: '1632511084 Universidad Oceánica de Shanghái',
    customerAbstract: 'Tenpay - Universidad Oceánica de Shanghái'
  },
  {
    date: '2023/10/05',
    currency: 'CNY',
    income: '0.00',
    expense: '200.00',
    balance: '41,139.68',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/06',
    currency: 'CNY',
    income: '0.00',
    expense: '35.00',
    balance: '41,104.68',
    summary: 'Pago Rápido',
    counterparty: '1434821902 NewTV Jiguang',
    customerAbstract: 'Tenpay - NewTV Jiguang'
  },
  {
    date: '2023/10/06',
    currency: 'CNY',
    income: '0.00',
    expense: '30.00',
    balance: '41,074.68',
    summary: 'Pago Rápido',
    counterparty: '1511946721 Shanghai Changji Polar Ocean',
    customerAbstract: 'Tenpay - Shanghai Changji Polar Ocean World'
  },
  {
    date: '2023/10/06',
    currency: 'CNY',
    income: '0.00',
    expense: '136.00',
    balance: '40,938.68',
    summary: 'Pago Rápido',
    counterparty: '1609002078 Domino\'s Pizza',
    customerAbstract: 'Tenpay - Domino\'s Pizza'
  },
  {
    date: '2023/10/07',
    currency: 'CNY',
    income: '0.00',
    expense: '19.50',
    balance: '40,919.18',
    summary: 'Pago Rápido',
    counterparty: '1609002078 Domino\'s Pizza',
    customerAbstract: 'Tenpay - Domino\'s Pizza'
  },
  {
    date: '2023/10/07',
    currency: 'CNY',
    income: '0.00',
    expense: '500.00',
    balance: '40,419.18',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/07',
    currency: 'CNY',
    income: '0.00',
    expense: '9.90',
    balance: '40,409.28',
    summary: 'Pago Rápido',
    counterparty: '1611788718 Luckin Coffee',
    customerAbstract: 'Tenpay - Luckin Coffee'
  },
  {
    date: '2023/10/08',
    currency: 'CNY',
    income: '0.00',
    expense: '21.70',
    balance: '40,387.58',
    summary: 'Pago Rápido',
    counterparty: '459789449 Yang Guofu Malatang',
    customerAbstract: 'Tenpay - Yang Guofu Malatang'
  },
  {
    date: '2023/10/08',
    currency: 'CNY',
    income: '0.00',
    expense: '300.00',
    balance: '40,087.58',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/08',
    currency: 'CNY',
    income: '0.00',
    expense: '300.00',
    balance: '39,787.58',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/08',
    currency: 'CNY',
    income: '0.00',
    expense: '20.00',
    balance: '39,767.58',
    summary: 'Pago Rápido',
    counterparty: '459070535 Traditional Beef Noodles',
    customerAbstract: 'Tenpay - Traditional Beef Noodles'
  },
  {
    date: '2023/10/08',
    currency: 'CNY',
    income: '0.00',
    expense: '9.90',
    balance: '39,757.68',
    summary: 'Pago Rápido',
    counterparty: '1611788718 Luckin Coffee',
    customerAbstract: 'Tenpay - Luckin Coffee'
  },
  {
    date: '2023/10/09',
    currency: 'CNY',
    income: '0.00',
    expense: '24.00',
    balance: '39,733.68',
    summary: 'Pago Rápido',
    counterparty: '454556829 Kuwei Tea Shop',
    customerAbstract: 'Tenpay - Kuwei Tea Shop'
  },
  {
    date: '2023/10/09',
    currency: 'CNY',
    income: '0.00',
    expense: '5,057.00',
    balance: '34,676.68',
    summary: 'Pago Rápido UnionPay',
    counterparty: '888331073999999 Ctrip',
    customerAbstract: 'Alipay - Payment - Consumption - Ctrip'
  },
  {
    date: '2023/10/10',
    currency: 'CNY',
    income: '0.00',
    expense: '114.95',
    balance: '34,561.73',
    summary: 'Pago Rápido',
    counterparty: '1238342501 Comerciante JD.com',
    customerAbstract: 'Tenpay - Comerciante JD.com'
  },
  {
    date: '2023/10/10',
    currency: 'CNY',
    income: '21,989.91',
    expense: '0.00',
    balance: '56,551.64',
    summary: 'Pago de Salario',
    counterparty: '212781375710001 Shanghai Chengxi International Travel',
    customerAbstract: '$79350'
  },
  {
    date: '2023/10/10',
    currency: 'CNY',
    income: '0.00',
    expense: '30.00',
    balance: '56,521.64',
    summary: 'Pago Rápido',
    counterparty: '8750573 Shanghai Public Transport Card',
    customerAbstract: 'Alipay - Shanghai Public Transport Card Co., Ltd.'
  },
  {
    date: '2023/10/10',
    currency: 'CNY',
    income: '0.00',
    expense: '19.90',
    balance: '56,501.74',
    summary: 'Pago Rápido',
    counterparty: '1572850671 Youhui Tequan',
    customerAbstract: 'Tenpay - Youhui Tequan'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '97.59',
    balance: '56,404.15',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1238342501 Comerciante JD.com',
    customerAbstract: 'Tenpay - Pago WeChat - Comerciante JD.com'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '200.00',
    balance: '56,204.15',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '5,000.00',
    balance: '51,204.15',
    summary: 'Transferencia',
    counterparty: '6214832134213763 MUJAHIDUL HOSSAIN',
    customerAbstract: 'Transferencia'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '5,000.00',
    balance: '46,204.15',
    summary: 'Transferencia',
    counterparty: '6216690800006468544 Hu Tai',
    customerAbstract: 'NonResident+Transferencia'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '5,000.00',
    expense: '0.00',
    balance: '51,204.15',
    summary: 'Reembolso Transferencia',
    counterparty: '6216690800006468544 Hu Tai',
    customerAbstract: 'NonResident+Transferencia'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '5,000.00',
    balance: '46,204.15',
    summary: 'Transferencia',
    counterparty: '6216690800006468544 HOSSAIN MUJAHIDUL',
    customerAbstract: 'NonResident+Transferencia'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '20.00',
    balance: '46,184.15',
    summary: 'Pago Rápido',
    counterparty: '459070535 Traditional Beef Noodles',
    customerAbstract: 'Tenpay - Traditional Beef Noodles'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '15.80',
    balance: '46,168.35',
    summary: 'Pago Rápido',
    counterparty: '1611788718 Luckin Coffee',
    customerAbstract: 'Tenpay - Luckin Coffee'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '60.70',
    balance: '46,107.65',
    summary: 'Pago Rápido UnionPay',
    counterparty: '160930560 HotMaxx',
    customerAbstract: 'Tenpay - Pago WeChat - HotMaxx'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '44.70',
    balance: '46,062.95',
    summary: 'Pago Rápido',
    counterparty: '1520510501 Taco Bell',
    customerAbstract: 'Tenpay - Taco Bell'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '30.00',
    balance: '46,032.95',
    summary: 'Pago Rápido',
    counterparty: '8750573 Shanghai Public Transport Card',
    customerAbstract: 'Alipay - Shanghai Public Transport Card Co., Ltd.'
  },
  {
    date: '2023/10/11',
    currency: 'CNY',
    income: '0.00',
    expense: '155.00',
    balance: '45,877.95',
    summary: 'Pago Rápido',
    counterparty: '460527691 UnionPay',
    customerAbstract: 'Tenpay - UnionPay'
  },
  {
    date: '2023/10/12',
    currency: 'CNY',
    income: '0.00',
    expense: '40.90',
    balance: '45,837.05',
    summary: 'Pago Rápido',
    counterparty: '1635868379 Chen Xianggui',
    customerAbstract: 'Tenpay - Chen Xianggui'
  },
  {
    date: '2023/10/12',
    currency: 'CNY',
    income: '0.00',
    expense: '50.00',
    balance: '45,787.05',
    summary: 'Pago Rápido',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Transferencia WeChat'
  },
  {
    date: '2023/10/12',
    currency: 'CNY',
    income: '0.00',
    expense: '22.00',
    balance: '45,765.05',
    summary: 'Pago Rápido',
    counterparty: '1443736002 KFC',
    customerAbstract: 'Tenpay - KFC'
  },
  {
    date: '2023/10/13',
    currency: 'CNY',
    income: '0.00',
    expense: '299.00',
    balance: '45,466.05',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1000050001 Transferencia WeChat',
    customerAbstract: 'Tenpay - Pago WeChat - Transferencia'
  },
  {
    date: '2023/10/13',
    currency: 'CNY',
    income: '0.00',
    expense: '8.00',
    balance: '45,458.05',
    summary: 'Pago Rápido',
    counterparty: '1632206432 Pizza Hut',
    customerAbstract: 'Tenpay - Pizza Hut'
  },
  {
    date: '2023/10/13',
    currency: 'CNY',
    income: '0.00',
    expense: '12.00',
    balance: '45,446.05',
    summary: 'Pago Rápido UnionPay',
    counterparty: '1632206432 Pizza Hut',
    customerAbstract: 'Tenpay - Pago WeChat - Pizza Hut'
  }
];

export function StatementView() {
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
            
            {/* Header Section - Only on First Page */}
            {page.isFirst && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold text-xs">CMB</div>
                        <div>
                           <h1 className="text-xl font-bold text-[#1f2937] tracking-wide">CHINA MERCHANTS BANK</h1>
                           <div className="text-[8px] text-[#6b7280] tracking-wider">BANCO DE COMERCIANTES DE CHINA</div>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="border-2 border-[#dc2626] rounded-full w-24 h-24 flex items-center justify-center rotate-[-15deg] opacity-80 absolute top-10 right-10 pointer-events-none print:opacity-80">
                        <div className="text-center text-[#dc2626] font-bold text-[8px] leading-none">
                          <div>CHINA MERCHANTS</div>
                          <div>BANK CO., LTD.</div>
                          <div className="my-1 text-[10px]">业务专用章</div>
                          <div>(Sello Especial)</div>
                          <div>673RM2C2</div>
                        </div>
                     </div>
                     <div className="border border-[#d1d5db] px-2 py-1 inline-block text-[10px] mt-2">
                        Documento Electrónico
                     </div>
                  </div>
                </div>

                <h2 className="text-center text-lg font-bold mb-8 border-b pb-4 border-[#e5e7eb]">
                  DETALLE HISTÓRICO DE TRANSACCIONES DE CUENTA
                </h2>

                {/* Account Details Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-[10px]">
                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">Fecha:</span>
                      <span className="font-medium">2024/03/21 15:12:51</span>
                   </div>
                   <div className="flex">
                      <span className="w-32 text-[#4b5563]">Sucursal de Aceptación:</span>
                      <span className="font-medium">Zona Franca de Shanghái Lingang</span>
                   </div>

                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">Nombre:</span>
                      <span className="font-medium">MUJAHIDUL HOSSAIN</span>
                   </div>
                   <div className="flex">
                      <span className="w-32 text-[#4b5563]">Tipo de Comprobante:</span>
                      <span className="font-medium">Tarjeta IC UnionPay Golden Sunflower</span>
                   </div>

                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">Tipo de Consulta:</span>
                      <span className="font-medium">Historial de Cuenta</span>
                   </div>
                   <div className="flex">
                      <span className="w-32 text-[#4b5563]">Tipo de Cuenta:</span>
                      <span className="font-medium">Multidivisa</span>
                   </div>

                   <div className="flex">
                      <span className="w-24 text-[#4b5563]">Cód. Verificación:</span>
                      <span className="font-medium">673RM2C2</span>
                   </div>
                   <div className="flex">
                      <span className="w-32 text-[#4b5563]">Sucursal de Apertura:</span>
                      <span className="font-medium">Sucursal Shanghai Jinqiao</span>
                   </div>

                   <div className="col-span-1 flex"></div>
                   <div className="flex">
                      <span className="w-32 text-[#4b5563]">Número de Cuenta:</span>
                      <span className="font-medium">6214860214983062</span>
                   </div>

                   <div className="col-span-1"></div>
                   <div className="flex">
                      <span className="w-32 text-[#4b5563]">Periodo de Transacción:</span>
                      <span className="font-medium">2023/09/19 - 2024/03/21</span>
                   </div>
                </div>
              </>
            )}

            {/* Transactions Table */}
            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b border-t border-black text-[9px]">
                  <th className="py-1 font-medium w-20">Fecha</th>
                  <th className="py-1 font-medium w-10">Moneda</th>
                  <th className="py-1 font-medium text-right w-20">Ingresos</th>
                  <th className="py-1 font-medium text-right w-20">Egresos</th>
                  <th className="py-1 font-medium text-right w-24">Saldo</th>
                  <th className="py-1 font-medium pl-4 w-24">Resumen</th>
                  <th className="py-1 font-medium w-40">Info. Contraparte</th>
                  <th className="py-1 font-medium">Resumen del Cliente</th>
                </tr>
              </thead>
              <tbody className="text-[9px]">
                {page.transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] print:hover:bg-transparent">
                    <td className="py-1 align-top">{tx.date}</td>
                    <td className="py-1 align-top">{tx.currency}</td>
                    <td className="py-1 align-top text-right">{tx.income !== '0.00' ? tx.income : '0.00'}</td>
                    <td className="py-1 align-top text-right">{tx.expense !== '0.00' ? tx.expense : '0.00'}</td>
                    <td className="py-1 align-top text-right">{tx.balance}</td>
                    <td className="py-1 align-top pl-4">{tx.summary}</td>
                    <td className="py-1 align-top pr-2 text-[#4b5563] break-words whitespace-normal leading-tight">{tx.counterparty}</td>
                    <td className="py-1 align-top text-[#4b5563] break-words whitespace-normal leading-tight">{tx.customerAbstract}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-auto pt-8 flex justify-between text-[9px] text-[#6b7280]">
               <div>Usuario: 037706</div>
               <div>Página: {page.pageNum} de {totalPages}</div>
               <div></div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
