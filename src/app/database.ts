import { supabase } from "@/integrations/supabase/client";

// IndexedDB Database Service
export interface Table {
  id: number;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  customers?: number;
  orderId?: string;
  reservationTime?: string;
  reservationId?: string;
}

export interface Order {
  id: string;
  table: string;
  tableId: number;
  customer: string;
  items: MenuItem[];
  total: number;
  time: string;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  waiter: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableId?: number;
  table?: string;
  status: 'confirmed' | 'arrived' | 'cancelled' | 'completed';
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

export interface Stats {
  id: string;
  date: string;
  occupiedTables: number;
  totalTables: number;
  activeOrders: number;
  averageTime: number;
  dailyRevenue: number;
  ordersPerHour: number;
  satisfaction: number;
  occupancyRate: number;
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'RestaurantePRO';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tables store
        if (!db.objectStoreNames.contains('tables')) {
          const tablesStore = db.createObjectStore('tables', { keyPath: 'id' });
          tablesStore.createIndex('status', 'status', { unique: false });
        }

        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('status', 'status', { unique: false });
          ordersStore.createIndex('date', 'date', { unique: false });
          ordersStore.createIndex('tableId', 'tableId', { unique: false });
        }

        // Reservations store
        if (!db.objectStoreNames.contains('reservations')) {
          const reservationsStore = db.createObjectStore('reservations', { keyPath: 'id' });
          reservationsStore.createIndex('date', 'date', { unique: false });
          reservationsStore.createIndex('status', 'status', { unique: false });
        }

        // Menu items store
        if (!db.objectStoreNames.contains('menuItems')) {
          const menuStore = db.createObjectStore('menuItems', { keyPath: 'id' });
          menuStore.createIndex('category', 'category', { unique: false });
        }

        // Stats store
        if (!db.objectStoreNames.contains('stats')) {
          const statsStore = db.createObjectStore('stats', { keyPath: 'id' });
          statsStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Tables methods
  async getTables(): Promise<Table[]> {
    const store = await this.getStore('tables');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTable(table: Table): Promise<void> {
    const store = await this.getStore('tables', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(table);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Orders methods
  async getOrders(): Promise<Order[]> {
    const store = await this.getStore('orders');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addOrder(order: Order): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(order);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateOrder(order: Order): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(order);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrder(orderId: string): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(orderId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Reservations methods
  async getReservations(): Promise<Reservation[]> {
    const store = await this.getStore('reservations');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addReservation(reservation: Reservation): Promise<void> {
    const store = await this.getStore('reservations', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(reservation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateReservation(reservation: Reservation): Promise<void> {
    const store = await this.getStore('reservations', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(reservation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReservation(reservationId: string): Promise<void> {
    const store = await this.getStore('reservations', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(reservationId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Menu items methods
  async getMenuItems(): Promise<MenuItem[]> {
    const store = await this.getStore('menuItems');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Stats methods
  async getStats(): Promise<Stats[]> {
    const store = await this.getStore('stats');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateStats(stats: Stats): Promise<void> {
    const store = await this.getStore('stats', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(stats);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Initialize default data
  // async initializeDefaultData(): Promise<void> {
  //   const tables = await this.getTables();
  //   if (tables.length === 0) {
  //     const defaultTables: Table[] = [
  //       { id: 1, number: "01",  status: 'available' },
  //       { id: 2, number: "02",  status: 'available' },
  //       { id: 3, number: "03", status: 'available' },
  //       { id: 4, number: "04",  status: 'available' },
  //       { id: 5, number: "05",  status: 'available' },
  //       { id: 6, number: "06",  status: 'available' },
  //       { id: 7, number: "07",  status: 'available' },
  //       { id: 8, number: "08", status: 'available' },
  //       { id: 9, number: "09",  status: 'available' },
  //       { id: 10, number: "10",  status: 'available' },
  //       { id: 11, number: "11",  status: 'available' },
  //       { id: 12, number: "12",  status: 'available' },
  //     ];

  //     for (const table of defaultTables) {
  //       await this.updateTable(table);
  //     }
  //   }

  //   // Initialize menu items
  //   const menuItems = await this.getMenuItems();
  //   if (menuItems.length === 0) {
  //     const defaultMenu: MenuItem[] = [
  //       { id: 'item1', name: 'Hambúrguer Artesanal', price: 28.90, category: 'Pratos Principais', quantity: 1 },
  //       { id: 'item2', name: 'Pizza Margherita', price: 32.00, category: 'Pratos Principais', quantity: 1 },
  //       { id: 'item3', name: 'Salada Caesar', price: 22.50, category: 'Saladas', quantity: 1 },
  //       { id: 'item4', name: 'Coca-Cola 350ml', price: 8.00, category: 'Bebidas', quantity: 1 },
  //       { id: 'item5', name: 'Suco Natural Laranja', price: 12.00, category: 'Bebidas', quantity: 1 },
  //       { id: 'item6', name: 'Tiramisu', price: 18.00, category: 'Sobremesas', quantity: 1 },
  //     ];

  //     const store = await this.getStore('menuItems', 'readwrite');
  //     for (const item of defaultMenu) {
  //       store.add(item);
  //     }
  //   }
  // }
  async initializeDefaultData(ownerId: string): Promise<void> {
  // 1️⃣ Inicializa mesas padrão se não tiver nenhuma
  const tables = await this.getTables();
  if (tables.length === 0) {
    const defaultTables: Table[] = [
      { id: 1, number: "01", status: 'available' },
      { id: 2, number: "02", status: 'available' },
      { id: 3, number: "03", status: 'available' },
      { id: 4, number: "04", status: 'available' },
      { id: 5, number: "05", status: 'available' },
      { id: 6, number: "06", status: 'available' },
      { id: 7, number: "07", status: 'available' },
      { id: 8, number: "08", status: 'available' },
      { id: 9, number: "09", status: 'available' },
      { id: 10, number: "10", status: 'available' },
      { id: 11, number: "11", status: 'available' },
      { id: 12, number: "12", status: 'available' },
    ];

    for (const table of defaultTables) {
      await this.updateTable(table);
    }
  }

  // 2️⃣ Buscar produtos do Supabase
  try {
    // Buscar restaurante do dono
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (restaurantError) throw restaurantError;

    if (!restaurant) {
      console.warn('Nenhum restaurante encontrado para este dono.');
      return; // Sem produtos
    }

    const restaurantId = restaurant.id;

    // Buscar produtos do restaurante
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (productsError) throw productsError;

    // Salvar produtos no IndexedDB
    const store = await this.getStore('menuItems', 'readwrite');
    if (productsData && productsData.length > 0) {
      for (const item of productsData) {
        store.add({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category_id,
          quantity: 1, // default quantity
        });
      }
    } else {
      console.warn('Nenhum produto encontrado no Supabase.');
    }
  } catch (err: any) {
    console.error('Erro ao buscar produtos do Supabase:', err.message);
  }
}

}

export const database = new DatabaseService();