import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { fazerLogin } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const dados = await fazerLogin(email, senha);

      login(dados.token, dados.usuario);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f8f6",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          border: "1px solid #e2e8e4",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#183b2a",
            mb: 1,
          }}
        >
          Reserva Quadras
        </Typography>

        <Typography
          sx={{
            color: "#718096",
            mb: 3,
          }}
        >
          Entre com seus dados para continuar.
        </Typography>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            fullWidth
            required
          />

          {erro && (
            <Typography color="error">
              {erro}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={carregando}
            sx={{
              backgroundColor: "#198754",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              py: 1.2,

              "&:hover": {
                backgroundColor: "#157347",
              },
            }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}