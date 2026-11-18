import { useState } from "react";
import { Box } from "@mui/material";

import Menu from "./components/Menu";
import Dashboard from "./pages/Dashboard/Dashboard";
import Agenda from "./pages/Agenda/Agenda";
import Quadras from "./pages/Quadras/Quadras";
import Usuarios from "./pages/Usuarios/Usuarios";
import Perfil from "./pages/Perfil/Perfil";
import Reservas from "./pages/Reservas/Reservas";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha";


const drawerWidth = 240;

function App() {
  const [paginaAtual, setPaginaAtual] = useState("Dashboard");
  const [telaLogin, setTelaLogin] = useState(true);
  const [telaEsqueci, setTelaEsqueci] = useState(false);
  const { autenticado } = useAuth();

  if (!autenticado) {
    if (telaEsqueci) {
      return <EsqueciSenha onVoltar={() => setTelaEsqueci(false)} />;
    }

    return telaLogin ? (
      <Login
        onCadastro={() => setTelaLogin(false)}
        onEsqueciSenha={() => setTelaEsqueci(true)}
      />
    ) : (
      <Cadastro onVoltar={() => setTelaLogin(true)} />
    );
  }

  const renderizarPagina = () => {
    switch (paginaAtual) {
      case "Dashboard":
        return <Dashboard />;

      case "Agenda":
        return <Agenda />;

      case "Quadras":
        return <Quadras />;

      case "Reservas":
        return <Reservas />;

      case "Usuários":
        return <Usuarios />;

      case "Perfil":
        return <Perfil />;

      default:
        return <Quadras />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Menu
        paginaAtual={paginaAtual}
        setPaginaAtual={setPaginaAtual}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "#f5f7f6",
          p: 4,
        }}
      >
        {renderizarPagina()}
      </Box>
    </Box>
  );
}

export default App;