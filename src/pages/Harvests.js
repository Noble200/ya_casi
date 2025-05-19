import React from 'react';
import HarvestsPanel from '../components/panels/Harvests/HarvestsPanel';
import useHarvestsController from '../controllers/HarvestsController';

// Página principal de cosechas que conecta el controlador con el componente visual
const Harvests = () => {
  // Usar el controlador para obtener datos y funciones
  const {
    harvests,
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
  } = useHarvestsController();

  // Renderizar el componente visual con los datos del controlador
  return (
    <HarvestsPanel
      harvests={harvests}
      loading={loading}
      error={error}
      selectedHarvest={selectedHarvest}
      dialogOpen={dialogOpen}
      currentView={currentView}
      filterOptions={filterOptions}
      sortOptions={sortOptions}
      onAddHarvest={handleAddHarvest}
      onEditHarvest={handleEditHarvest}
      onDeleteHarvest={handleDeleteHarvest}
      onViewHarvest={handleViewHarvest}
      onCompleteHarvest={handleCompleteHarvest}
      onDialogClose={handleDialogClose}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onSearchChange={handleSearchChange}
      onRefresh={handleRefresh}
    />
  );
};

export default Harvests;