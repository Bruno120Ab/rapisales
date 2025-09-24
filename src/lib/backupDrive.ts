import { toast } from "sonner";
import { db } from "./database";


// export const sendBackupToDriveupToDrive = async () => {
//   try {
//     console.log("Iniciando backup...");

//     // Aqui você pega todos os dados do seu banco (exemplo usando IndexedDB/Dexie)
//     const products = await db.products.toArray();
//     const sales = await db.sales.toArray();
//     const stockMovements = await db.stockMovements.toArray();

//     const data = {
//       products,
//       sales,
//       stockMovements,
//       exportedAt: new Date().toISOString()
//     };
//     try {
//     // const scriptUrl = 'https://script.google.com/macros/s/AKfycbx5Afz8L0CaEqtei4DMqUciNpVd57s_NArlGz6PmwvhFlw42J7qW215ARNbl_aNJWCn/exec';

//     // const response = await fetch(scriptUrl, {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify(data)
//     // });

    
//     // const result = await response.json();

//     // if (result.status === 'success') {
//     //   console.log('Backup enviado para o Drive com sucesso!', result.fileName);
//     // } else {
//     //   console.error('Erro ao enviar backup:', result.message);
//     // }
//     const products = await db.products.toArray();
//   const sales = await db.sales.toArray();
//   const stockMovements = await db.stockMovements.toArray();

//   const data = {
//     products,
//     sales,
//     stockMovements,
//     exportedAt: new Date().toISOString()
//   };

//   const form = document.createElement('form');
//   form.method = 'POST';
//   form.action = 'https://script.google.com/macros/s/AKfycbx5Afz8L0CaEqtei4DMqUciNpVd57s_NArlGz6PmwvhFlw42J7qW215ARNbl_aNJWCn/exec';
//   form.target = '_blank'; // abre em nova aba (opcional)
  
//   // Adiciona os dados do backup
//   const input = document.createElement('input');
//   input.type = 'hidden';
//   input.name = 'payload';
//   input.value = JSON.stringify(data);
  
//   form.appendChild(input);
//   document.body.appendChild(form);
  
//   // Envia o formulário
//   form.submit();
  
//   // Remove o formulário da página
//   document.body.removeChild(form);
//   } catch (error) {
//     console.error('Erro ao conectar com Apps Script:', error);
//   }

//     // Cria arquivo JSON
//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `backup-pdv-${new Date().toISOString().split("T")[0]}.json`;
//     a.click();
//     URL.revokeObjectURL(url);

//     console.log("Backup realizado com sucesso!");
//   } catch (error) {
//     console.error("Erro ao realizar backup:", error);
//   }

  
// };


export const sendBackupToDriveAndLocal = async () => {
  try {
    console.log("=== Iniciando backup ===");

    // 1️⃣ Pega os dados do banco
    // console.log("Buscando dados do banco...");
    // const products = await db.products.toArray();
    // console.log(`Produtos encontrados: ${products.length}`);
    // const sales = await db.sales.toArray();
    // console.log(`Vendas encontradas: ${sales.length}`);
    // const stockMovements = await db.stockMovements.toArray();
    // console.log(`Movimentos de estoque encontrados: ${stockMovements.length}`);
    const products = await db.products.toArray();
    const sales = await db.sales.toArray();
    const stockMovements = await db.stockMovements.toArray();
    const users = await db.users.toArray();
    const customers = await db.customers.toArray();
    const creditors = await db.creditors.toArray();
    const creditSales = await db.creditSales.toArray();
    const returns = await db.returns.toArray();
    const expenses = await db.expenses.toArray();
    const exchanges = await db.exchanges.toArray();

    const data = {
      products,
      sales,
      stockMovements,
      users,
      customers,
      creditors,
      creditSales,
      returns,
      expenses,
      exchanges,
      exportedAt: new Date().toISOString()
    };

    console.log("Dados compilados para backup:", data);

    // 2️⃣ Envio para Apps Script via formulário (resolve CORS)
    try {
      console.log("Criando formulário invisível para envio ao Apps Script...");

  const iframe = document.createElement("iframe");
  iframe.name = "hidden_iframe"; // importante dar o nome antes de setar no form
  iframe.style.display = "none";
  document.body.appendChild(iframe);


// Cria o formulário apontando para o iframe
  const form = document.createElement("form");
  form.method = "POST";
  form.target = iframe.name = "hidden_iframe";

  // Adiciona os dados
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "payload";
  input.value = JSON.stringify(data);
  form.appendChild(input);

  // Insere e envia
  document.body.appendChild(form);
  console.log("Formulário pronto, submetendo...");
  form.submit();
  console.log("Formulário submetido!");

  // Remove o form após envio
  document.body.removeChild(form);
  console.log("Formulário removido do DOM.");

  // Remove o iframe depois de um tempo para garantir que o request foi enviado
  setTimeout(() => {
    document.body.removeChild(iframe);
    console.log("Iframe removido do DOM.");
  }, 5000);

    } catch (err) {
      console.error("Erro ao criar/enviar formulário para o Drive:", err);
    }

    // 3️⃣ Backup local
    try {
      console.log("Criando backup local...");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date();
      const date = now.toISOString().split("T")[0]; // "2025-09-13"
      const pdvName = "MinhaLoja"; // substitua pelo nome do PDV
      a.download = `Backup_${pdvName}-${date}.json`;

      console.log("Disparando download do backup local...");
      a.click();
      console.log("Download disparado!");

      URL.revokeObjectURL(url);
      console.log("URL do blob revogada.");

      console.log("Backup local realizado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar backup local:", err);
    }

    console.log("=== Backup finalizado ===");
  } catch (error) {
    console.error("Erro inesperado ao realizar backup:", error);
  }
};
