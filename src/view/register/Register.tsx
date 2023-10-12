import "./register.css"
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../axiosInstance'; // Importa la instancia de Axios
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../UserContext';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ci: 0,
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: 0,
    contrasena: '',
  });
  const [error, setError] = useState('');
  const history = useNavigate(); // Obtiene la instancia de la historia de navegación
  const { setAuthenticated } = useUserContext(); // Accede a la función setAuthenticated del contexto
  const { login } = useUserContext(); // Obtiene la función de login del contexto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/user/register', formData); // Ruta del backend para el inicio de sesión
      console.log('Usuario registrado correctamente:', response.data);

      login(response.data); // Guardamos los datos del usuario
      // Estado de autenticado correcto

      localStorage.setItem('token', response.data.user.token);
      localStorage.setItem('userData', JSON.stringify(response.data));


      setAuthenticated(true);

      navigate('/');

    } catch (error) {
      console.error('Error al iniciar Sesión:', error);
      setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };
  return (
    <div className="register">
      <span className="registerTitle">Registro de nuevo usuario</span>
      <form className="registerForm"  onSubmit={handleSubmit}>
        <label>Número de C.I</label>
        <input
          className="registerInput"
          type="number"
          placeholder="Ingrese su C.I"
          value={formData.ci}
          onChange={(e) => setFormData({ ...formData, ci: e.target.valueAsNumber })}
        />
        <label>Nombre</label>
        <input
          className="registerInput"
          type="text"
          placeholder="Ingrese su Nombre Completo"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
        <label>Apellidos</label>
        <input
          className="registerInput"
          type="text"
          placeholder="Ingrese su Apellido Completo"
          value={formData.apellido}
          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
        />
        <label>Dirección </label>
        <input
          className="registerInput"
          type="text"
          placeholder="Ingrese su dirección de domicilio"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
        />
        <label>Número de celular</label>
        <input
          className="registerInput"
          type="number"
          placeholder="Ingrese su número de celular"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.valueAsNumber })}
        />
        <label>Contraseña</label>
        <input
          className="registerInput"
          type="password"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
        />
        <button className="registerButton">Registrar</button>
      </form>
      <button className="registerLoginButton">
        <Link to="/login">Ya tienes cuenta?</Link>
      </button>
    </div>
  )
}
