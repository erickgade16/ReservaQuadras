import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";

import { redefinirSenha } from "../../services/api";
import {
  email as validarEmail,
  minLength,
  required,
  validarCampo,
} from "../../utils/validation";

const botaoVerde = {
  backgroundColor: "#198754",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  py: 1.2,
  "&:hover": { backgroundColor: "#157347" },
};

const botaoTexto = {
  textTransform: "none",
  color: "#198754",
  fontWeight: 600,
};

export default function EsqueciSenha({ onVoltar }) {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function salvar(event) {
    event.preventDefault();

    if (carregando) return;

    const erroValidacao =
      validarCampo(email, [
        required("Informe o e-mail."),
        validarEmail("Informe um e-mail válido."),
      ]) ||
      validarCampo(novaSenha, [
        required("Informe a nova senha."),
        minLength(6, "A nova senha deve ter pelo menos 6 caracteres."),
      ]) ||
      (novaSenha !== confirmarSenha
        ? "A confirmação não é igual à nova senha."
        : null);

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      await redefinirSenha({
        email: email.trim(),
        novaSenha,
      });

      setConcluido(true);
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
          sx={{ fontWeight: 700, color: "#183b2a", mb: 1 }}
        >
          Esqueci minha senha
        </Typography>

        {concluido ? (
          <>
            <Alert severity="success" sx={{ my: 2 }}>
              Senha redefinida com sucesso! Entre com a nova senha.
            </Alert>

            <Button
              type="button"
              variant="contained"
              onClick={onVoltar}
              fullWidth
              sx={botaoVerde}
            >
              Ir para o login
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ color: "#718096", mb: 3 }}>
              Informe o e-mail da sua conta e escolha uma nova senha.
            </Typography>

            <Box
              component="form"
              onSubmit={salvar}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                autoComplete="new-password"
                helperText="Mínimo de 6 caracteres."
                fullWidth
                required
              />

              <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                autoComplete="new-password"
                fullWidth
                required
              />

              {erro && <Typography color="error">{erro}</Typography>}

              <Button
                type="submit"
                variant="contained"
                disabled={carregando}
                sx={botaoVerde}
              >
                {carregando ? "Salvando..." : "Redefinir senha"}
              </Button>

              <Button
                type="button"
                variant="text"
                onClick={onVoltar}
                disabled={carregando}
                sx={botaoTexto}
              >
                Voltar para o login
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
