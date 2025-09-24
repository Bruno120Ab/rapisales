import { Order } from "@/hooks/useOrders";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";

// Exemplo de entregador definido manualmente
const motoStatus = {
  online: true, // ou false se estiver indisponível
  name: "Allysson"
};

function callMoto(order: Order) {
  if (!order.customer?.phone) return;

  // Número do entregador (ex: WhatsApp com DDI + DDD)
  const motoNumber = "71999099688";

  // Lista os itens do pedido, se houver
  const items = order.order_items?.map(i => `${i.quantity}x ${i.product.name}`).join("\n") || "Nenhum item listado";

  // Mensagem para o entregador
  const message = `
🚀 Novo pedido para entrega!

Cliente: ${order.customer.name || "Sem nome"}
Telefone: ${order.customer.phone}
Endereço: ${order.delivery_address}

Itens do pedido:
${items}

Observações: ${order.observations || "Nenhuma"}

Total: R$ ${order.total_amount.toFixed(2)}
Taxa de entrega: R$ ${order.delivery_fee.toFixed(2)}
Forma de pagamento: ${order.payment_method}
  `;

  const encodedMessage = encodeURIComponent(message);

  // Abre o WhatsApp
  window.open(`https://wa.me/${motoNumber}?text=${encodedMessage}`, "_blank");
}

export const MotoButtonExample = ({ order }: { order: Order }) => {
  const motoStatus = {
    online: true,
    name: "Allysson",
  };
  const isAvailable = motoStatus.online;

  const handleCallMoto = () => {
    if (!order.customer?.phone) return;
    if (!isAvailable) return;

    // Pergunta quanto vai pagar pela viagem
    const deliveryFee = prompt("Quanto você vai pagar pela viagem?", "0");
    if (deliveryFee === null) return; // usuário cancelou

    // Monta a mensagem para o entregador
    const items = order.order_items?.map(i => `${i.quantity}x ${i.product.name}`).join("\n") || "Nenhum item listado";
    const message = `
🚀 Novo pedido para entrega! (RapiEntregador Oficial)

Cliente: ${order.customer.name || "Sem nome"}
Telefone: ${order.customer.phone}
Endereço: ${order.delivery_address}

Itens do pedido:
${items}

Observações: ${order.observations || "Nenhuma"}

Valor pago pela viagem: R$ ${deliveryFee}
Total: R$ ${order.total_amount.toFixed(2)}
Forma de pagamento: ${order.payment_method}

⚡ Enviado via WhatsApp
    `;

    const encodedMessage = encodeURIComponent(message);
    const motoNumber = "5511999999999"; // número do entregador
    window.open(`https://wa.me/${motoNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Button
      size="sm"
      className={`
        ${isAvailable ? "bg-gradient-to-r from-green-400 via-teal-500 to-green-600 border border-teal-600" : "bg-red-500 border-red-600"}
        text-white
        backdrop-blur-md
        rounded-2xl
        disabled:opacity-50
        flex flex-col items-center justify-center
        px-5 py-3 shadow-lg
        hover:scale-105 transition-transform duration-200
      `}
      onClick={handleCallMoto}
      disabled={!order.customer?.phone || !isAvailable}
    >
      <div className="flex items-center font-bold text-sm sm:text-base">
        <Phone className="h-5 w-5 mr-2" />
        {isAvailable ? `Chamar entregador` : "Entregador indisponível"}
      </div>
      {/* {isAvailable && (
        <span className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">
          Abrirá no WhatsApp
        </span>
      )} */}
    </Button>
  );
};
