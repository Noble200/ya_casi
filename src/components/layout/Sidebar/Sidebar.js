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

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-leaf sidebar-logo-icon"></i>
          <span className="sidebar-logo-text">AgroGestión</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
      
      <nav className="sidebar-menu">
        {menuOptions.map((option) => (
          // Sólo mostrar opciones a las que el usuario tiene permiso
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