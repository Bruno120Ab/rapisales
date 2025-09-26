import { useState, useEffect } from 'react';
import { database, Table, Order, Reservation, MenuItem, Stats } from './database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';


export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initDB = async () => {
      try {
        await database.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: "Erro no Banco de Dados",
          description: "Falha ao inicializar o sistema de armazenamento.",
          variant: "destructive",
        });
      }
    };

    initDB();
  }, [toast]);

  return { isInitialized };
};

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTables = async () => {
    try {
      const data = await database.getTables();
      setTables(data);
    } catch (error) {
      console.error('Failed to load tables:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar as mesas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTable = async (table: Table) => {
    try {
      await database.updateTable(table);
      await loadTables();
      toast({
        title: "Sucesso",
        description: "Mesa atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Failed to update table:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a mesa.",
        variant: "destructive",
      });
    }
  };

  const occupyTable = async (tableId: number, customers: number, orderId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      const updatedTable: Table = {
        ...table,
        status: 'occupied',
        customers,
        orderId
      };
      await updateTable(updatedTable);
    }
  };

  const freeTable = async (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      const updatedTable: Table = {
        ...table,
        status: 'available',
        customers: undefined,
        orderId: undefined,
        reservationTime: undefined,
        reservationId: undefined
      };
      await updateTable(updatedTable);
    }
  };

  const reserveTable = async (tableId: number, reservationTime: string, reservationId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      const updatedTable: Table = {
        ...table,
        status: 'reserved',
        reservationTime,
        reservationId
      };
      await updateTable(updatedTable);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  return {
    tables,
    loading,
    loadTables,
    updateTable,
    occupyTable,
    freeTable,
    reserveTable
  };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadOrders = async () => {
    try {
      const data = await database.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar as comandas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'date' | 'time'>) => {
    try {
      const newOrder: Order = {
        ...order,
        id: `#${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      
      await database.addOrder(newOrder);
      await loadOrders();
      
      toast({
        title: "Sucesso",
        description: "Comanda criada com sucesso!",
      });
      
      return newOrder;
    } catch (error) {
      console.error('Failed to add order:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar a comanda.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrder = async (order: Order) => {
    try {
      await database.updateOrder(order);
      await loadOrders();
      toast({
        title: "Sucesso",
        description: "Comanda atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a comanda.",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await database.deleteOrder(orderId);
      await loadOrders();
      toast({
        title: "Sucesso",
        description: "Comanda excluída com sucesso!",
      });
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir a comanda.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    loadOrders,
    addOrder,
    updateOrder,
    deleteOrder
  };
};

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadReservations = async () => {
    try {
      const data = await database.getReservations();
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar as reservas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addReservation = async (reservation: Omit<Reservation, 'id'>) => {
    try {
      const newReservation: Reservation = {
        ...reservation,
        id: `R${Date.now().toString().slice(-6)}`,
      };
      
      await database.addReservation(newReservation);
      await loadReservations();
      
      toast({
        title: "Sucesso",
        description: "Reserva criada com sucesso!",
      });
      
      return newReservation;
    } catch (error) {
      console.error('Failed to add reservation:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar a reserva.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReservation = async (reservation: Reservation) => {
    try {
      await database.updateReservation(reservation);
      await loadReservations();
      toast({
        title: "Sucesso",
        description: "Reserva atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Failed to update reservation:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a reserva.",
        variant: "destructive",
      });
    }
  };

  const deleteReservation = async (reservationId: string) => {
    try {
      await database.deleteReservation(reservationId);
      await loadReservations();
      toast({
        title: "Sucesso",
        description: "Reserva excluída com sucesso!",
      });
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir a reserva.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return {
    reservations,
    loading,
    loadReservations,
    addReservation,
    updateReservation,
    deleteReservation
  };
};

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMenuItems = async () => {
    try {
      const data = await database.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    loadMenuItems
  };
};