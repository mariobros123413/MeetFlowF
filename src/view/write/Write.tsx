import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Write: React.FC = () => {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Realizar la solicitud al backend para obtener los datos del usuario con sus reuniones y diagramas
    const idUsuario = 1; // Reemplaza esto con el ID real del usuario
    axios.get(`http://localhost:3001/usuario/${idUsuario}/reuniones`)
      .then(response => {
        setUsuario(response.data); // Almacena los datos del usuario en el estado
      })
      .catch(error => {
        console.error('Error al obtener los datos del usuario:', error);
      });
  }, []);

  return (
    <div className="write">
      {/* Renderizar tarjetas de reuniones */}
      {usuario && usuario.reuniones.map((reunion: any) => (
        <div className="reunionCard" key={reunion.id}>
          <h2>{reunion.titulo}</h2>
          {/* Muestra la imagen del diagrama o cualquier otro dato que desees */}
          <img src={reunion.diagramaUrl} alt="Diagrama" />
          <p>{reunion.descripcion}</p>
        </div>
      ))}
    </div>
  );
};

export default Write;
