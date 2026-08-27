import { useState } from "react";
import { Box } from "@mui/material";

import Menu from "./components/Menu";
import Quadras from "./pages/Quadras/Quadras";
import Usuarios from "./pages/Usuarios/Usuarios";
import Reservas from "./pages/Reservas/Reservas";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";


const drawerWidth = 240;

function App() {
  const [paginaAtual, setPaginaAtual] = useState("Quadras");
  const [telaLogin, setTelaLogin] = useState(true);
  const { autenticado } = useAuth();

  if (!autenticado) {
  return telaLogin ? (
    <Login onCadastro={() => setTelaLogin(false)} />
  ) : (
    <Cadastro onVoltar={() => setTelaLogin(true)} />
  );
}

  const renderizarPagina = () => {
    switch (paginaAtual) {
      case "Quadras":
        return <Quadras />;

      case "Reservas":
        return <Reservas />;

      case "Usuários":
        return <Usuarios />;

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