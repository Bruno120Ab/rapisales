import Dexie, { Table } from 'dexie';
export interface Expense {
  id?: number;
  supplier: string;       // Nome do fornecedor
  description: string;    // Descrição da despesa
  category?: string;      // Categoria, ex: "Ração", "Serviço", "Outros"
  amount: number;         // Valor da despesa
  dueDate: Date;          // Data de vencimento
  paid: boolean;          // Status de pagamento
  createdAt: Date;
}
export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  description?: string;
  supplier?: string;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id?: number;
  items: SaleItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix' | 'crediario';
  discount: number;
  createdAt: Date;
  customerId?: number;
  installments?: number;
  installmentValue?: number;
  userId: number;
}

export interface User {
  id?: number;
  username: string;
  password: string;
  role: 'admin' | 'vendedor' | 'estoquista' | 'estagiario'; // permissões
  createdAt: Date;
}

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  cpf?: string;
  createdAt: Date;
}

export interface Creditor {
  id?: number;
  customerId: number;
  customerName: string;
  totalDebt: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  description: string;
  status: 'pendente' | 'pago' | 'atrasado';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditSale {
  id?: number;
  saleId: number;
  creditorId: number;
  installmentNumber: number;
  installmentValue: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pendente' | 'pago' | 'atrasado';
  createdAt: Date;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface StockMovement {
  id?: number;
  productId: number;
  productName: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  createdAt: Date;
}

export interface Return {
  id?: number;
  saleId: number;
  items: ReturnItem[];
  type: 'devolucao' | 'troca';
  reason: string;
  totalRefund: number;
  status: 'pendente' | 'processada' | 'cancelada';
  createdAt: Date;
  processedAt?: Date;
  userId: number;
  customerId?: number;
}

export interface ReturnItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  condition: 'nova' | 'usada' | 'danificada';
}

export interface Exchange {
  id?: number;
  originalSaleId: number;
  newSaleId?: number;
  returnedItems: ReturnItem[];
  newItems: SaleItem[];
  reason: string;
  status: 'pendente' | 'processada' | 'cancelada';
  createdAt: Date;
  processedAt?: Date;
  userId: number;
  customerId?: number;
}

export class PDVDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  stockMovements!: Table<StockMovement>;
  users!: Table<User>;
  customers!: Table<Customer>;
  creditors!: Table<Creditor>;
  creditSales!: Table<CreditSale>;
  returns!: Table<Return>;
  expenses!: Table<Expense>;
  exchanges!: Table<Exchange>;

  constructor() {
    super('PDVDatabase');
    this.version(3).stores({
      products: '++id, name, category, barcode, stock, minStock',
      sales: '++id, createdAt, total, userId, customerId',
      stockMovements: '++id, productId, type, createdAt',
      users: '++id, username, role',
      customers: '++id, name, phone, cpf',
      creditors: '++id, customerId, status, dueDate',
      creditSales: '++id, saleId, creditorId, dueDate, status',
      returns: '++id, saleId, type, status, createdAt, userId',
      exchanges: '++id, originalSaleId, status, createdAt, userId',
      expenses: '++id, supplier, dueDate, paid, category, amount' // ← aqui

    });
  }
}

export const db = new PDVDatabase();

