import React from 'react';
import { Link } from 'react-router-dom';
import './topbar.css';
import { useUserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';

const Topbar: React.FC = () => {
  const { authenticated, user, logout } = useUserContext();
  const navigate = useNavigate();

  const isAuthenticated: boolean = authenticated !== null;
  const token: string | null = localStorage.getItem('token');
  const handleLogout = () => {
    logout();
    localStorage.removeItem('token'); // Borra el token del Local Storage
    localStorage.removeItem('userData'); // Borra los datos del usuario del Local Storage
    navigate('/'); // Redirige a la página de inicio
  };
  return (
    <div className="top">
      <div className="topLeft">{/* Contenido del lado izquierdo de la barra superior */}</div>
      <div className="topRight">
        <ul className="topList">
          <li className="topListItem">
            <Link className="link" to="/">
              Inicio
            </Link>
          </li>
          <li className="topListItem">
            <Link className="link, topListItem" to="/diagramas">
              Tus Diagramas
            </Link>
          </li>
          <li className="topListItem">Sobre Mí</li>
          <li className="topListItem">Contáctame</li>
        </ul>
      </div>
      <div className="topRight">
        {isAuthenticated && token ? (
          <div className="">
            <ul className="topList">
              {user && (
                <li className="topListItem" style={{ marginTop: '25px', cursor: 'text' }}>
                  {user.nombre} {user.apellido}
                </li>
              )}

              <li>
                <Link className="link" to="/settings">
                  <img
                    className="topImg" style={{ marginTop: '17px' }}
                    src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                    alt=""
                  />
                </Link>
              </li>
              <li>
                <button className="topLogoutButton" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <ul className="topList">
            <li className="topListItem">
              <Link className="link" to="/login">
                Iniciar Sesión
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/register">
                Crear Cuenta
              </Link>
            </li>
          </ul>
        )}
        <i className="topSearchIcon fas fa-search"></i>
      </div>
    </div>
  );
};

export default Topbar;
