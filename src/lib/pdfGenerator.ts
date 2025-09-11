import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './formatters';

export interface CarneData {
  creditorId: number;
  creditorName: string;
  customerName: string;
  totalAmount: number;
  installments: number;
  installmentValue: number;
  dueDate: Date;
  saleId?: number;
  items?: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export interface CarneInstallment {
  id?: number;
  creditorId: number;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paid: boolean;
  paidAt?: Date;
  createdAt: Date;
}

export class PDFGenerator {
  
  // static generateCarne(carneData: CarneData): string {
  //   const doc = new jsPDF();
  //   const pageHeight = doc.internal.pageSize.height;
    
  //   // Configurações
  //   const margin = 20;
  //   const carneHeight = 80;
  //   const carnePorPagina = Math.floor((pageHeight - margin * 2) / carneHeight);
    
  //   // Título
  //   doc.setFontSize(18);
  //   doc.text('CARNÊ DE PAGAMENTO', 105, 20, { align: 'center' });
    
  //   let currentY = 40;
  //   let currentPage = 1;
    
  //   for (let i = 1; i <= carneData.installments; i++) {
  //     if (i > 1 && (i - 1) % carnePorPagina === 0) {
  //       doc.addPage();
  //       currentY = 20;
  //       currentPage++;
  //     }
      
  //     const installmentDueDate = new Date(carneData.dueDate);
  //     installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));
      
  //     this.drawCarneInstallment(doc, currentY, {
  //       installmentNumber: i,
  //       totalInstallments: carneData.installments,
  //       creditorName: carneData.creditorName,
  //       customerName: carneData.customerName,
  //       amount: carneData.installmentValue,
  //       dueDate: installmentDueDate,
  //       totalAmount: carneData.totalAmount
  //     });
      
  //     currentY += carneHeight + 10;
  //   }
    
