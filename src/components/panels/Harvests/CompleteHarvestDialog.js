// src/components/panels/Harvests/CompleteHarvestDialog.js - Formulario para completar una cosecha
import React, { useState } from 'react';

const CompleteHarvestDialog = ({ harvest, onComplete, onClose }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    harvestDate: new Date().toISOString().split('T')[0],
    actualYield: harvest.estimatedYield || '',
    totalHarvested: '',
    totalHarvestedUnit: 'kg',
    destination: harvest.targetWarehouse || '',
    qualityResults: [],
    harvestNotes: '',
    status: 'completed'
  });

  // Estado para parámetros de calidad
  const [qualityInput, setQualityInput] = useState({ 
    name: '', 
    value: '', 
    unit: '' 
  });
  
  // Estado para errores de validación
  const [errors, setErrors] = useState({});
  // Estado para loading
  const [submitting, setSubmitting] = useState(false);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar errores al modificar campos
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar adición de resultado de calidad
  const handleAddQualityResult = () => {
    if (qualityInput.name.trim() && qualityInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        qualityResults: [...prev.qualityResults, { ...qualityInput }]
      }));
      setQualityInput({ name: '', value: '', unit: '' });
    }
  };

  // Manejar eliminación de resultado de calidad
  const handleRemoveQualityResult = (index) => {
    setFormData(prev => ({
      ...prev,
      qualityResults: prev.qualityResults.filter((_, i) => i !== index)
    }));
  };

  // Manejar cambio en inputs de parámetros de calidad
  const handleQualityInputChange = (e) => {
    const { name, value } = e.target;
    setQualityInput(prev => ({ ...prev, [name]: value }));
  };

  // Validar formulario antes de guardar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.harvestDate) {
      newErrors.harvestDate = 'La fecha de cosecha es obligatoria';
    }
    
    if (!formData.actualYield) {
      newErrors.actualYield = 'El rendimiento obtenido es obligatorio';
    } else if (isNaN(Number(formData.actualYield))) {
      newErrors.actualYield = 'El rendimiento debe ser un número';
    }
    
    if (formData.totalHarvested && isNaN(Number(formData.totalHarvested))) {
      newErrors.totalHarvested = 'La producción total debe ser un número';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      // Preparar datos para guardar
      const harvestData = {
        ...formData,
        actualYield: Number(formData.actualYield),
        totalHarvested: formData.totalHarvested ? Number(formData.totalHarvested) : null,
        harvestDate: new Date(formData.harvestDate)
      };
      
      // Incluir los lotes y el campo para mantener los datos completos
      harvestData.lots = harvest.lots;
      harvestData.field = harvest.field;
      harvestData.fieldId = harvest.fieldId;
      harvestData.crop = harvest.crop;
      harvestData.totalArea = harvest.totalArea;
      harvestData.areaUnit = harvest.areaUnit;
      
      onComplete(harvestData)
        .catch(error => {
          console.error("Error al completar cosecha:", error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  return (
    <div className="dialog complete-harvest-dialog">
      <div className="dialog-header">
        <h2 className="dialog-title">Completar cosecha</h2>
        <button className="dialog-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="dialog-body">
        <form onSubmit={handleSubmit}>
          <div className="harvest-summary-card">
            <div className="harvest-summary-title">
              <i className="fas fa-leaf"></i>
              <span>{harvest.crop} en {harvest.field.name}</span>
            </div>
            <div className="harvest-summary-details">
              <div className="summary-detail">
                <span className="detail-label">Superficie:</span>
                <span className="detail-value">{harvest.totalArea} {harvest.areaUnit}</span>
              </div>
              {harvest.estimatedYield && (
                <div className="summary-detail">
                  <span className="detail-label">Rendimiento estimado:</span>
                  <span className="detail-value">{harvest.estimatedYield} {harvest.yieldUnit}</span>
                </div>
              )}
              <div className="summary-detail">
                <span className="detail-label">Lotes:</span>
                <span className="detail-value">{harvest.lots?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="form-sections">
            {/* Sección de resultados principales */}
            <div className="form-section">
              <h3 className="section-title">Datos de la cosecha</h3>
              
              {/* Fecha de cosecha */}
              <div className="form-group">
                <label htmlFor="harvestDate" className="form-label required">Fecha de cosecha</label>
                <input
                  type="date"
                  id="harvestDate"
                  name="harvestDate"
                  className={`form-control ${errors.harvestDate ? 'is-invalid' : ''}`}
                  value={formData.harvestDate}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.harvestDate && <div className="invalid-feedback">{errors.harvestDate}</div>}
              </div>
              
              {/* Rendimiento real */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="actualYield" className="form-label required">Rendimiento obtenido</label>
                  <input
                    type="text"
                    id="actualYield"
                    name="actualYield"
                    className={`form-control ${errors.actualYield ? 'is-invalid' : ''}`}
                    value={formData.actualYield}
                    onChange={handleChange}
                    placeholder="Ej: 8500"
                    disabled={submitting}
                  />
                  {errors.actualYield && <div className="invalid-feedback">{errors.actualYield}</div>}
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="yieldUnit" className="form-label">Unidad</label>
                  <select
                    id="yieldUnit"
                    name="yieldUnit"
                    className="form-control"
                    value={harvest.yieldUnit}
                    disabled={true}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                  >
                    <option value={harvest.yieldUnit}>{harvest.yieldUnit}</option>
                  </select>
                </div>
              </div>
              
              {/* Producción total */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="totalHarvested" className="form-label">Producción total</label>
                  <input
                    type="text"
                    id="totalHarvested"
                    name="totalHarvested"
                    className={`form-control ${errors.totalHarvested ? 'is-invalid' : ''}`}
                    value={formData.totalHarvested}
                    onChange={handleChange}
                    placeholder="Ej: 42500"
                    disabled={submitting}
                  />
                  {errors.totalHarvested && <div className="invalid-feedback">{errors.totalHarvested}</div>}
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="totalHarvestedUnit" className="form-label">Unidad</label>
                  <select
                    id="totalHarvestedUnit"
                    name="totalHarvestedUnit"
                    className="form-control"
                    value={formData.totalHarvestedUnit}
                    onChange={handleChange}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                    disabled={submitting}
                  >
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="qq">qq</option>
                  </select>
                </div>
              </div>
              
              {/* Destino del producto */}
              <div className="form-group">
                <label htmlFor="destination" className="form-label">Destino final del producto</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  className="form-control"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Ej: Silo principal, Almacén central"
                  disabled={submitting}
                />
              </div>
            </div>
            
            {/* Sección de parámetros de calidad */}
            <div className="form-section">
              <h3 className="section-title">Resultados de calidad</h3>
              
              <div className="form-group">
                <label className="form-label">Parámetros de calidad medidos</label>
                
                <div className="quality-params-grid">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={qualityInput.name}
                    onChange={handleQualityInputChange}
                    placeholder="Parámetro"
                    disabled={submitting}
                  />
                  
                  <input
                    type="text"
                    name="value"
                    className="form-control"
                    value={qualityInput.value}
                    onChange={handleQualityInputChange}
                    placeholder="Valor"
                    disabled={submitting}
                  />
                  
                  <input
                    type="text"
                    name="unit"
                    className="form-control"
                    value={qualityInput.unit}
                    onChange={handleQualityInputChange}
                    placeholder="Unidad"
                    disabled={submitting}
                  />
                  
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddQualityResult}
                    disabled={submitting || !qualityInput.name || !qualityInput.value}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                
                {formData.qualityResults && formData.qualityResults.length > 0 ? (
                  <div className="quality-params-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Parámetro</th>
                          <th>Valor</th>
                          <th>Unidad</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.qualityResults.map((param, index) => (
                          <tr key={index}>
                            <td>{param.name}</td>
                            <td>{param.value}</td>
                            <td>{param.unit}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-icon btn-icon-sm btn-icon-danger"
                                onClick={() => handleRemoveQualityResult(index)}
                                disabled={submitting}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-table-message">No hay parámetros de calidad definidos</div>
                )}
              </div>
            </div>
            
            {/* Notas de la cosecha */}
            <div className="form-section">
              <h3 className="section-title">Notas adicionales</h3>
              
              <div className="form-group">
                <label htmlFor="harvestNotes" className="form-label">Notas sobre la cosecha</label>
                <textarea
                  id="harvestNotes"
                  name="harvestNotes"
                  className="form-control"
                  value={formData.harvestNotes}
                  onChange={handleChange}
                  placeholder="Observaciones y notas sobre el proceso de cosecha"
                  rows={4}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div className="dialog-footer">
        <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2"></span>
              Completando...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Completar cosecha
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompleteHarvestDialog;