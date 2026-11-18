import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";

import PageHeader from "../../components/PageHeader";
import AppSnackbar from "../../components/AppSnackbar";
import { useAuth } from "../../context/AuthContext";
import { atualizarPerfil } from "../../services/api";
import {
  email as validarEmail,
  minLength,
  required,
  validarCampo,
} from "../../utils/validation";

const botaoVerde = {
  alignSelf: "flex-start",
  backgroundColor: "#198754",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  px: 2.5,
  "&:hover": { backgroundColor: "#157347" },
};

function Secao({ titulo, descricao, children }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8e4" }}
    >
      <Typography sx={{ color: "#183b2a", fontWeight: 700, fontSize: 17 }}>
        {titulo}
      </Typography>

      <Typography sx={{ color: "#718096", fontSize: 14, mb: 2.5 }}>
        {descricao}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {children}
      </Box>
    </Paper>
  );
}

export default function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();

  const [nome, setNome] = useState(usuario?.nome || "");
  const [emailUsuario, setEmailUsuario] = useState(usuario?.email || "");
  const [erroDados, setErroDados] = useState("");
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [snackbarAberto, setSnackbarAberto] = useState(false);
  const [snackbarMensagem, setSnackbarMensagem] = useState("");

  function avisar(mensagem) {
    setSnackbarMensagem(mensagem);
    setSnackbarAberto(true);
  }

  async function salvarDados() {
    if (salvandoDados) return;

    const erroValidacao =
      validarCampo(nome, [required("Informe o nome.")]) ||
      validarCampo(emailUsuario, [
        required("Informe o e-mail."),
        validarEmail("Informe um e-mail válido."),
      ]);

    if (erroValidacao) {
      setErroDados(erroValidacao);
      return;
    }

    try {
      setSalvandoDados(true);
      setErroDados("");

      const atualizado = await atualizarPerfil({
        nome: nome.trim(),
        email: emailUsuario.trim(),
      });

      atualizarUsuario({ nome: atualizado.nome, email: atualizado.email });
      setNome(atualizado.nome);
      setEmailUsuario(atualizado.email);

      avisar("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      setErroDados(error.message);
    } finally {
      setSalvandoDados(false);
    }
  }

  async function salvarSenha() {
    if (salvandoSenha) return;

    const erroValidacao =
      validarCampo(senhaAtual, [required("Informe a senha atual.")]) ||
      validarCampo(novaSenha, [
        required("Informe a nova senha."),
        minLength(6, "A nova senha deve ter pelo menos 6 caracteres."),
      ]) ||
      (novaSenha !== confirmarSenha
        ? "A confirmação não é igual à nova senha."
        : null);

    if (erroValidacao) {
      setErroSenha(erroValidacao);
      return;
    }

    try {
      setSalvandoSenha(true);
      setErroSenha("");

      await atualizarPerfil({
        // nome e e-mail já salvos; só a senha muda aqui
        nome: usuario.nome,
        email: usuario.email,
        senhaAtual,
        novaSenha,
      });

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      avisar("Senha alterada com sucesso!");
    } catch (error) {
      console.error(error);
      setErroSenha(error.message);
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <Box>
      <PageHeader
        titulo="Perfil"
        descricao="Atualize seus dados e sua senha."
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          px: 3,
          maxWidth: 620,
        }}
      >
        <Secao
          titulo="Meus dados"
          descricao="Nome e e-mail usados na sua conta."
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
            value={emailUsuario}
            onChange={(event) => setEmailUsuario(event.target.value)}
            fullWidth
            required
          />

          {erroDados && <Alert severity="error">{erroDados}</Alert>}

          <Button
            variant="contained"
            onClick={salvarDados}
            disabled={salvandoDados}
            sx={botaoVerde}
          >
            {salvandoDados ? "Salvando..." : "Salvar dados"}
          </Button>
        </Secao>

        <Secao
          titulo="Alterar senha"
          descricao="Por segurança, informe a senha atual para definir uma nova."
        >
          <TextField
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(event) => setSenhaAtual(event.target.value)}
            autoComplete="current-password"
            fullWidth
          />

          <TextField
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(event) => setNovaSenha(event.target.value)}
            autoComplete="new-password"
            helperText="Mínimo de 6 caracteres."
            fullWidth
          />

          <TextField
            label="Confirmar nova senha"
            type="password"
            value={confirmarSenha}
            onChange={(event) => setConfirmarSenha(event.target.value)}
            autoComplete="new-password"
            fullWidth
          />

          {erroSenha && <Alert severity="error">{erroSenha}</Alert>}

          <Button
            variant="contained"
            onClick={salvarSenha}
            disabled={salvandoSenha}
            sx={botaoVerde}
          >
            {salvandoSenha ? "Salvando..." : "Alterar senha"}
          </Button>
        </Secao>
      </Box>

      <AppSnackbar
        open={snackbarAberto}
        message={snackbarMensagem}
        severity="success"
        onClose={() => setSnackbarAberto(false)}
      />
    </Box>
  );
}
