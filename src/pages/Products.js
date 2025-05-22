// src/pages/Products.js - Página principal de productos que conecta con el controlador
import React from 'react';
import ProductsPanel from '../components/panels/Products/ProductsPanel';
import useProductsController from '../controllers/ProductsController';

const Products = () => {
  // Usar el controlador para obtener datos y funciones
  const {
    products,
    fields,
    warehouses,
    loading,
    error,
    selectedProduct,
    dialogOpen,
    dialogType,
    filterOptions,
    handleAddProduct,
    handleEditProduct,
    handleViewProduct,
    handleDeleteProduct,
    handleSaveProduct,
    handleFilterChange,
    handleSearch,
    handleCloseDialog,
    refreshData
  } = useProductsController();

  // Renderizar el componente visual con los datos del controlador
  return (
    <ProductsPanel
      products={products}
      fields={fields}
      warehouses={warehouses}
      loading={loading}
      error={error}
      selectedProduct={selectedProduct}
      dialogOpen={dialogOpen}
      dialogType={dialogType}
      filterOptions={filterOptions}
      onAddProduct={handleAddProduct}
      onEditProduct={handleEditProduct}
      onViewProduct={handleViewProduct}
      onDeleteProduct={handleDeleteProduct}
      onSaveProduct={handleSaveProduct}
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      onCloseDialog={handleCloseDialog}
      onRefresh={refreshData}
    />
  );
};

export default Products;