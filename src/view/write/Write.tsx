import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from "../../UserContext";
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia, { CardMediaProps } from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import io from 'socket.io-client';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface CustomCardMediaProps extends CardMediaProps {
  svgString: string;
  alt: string;
  title: string;
}
const Write: React.FC = () => {
  const [usuario, setUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user, logout } = useUserContext();
  const navigate = useNavigate()
  const socket = io('https://meetflow-production.up.railway.app/reunion');

  useEffect(() => {
    // Realizar la solicitud al backend para obtener los datos del usuario con sus reuniones y diagramas
    if (!user || (user.id === null || user.id === undefined)) {
      logout();
      localStorage.removeItem('token'); // Borra el token del Local Storage
      localStorage.removeItem('userData'); // Borra los datos del usuario del Local Storage
      navigate('/'); // Redirige a la página de inicio
    } else {
      const idUsuario = user.id; // Reemplaza esto con el ID real del usuario
      axios.get(`https://meetflow-production.up.railway.app/reuniones/${idUsuario}/reuniones`)
        .then(response => {
          console.log(response.data);
          setUsuario(response.data); // Almacena los datos del usuario en el estado
        })
        .catch(error => {
          console.error('Error al obtener los datos del usuario:', error);
        });
    }

  }, []);
  function SVGImage({ svgString, alt }) {
    // Convierte la cadena SVG en un Data URL
    const dataURL = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

    return (
      <img src={dataURL} alt={alt} style={{ width: '100%', height: '100%' }} />
    );
  }

  function CustomCardMedia({ svgString, alt, title, ...props }: CustomCardMediaProps) {
    return (
      <CardMedia
        component={() => <SVGImage svgString={svgString} alt={alt} />}
        title={title}
        {...props}
      />
    );
  }
  
  
  const handleEntrarClick = (codigo, password) => {
    try {
      console.log('user.id : ', user.id)
      // logout();
      // localStorage.removeItem('token');
      // localStorage.removeItem('userData');
      // navigate('/');
      console.log(codigo);
      console.log(password);

      socket.emit('unirseReunion', { codigoReunion: codigo, password: password, usuarioId: usuario.usuarioid });
      socket.on('unirseReunionExitoso', (data) => {
        navigate(`/reunion/${data.id}/${data.codigo}`, {
          state: { tipo: 'unirse', usuarioId: user.id },
        });
      });
    } catch (error) {
      console.error('Error al entrar en la reunión:', error);
    }
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredReuniones = usuario ? usuario.filter((reunion) => {
    const titleMatch = reunion.diagrama_titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch = reunion.diagrama_descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || descriptionMatch;
  }):[];

  return (
    <div>
      <div>
        <Box
          sx={{
            width: '50%',
            maxWidth: '100%',
            paddingTop: '30px'
          }}
        >
          <TextField
            fullWidth
            label="Buscar"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* Renderizar tarjetas de reuniones */}
        {filteredReuniones.map((reunion: any) => (
          <div key={reunion.id} style={{ margin: '15px' }}>
            <Card sx={{ maxWidth: 345, border: '1px solid #085659' }}>
              <CustomCardMedia svgString={reunion.svg} alt="Descripción alternativa de la imagen SVG" title="Título de la imagen" />

              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {reunion.diagrama_titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {reunion.diagrama_descripcion}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEntrarClick(reunion.codigo, reunion.password)}>Entrar</Button>
              </CardActions>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

};

export default Write;
