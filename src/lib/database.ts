import Dexie, { Table } from 'dexie';

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
  role: 'admin' | 'estagiario';
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
      exchanges: '++id, originalSaleId, status, createdAt, userId'
    });
  }
}

export const db = new PDVDatabase();

// Seed initial data
export const seedDatabase = async () => {
  const productCount = await db.products.count();
  const userCount = await db.users.count();
  
  // Seed users
  if (userCount === 0) {
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
      }
    ];
    await db.users.bulkAdd(initialUsers);
  }
  
  if (productCount === 0) {
    const initialProducts: Omit<Product, 'id'>[] = [
      {
        name: 'Ração Golden Adulto 15kg',
        price: 89.90,
        stock: 50,
        category: 'Ração Cães',
        barcode: '7896015415146',
        description: 'Ração premium para cães adultos',
        supplier: 'Premier Pet',
        minStock: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ração Whiskas Adulto 3kg',
        price: 45.90,
        stock: 30,
        category: 'Ração Gatos',
        barcode: '7896015415147',
        description: 'Ração para gatos adultos',
        supplier: 'Mars Petcare',
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Antipulgas Frontline Plus',
        price: 65.90,
        stock: 25,
        category: 'Medicamentos',
        barcode: '7896015415148',
        description: 'Antipulgas e carrapatos',
        supplier: 'Boehringer',
        minStock: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Coleira Nylon Média',
        price: 25.90,
        stock: 40,
        category: 'Acessórios',
        barcode: '7896015415149',
        description: 'Coleira ajustável para cães médios',
        supplier: 'Pet & Co',
        minStock: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Brinquedo Ossinho Dental',
        price: 18.90,
        stock: 60,
        category: 'Brinquedos',
        barcode: '7896015415150',
        description: 'Brinquedo para higiene dental',
        supplier: 'Chalesco',
        minStock: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.products.bulkAdd(initialProducts);
  }
};