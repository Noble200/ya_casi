import { useState, useEffect, useCallback } from 'react';
import { useStock } from '../../contexts/StockContext';

// Controlador del Dashboard (lógica separada de la presentación)
const useDashboardController = () => {
  const { 
    products, 
    warehouses, 
    transfers, 
    fumigations, 
    loading, 
    error, 
    loadProducts,
    loadWarehouses
  } = useStock();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    expiringCount: 0,
    warehouseCount: 0,
    pendingTransfersCount: 0,
    pendingFumigationsCount: 0
  });
  
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiringSoonProducts, setExpiringSoonProducts] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingFumigations, setPendingFumigations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Calcular estadísticas y listas filtradas
  const processData = useCallback(() => {
    // Calcular productos con stock bajo
    const lowStock = products.filter(product => {
      const totalStock = Object.values(product.warehouseStock || {}).reduce((sum, stock) => sum + stock, 0);
      return totalStock <= (product.minStock || 0) && product.minStock > 0;
    }).slice(0, 5);
    
    // Calcular productos próximos a vencer
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);
    
    const expiringSoon = products
      .filter(product => {
        const expiryDate = product.expiryDate 
          ? new Date(product.expiryDate.seconds ? product.expiryDate.seconds * 1000 : product.expiryDate) 
          : null;
        return expiryDate && expiryDate > currentDate && expiryDate < thirtyDaysFromNow;
      })
      .slice(0, 5);
    
    // Obtener transferencias pendientes
    const pendingTransfs = transfers
      .filter(transfer => transfer.status === 'pending')
      .map(transfer => ({
        ...transfer,
        sourceWarehouseName: getWarehouseName(transfer.sourceWarehouseId),
        targetWarehouseName: getWarehouseName(transfer.targetWarehouseId)
      }))
      .slice(0, 5);
    
    // Obtener fumigaciones pendientes
    const pendingFumigs = fumigations
      .filter(fumigation => fumigation.status === 'pending')
      .slice(0, 5);
    
    // Generar actividades recientes
    const allActivities = [
      ...transfers.map(transfer => ({
        type: 'transfer',
        id: transfer.id,
        date: transfer.updatedAt ? new Date(transfer.updatedAt.seconds * 1000) : new Date(),
        description: `Transferencia de ${transfer.products.length} producto(s) de ${getWarehouseName(transfer.sourceWarehouseId)} a ${getWarehouseName(transfer.targetWarehouseId)}`,
        status: transfer.status
      })),
      ...fumigations.map(fumigation => ({
        type: 'fumigation',
        id: fumigation.id,
        date: fumigation.updatedAt ? new Date(fumigation.updatedAt.seconds * 1000) : new Date(),
        description: `Fumigación en ${fumigation.establishment} (${fumigation.surface} ha)`,
        status: fumigation.status
      }))
    ];
    
    // Ordenar por fecha descendente y tomar los 10 más recientes
    const recent = allActivities
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
    
    // Actualizar estados
    setLowStockProducts(lowStock);
    setExpiringSoonProducts(expiringSoon);
    setPendingTransfers(pendingTransfs);
    setPendingFumigations(pendingFumigs);
    setRecentActivities(recent);
    
    // Actualizar estadísticas
    setStats({
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      expiringCount: expiringSoon.length,
      warehouseCount: warehouses.length,
      pendingTransfersCount: pendingTransfs.length,
      pendingFumigationsCount: pendingFumigs.length
    });
  }, [products, warehouses, transfers, fumigations]);
  
  // Función para obtener el nombre de un almacén por ID
  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Almacén desconocido';
  };
  
  // Cargar datos cuando cambien las dependencias
  useEffect(() => {
    if (!loading) {
      processData();
    }
  }, [products, warehouses, transfers, fumigations, loading, processData]);
  
  // Función para recargar datos
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadWarehouses()
      ]);
    } catch (err) {
      console.error('Error al recargar datos:', err);
    }
  }, [loadProducts, loadWarehouses]);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Retornar estados y funciones necesarias para el componente visual
  return {
    stats,
    lowStockProducts,
    expiringSoonProducts,
    pendingTransfers,
    pendingFumigations,
    recentActivities,
    loading,
    error,
    refreshData
  };
};

export default useDashboardController;