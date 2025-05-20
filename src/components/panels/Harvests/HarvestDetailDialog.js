// src/components/panels/Harvests/HarvestDetailDialog.js - Visualización detallada de una cosecha
import React from 'react';

const HarvestDetailDialog = ({ harvest, onClose, onEditHarvest, onCompleteHarvest, onDeleteHarvest }) => {
  // Formatear fecha
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

  // Función para verificar si la cosecha se puede editar (solo si está pendiente o programada)
  const canEdit = harvest.status === 'pending' || harvest.status === 'scheduled';
  
  // Función para verificar si la cosecha se puede completar (no si ya está completada o cancelada)
  const canComplete = harvest.status !== 'completed' && harvest.status !== 'cancelled';

  return (
    <div className="dialog harvest-detail-dialog">
      <div className="dialog-header">
        <div className="dialog-title-container">
          <h2 className="dialog-title">Detalles de cosecha</h2>
          {renderStatusChip(harvest.status)}
        </div>
        <button className="dialog-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="dialog-body">
        <div className="harvest-details-container">
          <div className="harvest-summary">
            <div className="harvest-summary-header">
              <div className="harvest-summary-title">
                <i className="fas fa-leaf"></i>
                <span>
                  {harvest.crop} en {harvest.field.name}
                </span>
              </div>
              <div className="harvest-summary-stats">
                <div className="summary-stat">
                  <div className="summary-stat-value">{harvest.totalArea} {harvest.areaUnit}</div>
                  <div className="summary-stat-label">Superficie total</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat-value">{harvest.lots?.length || 0}</div>
                  <div className="summary-stat-label">Lotes</div>
                </div>
                {harvest.estimatedYield && (
                  <div className="summary-stat">
                    <div className="summary-stat-value">{harvest.estimatedYield} {harvest.yieldUnit}</div>
                    <div className="summary-stat-label">Rendimiento est.</div>
                  </div>
                )}
                {harvest.status === 'completed' && harvest.actualYield && (
                  <div className="summary-stat highlight">
                    <div className="summary-stat-value">{harvest.actualYield} {harvest.yieldUnit}</div>
                    <div className="summary-stat-label">Rendimiento real</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Acciones rápidas */}
            <div className="harvest-actions-bar">
              {canEdit && (
                <button className="btn btn-primary" onClick={() => onEditHarvest(harvest)}>
                  <i className="fas fa-edit"></i> Editar cosecha
                </button>
              )}
              {canComplete && (
                <button className="btn btn-success" onClick={() => onCompleteHarvest(harvest)}>
                  <i className="fas fa-check-circle"></i> Completar cosecha
                </button>
              )}
              <button className="btn btn-outline btn-danger" onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar esta cosecha?')) {
                  onDeleteHarvest(harvest.id);
                  onClose();
                }
              }}>
                <i className="fas fa-trash"></i> Eliminar
              </button>
            </div>

            {/* Información básica */}
            <div className="detail-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i> Información básica
              </h3>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Fecha planificada</span>
                  <span className="detail-value">{formatDate(harvest.plannedDate)}</span>
                </div>
                
                {harvest.status === 'completed' && harvest.harvestDate && (
                  <div className="detail-item">
                    <span className="detail-label">Fecha de cosecha</span>
                    <span className="detail-value">{formatDate(harvest.harvestDate)}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Método de cosecha</span>
                  <span className="detail-value">
                    {harvest.harvestMethod === 'manual' && 'Manual'}
                    {harvest.harvestMethod === 'mechanical' && 'Mecánica'}
                    {harvest.harvestMethod === 'combined' && 'Combinada'}
                    {!harvest.harvestMethod && 'No especificado'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Almacén destino</span>
                  <span className="detail-value">
                    {harvest.targetWarehouse || 'No especificado'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Lotes */}
            <div className="detail-section">
              <h3 className="section-title">
                <i className="fas fa-th"></i> Lotes seleccionados
              </h3>
              
              {harvest.lots && harvest.lots.length > 0 ? (
                <div className="lots-table-container">
                  <table className="lots-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Superficie</th>
                        <th>Cultivo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harvest.lots.map((lot) => (
                        <tr key={lot.id}>
                          <td>{lot.name}</td>
                          <td>{lot.area} {lot.areaUnit || harvest.areaUnit}</td>
                          <td>
                            {lot.crops && lot.crops.length > 0 
                              ? lot.crops[0] 
                              : lot.currentCrop || 'No especificado'}
                          </td>
                          <td>
                            <span className={`status-badge status-${lot.status || 'active'}`}>
                              {lot.status === 'active' && 'Activo'}
                              {lot.status === 'inactive' && 'Inactivo'}
                              {lot.status === 'prepared' && 'Preparado'}
                              {lot.status === 'sown' && 'Sembrado'}
                              {lot.status === 'fallow' && 'En barbecho'}
                              {!lot.status && 'Activo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-table-message">No hay lotes seleccionados</div>
              )}
            </div>
            
            {/* Maquinaria y personal */}
            {(harvest.machinery?.length > 0 || harvest.workers) && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-tools"></i> Maquinaria y personal
                </h3>
                
                <div className="detail-content">
                  {harvest.machinery && harvest.machinery.length > 0 && (
                    <div className="detail-subsection">
                      <h4 className="subsection-title">Maquinaria</h4>
                      <div className="tags-container">
                        {harvest.machinery.map((item, index) => (
                          <div key={index} className="tag">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {harvest.workers && (
                    <div className="detail-subsection">
                      <h4 className="subsection-title">Personal</h4>
                      <p>{harvest.workers}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Parámetros de calidad */}
            {harvest.qualityParameters && harvest.qualityParameters.length > 0 && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-chart-line"></i> Parámetros de calidad
                </h3>
                
                <div className="quality-params-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parámetro</th>
                        <th>Valor</th>
                        <th>Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harvest.qualityParameters.map((param, index) => (
                        <tr key={index}>
                          <td>{param.name}</td>
                          <td>{param.value}</td>
                          <td>{param.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Resultados (solo si está completada) */}
            {harvest.status === 'completed' && (
              <div className="detail-section results-section">
                <h3 className="section-title highlight">
                  <i className="fas fa-flag-checkered"></i> Resultados de la cosecha
                </h3>
                
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Fecha de cosecha</span>
                    <span className="detail-value">{formatDate(harvest.harvestDate)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Rendimiento obtenido</span>
                    <span className="detail-value highlight">
                      {harvest.actualYield} {harvest.yieldUnit}
                    </span>
                  </div>
                  
                  {harvest.estimatedYield && (
                    <div className="detail-item">
                      <span className="detail-label">Diferencia con estimado</span>
                      <span className="detail-value">
                        {((harvest.actualYield / harvest.estimatedYield * 100) - 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                  
                  {harvest.totalHarvested && (
                    <div className="detail-item">
                      <span className="detail-label">Producción total</span>
                      <span className="detail-value">
                        {harvest.totalHarvested} {harvest.totalHarvestedUnit || 'kg'}
                      </span>
                    </div>
                  )}
                </div>
                
                {harvest.harvestNotes && (
                  <div className="harvest-notes">
                    <h4 className="subsection-title">Notas de la cosecha</h4>
                    <p>{harvest.harvestNotes}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Notas generales */}
            {harvest.notes && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-sticky-note"></i> Notas
                </h3>
                
                <div className="notes-content">
                  <p>{harvest.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dialog-footer">
        <button className="btn btn-outline" onClick={onClose}>
          Cerrar
        </button>
        
        {canComplete && (
          <button className="btn btn-success" onClick={() => onCompleteHarvest(harvest)}>
            <i className="fas fa-check-circle"></i> Completar cosecha
          </button>
        )}
      </div>
    </div>
  );
};

export default HarvestDetailDialog;