  //   return doc.output('datauristring');
  // }
  
// static generateCarne(carneData: CarneData): string {
//   const doc = new jsPDF();
//   const pageHeight = doc.internal.pageSize.height;

//   // Configurações
//   const margin = 20;
//   const installmentHeight = 120;  // altura de UM quadrado
//   const spacing = 25;             // espaço entre quadrados
//   const totalParcelaHeight = installmentHeight * 2 + spacing; // 2 vias + corte

//   const parcelasPorPagina = Math.floor((pageHeight - margin * 2) / totalParcelaHeight);

//   // Título
//   doc.setFontSize(18);
//   doc.text('CARNÊ DE PAGAMENTO', 105, 20, { align: 'center' });

//   let currentY = 40;

//   for (let i = 1; i <= carneData.installments; i++) {
//     // Quebra de página
//     if (i > 1 && (i - 1) % parcelasPorPagina === 0) {
//       doc.addPage();
//       currentY = 20;
//     }

//     // Calcula vencimento da parcela
//     const installmentDueDate = new Date(carneData.dueDate);
//     installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));

//     // Desenha parcela (2 vias)
//     this.drawCarneInstallment(doc, currentY, {
//       installmentNumber: i,
//       totalInstallments: carneData.installments,
//       creditorName: carneData.creditorName,
//       customerName: carneData.customerName,
//       amount: carneData.installmentValue,
//       dueDate: installmentDueDate,
//       totalAmount: carneData.totalAmount
//     });

//     // Avança Y só pelo tamanho real da parcela
//     currentY += totalParcelaHeight;
//   }

//   return doc.output('datauristring');
// }

static generateSaleReport(saleData: {
  saleId: number;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  installments?: number;
  discount: number;
  createdAt: Date;
  seller: string;
}): string {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text('COMPROVANTE DE VENDA', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Venda Nº: ${saleData.saleId}`, 20, 40);
  doc.text(`Data: ${formatDate(saleData.createdAt)}`, 20, 50);
  doc.text(`Cliente: ${saleData.customerName}`, 20, 60);
  doc.text(`Vendedor: ${saleData.seller}`, 20, 70);
  
  // Linha separadora
  doc.line(20, 80, 190, 80);
  
  // Itens
  doc.setFontSize(14);
  doc.text('ITENS DA VENDA', 20, 95);
  
  doc.setFontSize(10);
  doc.text('Produto', 20, 110);
  doc.text('Qtd', 120, 110);
  doc.text('Valor Unit.', 140, 110);
  doc.text('Total', 170, 110);
  
  doc.line(20, 115, 190, 115);
  
  let currentY = 125;
  saleData.items.forEach((item) => {
    doc.text(item.productName, 20, currentY);
    doc.text(item.quantity.toString(), 120, currentY);
    doc.text(formatCurrency(item.price), 140, currentY);
    doc.text(formatCurrency(item.quantity * item.price), 170, currentY);
    currentY += 10;
  });
  
  // Totais
  currentY += 10;
  doc.line(20, currentY, 190, currentY);
  currentY += 10;
  
  if (saleData.discount > 0) {
    doc.text(`Desconto: ${formatCurrency(saleData.discount)}`, 120, currentY);
    currentY += 10;
  }
  
  doc.setFontSize(12);
  doc.text(`TOTAL: ${formatCurrency(saleData.total)}`, 120, currentY);
  currentY += 10;
  doc.text(`Forma de Pagamento: ${saleData.paymentMethod.toUpperCase()}`, 120, currentY);
  
  if (saleData.installments && saleData.installments > 1) {
    currentY += 10;
    doc.text(`Parcelas: ${saleData.installments}x`, 120, currentY);
    
    currentY += 20;
    doc.setFontSize(10);
    doc.text('* Esta venda foi parcelada. Carnês gerados separadamente.', 20, currentY);
  }
  
  return doc.output('datauristring');
}

// private static drawCarneInstallment(
//   doc: jsPDF,
//   y: number,
//   data: {
//     installmentNumber: number;
//     totalInstallments: number;
//     creditorName: string;
//     customerName: string;
//     amount: number;
//     dueDate: Date;
//     totalAmount: number;
//   }
// ) {
//   const x = 20;
//   const width = 170;
//   const height = 120; // altura de cada quadrado
//   const spacing = 25;  // espaço entre quadrados
//   const padding = 8;   // padding interno

//   // Identificador único
//   const uniqueId = `PARC-${data.installmentNumber}/${data.totalInstallments}-${Math.random()
//     .toString(36)
//     .substring(2, 7)
//     .toUpperCase()}`;

//   // Função para desenhar cada quadrado (via)
//   const drawVia = (offsetY: number, title: string, assinatura: string) => {
//     // Retângulo principal
//     doc.setDrawColor(0);
//     doc.rect(x, offsetY, width, height);

//     // Cabeçalho sombreado
//     doc.setFillColor(230, 230, 230);
//     doc.rect(x, offsetY, width, 18, 'F'); // cabeçalho preenchido
//     doc.setFontSize(11);
//     doc.setTextColor(0);
//     doc.text(`${title} - Parcela ${data.installmentNumber}/${data.totalInstallments}`, x + padding, offsetY + 12);

//     doc.setFontSize(9);
//     doc.text(`Vencimento: ${formatDate(data.dueDate)}`, x + width - 60, offsetY + 12);

//     // Caixa de Cliente
//     const clientBoxY = offsetY + 20;
//     doc.setDrawColor(150);
//     doc.rect(x + padding, clientBoxY, width - 2 * padding, 25);
//     doc.setFontSize(10);
//     doc.text(`Cliente: ${data.customerName}`, x + padding + 3, clientBoxY + 10);

//     // Caixa de Credor
//     const creditorBoxY = clientBoxY + 28;
//     doc.rect(x + padding, creditorBoxY, width - 2 * padding, 25);
//     doc.text(`Credor: ${data.creditorName}`, x + padding + 3, creditorBoxY + 10);

//     // Valores destacados
//     const valuesY = creditorBoxY + 33;
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'bold');
//     doc.text(`Valor: ${formatCurrency(data.amount)}`, x + padding, valuesY);
//     doc.text(`Total: ${formatCurrency(data.totalAmount)}`, x + width - 60, valuesY);
//     doc.setFont(undefined, 'normal');

//     // ID único
//     const idY = valuesY + 12;
//     doc.setFontSize(8);
//     doc.text(`ID: ${uniqueId}`, x + padding, idY);

//     // Linha de assinatura
//     const signY = offsetY + height - 25;
//     doc.line(x + padding, signY, x + width - padding, signY);
//     doc.setFontSize(8);
//     doc.text(`Assinatura do ${assinatura}`, x + padding + 5, signY + 7);

//     // Observação
//     doc.setFontSize(7);
//     doc.text("Guarde este comprovante.", x + padding, offsetY + height - 5);
//   };

//   // Via do Cliente
//   drawVia(y, "Via do Cliente", "Credor");

//   // Linha pontilhada de corte
//   doc.setLineDashPattern([2, 2], 0);
//   doc.line(x, y + height + spacing / 2, x + width, y + height + spacing / 2);
//   doc.setLineDashPattern([], 0);

//   // Via do Credor
//   drawVia(y + height + spacing, "Via do Credor", "Cliente");
// }
static generateCarne(carneData: CarneData): string {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;

  const margin = 20;
  const tituloHeight = 20;

  // Título
  doc.setFontSize(18);
  doc.text('CARNÊ DE PAGAMENTO', 105, tituloHeight, { align: 'center' });

  let currentY = tituloHeight + 20;

  for (let i = 1; i <= carneData.installments; i++) {
    // Calcula vencimento da parcela
    const installmentDueDate = new Date(carneData.dueDate);
    installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));

    // Desenha parcela (2 vias) e pega altura usada
    const usedHeight = this.drawCarneInstallment(doc, currentY, {
      installmentNumber: i,
      totalInstallments: carneData.installments,
      creditorName: carneData.creditorName,
      customerName: carneData.customerName,
      amount: carneData.installmentValue,
      dueDate: installmentDueDate,
      totalAmount: carneData.totalAmount
    });

    currentY += usedHeight + 10;

    // Se não couber na página, quebra
    if (currentY + usedHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
  }

  return doc.output('datauristring');
}

private static drawCarneInstallment(
  doc: jsPDF,
  y: number,
  data: {
    installmentNumber: number;
    totalInstallments: number;
    creditorName: string;   // Estabelecimento
    customerName: string;
    amount: number;
    dueDate: Date;
    totalAmount: number;
    seller?: string;        // Novo campo opcional
  }
): number {
  const x = 20;
  const width = 170;
  const height = 120; // altura de cada via
  const spacing = 25; // corte
  const padding = 8;

  const uniqueId = `PARC-${data.installmentNumber}/${data.totalInstallments}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;

  const drawVia = (offsetY: number, title: string, assinatura: string) => {
    doc.setDrawColor(0);
    doc.rect(x, offsetY, width, height);

    // Cabeçalho sombreado
    doc.setFillColor(230, 230, 230);
    doc.rect(x, offsetY, width, 18, 'F');
    doc.setFontSize(11);
    doc.text(
      `${title} - Parcela ${data.installmentNumber}/${data.totalInstallments}`,
      x + padding,
      offsetY + 12
    );

    doc.setFontSize(9);
    doc.text(`Vencimento: ${formatDate(data.dueDate)}`, x + width - 60, offsetY + 12);

    // Estabelecimento e Vendedor
    const infoY = offsetY + 20;
    doc.setFontSize(9);
    doc.text(`Estabelecimento: ${data.creditorName}`, x + padding, infoY);
    if (data.seller) {
      doc.text(`Vendedor: ${data.seller}`, x + width - 70, infoY);
    }

    // Caixa de Cliente
    const clientBoxY = infoY + 8;
    doc.setDrawColor(150);
    doc.rect(x + padding, clientBoxY, width - 2 * padding, 25);
    doc.setFontSize(10);
    doc.text(`Cliente: ${data.customerName}`, x + padding + 3, clientBoxY + 10);

    // Valores destacados
    const valuesY = clientBoxY + 40;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Valor: ${formatCurrency(data.amount)}`, x + padding, valuesY);
    doc.text(`Total: ${formatCurrency(data.totalAmount)}`, x + width - 60, valuesY);
    doc.setFont(undefined, 'normal');

    // ID único
    const idY = valuesY + 12;
    doc.setFontSize(8);
    doc.text(`ID: ${uniqueId}`, x + padding, idY);

    // Linha de assinatura
    const signY = offsetY + height - 25;
    doc.line(x + padding, signY, x + width - padding, signY);
    doc.setFontSize(8);
    doc.text(`Assinatura do ${assinatura}`, x + padding + 5, signY + 7);

    // Observação
    doc.setFontSize(7);
    doc.text("Guarde este comprovante.", x + padding, offsetY + height - 5);
  };

