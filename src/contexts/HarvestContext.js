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
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAuth } from './AuthContext';

// Crear el contexto de cosechas
const HarvestContext = createContext();

export function useHarvests() {
  return useContext(HarvestContext);
}

export function HarvestProvider({ children }) {
  const { currentUser } = useAuth();
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar cosechas
  const loadHarvests = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      
      // Crear consulta base
      const harvestsQuery = query(collection(db, 'harvests'), orderBy('plannedDate', 'desc'));
      const querySnapshot = await getDocs(harvestsQuery);
      
      // Mapear documentos a objetos de cosechas
      let harvestsData = [];
      querySnapshot.forEach((doc) => {
        const harvestData = doc.data();
        harvestsData.push({
          id: doc.id,
          establishment: harvestData.establishment,
          field: harvestData.field,
          lot: harvestData.lot,
          crop: harvestData.crop,
          surface: harvestData.surface || 0,
          surfaceUnit: harvestData.surfaceUnit || 'ha',
          plannedDate: harvestData.plannedDate,
          harvestDate: harvestData.harvestDate || null,
          status: harvestData.status || 'pending',
          estimatedYield: harvestData.estimatedYield || 0,
          actualYield: harvestData.actualYield || 0,
          yieldUnit: harvestData.yieldUnit || 'kg',
          harvestMethod: harvestData.harvestMethod || '',
          warehouseId: harvestData.warehouseId || null,
          notes: harvestData.notes || '',
          createdAt: harvestData.createdAt,
          updatedAt: harvestData.updatedAt
        });
      });
      
      // Aplicar filtros si se proporcionan
      if (filters.status) {
        harvestsData = harvestsData.filter(harvest => harvest.status === filters.status);
      }
      
      if (filters.crop) {
        harvestsData = harvestsData.filter(harvest => harvest.crop === filters.crop);
      }

      if (filters.field) {
        harvestsData = harvestsData.filter(harvest => harvest.field === filters.field);
      }
      
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        harvestsData = harvestsData.filter(harvest => {
          const plannedDate = harvest.plannedDate 
            ? new Date(harvest.plannedDate.seconds ? harvest.plannedDate.seconds * 1000 : harvest.plannedDate) 
            : null;
          
          if (!plannedDate) return false;
          
          return (!start || plannedDate >= new Date(start)) && 
                 (!end || plannedDate <= new Date(end));
        });
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        harvestsData = harvestsData.filter(harvest => 
          harvest.establishment.toLowerCase().includes(term) || 
          harvest.crop.toLowerCase().includes(term) ||
          (harvest.lot && harvest.lot.toLowerCase().includes(term))
        );
      }
      
      setHarvests(harvestsData);
      return harvestsData;
    } catch (error) {
      console.error('Error al cargar cosechas:', error);
      setError('Error al cargar cosechas: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Añadir una cosecha
  const addHarvest = useCallback(async (harvestData) => {
    try {
      setError('');
      
      // Preparar datos para Firestore
      const dbHarvestData = {
        establishment: harvestData.establishment,
        field: harvestData.field,
        lot: harvestData.lot,
        crop: harvestData.crop,
        surface: harvestData.surface || 0,
        surfaceUnit: harvestData.surfaceUnit || 'ha',
        status: harvestData.status || 'pending',
        estimatedYield: harvestData.estimatedYield || 0,
        yieldUnit: harvestData.yieldUnit || 'kg',
        harvestMethod: harvestData.harvestMethod || '',
        warehouseId: harvestData.warehouseId || null,
        notes: harvestData.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Convertir fechas si existen
      if (harvestData.plannedDate) {
        if (harvestData.plannedDate instanceof Date) {
          dbHarvestData.plannedDate = Timestamp.fromDate(harvestData.plannedDate);
        }
      }
      
      if (harvestData.harvestDate) {
        if (harvestData.harvestDate instanceof Date) {
          dbHarvestData.harvestDate = Timestamp.fromDate(harvestData.harvestDate);
        }
      }
      
      // Insertar cosecha en Firestore
      const harvestRef = await addDoc(collection(db, 'harvests'), dbHarvestData);
      
      // Recargar cosechas
      await loadHarvests();
      
      return harvestRef.id;
    } catch (error) {
      console.error('Error al añadir cosecha:', error);
      setError('Error al añadir cosecha: ' + error.message);
      throw error;
    }
  }, [loadHarvests]);

  // Actualizar una cosecha
  const updateHarvest = useCallback(async (harvestId, harvestData) => {
    try {
      setError('');
      
      // Preparar datos para actualizar
      const updateData = {
        ...harvestData,
        updatedAt: serverTimestamp()
      };
      
      // Convertir fechas si existen
      if (harvestData.plannedDate) {
        if (harvestData.plannedDate instanceof Date) {
          updateData.plannedDate = Timestamp.fromDate(harvestData.plannedDate);
        }
      }
      
      if (harvestData.harvestDate) {
        if (harvestData.harvestDate instanceof Date) {
          updateData.harvestDate = Timestamp.fromDate(harvestData.harvestDate);
        }
      }
      
      // Actualizar cosecha en Firestore
      await updateDoc(doc(db, 'harvests', harvestId), updateData);
      
      // Recargar cosechas
      await loadHarvests();
      
      return harvestId;
    } catch (error) {
      console.error(`Error al actualizar cosecha ${harvestId}:`, error);
      setError('Error al actualizar cosecha: ' + error.message);
      throw error;
    }
  }, [loadHarvests]);

  // Eliminar una cosecha
  const deleteHarvest = useCallback(async (harvestId) => {
    try {
      setError('');
      
      // Eliminar cosecha de Firestore
      await deleteDoc(doc(db, 'harvests', harvestId));
      
      // Recargar cosechas
      await loadHarvests();
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar cosecha ${harvestId}:`, error);
      setError('Error al eliminar cosecha: ' + error.message);
      throw error;
    }
  }, [loadHarvests]);

  // Completar una cosecha
  const completeHarvest = useCallback(async (harvestId, harvestResults) => {
    try {
      setError('');
      
      // Obtener la cosecha actual
      const harvestDoc = await doc(db, 'harvests', harvestId);
      
      // Datos para la actualización
      const updateData = {
        status: 'completed',
        harvestDate: Timestamp.fromDate(new Date()),
        actualYield: harvestResults.actualYield || 0,
        notes: harvestResults.notes || '',
        updatedAt: serverTimestamp()
      };
      
      // Actualizar la cosecha
      await updateDoc(harvestDoc, updateData);
      
      // Si se especificó un almacén destino, añadir el producto al inventario
      if (harvestResults.warehouseId && harvestResults.actualYield > 0) {
        // Aquí iría la lógica para actualizar el inventario
        // Esta parte se implementaría en integración con el contexto de stock
      }
      
      // Recargar cosechas
      await loadHarvests();
      
      return harvestId;
    } catch (error) {
      console.error(`Error al completar cosecha ${harvestId}:`, error);
      setError('Error al completar cosecha: ' + error.message);
      throw error;
    }
  }, [loadHarvests]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (!currentUser) {
      setHarvests([]);
      setLoading(false);
      return;
    }

    loadHarvests()
      .catch(err => {
        console.error('Error al cargar datos iniciales de cosechas:', err);
        setError('Error al cargar datos: ' + err.message);
      });
  }, [currentUser, loadHarvests]);

  // Valor que se proporcionará a través del contexto
  const value = {
    harvests,
    loading,
    error,
    setError,
    loadHarvests,
    addHarvest,
    updateHarvest,
    deleteHarvest,
    completeHarvest
  };

  return (
    <HarvestContext.Provider value={value}>
      {children}
    </HarvestContext.Provider>
  );
}

export default HarvestContext;