// Seed initial data
export const seedDatabase = async () => {
  const productCount = await db.products.count();
  const userCount = await db.users.count();
  
  // Seed users
  if (userCount === 0 || userCount !== 0 ) {
    const initialUsers: Omit<User, 'id'>[] = [
      {
        username: 'admin',
        password: 'admin123', // Em produção, usar hash
        role: 'admin',
        createdAt: new Date()
      },
      {
        username: 'estagiario',
        password: 'estagiario123', // Em produção, usar hash
        role: 'estagiario',
        createdAt: new Date()
      },
       {
        username: 'Dev',
        password: 'Dev123', // Em produção, usar hash
        role: 'admin',
        createdAt: new Date()
      },
      {
        username: 'Funcionario',
        password: 'Funcionario123', // Em produção, usar hash
        role: 'estoquista',
        createdAt: new Date()
      }
    ];
    await db.users.bulkAdd(initialUsers);
  }
  
  if (productCount === 0) {
    const initialProducts: Omit<Product, 'id'>[] = [
      {
        name: 'Camiseta Estampada Tropical',
        price: 59.90,
        stock: 40,
        category: 'Camisetas',
        barcode: 'MODA014',
        description: 'Camiseta unissex com estampa tropical colorida',
        supplier: 'Hering',
        minStock: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Camiseta Básica Branca',
        price: 39.90,
        stock: 60,
        category: 'Camisetas',
        barcode: 'MODA015',
        description: 'Camiseta branca básica, 100% algodão',
        supplier: 'C&A',
        minStock: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Jaquetas
      {
        name: 'Jaqueta Jeans Azul',
        price: 229.90,
        stock: 12,
        category: 'Jaquetas',
        barcode: 'MODA016',
        description: 'Jaqueta jeans azul unissex',
        supplier: 'Levi’s',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jaqueta Couro Sintético Preta',
        price: 349.90,
        stock: 8,
        category: 'Jaquetas',
        barcode: 'MODA017',
        description: 'Jaqueta preta em couro sintético',
        supplier: 'Renner',
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Saias
      {
        name: 'Saia Midi Plissada',
        price: 119.90,
        stock: 14,
        category: 'Saias',
        barcode: 'MODA018',
        description: 'Saia midi plissada em poliéster rosa',
        supplier: 'Forever 21',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saia Jeans Curta',
        price: 99.90,
        stock: 18,
        category: 'Saias',
        barcode: 'MODA019',
        description: 'Saia jeans curta azul clara',
        supplier: 'Zara',
        minStock: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Shorts
      {
        name: 'Shorts Moletom Cinza',
        price: 69.90,
        stock: 25,
        category: 'Shorts',
        barcode: 'MODA020',
        description: 'Shorts unissex em moletom cinza',
        supplier: 'Adidas',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Shorts Jeans Feminino',
        price: 89.90,
        stock: 20,
        category: 'Shorts',
        barcode: 'MODA021',
        description: 'Shorts jeans feminino destroyed',
        supplier: 'Farm',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Casacos
      {
        name: 'Cardigan Bege Feminino',
        price: 139.90,
        stock: 12,
        category: 'Casacos',
        barcode: 'MODA022',
        description: 'Cardigan bege feminino em tricô',
        supplier: 'Renner',
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Moletom Canguru Preto',
        price: 159.90,
        stock: 20,
        category: 'Casacos',
        barcode: 'MODA023',
        description: 'Moletom canguru preto unissex com capuz',
        supplier: 'Nike',
        minStock: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Calçados extras
      {
        name: 'Bota Cano Curto Feminina',
        price: 229.90,
        stock: 10,
        category: 'Calçados',
        barcode: 'MODA024',
        description: 'Bota feminina de cano curto em couro sintético',
        supplier: 'Schutz',
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chinelo Slide Preto',
        price: 49.90,
        stock: 35,
        category: 'Calçados',
        barcode: 'MODA025',
        description: 'Chinelo slide preto unissex',
        supplier: 'Adidas',
        minStock: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Bolsas extras
      {
        name: 'Bolsa Tote Feminina Caramelo',
        price: 199.90,
        stock: 12,
        category: 'Bolsas',
        barcode: 'MODA026',
        description: 'Bolsa tote grande feminina cor caramelo',
        supplier: 'Arezzo',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pochete Esportiva',
        price: 79.90,
        stock: 18,
        category: 'Bolsas',
        barcode: 'MODA027',
        description: 'Pochete esportiva ajustável para corrida',
        supplier: 'Nike',
        minStock: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Acessórios extras
      {
        name: 'Relógio Analógico Masculino',
        price: 349.90,
        stock: 6,
        category: 'Acessórios',
        barcode: 'MODA028',
        description: 'Relógio de pulso masculino com pulseira de aço',
        supplier: 'Casio',
        minStock: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pulseira Couro Feminina',
        price: 49.90,
        stock: 20,
        category: 'Acessórios',
        barcode: 'MODA029',
        description: 'Pulseira feminina em couro trançado',
        supplier: 'Forever 21',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Extras diversos
      {
        name: 'Blusa Cropped Feminina',
        price: 79.90,
        stock: 22,
        category: 'Blusas',
        barcode: 'MODA030',
        description: 'Blusa cropped feminina em algodão',
        supplier: 'Zara',
        minStock: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chapéu Panamá',
        price: 119.90,
        stock: 15,
        category: 'Acessórios',
        barcode: 'MODA031',
        description: 'Chapéu estilo panamá em palha natural',
        supplier: 'Havaianas',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
     {
        name: 'Camisa Polo Azul',
        price: 79.90,
        stock: 30,
        category: 'Camisas',
        barcode: 'MODA001',
        description: 'Camisa polo azul marinho em algodão',
        supplier: 'Lacoste',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Camisa Social Branca Slim',
        price: 129.90,
        stock: 20,
        category: 'Camisas',
        barcode: 'MODA002',
        description: 'Camisa social branca slim fit para ocasiões formais',
        supplier: 'Zara',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Camiseta Básica Preta',
        price: 39.90,
        stock: 50,
        category: 'Camisetas',
        barcode: 'MODA003',
        description: 'Camiseta preta básica 100% algodão',
        supplier: 'Hering',
        minStock: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Calças
      {
        name: 'Calça Jeans Skinny Feminina',
        price: 149.90,
        stock: 25,
        category: 'Calças',
        barcode: 'MODA004',
        description: 'Calça jeans skinny feminina azul escuro',
        supplier: 'Levi’s',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Calça Social Masculina Preta',
        price: 189.90,
        stock: 15,
        category: 'Calças',
        barcode: 'MODA005',
        description: 'Calça social masculina preta clássica',
        supplier: 'Aramis',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Vestidos
      {
        name: 'Vestido Longo Floral',
        price: 199.90,
        stock: 10,
        category: 'Vestidos',
        barcode: 'MODA006',
        description: 'Vestido longo com estampa floral em viscose',
        supplier: 'Farm',
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vestido Tubinho Preto',
        price: 159.90,
        stock: 12,
        category: 'Vestidos',
        barcode: 'MODA007',
        description: 'Vestido tubinho preto clássico, ideal para noite',
        supplier: 'Renner',
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Calçados
      {
        name: 'Tênis Casual Branco',
        price: 179.90,
        stock: 20,
        category: 'Calçados',
        barcode: 'MODA008',
        description: 'Tênis branco casual unissex',
        supplier: 'Adidas',
        minStock: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sandália Rasteira Dourada',
        price: 89.90,
        stock: 18,
        category: 'Calçados',
        barcode: 'MODA009',
        description: 'Sandália rasteira feminina dourada',
        supplier: 'Arezzo',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Bolsas
      {
        name: 'Bolsa Tiracolo Couro Preto',
        price: 249.90,
        stock: 10,
        category: 'Bolsas',
        barcode: 'MODA010',
        description: 'Bolsa tiracolo em couro legítimo preta',
        supplier: 'Michael Kors',
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mochila Casual Jeans',
        price: 139.90,
        stock: 15,
        category: 'Bolsas',
        barcode: 'MODA011',
        description: 'Mochila casual em tecido jeans',
        supplier: 'Forever 21',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Acessórios
      {
        name: 'Cinto de Couro Marrom',
        price: 59.90,
        stock: 30,
        category: 'Acessórios',
        barcode: 'MODA012',
        description: 'Cinto masculino em couro marrom',
        supplier: 'Tommy Hilfiger',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Óculos de Sol Redondo',
        price: 299.90,
        stock: 12,
        category: 'Acessórios',
        barcode: 'MODA013',
        description: 'Óculos de sol redondo com lentes escuras',
        supplier: 'Ray-Ban',
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.products.bulkAdd(initialProducts);
  }
};


export const seedNewDatabase = async () => {
  const expenseCount = await db.expenses.count();

  if (expenseCount === 0) {
    const initialExpenses: Omit<Expense, 'id'>[] = [
      {
        supplier: 'Fornecedor A',
        description: 'Compra de Ração',
        category: 'Ração',
        amount: 450,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        paid: false,
        createdAt: new Date(),
      },
      {
        supplier: 'Fornecedor B',
        description: 'Serviço de limpeza',
        category: 'Serviço',
        amount: 200,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        paid: true,
        createdAt: new Date(),
      },
      {
        supplier: 'Fornecedor C',
        description: 'Medicamentos',
        category: 'Medicamentos',
        amount: 120,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        paid: false,
        createdAt: new Date(),
      }
    ];

    await db.expenses.bulkAdd(initialExpenses);
  }
};