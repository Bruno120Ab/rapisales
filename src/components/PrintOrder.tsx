import { Order } from "@/app/database";

const printCountMap: Record<string, number> = {};


export const printThermalOrderForDelivery = (order: Order) => {
  // Contagem de impressões
  if (!printCountMap[order.id]) {
    printCountMap[order.id] = 1;
  } else {
    printCountMap[order.id] += 1;
  }

  const currentPrintNumber = printCountMap[order.id];
  const isFirstPrint = currentPrintNumber === 1 ? 'Sim' : 'Não';

  // Abrir janela de impressão
  const printWindow = window.open('', '', 'width=350,height=800');
  if (!printWindow) return;

  const printDate = new Date();
  const formattedDate = printDate.toLocaleString('pt-BR');

  // Informações do cliente
  const clientInfo = `
Cliente: ${order.customer}
Mesa: ${order.table}
Garçom: ${order.waiter}
Observações: ${order.notes || '-'}
`;

  // Produtos detalhados
  const itemsLines = order.items.map(item => {
    const itemTotal = item.price * item.quantity;
    return `${item.name.padEnd(20)} | Qtd: ${String(item.quantity).padStart(2)} | Unit: R$${item.price.toFixed(2).padStart(6)} | Total: R$${itemTotal.toFixed(2).padStart(6)}`;
  }).join('\n');

  // Totais
  const total = order.total;

  printWindow.document.write(`
<html>
<head>
<title>Pedido #${order.id.slice(0,8)}</title>
<style>
  body { font-family: monospace; padding: 5px; font-size: 12px; line-height: 1.3; white-space: pre-wrap; }
  h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
  hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
</style>
</head>
<body>
<div class="center bold">Pedido #${currentPrintNumber}</div>
<hr/>
<div>${clientInfo}</div>
<hr/>
${itemsLines}
<hr/>
<div class="right bold">TOTAL: R$ ${total.toFixed(2)}</div>
<hr/>
<div>Impresso em: ${formattedDate}</div>
<div>Primeira impressão: ${isFirstPrint}</div>
<hr/>
<div class="center bold">RapiDelivery</div>
</body>
</html>
  `);

  printWindow.document.close();
  printWindow.print();
};