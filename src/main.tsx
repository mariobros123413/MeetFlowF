import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { UserProvider } from './UserContext'; // Ruta relativa desde el archivo index.js
// Recupera la información de autenticación desde el Local Storage
const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(


  <UserProvider initialAuthenticated={!!token} initialUserData={userData}>
    <script src="https://unpkg.com/gojs@2.3.11/release/go.js"></script>

    <App />
  </UserProvider>
);

