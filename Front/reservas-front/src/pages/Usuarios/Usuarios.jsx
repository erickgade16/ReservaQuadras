import { useEffect, useState } from "react";

import {
  Box,
  TextField,
  Typography,
} from "@mui/material";

import {
  buscarUsuarios,
  criarUsuario,
} from "../../services/api";

import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [formularioAberto, setFormularioAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarUsuarios();

      if (Array.isArray(dados)) {
        setUsuarios(dados);
      } else if (Array.isArray(dados?.data)) {
        setUsuarios(dados.data);
      } else {
        console.error("Formato inesperado da API:", dados);
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setErro("Não foi possível carregar os usuários.");
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setNome("");
    setEmail("");
    setSenha("");
  }

  function fecharFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(false);
  }

  async function salvarUsuario() {
    try {
      setSalvando(true);
      setErro("");

      const usuario = {
        nome,
        email,
        senha,
      };

      console.log("Enviando usuário:", usuario);

      await criarUsuario(usuario);

      fecharFormulario();

      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      setErro("Não foi possível criar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Box>
      <PageTable
        titulo="Usuários"
        descricao="Gerencie os usuários cadastrados no sistema."
        textoBotao="Novo Usuário"
        onClick={() => setFormularioAberto(true)}
        columns={[
          {
            field: "nome",
            label: "Nome",
          },
          {
            field: "email",
            label: "E-mail",
          },
          {
            field: "dataCadastro",
            label: "Data de Cadastro",
            render: (usuario) => {
              if (!usuario?.dataCadastro) {
                return "-";
              }

              const [dia, mes, ano] =
                usuario.dataCadastro.split("/");

              const data = new Date(
                ano,
                mes - 1,
                dia
              );

              if (isNaN(data.getTime())) {
                return "Data inválida";
              }

              return data.toLocaleDateString("pt-BR");
            },
          },
        ]}
        rows={usuarios}
        loading={carregando}
        emptyMessage="Nenhum usuário cadastrado."
      />

      <FormDialog
        open={formularioAberto}
        title="Novo usuário"
        onClose={fecharFormulario}
        onSubmit={salvarUsuario}
        loading={salvando}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
          }}
        >
          <TextField
            label="Nome"
            value={nome}
            onChange={(event) =>
              setNome(event.target.value)
            }
            fullWidth
            required
          />

          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            fullWidth
            required
          />

          <TextField
            label="Senha"
            type="password"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            fullWidth
            required
          />

          {erro && (
            <Typography color="error">
              {erro}
            </Typography>
          )}
        </Box>
      </FormDialog>
    </Box>
  );
}