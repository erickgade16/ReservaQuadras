import { useState } from "react";
import { Box, Toolbar } from "@mui/material";

import Menu from "./components/Menu";
import Quadras from "./pages/Quadras/Quadras";
import Usuarios from "./pages/Usuarios/Usuarios";


const drawerWidth = 240;

function App() {
  const [paginaAtual, setPaginaAtual] = useState("Quadras");

  const renderizarPagina = () => {
    switch (paginaAtual) {
      case "Quadras":
        return <Quadras />;

      case "Reservas":
        return <div>Reservas</div>;

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