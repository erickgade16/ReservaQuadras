import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";

import {
  buscarUsuarios,
  criarUsuario,
  editarUsuario,
  alterarStatusUsuario,
} from "../../services/api";

import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";

import {
  validarCampo,
  required,
  email,
  minLength,
} from "../../utils/validation";

import StatusSwitch from "../../components/StatusSwitch";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [formularioAberto, setFormularioAberto] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [nome, setNome] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
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
    setEmailUsuario("");
    setSenha("");
    setUsuarioEditando(null);
  }

  function fecharFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(false);
  }

  function abrirFormularioNovo() {
    limparFormulario();
    setErro("");
    setFormularioAberto(true);
  }

  function abrirFormularioEdicao(usuario) {
    setErro("");

    setUsuarioEditando(usuario);

    setNome(usuario.nome || "");
    setEmailUsuario(usuario.email || "");

    setSenha("");

    setFormularioAberto(true);
  }

  function validarFormulario() {
    const erros = {
      nome: validarCampo(nome, [
        required("Informe o nome."),
      ]),

      email: validarCampo(emailUsuario, [
        required("Informe o e-mail."),
        email("Informe um e-mail válido."),
      ]),

      senha: usuarioEditando
        ? null
        : validarCampo(senha, [
            required("Informe a senha."),
            minLength(
              6,
              "A senha deve ter pelo menos 6 caracteres."
            ),
          ]),
    };

    return Object.values(erros).find(Boolean) || null;
  }

  async function salvarUsuario() {
    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const usuario = {
        id: usuarioEditando?.id,
        nome: nome.trim(),
        email: emailUsuario.trim(),
      };

      if (!usuarioEditando || senha.trim()) {
        usuario.senha = senha;
      }

      console.log("Enviando usuário:", usuario);

      if (usuarioEditando) {
        await editarUsuario(usuarioEditando.id, usuario);
      } else {
        await criarUsuario(usuario);
      }

      fecharFormulario();

      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);

      setErro(
        usuarioEditando
          ? "Não foi possível editar o usuário."
          : "Não foi possível criar o usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

 async function alterarStatus(usuario) {
  const novoAtivo = !usuario.ativo;

  try {
    setErro("");

    await alterarStatusUsuario(
      usuario.id,
      novoAtivo
    );

    setUsuarios((usuariosAtuais) =>
      usuariosAtuais.map((item) =>
        item.id === usuario.id
          ? {
              ...item,
              ativo: novoAtivo,
            }
          : item
      )
    );
  } catch (error) {
    console.error(
      "Erro ao alterar status:",
      error
    );

    setErro(
      "Não foi possível alterar o status do usuário."
    );
  }
}

  return (
    <Box>
      <PageTable
        titulo="Usuários"
        descricao="Gerencie os usuários cadastrados no sistema."
        textoBotao="Novo Usuário"
        onClick={abrirFormularioNovo}
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
            render: (usuario) =>
              usuario.dataCadastro
                ? new Date(
                    usuario.dataCadastro
                  ).toLocaleDateString("pt-BR")
                : "-",
          },

          {
  field: "ativo",
  label: "Status",
  render: (usuario) => (
    <StatusSwitch
      checked={usuario.ativo}
      onChange={() => alterarStatus(usuario)}
    />
  ),
},

          {
            field: "acoes",
            label: "Ações",
            render: (usuario) => (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditRoundedIcon />}
                onClick={() =>
                  abrirFormularioEdicao(usuario)
                }
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Editar
              </Button>
            ),
          },


        ]}
        rows={usuarios}
        loading={carregando}
        emptyMessage="Nenhum usuário cadastrado."
      />

      <FormDialog
        open={formularioAberto}
        title={
          usuarioEditando
            ? "Editar usuário"
            : "Novo usuário"
        }
        onClose={fecharFormulario}
        onSubmit={salvarUsuario}
        loading={salvando}
        submitText="Salvar"
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
            value={emailUsuario}
            onChange={(event) =>
              setEmailUsuario(event.target.value)
            }
            fullWidth
            required
          />

          <TextField
            label={
              usuarioEditando
                ? "Nova senha"
                : "Senha"
            }
            type="password"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            fullWidth
            required={!usuarioEditando}
            helperText={
              usuarioEditando
                ? "Deixe vazio para manter a senha atual."
                : ""
            }
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