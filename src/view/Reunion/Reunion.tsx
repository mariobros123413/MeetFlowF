import * as go from "gojs";

import { useEffect, useRef, useState } from "react";
import DiagramWrapper from "../DiagramWrapper";
import { ReactDiagram } from "gojs-react";
import { io, Manager } from 'socket.io-client';
import { useParams } from 'react-router-dom';

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

export default function Reunion() {
  const { id, codigo } = useParams();
  console.log('datos recibidos : ', id);
  console.log('datos recibidos : ', codigo);
  const [data, setData] = useState(initialData);
  const [nextNodeX, setNextNodeX] = useState(400);
  const diagramRef = useRef<ReactDiagram | null>(null);
  const socket = io('http://localhost:3001/reunion');
  let timeoutId;
  // const [selectedNode, setSelectedNode] = useState<number | null>(null);
  useEffect(() => {
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
        setData({
          ...data,
          nodeDataArray: model.nodeDataArray,
          linkDataArray: model.linkDataArray,
        });
        // Cancela el envío anterior y programa un nuevo envío después de 500ms
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          socket.emit('actualizarDiagrama', { id, data: { nodeDataArray: model.nodeDataArray, linkDataArray: model.linkDataArray } });
        }, 500);
      }
    }

    console.log("Model changed:", obj);
  };

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
    </div>
  );
}
