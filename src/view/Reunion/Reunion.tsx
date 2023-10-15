import * as go from "gojs";
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { useNavigate } from 'react-router-dom';
import { useUserContext } from "../../UserContext";

import { useEffect, useRef, useState } from "react";
import DiagramWrapper from "../DiagramWrapper";
import { ReactDiagram } from "gojs-react";
import { io, Manager } from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const initialData = {
  nodeDataArray: [
    {
      key: "Fred",
      text: "Fred: Patron",
      isGroup: true,
      loc: "0 0",
      duration: 9,
    },
    {
      key: "Bob",
      text: "Bob: Waiter",
      isGroup: true,
      loc: "100 0",
      duration: 9,
    },
    {
      key: "Hank",
      text: "Hank: Cook",
      isGroup: true,
      loc: "200 0",
      duration: 9,
    },
    {
      key: "Renee",
      text: "Renee: Cashier",
      isGroup: true,
      loc: "300 0",
      duration: 9,
    },
    { group: "Bob", start: 1, duration: 2 },
    { group: "Hank", start: 2, duration: 3 },
    { group: "Fred", start: 3, duration: 1 },
    { group: "Bob", start: 5, duration: 1 },
    { group: "Fred", start: 6, duration: 2 },
    { group: "Renee", start: 8, duration: 1 },
  ],

  linkDataArray: [
    { from: "Fred", to: "Bob", text: "order", time: 1 },
    { from: "Bob", to: "Hank", text: "order food", time: 2 },
    { from: "Bob", to: "Fred", text: "serve drinks", time: 3 },
    { from: "Hank", to: "Bob", text: "finish cooking", time: 5 },
    { from: "Bob", to: "Fred", text: "serve food", time: 6 },
    { from: "Fred", to: "Renee", text: "pay", time: 8 },
  ],
};

