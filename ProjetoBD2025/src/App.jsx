import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./components/Home";
import TelaLogin from "./components/TelaLogin";
import TelaADM from "./components/TelaADM";
import TelaPerfil from "./components/TelaPerfil";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);


  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/tela-adm");
    }
  }, [user, navigate]);

  return (
      <Routes>
        <Route path="/" element={<MainLayout user={user} setUser={setUser} />}>
          <Route index element={<Home user={user} />} />
          <Route path="tela-login" element={<TelaLogin setUser={setUser} />} />
          <Route path="tela-perfil" element={<TelaPerfil user={user} />} />
          <Route
            path="tela-adm"
            element={user?.role === "admin" ? <TelaADM /> : <Home user={user} />}
          />
        </Route>

      </Routes>
  );
}

export default App;