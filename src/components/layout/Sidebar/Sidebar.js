import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './sidebar.css';

const Sidebar = ({ collapsed, toggleSidebar, mobileOpen }) => {
  const location = useLocation();
  const { currentUser, hasPermission } = useAuth();
  
  // Opciones del menú principal con permisos requeridos
  const menuOptions = [
    { 
      text: 'Panel Principal', 
      icon: 'fas fa-tachometer-alt', 
      path: '/dashboard',
      permission: 'dashboard'
    },
    { 
      text: 'Productos', 
      icon: 'fas fa-box', 
      path: '/productos',
      permission: 'products'
    },
    { 
      text: 'Transferencias', 
      icon: 'fas fa-exchange-alt', 
      path: '/transferencias',
      permission: 'transfers'
    },
    { 
      text: 'Fumigaciones', 
      icon: 'fas fa-spray-can', 
      path: '/fumigaciones',
      permission: 'fumigations'
    },
    { 
      text: 'Cosechas', 
      icon: 'fas fa-tractor', 
      path: '/cosechas',
      permission: 'harvests'
    },
    { 
      text: 'Campos', 
      icon: 'fas fa-seedling', 
      path: '/campos',
      permission: 'fields'
    },
    { 
      text: 'Almacenes', 
      icon: 'fas fa-warehouse', 
      path: '/almacenes',
      permission: 'warehouses'
    },
    { 
      text: 'Usuarios', 
      icon: 'fas fa-users', 
      path: '/usuarios',
      permission: 'users'
    }
  ];
  
  // Agrupar las opciones por categorías
  const menuCategories = [
    {
      title: 'Principal',
      options: [menuOptions[0]] // Dashboard
    },
    {
      title: 'Inventario',
      options: [menuOptions[1], menuOptions[2]] // Productos y Transferencias
    },
    {
      title: 'Producción',
      options: [menuOptions[3], menuOptions[4], menuOptions[5]] // Fumigaciones, Cosechas y Campos
    },
    {
      title: 'Administración',
      options: [menuOptions[6], menuOptions[7]] // Almacenes y Usuarios
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <i className="fas fa-leaf"></i>
          </div>
          <span className="sidebar-logo-text">AgroGestión</span>
        </Link>
        <button className="sidebar-toggle" onClick={toggleSidebar} title={collapsed ? 'Expandir menú' : 'Colapsar menú'}>
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
      
      <nav className="sidebar-menu">
        {!collapsed && menuCategories.map((category, index) => (
          <div key={index} className="sidebar-category">
            <div className="sidebar-category-title">{category.title}</div>
            {category.options.map((option) => (
              hasPermission(option.permission) && (
                <Link 
                  key={option.path}
                  to={option.path}
                  className={`sidebar-menu-item ${location.pathname === option.path ? 'active' : ''}`}
                >
                  <i className={`${option.icon} sidebar-menu-icon`}></i>
                  <span className="sidebar-menu-text">{option.text}</span>
                </Link>
              )
            ))}
          </div>
        ))}

        {collapsed && menuOptions.map((option) => (
          hasPermission(option.permission) && (
            <Link 
              key={option.path}
              to={option.path}
              className={`sidebar-menu-item ${location.pathname === option.path ? 'active' : ''}`}
              title={option.text}
            >
              <i className={`${option.icon} sidebar-menu-icon`}></i>
              <span className="sidebar-menu-text">{option.text}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="app-version">
          v1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;