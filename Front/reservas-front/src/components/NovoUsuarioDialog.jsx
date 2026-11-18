import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";

import FormDialog from "./FormDialog";
import { criarUsuarioRapido } from "../services/api";
import {
  email as validarEmail,
  required,
  validarCampo,
} from "../utils/validation";

// Cadastro rápido de usuário (só nome e e-mail), usado ao fazer uma reserva.
export default function NovoUsuarioDialog({ open, onClose, onCriado }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function limpar() {
    setNome("");
    setEmail("");
    setErro("");
  }

  function fechar() {
    if (salvando) return;

    limpar();
    onClose();
  }

  async function salvar() {
    if (salvando) return;

    const erroValidacao =
      validarCampo(nome, [required("Informe o nome.")]) ||
      validarCampo(email, [
        required("Informe o e-mail."),
        validarEmail("Informe um e-mail válido."),
      ]);

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const novo = await criarUsuarioRapido({
        nome: nome.trim(),
        email: email.trim(),
      });

      limpar();
      onCriado(novo);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormDialog
      open={open}
      title="Novo usuário"
      onClose={fechar}
      onSubmit={salvar}
      loading={salvando}
      submitText="Criar usuário"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Typography sx={{ color: "#718096", fontSize: 14 }}>
          Cadastro rápido: só nome e e-mail. O usuário fica sem senha de acesso.
        </Typography>

        <TextField
          label="Nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          fullWidth
          required
          autoFocus
        />

        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
          required
        />

        {erro && <Typography color="error">{erro}</Typography>}
      </Box>
    </FormDialog>
  );
}
