import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { criarUsuario } from "../../services/api";

export default function Cadastro({ onVoltar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(event) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");
    setSucesso("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    try {
      setCarregando(true);

      await criarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        ativo: true,
      });

      setSucesso("Conta criada com sucesso!");

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");

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
          Criar conta
        </Typography>

        <Typography
          sx={{
            color: "#718096",
            mb: 3,
          }}
        >
          Preencha seus dados para criar sua conta.
        </Typography>

        <Box
          component="form"
          onSubmit={handleCadastro}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            fullWidth
            required
          />

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

          <TextField
            label="Confirmar senha"
            type="password"
            value={confirmarSenha}
            onChange={(event) =>
              setConfirmarSenha(event.target.value)
            }
            fullWidth
            required
          />

          {erro && (
            <Typography color="error">
              {erro}
            </Typography>
          )}

          {sucesso && (
            <Typography sx={{ color: "#198754" }}>
              {sucesso}
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
            {carregando ? "Criando..." : "Criar conta"}
          </Button>

          <Button
            type="button"
            variant="text"
            onClick={onVoltar}
            disabled={carregando}
            sx={{
              textTransform: "none",
              color: "#198754",
              fontWeight: 600,
            }}
          >
            Voltar para o login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}