  // Via do Cliente
  drawVia(y, "Via do Cliente", "Credor");

  // Linha pontilhada
  doc.setLineDashPattern([2, 2], 0);
  doc.line(x, y + height + spacing / 2, x + width, y + height + spacing / 2);
  doc.setLineDashPattern([], 0);

  // Via do Credor
  drawVia(y + height + spacing, "Via do Credor", "Cliente");

  return height * 2 + spacing;
}


 // private static drawCarneInstallment(
  //   doc: jsPDF, 
  //   y: number, 
  //   data: {
  //     installmentNumber: number;
  //     totalInstallments: number;
  //     creditorName: string;
  //     customerName: string;
  //     amount: number;
  //     dueDate: Date;
  //     totalAmount: number;
  //   }
  // ) {
  //   const x = 20;
  //   const width = 170;
  //   const height = 70;
    
  //   // Borda do carnê
  //   doc.rect(x, y, width, height);
  //   doc.line(x, y + 20, x + width, y + 20); // Linha do cabeçalho
    
  //   // Cabeçalho
  //   doc.setFontSize(12);

  //   doc.text(`PARCELA ${data.installmentNumber}/${data.totalInstallments}`, x + 5, y + 15);
  //   doc.text(`Vencimento: ${formatDate(data.dueDate)}`, x + width - 60, y + 15);
    
  //   // Dados do cliente
  //   doc.setFontSize(10);
  //   doc.text(`Cliente: ${data.customerName}`, x + 5, y + 35);
  //   doc.text(`Credor: ${data.creditorName}`, x + 5, y + 45);
    
  //   // Valor
  //   doc.setFontSize(14);
  //   doc.text(`Valor: ${formatCurrency(data.amount)}`, x + 5, y + 60);
  //   doc.text(`Total: ${formatCurrency(data.totalAmount)}`, x + width - 60, y + 60);
    
  //   // Linha pontilhada para destacar
  //   doc.setLineDashPattern([2, 2], 0);
  //   doc.line(x, y + height + 5, x + width, y + height + 5);
  //   doc.setLineDashPattern([], 0);
  // }


}