import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useUserContext } from "./UserContext";
import Homepage from "./view/homepage/Homepage";
import Login from "./view/login/Login";
import Register from "./view/register/Register";
import Reunion from './view/Reunion/Reunion';
import Settings from "./view/settings/Settings";
import Single from "./view/single/Single";
import Write from "./view/write/Write";
import Topbar from "./components/topbar/topbar";

export default function App(){
  const { authenticated } = useUserContext();
  const isAuthenticated = authenticated !== null;
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Topbar />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path="/posts" element={<Homepage />} />
        <Route path="/register" element={isAuthenticated && token ? <Homepage /> : <Register />} />
        <Route path="/login" element={isAuthenticated && token ? <Homepage /> : <Login />} />
        <Route path="/post/:id" element={<Single />} />
        <Route path="/write" element={isAuthenticated && token ? <Write /> : <Login />} />
        <Route path="/settings" element={isAuthenticated && token ? <Settings /> : <Login />} />
        <Route path='/reunion/:id/:codigo' element={<Reunion />} />
      </Routes>
    </Router>
  );
}