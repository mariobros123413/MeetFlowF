import "./login.css";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../axiosInstance'; // Importa la instancia de Axios
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../UserContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    ci: 0,
    contrasena: '',
  });
  const [error, setError] = useState('');
  const history = useNavigate(); // Obtiene la instancia de la historia de navegación
  const { setAuthenticated } = useUserContext(); // Accede a la función setAuthenticated del contexto
  const { login } = useUserContext(); // Obtiene la función de login del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/user/login', formData); // Ruta del backend para el inicio de sesión
      console.log('Inicio de sesión correctamente:',response.data.user.token);

      login(response.data); // Guardamos los datos del usuario
      login({
        token: response.data.user.token,
        id: response.data.user.usuario.id,
        ci: response.data.user.usuario.ci,
        nombre: response.data.user.usuario.nombre,
        apellido: response.data.user.usuario.apellido,
        // ...otros campos del usuario
      });
      // Estado de autenticado correcto
      
      localStorage.setItem('token', response.data.user.token);
      localStorage.setItem('id', response.data.user.usuario.id);

      localStorage.setItem('userData', JSON.stringify(response.data));
  

      setAuthenticated(true);

      history('/');

    } catch (error) {
      
      console.error('Error al iniciar Sesión:', error);
      setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <div className="login">
      <span className="loginTitle">Inicio de Sesión</span>
      {error && <p>{error}</p>} {/* Muestra el mensaje de error si está configurado */}
      <form className="loginForm" onSubmit={handleSubmit}>
        <label>Número de C.I</label>
        <input
          type="number"
          placeholder="Ingrese su C.I"
          value={formData.ci}
          onChange={(e) => setFormData({ ...formData, ci: e.target.valueAsNumber })}
        />
        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
        />
        <button className="loginButton">Iniciar Sesión</button>
      </form>
      <button className="loginRegisterButton">
        <Link to="/register">No estás registrado?</Link>
      </button>
    </div>
  );
};

export default Login;
