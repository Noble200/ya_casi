import React from 'react';
import './harvests.css';

// Componente visual para la gestión de cosechas
const HarvestsPanel = ({
  harvests,
  loading,
  error,
  selectedHarvest,
  dialogOpen,
  currentView,
  filterOptions,
  sortOptions,
  onAddHarvest,
  onEditHarvest,
  onDeleteHarvest,
  onViewHarvest,
  onCompleteHarvest,
  onDialogClose,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onRefresh
}) => {
  // Función para formatear una fecha
  const formatDate = (date) => {
    if (!date) return 'No especificada';
    const d = date.seconds 
      ? new Date(date.seconds * 1000) 
      : new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Renderizar estado como chip
  const renderStatusChip = (status) => {
    let chipClass = '';
    let statusText = '';

    switch (status) {
      case 'pending':
        chipClass = 'chip-warning';
        statusText = 'Pendiente';
        break;
      case 'scheduled':
        chipClass = 'chip-primary';
        statusText = 'Programada';
        break;
      case 'in_progress':
        chipClass = 'chip-info';
        statusText = 'En Proceso';
        break;
      case 'completed':
        chipClass = 'chip-success';
        statusText = 'Completada';
        break;
      case 'cancelled':
        chipClass = 'chip-danger';
        statusText = 'Cancelada';
        break;
      default:
        chipClass = 'chip-primary';
        statusText = status;
    }

    return <span className={`chip ${chipClass}`}>{statusText}</span>;
  };

  // Mostrar cargando
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando cosechas...</p>
      </div>
    );
  }

  return (
    <div className="harvests-container">
      {/* Título y acciones principales */}
      <div className="harvests-header">
        <h1 className="harvests-title">Gestión de Cosechas</h1>
        <div className="harvests-actions">
          <button
            className="btn btn-primary"
            onClick={onAddHarvest}
          >
            <i className="fas fa-plus"></i> Nueva Cosecha
          </button>
          <button
            className="btn btn-icon"
            onClick={onRefresh}
            title="Actualizar datos"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="filters-container">
        <div className="filters-group">
          <div className="filter-item">
            <label htmlFor="statusFilter">Estado:</label>
            <select
              id="statusFilter"
              className="form-control"
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              {filterOptions.status.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="cropFilter">Cultivo:</label>
            <select
              id="cropFilter"
              className="form-control"
              onChange={(e) => onFilterChange('crop', e.target.value)}
            >
              {filterOptions.crops.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item date-range">
            <label>Período:</label>
            <div className="date-inputs">
              <input
                type="date"
                className="form-control"
                placeholder="Desde"
                onChange={(e) => onFilterChange('dateRange', { 
                  ...filterOptions.dateRange,
                  start: e.target.value 
                })}
              />
              <span>-</span>
              <input
                type="date"
                className="form-control"
                placeholder="Hasta"
                onChange={(e) => onFilterChange('dateRange', { 
                  ...filterOptions.dateRange,
                  end: e.target.value 
                })}
              />
            </div>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar cosechas..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button className="btn btn-sm" onClick={onRefresh}>
            <i className="fas fa-sync-alt"></i> Reintentar
          </button>
        </div>
      )}

      {/* Tabla de cosechas */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Establecimiento</th>
              <th>Cultivo</th>
              <th>Superficie (ha)</th>
              <th>Fecha Planificada</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {harvests.length > 0 ? (
              harvests.map((harvest) => (
                <tr key={harvest.id} onClick={() => onViewHarvest(harvest)}>
                  <td>
                    <div className="cell-content">
                      <span className="cell-main">{harvest.establishment}</span>
                      <span className="cell-sub">Lote: {harvest.lot}</span>
                    </div>
                  </td>
                  <td>{harvest.crop}</td>
                  <td>{harvest.surface} {harvest.surfaceUnit}</td>
                  <td>{formatDate(harvest.plannedDate)}</td>
                  <td>{renderStatusChip(harvest.status)}</td>
                  <td>
                    <div className="row-actions">
                      <button 
                        className="btn-icon btn-icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewHarvest(harvest);
                        }}
                        title="Ver detalles"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      
                      <button 
                        className="btn-icon btn-icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditHarvest(harvest);
                        }}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      {harvest.status !== 'completed' && harvest.status !== 'cancelled' && (
                        <button 
                          className="btn-icon btn-icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompleteHarvest(harvest);
                          }}
                          title="Completar cosecha"
                        >
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                      
                      <button 
                        className="btn-icon btn-icon-sm btn-icon-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Estás seguro de que deseas eliminar esta cosecha?')) {
                            onDeleteHarvest(harvest.id);
                          }
                        }}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan="6">
                  <div className="empty-message">
                    <i className="fas fa-info-circle"></i>
                    <p>No se encontraron cosechas que coincidan con los filtros.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* En una implementación real, aquí irían los diálogos para añadir/editar/ver cosechas */}
      {/* Por simplicidad, no los incluimos en esta versión inicial */}
    </div>
  );
};

export default HarvestsPanel;