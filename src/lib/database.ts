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
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  discount: number;
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

export class PDVDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  stockMovements!: Table<StockMovement>;

  constructor() {
    super('PDVDatabase');
    this.version(1).stores({
      products: '++id, name, category, barcode, stock, minStock',
      sales: '++id, createdAt, total',
      stockMovements: '++id, productId, type, createdAt'
    });
  }
}

export const db = new PDVDatabase();

// Seed initial data
export const seedDatabase = async () => {
  const productCount = await db.products.count();
  
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