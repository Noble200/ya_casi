import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAuth } from './AuthContext';

// Crear el contexto de stock
const StockContext = createContext();

export function useStock() {
  return useContext(StockContext);
}

export function StockProvider({ children }) {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [fumigations, setFumigations] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar productos
  const loadProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      
      // Crear consulta base
      const productsQuery = query(collection(db, 'products'), orderBy('name'));
      const querySnapshot = await getDocs(productsQuery);
      
      // Mapear documentos a objetos de productos
      let productsData = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        productsData.push({
          id: doc.id,
          name: productData.name,
          category: productData.category,
          quantity: productData.quantity || 0,
          minStock: productData.minStock || 0,
          unitOfMeasure: productData.unitOfMeasure || 'unidad',
          lotNumber: productData.lotNumber || '',
          notes: productData.notes || '',
          expiryDate: productData.expiryDate,
          warehouseStock: productData.warehouseStock || {},
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt
        });
      });
      
      // Aplicar filtros si se proporcionan
      if (filters.category) {
        productsData = productsData.filter(product => product.category === filters.category);
      }
      
      if (filters.minStock) {
        productsData = productsData.filter(product => product.quantity <= product.minStock);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        productsData = productsData.filter(product => 
          product.name.toLowerCase().includes(term) || 
          product.id.toLowerCase().includes(term) ||
          (product.lotNumber && product.lotNumber.toLowerCase().includes(term))
        );
      }
      
      setProducts(productsData);
      return productsData;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar almacenes
  const loadWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const warehousesQuery = query(collection(db, 'warehouses'), orderBy('name'));
      const querySnapshot = await getDocs(warehousesQuery);
      
      const warehousesData = [];
      querySnapshot.forEach((doc) => {
        const warehouseData = doc.data();
        warehousesData.push({
          id: doc.id,
          name: warehouseData.name,
          location: warehouseData.location,
          type: warehouseData.type,
          fieldId: warehouseData.fieldId,
          storageCondition: warehouseData.storageCondition,
          capacity: warehouseData.capacity,
          capacityUnit: warehouseData.capacityUnit,
          supervisor: warehouseData.supervisor,
          notes: warehouseData.notes,
          status: warehouseData.status,
          createdAt: warehouseData.createdAt,
          updatedAt: warehouseData.updatedAt
        });
      });
      
      setWarehouses(warehousesData);
      return warehousesData;
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
      setError('Error al cargar almacenes: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar campos
  const loadFields = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const fieldsQuery = query(collection(db, 'fields'), orderBy('name'));
      const querySnapshot = await getDocs(fieldsQuery);
      
      const fieldsData = [];
      querySnapshot.forEach((doc) => {
        const fieldData = doc.data();
        fieldsData.push({
          id: doc.id,
          name: fieldData.name,
          location: fieldData.location,
          area: fieldData.area,
          areaUnit: fieldData.areaUnit,
          owner: fieldData.owner,
          notes: fieldData.notes,
          lots: fieldData.lots || [],
          createdAt: fieldData.createdAt,
          updatedAt: fieldData.updatedAt
        });
      });
      
      setFields(fieldsData);
      return fieldsData;
    } catch (error) {
      console.error('Error al cargar campos:', error);
      setError('Error al cargar campos: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Añadir un producto
  const addProduct = useCallback(async (productData) => {
    try {
      setError('');
      
      // Preparar datos para Firestore
      const dbProductData = {
        name: productData.name,
        category: productData.category,
        quantity: productData.quantity || 0,
        minStock: productData.minStock || 0,
        unitOfMeasure: productData.unitOfMeasure || 'unidad',
        lotNumber: productData.lotNumber || null,
        notes: productData.notes || null,
        warehouseStock: productData.warehouseStock || {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Convertir fecha de vencimiento si existe
      if (productData.expiryDate) {
        if (productData.expiryDate instanceof Date) {
          dbProductData.expiryDate = Timestamp.fromDate(productData.expiryDate);
        }
      }
      
      // Insertar producto en Firestore
      const productRef = await addDoc(collection(db, 'products'), dbProductData);
      
      // Recargar productos
      await loadProducts();
      
      return productRef.id;
    } catch (error) {
      console.error('Error al añadir producto:', error);
      setError('Error al añadir producto: ' + error.message);
      throw error;
    }
  }, [loadProducts]);

  // Actualizar un producto
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      setError('');
      
      // Preparar datos para actualizar
      const updateData = {
        name: productData.name,
        category: productData.category,
        quantity: productData.quantity,
        minStock: productData.minStock,
        unitOfMeasure: productData.unitOfMeasure,
        lotNumber: productData.lotNumber,
        notes: productData.notes,
        warehouseStock: productData.warehouseStock || {},
        updatedAt: serverTimestamp()
      };
      
      // Convertir fecha de vencimiento si existe
      if (productData.expiryDate) {
        if (productData.expiryDate instanceof Date) {
          updateData.expiryDate = Timestamp.fromDate(productData.expiryDate);
        }
      }
      
      // Actualizar producto en Firestore
      await updateDoc(doc(db, 'products', productId), updateData);
      
      // Recargar productos
      await loadProducts();
      
      return productId;
    } catch (error) {
      console.error(`Error al actualizar producto ${productId}:`, error);
      setError('Error al actualizar producto: ' + error.message);
      throw error;
    }
  }, [loadProducts]);

  // Eliminar un producto
  const deleteProduct = useCallback(async (productId) => {
    try {
      setError('');
      
      // Eliminar producto de Firestore
      await deleteDoc(doc(db, 'products', productId));
      
      // Recargar productos
      await loadProducts();
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar producto ${productId}:`, error);
      setError('Error al eliminar producto: ' + error.message);
      throw error;
    }
  }, [loadProducts]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      setWarehouses([]);
      setTransfers([]);
      setFumigations([]);
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Cargar datos iniciales
    Promise.all([
      loadProducts(),
      loadWarehouses(),
      loadFields()
    ])
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos: ' + err.message);
        setLoading(false);
      });
  }, [currentUser, loadProducts, loadWarehouses, loadFields]);

  // Valor que se proporcionará a través del contexto
  const value = {
    products,
    warehouses,
    transfers,
    fumigations,
    fields,
    loading,
    error,
    setError,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    loadWarehouses,
    loadFields,
    
    // Funciones para almacenes
    addWarehouse: async (warehouseData) => {
      try {
        setError('');
        const newWarehouseRef = await addDoc(collection(db, 'warehouses'), {
          ...warehouseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await loadWarehouses();
        return newWarehouseRef.id;
      } catch (error) {
        setError('Error al crear almacén: ' + error.message);
        throw error;
      }
    },
    
    updateWarehouse: async (warehouseId, warehouseData) => {
      try {
        setError('');
        await updateDoc(doc(db, 'warehouses', warehouseId), {
          ...warehouseData,
          updatedAt: serverTimestamp()
        });
        await loadWarehouses();
        return warehouseId;
      } catch (error) {
        setError('Error al actualizar almacén: ' + error.message);
        throw error;
      }
    },
    
    deleteWarehouse: async (warehouseId) => {
      try {
        setError('');
        await deleteDoc(doc(db, 'warehouses', warehouseId));
        await loadWarehouses();
        return true;
      } catch (error) {
        setError('Error al eliminar almacén: ' + error.message);
        throw error;
      }
    }
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

export default StockContext;