const Reunion: React.FC = () => {
  const location = useLocation();

  // const { diagramaModel } = location.state ?? { diagramaModel: initialData };
  // const { diagramaModel } = location.state.diagramaModel ?? '';
  const { id, codigo } = useParams();
  const [data, setData] = useState(initialData);
  const [reunionTipo, setReunionTipo] = useState('nueva'); // Por defecto, es una reunión nueva
  // const password  = location.state.password ?? '';
  const [nextNodeX, setNextNodeX] = useState(400);
  const diagramRef = useRef<ReactDiagram | null>(null);
  const socket = io('http://localhost:3001/reunion');
  let timeoutId;
  // const [selectedNode, setSelectedNode] = useState<number | null>(null);
  useEffect(() => {
    axios.get(`http://localhost:3001/diagrama/obtenerDiagramaIdReunion/${id}`)
    .then((response) => {
      // Si la solicitud es exitosa, actualiza el estado con los datos del diagrama
      console.log('Reunion es unirse')
      setData(response.data);
    })
    .catch((error) => {
      // Maneja errores, por ejemplo, mostrando un mensaje al usuario
      console.error('Error al obtener el diagrama:', error);
    });
    // if (location.state && location.state.diagramaModel === '') { //es nueva
    //   console.log('Reunion es creado')
    //   setData(initialData);
    // } else { // podría ser agarrado de un link o Unirse Reunion
    //   const idReunion = id;
    //   // Si no es una reunión para unirse, hace una solicitud para obtener el diagrama por ID
    //   axios.get(`http://localhost:3001/diagrama/obtenerDiagramaIdReunion/${idReunion}`)
    //     .then((response) => {
    //       // Si la solicitud es exitosa, actualiza el estado con los datos del diagrama
    //       console.log('Reunion es unirse')
    //       setData(response.data);
    //     })
    //     .catch((error) => {
    //       // Maneja errores, por ejemplo, mostrando un mensaje al usuario
    //       console.error('Error al obtener el diagrama:', error);
    //     });

    // }
    socket.on('actualizarDiagramas', (updateData) => {
      console.log('data recib: ', updateData);
      setData(updateData,);
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  // Función para generar un ID único para los elementos de StarUML
  const generateUniqueId = () => {
    return "AAAAAAFF+" + Math.random().toString(36).substr(2, 9);
  };
  // Función para gregar nodo
  const addNode = (position) => {
    // Genera un nuevo nodo con una clave única
    const newNode = {
      key: "newNode" + Date.now(), // Puedes utilizar una lógica diferente para generar claves únicas
      text: "New Node",
      isGroup: true,
      loc: `${nextNodeX} 0`, // Ubicado en la posición del doble clic
      duration: 3, // Ajusta la duración según tus necesidades
    };

    // Copia el array existente y agrega el nuevo nodo
    const newNodeDataArray = [...data.nodeDataArray, newNode];

    // Actualiza el estado con el nuevo array de nodos
    setData({
      ...data,
      nodeDataArray: newNodeDataArray,
    });
    socket.emit('actualizarDiagrama', { id, data: { nodeDataArray: newNodeDataArray, linkDataArray: data.linkDataArray } });

    setNextNodeX(nextNodeX + 100);
  };

  const handleDiagramEvent = (e: go.DiagramEvent) => { };

  // Cuando se realice un cambio
  const handleModelChange = (obj: go.IncrementalData) => {
    if (diagramRef.current) {
      const model = diagramRef.current.getDiagram()?.model;

      if (model) {
        const diagramData = {
          ...data,
          nodeDataArray: model.nodeDataArray,
          linkDataArray: model.linkDataArray,
        };

        // Convierte el objeto del diagrama en JSON y guárdalo en el estado o variable
        setData(diagramData);
        // Cancela el envío anterior y programa un nuevo envío después de 500ms
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          socket.emit('actualizarDiagrama', { id, data: { nodeDataArray: model.nodeDataArray, linkDataArray: model.linkDataArray } });
        }, 500);

        const reunionId = id;

        socket.emit('guardarDiagrama', { reunionId, diagrama: JSON.stringify(diagramData) });
      }
    }

    console.log("Model changed:", obj);
  };
  interface Node {
    key: string;
    text: string;
  }

  interface Link {
    fromNode: string;
    toNode: string;
    text: string;
  }

  const exportDiagramToStarUMLFormat = (nodes: Node[], links: Link[]): any => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        const nodes = diagram.nodes;
        const links = diagram.links;

        const starUMLData = {
          "_type": "Project",
          "_id": generateUniqueId(),
          "name": "Untitled",
          "ownedElements": [
            {
              "_type": "UMLModel",
              "_id": generateUniqueId(),
              "_parent": {
                "$ref": "AAAAAAFF+h6SjaM2Hec="
              },
              "name": "Model",
              "ownedElements": [
                {
                  "_type": "UMLClassDiagram",
                  "_id": generateUniqueId(),
                  "_parent": {
                    "$ref": "AAAAAAFF+qBWK6M3Z8Y="
                  },
                  "name": "Main",
                  "defaultDiagram": true
                }
              ]
            },
            {
              "_type": "UMLCollaboration",
              "_id": "AAAAAAGLJAOQRVhkBy0=",
              "_parent": {
                "$ref": "AAAAAAFF+h6SjaM2Hec="
              },
              "name": "Collaboration1",
              "ownedElements": [
                {
                  "_type": "UMLInteraction",
                  "_id": "AAAAAAGLJAOQRVhl3xg=",
                  "_parent": {
                    "$ref": "AAAAAAGLJAOQRVhkBy0="
                  },
                  "name": "Interaction1",
                  "ownedElements": [
                    {
                      "_type": "UMLSequenceDiagram",
                      "_id": "AAAAAAGLJAOQRVhm/Og=",
                      "_parent": {
                        "$ref": "AAAAAAGLJAOQRVhl3xg="
                      },
                      "name": "SequenceDiagram1",
                      "ownedViews": [
                        // CONTINUACIÓN DE LO QUE TE PEDÍ QUE VAYAS ITERANDO PARA OBTENER LOS VALORES
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        };
        const nodeIDMap: { [key: string]: string } = {};

        nodes.each(node => {
          const umlClassDiagram = {
            "_type": "UMLClassDiagram",
            "_id": generateUniqueId(),
            "name": node.text,
            "ownedViews": []
          };
          starUMLData.ownedElements[0].ownedElements.push(umlClassDiagram);

          // Agregar al mapa de IDs
          nodeIDMap[node.key] = umlClassDiagram._id;

          // Añadir nodos
          const nodeObject = {
            "_type": "Node",
            "_id": generateUniqueId(),
            "text": node.text,
            "_parent": umlClassDiagram._id
          };
          umlClassDiagram.ownedViews.push(nodeObject);
        });

        // Agregar enlaces
        links.each(link => {
          const umlMessage = {
            "_type": "UMLMessage",
            "_id": generateUniqueId(),
            "name": link.text,
            "source": nodeIDMap[link.fromNode],
            "target": nodeIDMap[link.toNode]
          };
          starUMLData.ownedElements[0].ownedElements.push(umlMessage);
        });

        // Ahora starUMLData contiene la estructura de datos de tu diagrama en el formato de StarUML
        // console.log(JSON.stringify(starUMLData, null, 2));
        return JSON.stringify(starUMLData, null, 2);
      }
    }
  };
  // Uso de la función
  const nodes: Node[] = [
    { key: "1", text: "ClassA" },
    { key: "2", text: "ClassB" }
  ];

  const links: Link[] = [
    { fromNode: "1", toNode: "2", text: "Association" }
  ];

  const starUMLData = exportDiagramToStarUMLFormat(nodes, links);

  const downloadJSON = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url); // Liberar el objeto URL
  };

  const handleDownloadButtonClick = () => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        const starUMLData = exportDiagramToStarUMLFormat();
        console.log('starumnl : ', starUMLData);
        downloadJSON(starUMLData, "staruml_data.mdj");
      }
    }
  };
  // En tu componente frontend

  const downloadSvg = () => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();

      if (diagram) {
        // Obtén el elemento SVG del diagrama
        const svgString = diagram.makeSvg({
          scale: 1,  // Puedes ajustar la escala según sea necesario
          background: 'white',  // Puedes cambiar el fondo si lo deseas
        });
        const svgStrings = new XMLSerializer().serializeToString(svgString);
        const svgText = new XMLSerializer().serializeToString(svgString);

        // Crea un Blob con el contenido SVG
        const blob = new Blob([svgText], { type: 'image/svg+xml' });

        // Descarga el archivo SVG
        saveAs(blob, 'diagrama.svg');

        axios.post('http://localhost:3001/reuniones/savesvg', { svgString: svgText, id })
          .then(response => {
            console.log('SVG guardado correctamente en el servidor:', response.data);
          })
          .catch(error => {
            console.error('Error al guardar el SVG:', error);
          });
      }
    }
  };
  // Función para encontrar el ID del nodo correspondiente en StarUML a partir de la clave del nodo de GoJS
  function findNodeId(node) {
    // Asumiendo que el ID del nodo está almacenado en la propiedad 'key'
    return node.key;
  }


  // Llama a la función para exportar el diagrama a StarUML

  return (
    <div>
      <DiagramWrapper
        diagramRef={diagramRef}
        nodeDataArray={data.nodeDataArray}
        linkDataArray={data.linkDataArray}
        onDiagramEvent={handleDiagramEvent}
        onModelChange={handleModelChange}
      // onNodeDoubleClicked={handleNodeDoubleClicked}
      />
      <button onClick={addNode}>Add Node</button>
      <div>
        <button onClick={handleDownloadButtonClick}>Exportar Diagrama</button>
      </div>
      <div>
        <button onClick={downloadSvg}>Descargar Imagen SVG</button>
      </div>
      <div>
        Datos de la Reunión:
        <ul>
          <li>Codigo de la Reunión: {codigo} </li>
          {/* {password && <li>Contraseña de la Reunión: {password}</li>} */}
        </ul>
      </div>
    </div>
  );
};
export default Reunion;
