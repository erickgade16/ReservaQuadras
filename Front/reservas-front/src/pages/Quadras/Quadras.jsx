import { useEffect, useState } from "react";

import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";

import {
  buscarQuadras,
  criarQuadra,
  editarQuadra,
  alterarStatusQuadra
} from "../../services/api";

import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";
import StatusSwitch from "../../components/StatusSwitch";

import {
  validarCampo,
  required,
  positive,
  horaMaiorQue,
} from "../../utils/validation";
import ConfirmDialog from "../../components/ConfirmDialog";
import AppSnackbar from "../../components/AppSnackbar";

export default function Quadras() {
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [quadraEditando, setQuadraEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [precoHora, setPrecoHora] = useState("");
  const [horaAbertura, setHoraAbertura] = useState("");
  const [horaFechamento, setHoraFechamento] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [quadraStatusPendente, setQuadraStatusPendente] = useState(null);
  const [snackbarAberto, setSnackbarAberto] = useState(false);
  const [snackbarMensagem, setSnackbarMensagem] = useState("");
  const [snackbarSeveridade, setSnackbarSeveridade] = useState("success");

  useEffect(() => {
    carregarQuadras();
  }, []);

  async function carregarQuadras() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarQuadras();

      setQuadras(dados);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setNome("");
    setTipo("");
    setPrecoHora("");
    setHoraAbertura("");
    setHoraFechamento("");
    setAtiva(true);
    setQuadraEditando(null);
  }

  function abrirFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(true);
  }

  function abrirFormularioEdicao(quadra) {
    setErro("");

    setQuadraEditando(quadra);

    setNome(quadra.nome || "");
    setTipo(quadra.tipo || "");
    setPrecoHora(quadra.precoHora ?? "");
    setHoraAbertura(quadra.horaAbertura || "");
    setHoraFechamento(quadra.horaFechamento || "");
    setAtiva(quadra.ativa);

    setFormularioAberto(true);
  }

  function fecharFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(false);
  }

  function validarFormulario() {
    const erros = {
      nome: validarCampo(nome, [
        required("Informe o nome da quadra."),
      ]),

      tipo: validarCampo(tipo, [
        required("Informe o tipo da quadra."),
      ]),

      precoHora: validarCampo(precoHora, [
        required("Informe o preço por hora."),
        positive("O preço deve ser maior que zero."),
      ]),

      horaAbertura: validarCampo(horaAbertura, [
        required("Informe o horário de abertura."),
      ]),

      horaFechamento: validarCampo(horaFechamento, [
        required("Informe o horário de fechamento."),
        () =>
          horaMaiorQue(
            horaAbertura,
            horaFechamento,
            "O horário de fechamento deve ser maior que o horário de abertura."
          ),
      ]),
    };

    return Object.values(erros).find(Boolean) || null;
  }

  async function salvarQuadra() {

    const erroValidacao = validarFormulario();

    if (salvando) {
      return;
    }

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const quadra = {
        nome: nome.trim(),
        tipo: tipo.trim(),
        precoHora: Number(precoHora),
        ativa,
        horaAbertura,
        horaFechamento,
      };

      if (quadraEditando) {
        await editarQuadra(
          quadraEditando.id,
          {
            id: quadraEditando.id,
            ...quadra,
          }
        );

        fecharFormulario();
        await carregarQuadras();

        mostrarSnackbar(
          "Quadra atualizada com sucesso!"
        );
      } else {
        await criarQuadra(quadra);

        fecharFormulario();
        await carregarQuadras();

        mostrarSnackbar(
          "Quadra criada com sucesso!"
        );
      }
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus() {
    if (!quadraStatusPendente) {
      return;
    }

    const novaAtiva = !quadraStatusPendente.ativa;

    try {
      setAlterandoStatus(true);
      setErro("");

      await alterarStatusQuadra(
        quadraStatusPendente.id,
        novaAtiva
      );

      setQuadras((quadrasAtuais) =>
        quadrasAtuais.map((item) =>
          item.id === quadraStatusPendente.id
            ? {
              ...item,
              ativa: novaAtiva,
            }
            : item
        )
      );

      setConfirmacaoAberta(false);
      setQuadraStatusPendente(null);

      mostrarSnackbar(
        novaAtiva
          ? "Quadra ativada com sucesso!"
          : "Quadra desativada com sucesso!"
      );
    } catch (error) {
      console.error(error);
     mostrarSnackbar(error.message, "error");
    } finally {
      setAlterandoStatus(false);
    }
  }

  function abrirConfirmacaoStatus(quadra) {
    setQuadraStatusPendente(quadra);
    setConfirmacaoAberta(true);
  }

  function mostrarSnackbar(
    mensagem,
    severidade = "success"
  ) {
    setSnackbarMensagem(mensagem);
    setSnackbarSeveridade(severidade);
    setSnackbarAberto(true);
  }

  function fecharSnackbar() {
    setSnackbarAberto(false);
  }

  return (
    <Box>
      <PageTable
        titulo="Quadras"
        descricao="Gerencie as quadras disponíveis para reserva."
        textoBotao="Novo"
        onClick={abrirFormulario}
        columns={[
          {
            field: "nome",
            label: "Nome",
          },

          {
            field: "tipo",
            label: "Tipo",
          },

          {
            field: "precoHora",
            label: "Preço/Hora",
            render: (quadra) =>
              `R$ ${Number(quadra.precoHora).toFixed(2)}`,
          },

          {
            field: "horaAbertura",
            label: "Abertura",
          },

          {
            field: "horaFechamento",
            label: "Fechamento",
          },

          {
            field: "ativa",
            label: "Status",
            render: (quadra) => (
              <StatusSwitch
                checked={quadra.ativa}
                disabled={
                  alterandoStatus &&
                  quadraStatusPendente?.id === quadra.id
                }
                onChange={() =>
                  abrirConfirmacaoStatus(quadra)
                }
              />
            ),
          },

          {
            field: "acoes",
            label: "Ações",
            render: (quadra) => (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditRoundedIcon />}
                onClick={() => abrirFormularioEdicao(quadra)}
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
        rows={quadras}
        loading={carregando}
        emptyMessage="Nenhuma quadra cadastrada."
      />

      <FormDialog
        open={formularioAberto}
        title={
          quadraEditando
            ? "Editar quadra"
            : "Nova quadra"
        }
        onClose={fecharFormulario}
        onSubmit={salvarQuadra}
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
            label="Tipo"
            value={tipo}
            onChange={(event) =>
              setTipo(event.target.value)
            }
            fullWidth
            required
          />

          <TextField
            label="Preço por hora"
            type="number"
            value={precoHora}
            onChange={(event) =>
              setPrecoHora(event.target.value)
            }
            fullWidth
            required
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            <TextField
              label="Hora de abertura"
              type="time"
              value={horaAbertura}
              onChange={(event) =>
                setHoraAbertura(event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              fullWidth
              required
            />

            <TextField
              label="Hora de fechamento"
              type="time"
              value={horaFechamento}
              onChange={(event) =>
                setHoraFechamento(event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              fullWidth
              required
            />
          </Box>

          <TextField
            select
            label="Status"
            value={ativa ? "true" : "false"}
            onChange={(event) =>
              setAtiva(
                event.target.value === "true"
              )
            }
            fullWidth
          >
            <MenuItem value="true">
              Ativa
            </MenuItem>

            <MenuItem value="false">
              Inativa
            </MenuItem>
          </TextField>

          {erro && (
            <Typography color="error">
              {erro}
            </Typography>
          )}
        </Box>
      </FormDialog>
      <ConfirmDialog
        open={confirmacaoAberta}
        title={
          quadraStatusPendente?.ativa
            ? "Desativar quadra"
            : "Ativar quadra"
        }
        message={
          quadraStatusPendente?.ativa
            ? `Tem certeza que deseja desativar a quadra "${quadraStatusPendente?.nome}"?`
            : `Tem certeza que deseja ativar a quadra "${quadraStatusPendente?.nome}"?`
        }
        onClose={() => {
          if (!alterandoStatus) {
            setConfirmacaoAberta(false);
            setQuadraStatusPendente(null);
          }
        }}
        onConfirm={alterarStatus}
        loading={alterandoStatus}
      />
      <AppSnackbar
        open={snackbarAberto}
        message={snackbarMensagem}
        severity={snackbarSeveridade}
        onClose={fecharSnackbar}
      />
    </Box>
  );
}