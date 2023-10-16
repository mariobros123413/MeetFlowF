import * as go from "gojs";
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { useNavigate } from 'react-router-dom';

import { useEffect, useRef, useState } from "react";
import DiagramWrapper from "../DiagramWrapper";
import { ReactDiagram } from "gojs-react";
import { io } from 'socket.io-client';
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
  const myDiagram = new go.Diagram();
  const model = new go.GraphLinksModel();
  myDiagram.model = model;
  // const { diagramaModel } = location.state ?? { diagramaModel: initialData };
  // const { diagramaModel } = location.state.diagramaModel ?? '';
  const { id, codigo } = useParams();
  const [data, setData] = useState(initialData);
  const [, setReunionTipo] = useState('nueva'); // Por defecto, es una reunión nueva
  // const password  = location.state.password ?? '';
  const [nextNodeX, setNextNodeX] = useState(400);
  const navigate = useNavigate()

  const diagramRef = useRef<ReactDiagram | null>(null);
  const socket = io('https://meetflow-production.up.railway.app/reunion');
  let timeoutId;
  // const [selectedNode, setSelectedNode] = useState<number | null>(null);
  useEffect(() => {
    axios.get(`https://meetflow-production.up.railway.app/diagrama/obtenerDiagramaIdReunion/${id}`)
      .then(async (response) => {
        // Si la solicitud es exitosa, actualiza el estado con los datos del diagrama

        const tipo = (location.state && location.state.tipo) || 'default'; // Asigna 'default' si tipo es null o undefined
        const usuarioId = (location.state && location.state.usuarioId) || 'default'; // Asigna 'default' si tipo es null o undefined
        console.log("tipo: ", tipo)
        if (tipo === 'unirse' || tipo === 'nueva' || (location.state && location.state.usuarioId === response.data.usuarioId)) {
          await axios.post(`https://meetflow-production.up.railway.app/colaborador/agregar`, { //Registramos al usuario como colaborador
            usuarioId: usuarioId, // Asegúrate de tener el ID del usuario en el estado de tu componente
            reunionId: id, // ID de la reunión a la que se está uniendo el usuario
          });
          setData(response.data);
          setReunionTipo(tipo);
        } else {
          navigate('/')
        }
      })
      .catch((error) => {
        // Maneja errores, por ejemplo, mostrando un mensaje al usuario
        console.error('Error al obtener el diagrama:', error);
      });

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
  const addNode = (_position) => {
    // Genera un nuevo nodo con una clave única
    const newNode = {
      key: "newNode" + Date.now(), // Puedes utilizar una lógica diferente para generar claves únicas
      text: "NewNode",
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
    convertSVG();
    setNextNodeX(nextNodeX + 100);
  };

  const handleDiagramEvent = (_e: go.DiagramEvent) => { };

  // Cuando se realice un cambio
  const handleModelChange = (obj: go.IncrementalData) => {
    if (diagramRef.current) {
      const model: any = diagramRef.current?.getDiagram()?.model;

      if (model && model.linkDataArray) {
        const formattedLinkDataArray = model.linkDataArray.map((linkData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          return {
            from: linkData.from,
            key: linkData.key,
            text: linkData.text,
            time: linkData.time,
            to: linkData.to,
            // Agrega otras propiedades según sea necesario
          };
        });
        const formattedNodeDataArray = model.nodeDataArray.map((nodeData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          console.log('nodedataarrray : ', nodeData)
          return {
            duration: nodeData.duration,
            group: nodeData.group,
            key: nodeData.key,
            start: nodeData.start,
            // Agrega otras propiedades según sea necesario
          };
        });
        const diagramData = {
          ...data,
          nodeDataArray: formattedNodeDataArray,
          linkDataArray: formattedLinkDataArray,
        };

        setData(diagramData);

        // Cancela el envío anterior y programa un nuevo envío después de 500ms
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          socket.emit('actualizarDiagrama', { id, data: { nodeDataArray: model.nodeDataArray, linkDataArray: model.linkDataArray } });
        }, 500);

        const reunionId = id;

        socket.emit('guardarDiagrama', { reunionId, diagrama: JSON.stringify(diagramData) });
        convertSVG();
      }
    }

    console.log("Model changed:", obj);
  };
  interface UMLView {
    _type: string;
    _id: string;
    _parent?: Parent;
    name: string;
    defaultDiagram?: boolean;
    ownedElements?: UMLView[];
    ownedViews?: UMLView[];
    // Otros campos si es necesario
  }

  interface StarUMLData {
    _type: string;
    _id: string;
    name: string;
    ownedElements: UMLView[];
  }

  interface Parent {
    $ref: string;
  }
  const exportDiagramToStarUMLFormat = (): any => {
    const diagram = diagramRef.current.getDiagram();
    const nodes = diagram.nodes;
    const starUMLData: StarUMLData = {
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
          "ownedElements": [{
            "_type": "UMLClassDiagram",
            "_id": "AAAAAAFF+qBtyKM79qY=",
            "_parent": {
              "$ref": "AAAAAAFF+qBWK6M3Z8Y="
            },
            "name": "Main",
            "defaultDiagram": true
          }]
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
                  "ownedViews": []
                }]
            }
          ]
        },
      ]
    };


    // const nodeIDMap: { [key: string]: string } = {};

    nodes.each(node => {
      const umlClassDiagram = {
        "_type": "UMLSeqLifelineView",
        "_id": generateUniqueId(),
        "name": node.text,
        "ownedViews": []
      };

      starUMLData.ownedElements[1].ownedElements[0].ownedElements[0].ownedViews.push(umlClassDiagram);

      const umlSeqLifelineView = {
        "_type": "UMLSeqLifelineView",
        "_id": generateUniqueId(),
        "_parent": {
          "$ref": umlClassDiagram._id
        },
        "model": {
          "$ref": umlClassDiagram._id
        },
        "subViews": [
          {
            "_type": "UMLNameCompartmentView",
            "_id": generateUniqueId(),
            "_parent": {
              "$ref": umlClassDiagram._id
            },
            "model": {
              "$ref": umlClassDiagram._id
            },
            "subViews": [
              {
                "_type": "LabelView",
                "_id": generateUniqueId(),
                "_parent": {
                  "$ref": umlClassDiagram._id
                },
                "font": "Arial;13;1",
                "left": 0,
                "top": 0,
                "width": 100,
                "height": 20,
                "text": node.text
              }
            ]
          }
        ]
      };

      umlClassDiagram.ownedViews.push(umlSeqLifelineView);
    });


    // Ahora starUMLData contiene la estructura de datos de tus nodos en el formato de StarUML
    // console.log(JSON.stringify(starUMLData, null, 2));
    return JSON.stringify(starUMLData, null, 2);
  };

  const downloadJSON = (data, filename) => {
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
        const svgText = new XMLSerializer().serializeToString(svgString);

        // Crea un Blob con el contenido SVG
        const blob = new Blob([svgText], { type: 'image/svg+xml' });

        // Descarga el archivo SVG
        saveAs(blob, 'diagrama.svg');

        axios.post('https://meetflow-production.up.railway.app/reuniones/savesvg', { svgString: svgText, id })
          .then(_response => {
            // console.log('SVG guardado correctamente en el servidor:', response.data);
          })
          .catch(error => {
            console.error('Error al guardar el SVG:', error);
          });
      }
    }
  };
  const convertSVG = () => {
    const diagram = diagramRef.current.getDiagram();

    if (diagram) {
      // Obtén el elemento SVG del diagrama
      const svgString = diagram.makeSvg({
        scale: 1,  // Puedes ajustar la escala según sea necesario
        background: 'white',  // Puedes cambiar el fondo si lo deseas
      });
      const svgText = new XMLSerializer().serializeToString(svgString);

      axios.post('https://meetflow-production.up.railway.app/reuniones/savesvg', { svgString: svgText, id })
        .then(_response => {
          // console.log('SVG guardado correctamente en el servidor:', response.data);
        })
    }
  };
  // Función para encontrar el ID del nodo correspondiente en StarUML a partir de la clave del nodo de GoJS

  const handleConvertJavaButtonClick = () => {
    if (diagramRef.current) {
      const model: any = diagramRef.current?.getDiagram()?.model;
      if (model && model.linkDataArray) {        // Enviar los datos al backend para la conversión a Java
        const formattedLinkDataArray = model.linkDataArray.map((linkData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          return {
            from: linkData.from,
            key: linkData.key,
            text: linkData.text,
            time: linkData.time,
            to: linkData.to,
            // Agrega otras propiedades según sea necesario
          };
        });
        const formattedNodeDataArray = model.nodeDataArray.map((nodeData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          console.log('nodedataarrray : ', nodeData)
          return {
            duration: nodeData.duration,
            group: nodeData.group,
            key: nodeData.key,
            start: nodeData.start,
            // Agrega otras propiedades según sea necesario
          };
        });
        const diagramData = {
          ...data,
          nodeDataArray: formattedNodeDataArray,
          linkDataArray: formattedLinkDataArray,
        };
        axios.post('https://meetflow-production.up.railway.app/reuniones/java', diagramData)
          .then(response => {
            // Obtener el contenido de texto del servidor
            const javaCode = response.data;

            // Crear un Blob con el contenido de texto
            const blob = new Blob([javaCode], { type: 'text/plain' });

            // Crear una URL para el Blob
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace <a> para descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = 'DiagramaJava.java'; // Nombre del archivo a descargar

            // Agregar el enlace al DOM y hacer clic en él para iniciar la descarga
            document.body.appendChild(a);
            a.click();

            // Eliminar el enlace del DOM después de la descarga
            window.URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Error al enviar datos al backend:', error);
          });
      }
    }
  };
  const handleConvertPythonButtonClick = () => {
    if (diagramRef.current) {
      const model: any = diagramRef.current?.getDiagram()?.model;

      if (model && model.linkDataArray) {
        const formattedLinkDataArray = model.linkDataArray.map((linkData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          return {
            from: linkData.from,
            key: linkData.key,
            text: linkData.text,
            time: linkData.time,
            to: linkData.to,
            // Agrega otras propiedades según sea necesario
          };
        });
        const formattedNodeDataArray = model.nodeDataArray.map((nodeData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          console.log('nodedataarrray : ', nodeData)
          return {
            duration: nodeData.duration,
            group: nodeData.group,
            key: nodeData.key,
            start: nodeData.start,
            // Agrega otras propiedades según sea necesario
          };
        });
        const diagramData = {
          ...data,
          nodeDataArray: formattedNodeDataArray,
          linkDataArray: formattedLinkDataArray,
        };

        axios.post('https://meetflow-production.up.railway.app/reuniones/python', diagramData)
          .then(response => {
            // Obtener el contenido de texto del servidor
            const pythonCode = response.data;

            // Crear un Blob con el contenido de texto
            const blob = new Blob([pythonCode], { type: 'text/plain' });

            // Crear una URL para el Blob
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace <a> para descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = 'DiagramaPython.py'; // Nombre del archivo a descargar

            // Agregar el enlace al DOM y hacer clic en él para iniciar la descarga
            document.body.appendChild(a);
            a.click();

            // Eliminar el enlace del DOM después de la descarga
            window.URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Error al enviar datos al backend:', error);
          });
      }
    }
  };
  const handleConvertJavaScriptButtonClick = () => {
    if (diagramRef.current) {
      const model: any = diagramRef.current?.getDiagram()?.model;

      if (model && model.linkDataArray) {
        const formattedLinkDataArray = model.linkDataArray.map((linkData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          return {
            from: linkData.from,
            key: linkData.key,
            text: linkData.text,
            time: linkData.time,
            to: linkData.to,
            // Agrega otras propiedades según sea necesario
          };
        });
        const formattedNodeDataArray = model.nodeDataArray.map((nodeData: go.ObjectData) => {
          // Transforma linkData según la estructura esperada
          // Por ejemplo, asumiendo que linkData tiene propiedades 'source', 'target', 'text', 'time', etc.
          console.log('nodedataarrray : ', nodeData)
          return {
            duration: nodeData.duration,
            group: nodeData.group,
            key: nodeData.key,
            start: nodeData.start,
            // Agrega otras propiedades según sea necesario
          };
        });
        const diagramData = {
          ...data,
          nodeDataArray: formattedNodeDataArray,
          linkDataArray: formattedLinkDataArray,
        };

        axios.post('https://meetflow-production.up.railway.app/reuniones/javascript', diagramData)
          .then(response => {
            // Obtener el contenido de texto del servidor
            const jsCode = response.data;

            // Crear un Blob con el contenido de texto
            const blob = new Blob([jsCode], { type: 'text/plain' });

            // Crear una URL para el Blob
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace <a> para descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = 'DiagramaJavaScript.js'; // Nombre del archivo a descargar

            // Agregar el enlace al DOM y hacer clic en él para iniciar la descarga
            document.body.appendChild(a);
            a.click();

            // Eliminar el enlace del DOM después de la descarga
            window.URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Error al enviar datos al backend:', error);
          });
      }
    }
  };

  const handleGojsDownloadButtonClick = () => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        const jsonData = diagram.model.toJson();
        const blob = new Blob([jsonData], { type: 'application/gojs' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagramGoJS.gojs'; // Nombre del archivo a descargar
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  };
  const handleUploadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        if (data) {
          const jsonData = typeof data === "string" ? JSON.parse(data) : null;
          if (jsonData) {
            if (diagramRef.current) {
              const diagram = diagramRef.current.getDiagram();
              if (diagram) {
                diagram.model = go.Model.fromJson(jsonData);
              }
            }
          } else {
            console.error("Error al analizar el archivo JSON.");
          }
        }
      };
      reader.readAsText(file);
    } else {
      console.error("No se seleccionó ningún archivo.");
    }
  };



  // En tu componente de JSX, agrega un input de tipo "file" para cargar el archivo
  <input type="file" accept=".gojs" onChange={handleUploadFile} key={Math.random()} />

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
        <button onClick={handleConvertJavaButtonClick}>Convertir a Java</button>
      </div>
      <div>
        <button onClick={handleConvertPythonButtonClick}>Convertir a Python</button>
      </div>
      <div>
        <button onClick={handleConvertJavaScriptButtonClick}>Convertir a JavaScript</button>
      </div>
      <div>
        <button onClick={handleGojsDownloadButtonClick}>Descargar Diagrama GoJs</button>
      </div>
      <input type="file" accept=".gojs" onChange={handleUploadFile} key={Math.random()} />

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