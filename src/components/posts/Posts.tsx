import "./posts.css";
import axios from 'axios'; // Asegúrate de tener axios instalado: npm install axios
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import go from 'gojs';

const Posts: React.FC = () =>{
  const navigate = useNavigate()
  const socket = io('http://localhost:3001/reunion');
  
  const [password, setPassword] = useState('');

  // Estado para controlar el valor del campo de entrada
  const [codigoReunion, setCodigoReunion] = useState('');
  const [meetingDetails, setMeetingDetails] = useState({
    name: '',
    description: '',
  });
  const [redirectToReunion, setRedirectToReunion] = useState(false);

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Emitir un evento 'crearReunion' con los detalles de la reunión al servidor
      socket.emit('crearReunion', {
        usuarioId: 11,
        titulo: meetingDetails.name,
        descripcion: meetingDetails.description,
        codigoReunion: codigoReunion,
      });
      console.log('Reunión creando:');

      // Manejar la respuesta del servidor cuando se crea la reunión
      socket.on('reunionCreada', (data) => {
        // console.log('Reunión creada:', data.diagrama);
        // Cerrar el modal después de crear la reunión
        closeModal();
        // Redirige a la página de reunión con el ID y el código
        navigate(`/reunion/${data.reunion.id}/${data.reunion.codigo}`);
      });
    } catch (error) {
      // Manejar errores, por ejemplo, mostrar un mensaje al usuario
      console.error('Error al crear la reunión:', error);
    }
  };
  // Función para manejar cambios en el campo de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleEntrarClick = () => {
    if (codigoReunion.trim() !== '' && password.trim() !== '') {
      try {
        // Emitir un evento 'entrarReunion' con el código y contraseña al servidor
        socket.emit('unirseReunion', { codigoReunion, password });

        // Manejar la respuesta del servidor cuando se entra en la reunión
        socket.on('unirseReunionExitoso', (data) => {
          console.log('data.codigo : ',data.codigo);
          const diagramaData = JSON.parse(data.diagrama.contenido);
          const diagramaModel = new go.GraphLinksModel(diagramaData.nodeDataArray, diagramaData.linkDataArray);
          console.log('diagramaData : ', diagramaData)
          // Redirigir a la página de reunión con el ID y el código
          navigate(`/reunion/${data.id}/${data.codigo}`);
          // navigate(`/reunion/${data.id}/${data.codigo}?reunionId=${data.id}`, {
          //   state: { diagramaModel: diagramaModel }
          // });
        });
      } catch (error) {
        // Manejar errores, por ejemplo, mostrar un mensaje al usuario
        console.error('Error al entrar en la reunión:', error);
      }
    } else {
      // Mostrar un mensaje de error si el código o la contraseña están en blanco
      console.error('Por favor, ingresa un código de reunión y una contraseña.');
    }
  };

  const [modalOpen, setModalOpen] = useState(false);

  // Función para abrir el modal
  const openModal = () => {
    setModalOpen(true);
  }

  // Función para cerrar el modal
  const closeModal = () => {
    setModalOpen(false);
  }
  return (
    <div>
      <main>
        <section className="hero">
          <h1>Reuniones virtuales fáciles y efectivas</h1>
          <p>Conéctate con colegas y amigos en cualquier lugar y en cualquier momento.</p>
          <button onClick={openModal}>Iniciar una reunión</button>
          <div>
            <input
            type="text"
            placeholder="Código de reunión"
            value={codigoReunion}
            onChange={(e) => setCodigoReunion(e.target.value)}
           />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleEntrarClick}>Entrar</button>
          </div>
          
        </section>
      </main>
      {/* Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Iniciar una reunión</h2>
            {/* Formulario para crear la reunión */}
            <form onSubmit={handleFormSubmit}>
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={meetingDetails.name}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                name="description"
                value={meetingDetails.description}
                onChange={handleInputChange}
                required
              />
              <button type="submit" >Crear Reunión</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
