import React from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';

// Componente visual para el Dashboard
const DashboardPanel = ({ 
  stats, 
  lowStockProducts, 
  expiringSoonProducts, 
  pendingTransfers, 
  pendingFumigations, 
  recentActivities,
  loading,
  error
}) => {
  // Función para formatear una fecha
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para formatear una hora completa
  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar un estado con chip
  const renderStatusChip = (status) => {
    let chipClass = '';
    let statusText = '';

    switch (status) {
      case 'pending':
        chipClass = 'chip-warning';
        statusText = 'Pendiente';
        break;
      case 'in_progress':
        chipClass = 'chip-info';
        statusText = 'En Proceso';
        break;
      case 'completed':
        chipClass = 'chip-success';
        statusText = 'Completado';
        break;
      case 'cancelled':
        chipClass = 'chip-danger';
        statusText = 'Cancelado';
        break;
      default:
        chipClass = 'chip-primary';
        statusText = status;
    }

    return <span className={`chip ${chipClass}`}>{statusText}</span>;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="alert alert-error">{error}</div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon primary">
              <i className="fas fa-box"></i>
            </div>
            <h3 className="stat-title">Productos</h3>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
          <p className="stat-description">Total en inventario</p>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="stat-title">Stock Bajo</h3>
          </div>
          <div className="stat-value">{stats.lowStockCount}</div>
          <p className="stat-description">Productos bajo mínimo</p>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon success">
              <i className="fas fa-warehouse"></i>
            </div>
            <h3 className="stat-title">Almacenes</h3>
          </div>
          <div className="stat-value">{stats.warehouseCount}</div>
          <p className="stat-description">Almacenes activos</p>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <div className="stat-icon info">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <h3 className="stat-title">Transferencias</h3>
          </div>
          <div className="stat-value">{stats.pendingTransfersCount}</div>
          <p className="stat-description">Pendientes</p>
        </div>
      </div>

      {/* Paneles de información */}
      <div className="dashboard-panels">
        {/* Productos con stock bajo */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-exclamation-triangle"></i>
              Productos con Stock Bajo
            </h3>
          </div>
          <div className="panel-content">
            {lowStockProducts.length > 0 ? (
              <ul className="item-list">
                {lowStockProducts.map((product) => {
                  const totalStock = Object.values(product.warehouseStock || {}).reduce((sum, stock) => sum + stock, 0);
                  return (
                    <li key={product.id} className="list-item">
                      <div className="list-item-title">
                        {product.name}
                      </div>
                      <div className="list-item-subtitle">
                        <span>
                          <i className="fas fa-box"></i>
                          Stock actual: {totalStock} {product.unitOfMeasure}
                        </span>
                        <span>
                          <i className="fas fa-arrow-down"></i>
                          Mínimo: {product.minStock} {product.unitOfMeasure}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="list-empty">
                <i className="fas fa-check-circle"></i>
                <p>No hay productos con stock bajo.</p>
              </div>
            )}
          </div>
          <div className="panel-footer">
            <Link to="/productos" className="btn btn-outline">
              Ver todos los productos
            </Link>
          </div>
        </div>

        {/* Productos próximos a vencer */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-calendar-alt"></i>
              Productos Próximos a Vencer
            </h3>
          </div>
          <div className="panel-content">
            {expiringSoonProducts.length > 0 ? (
              <ul className="item-list">
                {expiringSoonProducts.map((product) => {
                  const expiryDate = product.expiryDate 
                    ? formatDate(product.expiryDate.seconds ? new Date(product.expiryDate.seconds * 1000) : product.expiryDate) 
                    : 'Sin fecha';
                  return (
                    <li key={product.id} className="list-item">
                      <div className="list-item-title">
                        {product.name}
                      </div>
                      <div className="list-item-subtitle">
                        <span>
                          <i className="fas fa-calendar"></i>
                          Vence: {expiryDate}
                        </span>
                        {product.lotNumber && (
                          <span>
                            <i className="fas fa-tag"></i>
                            Lote: {product.lotNumber}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="list-empty">
                <i className="fas fa-check-circle"></i>
                <p>No hay productos próximos a vencer.</p>
              </div>
            )}
          </div>
          <div className="panel-footer">
            <Link to="/productos" className="btn btn-outline">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </div>

      {/* Segunda fila de paneles */}
      <div className="dashboard-panels">
        {/* Transferencias pendientes */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-exchange-alt"></i>
              Transferencias Pendientes
            </h3>
          </div>
          <div className="panel-content">
            {pendingTransfers.length > 0 ? (
              <ul className="item-list">
                {pendingTransfers.map((transfer) => (
                  <li key={transfer.id} className="list-item">
                    <div className="list-item-title">
                      {transfer.sourceWarehouseName} → {transfer.targetWarehouseName}
                    </div>
                    <div className="list-item-subtitle">
                      <span>
                        <i className="fas fa-calendar"></i>
                        Fecha: {formatDate(transfer.createdAt)}
                      </span>
                      <span>
                        <i className="fas fa-boxes"></i>
                        Productos: {transfer.products.length}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="list-empty">
                <i className="fas fa-check-circle"></i>
                <p>No hay transferencias pendientes.</p>
              </div>
            )}
          </div>
          <div className="panel-footer">
            <Link to="/transferencias" className="btn btn-outline">
              Ver todas las transferencias
            </Link>
          </div>
        </div>

        {/* Fumigaciones pendientes */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-spray-can"></i>
              Fumigaciones Pendientes
            </h3>
          </div>
          <div className="panel-content">
            {pendingFumigations.length > 0 ? (
              <ul className="item-list">
                {pendingFumigations.map((fumigation) => (
                  <li key={fumigation.id} className="list-item">
                    <div className="list-item-title">
                      {fumigation.establishment} - Lote: {fumigation.lot}
                    </div>
                    <div className="list-item-subtitle">
                      <span>
                        <i className="fas fa-calendar"></i>
                        Fecha: {formatDate(fumigation.date)}
                      </span>
                      <span>
                        <i className="fas fa-seedling"></i>
                        Cultivo: {fumigation.crop}
                      </span>
                      <span>
                        <i className="fas fa-ruler-combined"></i>
                        Superficie: {fumigation.surface} ha
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="list-empty">
                <i className="fas fa-check-circle"></i>
                <p>No hay fumigaciones pendientes.</p>
              </div>
            )}
          </div>
          <div className="panel-footer">
            <Link to="/fumigaciones" className="btn btn-outline">
              Ver todas las fumigaciones
            </Link>
          </div>
        </div>
      </div>

      {/* Actividades recientes */}
      <div className="activity-container">
        <div className="panel-header">
          <h3 className="panel-title">
            <i className="fas fa-history"></i>
            Actividades Recientes
          </h3>
        </div>
        <div className="activity-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'transfer' && <i className="fas fa-exchange-alt"></i>}
                  {activity.type === 'purchase' && <i className="fas fa-shopping-cart"></i>}
                  {activity.type === 'fumigation' && <i className="fas fa-spray-can"></i>}
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    <span className="activity-description">{activity.description}</span>
                    {renderStatusChip(activity.status)}
                  </div>
                  <div className="activity-details">
                    {formatDateTime(activity.date)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="list-empty">
              <i className="fas fa-info-circle"></i>
              <p>No hay actividades recientes para mostrar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;