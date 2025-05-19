import { useState, useEffect, useCallback } from 'react';
import { useHarvests } from '../contexts/HarvestContext';

const useHarvestsController = () => {
  const {
    harvests,
    loading,
    error,
    loadHarvests,
    addHarvest,
    updateHarvest,
    deleteHarvest,
    completeHarvest
  } = useHarvests();

  // Estados para la interfaz de usuario
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit', 'view', 'complete'
  const [filters, setFilters] = useState({
    status: 'all',
    crop: 'all',
    dateRange: { start: null, end: null }
  });
  const [sortBy, setSortBy] = useState('plannedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar cosechas con filtros
  const fetchHarvests = useCallback(async () => {
    try {
      // Preparar filtros
      const filterParams = {};
      
      if (filters.status !== 'all') {
        filterParams.status = filters.status;
      }
      
      if (filters.crop !== 'all') {
        filterParams.crop = filters.crop;
      }
      
      if (filters.dateRange.start || filters.dateRange.end) {
        filterParams.dateRange = filters.dateRange;
      }
      
      if (searchTerm) {
        filterParams.searchTerm = searchTerm;
      }
      
      // Cargar cosechas
      await loadHarvests(filterParams);
    } catch (err) {
      console.error('Error al cargar cosechas:', err);
    }
  }, [loadHarvests, filters, searchTerm]);

  // Cargar datos al iniciar o cuando cambian los filtros
  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  // Manejar los filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Manejar ordenamiento
  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Manejar búsqueda
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // Abrir diálogo para añadir cosecha
  const handleAddHarvest = () => {
    setSelectedHarvest(null);
    setCurrentView('add');
    setDialogOpen(true);
  };

  // Abrir diálogo para editar cosecha
  const handleEditHarvest = (harvest) => {
    setSelectedHarvest(harvest);
    setCurrentView('edit');
    setDialogOpen(true);
  };

  // Abrir diálogo para ver detalles
  const handleViewHarvest = (harvest) => {
    setSelectedHarvest(harvest);
    setCurrentView('view');
    setDialogOpen(true);
  };

  // Confirmar eliminación de cosecha
  const handleDeleteHarvest = async (harvestId) => {
    try {
      await deleteHarvest(harvestId);
    } catch (err) {
      console.error('Error al eliminar cosecha:', err);
    }
  };

  // Abrir diálogo para completar cosecha
  const handleCompleteHarvest = (harvest) => {
    setSelectedHarvest(harvest);
    setCurrentView('complete');
    setDialogOpen(true);
  };

  // Cerrar diálogo
  const handleDialogClose = (refreshData = false) => {
    setDialogOpen(false);
    setSelectedHarvest(null);
    
    if (refreshData) {
      fetchHarvests();
    }
  };

  // Refrescar datos
  const handleRefresh = () => {
    fetchHarvests();
  };

  // Opciones para filtros
  const filterOptions = {
    status: [
      { value: 'all', label: 'Todos los estados' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'scheduled', label: 'Programada' },
      { value: 'in_progress', label: 'En proceso' },
      { value: 'completed', label: 'Completada' },
      { value: 'cancelled', label: 'Cancelada' }
    ],
    crops: [
      { value: 'all', label: 'Todos los cultivos' },
      { value: 'maiz', label: 'Maíz' },
      { value: 'soja', label: 'Soja' },
      { value: 'trigo', label: 'Trigo' },
      { value: 'girasol', label: 'Girasol' },
      { value: 'alfalfa', label: 'Alfalfa' },
      { value: 'otro', label: 'Otro' }
    ]
  };

  // Opciones para ordenamiento
  const sortOptions = [
    { value: 'plannedDate', label: 'Fecha planificada' },
    { value: 'establishment', label: 'Establecimiento' },
    { value: 'crop', label: 'Cultivo' },
    { value: 'surface', label: 'Superficie' },
    { value: 'status', label: 'Estado' }
  ];

  // Ordenar la lista de cosechas según los criterios establecidos
  const sortedHarvests = [...harvests].sort((a, b) => {
    // Asegurar que los valores no son undefined
    const aValue = a[sortBy] !== undefined ? a[sortBy] : '';
    const bValue = b[sortBy] !== undefined ? b[sortBy] : '';
    
    // Manejar ordenamiento por fechas (asumiendo que son objetos Timestamp de Firestore)
    if (sortBy === 'plannedDate' || sortBy === 'harvestDate') {
      const dateA = aValue ? (aValue.seconds ? new Date(aValue.seconds * 1000) : new Date(aValue)) : new Date(0);
      const dateB = bValue ? (bValue.seconds ? new Date(bValue.seconds * 1000) : new Date(bValue)) : new Date(0);
      
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Ordenamiento para strings y números
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (bValue > aValue ? 1 : -1);
    }
  });

  return {
    harvests: sortedHarvests,
    loading,
    error,
    selectedHarvest,
    dialogOpen,
    currentView,
    filterOptions,
    sortOptions,
    handleAddHarvest,
    handleEditHarvest,
    handleDeleteHarvest,
    handleViewHarvest,
    handleCompleteHarvest,
    handleDialogClose,
    handleFilterChange,
    handleSortChange,
    handleSearchChange,
    handleRefresh
  };
};

export default useHarvestsController;