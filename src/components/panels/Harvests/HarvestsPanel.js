// src/components/panels/Harvests/HarvestsPanel.js - Panel completo de cosechas con la lupa reposicionada
import React from 'react';
import './harvests.css';
import HarvestDialog from './HarvestDialog';
import HarvestDetailDialog from './HarvestDetailDialog';
import CompleteHarvestDialog from './CompleteHarvestDialog';

const HarvestsPanel = ({
  harvests,
  fields,
  loading,
  error,
  selectedHarvest,
  selectedField,
  selectedLots,
  dialogOpen,
  dialogType,
  filterOptions,
  onAddHarvest,
  onEditHarvest,
  onViewHarvest,
  onDeleteHarvest,
  onCompleteHarvest,
  onSaveHarvest,
  onCompleteHarvestSubmit,
  onFilterChange,
  onSearch,
  onCloseDialog,
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
        statusText = 'En proceso';
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
        statusText = status || 'Desconocido';
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

      {/* Barra de filtros y búsqueda - MODIFICADO */}
      <div className="filters-container">
        <div className="filters-group">
          <div className="filter-item">
            <label htmlFor="statusFilter">Estado:</label>
            <select
              id="statusFilter"
              className="form-control"
              onChange={(e) => onFilterChange('status', e.target.value)}
              style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
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
              style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
            >
              {filterOptions.crops.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="fieldFilter">Campo:</label>
            <select
              id="fieldFilter"
              className="form-control"
              onChange={(e) => onFilterChange('field', e.target.value)}
              style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
            >
              <option value="all">Todos los campos</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
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
        
        {/* AQUÍ ESTÁ LA MODIFICACIÓN DEL BUSCADOR - INICIO */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Buscar cosechas..."
              className="form-control search-input"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
        {/* AQUÍ ESTÁ LA MODIFICACIÓN DEL BUSCADOR - FIN */}
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

      {/* Grid de cosechas */}
      {harvests.length > 0 ? (
        <div className="harvests-grid">
          {harvests.map((harvest) => (
            <div 
              key={harvest.id} 
              className={`harvest-card ${harvest.status}`} 
              onClick={() => onViewHarvest(harvest)}
            >
              <div className="harvest-header">
                <h3 className="harvest-title">{harvest.field.name}</h3>
                {renderStatusChip(harvest.status)}
              </div>
              
              <div className="harvest-content">
                <div className="harvest-details">
                  <div className="harvest-detail">
                    <span className="detail-label">Cultivo</span>
                    <span className="detail-value">{harvest.crop}</span>
                  </div>
                  
                  <div className="harvest-detail">
                    <span className="detail-label">Superficie total</span>
                    <span className="detail-value">
                      {harvest.totalArea} {harvest.areaUnit || 'ha'}
                    </span>
                  </div>
                  
                  <div className="harvest-detail">
                    <span className="detail-label">Fecha planificada</span>
                    <span className="detail-value">
                      {formatDate(harvest.plannedDate)}
                    </span>
                  </div>
                  
                  <div className="harvest-detail">
                    <span className="detail-label">Lotes</span>
                    <span className="detail-value">
                      {harvest.lots ? harvest.lots.length : 0} lotes seleccionados
                    </span>
                  </div>
                </div>
                
                {/* Lotes seleccionados */}
                <div className="harvest-lots">
                  <div className="lots-header">
                    <h4 className="lots-title">Lotes</h4>
                  </div>
                  
                  {harvest.lots && harvest.lots.length > 0 ? (
                    <div className="lot-chips">
                      {harvest.lots.slice(0, 5).map((lot) => (
                        <div key={lot.id} className="lot-chip">
                          {lot.name}
                        </div>
                      ))}
                      {harvest.lots.length > 5 && (
                        <div className="lot-chip">
                          +{harvest.lots.length - 5} más
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="no-lots-message">No hay lotes seleccionados</p>
                  )}
                </div>
                
                {/* Rendimiento esperado */}
                <div className="harvest-yield">
                  <div className="yield-item">
                    <i className="fas fa-balance-scale"></i>
                    <div className="yield-content">
                      <div className="yield-value">
                        {harvest.estimatedYield || 'N/A'} {harvest.yieldUnit || 'kg/ha'}
                      </div>
                      <div className="yield-label">Rendimiento esperado</div>
                    </div>
                  </div>
                  
                  {harvest.status === 'completed' && (
                    <div className="yield-item">
                      <i className="fas fa-check-circle"></i>
                      <div className="yield-content">
                        <div className="yield-value">
                          {harvest.actualYield || 'N/A'} {harvest.yieldUnit || 'kg/ha'}
                        </div>
                        <div className="yield-label">Rendimiento real</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="harvest-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHarvest(harvest);
                    }}
                    title="Ver detalles"
                  >
                    <i className="fas fa-eye"></i> Detalles
                  </button>
                  
                  {(harvest.status === 'pending' || harvest.status === 'scheduled' || harvest.status === 'in_progress') && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteHarvest(harvest);
                      }}
                      title="Completar cosecha"
                    >
                      <i className="fas fa-check-circle"></i> Completar
                    </button>
                  )}
                  
                  {(harvest.status === 'pending' || harvest.status === 'scheduled') && (
                    <button
                      className="btn-icon btn-icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditHarvest(harvest);
                      }}
                      title="Editar cosecha"
                    >
                      <i className="fas fa-edit"></i>
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
                    title="Eliminar cosecha"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-tractor"></i>
          </div>
          <h2 className="empty-title">No hay cosechas registradas</h2>
          <p className="empty-description">
            Comienza añadiendo una nueva cosecha para gestionar la recolección de tus cultivos.
          </p>
          <button className="btn btn-primary" onClick={onAddHarvest}>
            <i className="fas fa-plus"></i> Añadir cosecha
          </button>
        </div>
      )}

      {/* Diálogos */}
      {dialogOpen && (
        <div className="dialog-overlay">
          {dialogType === 'add-harvest' || dialogType === 'edit-harvest' ? (
            <HarvestDialog
              harvest={selectedHarvest}
              fields={fields}
              selectedField={selectedField}
              selectedLots={selectedLots}
              isNew={dialogType === 'add-harvest'}
              onSave={onSaveHarvest}
              onClose={onCloseDialog}
            />
          ) : dialogType === 'view-harvest' ? (
            <HarvestDetailDialog
              harvest={selectedHarvest}
              onClose={onCloseDialog}
              onEditHarvest={onEditHarvest}
              onCompleteHarvest={onCompleteHarvest}
              onDeleteHarvest={onDeleteHarvest}
            />
          ) : dialogType === 'complete-harvest' ? (
            <CompleteHarvestDialog
              harvest={selectedHarvest}
              onComplete={onCompleteHarvestSubmit}
              onClose={onCloseDialog}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HarvestsPanel;