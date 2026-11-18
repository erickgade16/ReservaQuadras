import { useEffect, useState } from "react";

import {
  Box,
  Button,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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

const DIAS_SEMANA = [
  { valor: 0, curto: "Dom", longo: "Domingo" },
  { valor: 1, curto: "Seg", longo: "Segunda-feira" },
  { valor: 2, curto: "Ter", longo: "Terça-feira" },
  { valor: 3, curto: "Qua", longo: "Quarta-feira" },
  { valor: 4, curto: "Qui", longo: "Quinta-feira" },
  { valor: 5, curto: "Sex", longo: "Sexta-feira" },
  { valor: 6, curto: "Sáb", longo: "Sábado" },
];

const TODOS_OS_DIAS = [0, 1, 2, 3, 4, 5, 6];

// "1,2,3" -> [1, 2, 3]  (vazio ou inválido = todos os dias)
function paraArrayDias(texto) {
  if (!texto) return TODOS_OS_DIAS;

  const dias = texto
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

  return dias.length ? dias : TODOS_OS_DIAS;
}

function resumoDias(texto) {
  const dias = [...paraArrayDias(texto)].sort((a, b) => a - b);
  const chave = dias.join(",");

  if (chave === "0,1,2,3,4,5,6") return "Todos os dias";
  if (chave === "1,2,3,4,5") return "Seg a Sex";
  if (chave === "0,6") return "Fins de semana";

  return dias.map((d) => DIAS_SEMANA[d].curto).join(", ");
}

// Horários de 30 em 30 minutos: "00:00", "00:30", ... "23:30"
const HORARIOS = Array.from({ length: 48 }, (_, i) => {
  const hora = String(Math.floor(i / 2)).padStart(2, "0");
  return `${hora}:${i % 2 ? "30" : "00"}`;
});

// Lista com rolagem para não ocupar a tela inteira
const MENU_HORARIOS = {
  slotProps: { paper: { sx: { maxHeight: 280 } } },
};

// Garante que um horário já salvo fora da grade (ex.: 08:15) continue aparecendo
function opcoesHorario(atual) {
  if (!atual || HORARIOS.includes(atual)) {
    return HORARIOS;
  }

  return [...HORARIOS, atual].sort();
}

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
  const [duracaoReservaMinutos, setDuracaoReservaMinutos] = useState("");
  const [diasFuncionamento, setDiasFuncionamento] = useState(TODOS_OS_DIAS);

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
    setDuracaoReservaMinutos("");
    setDiasFuncionamento(TODOS_OS_DIAS);
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
    setHoraAbertura((quadra.horaAbertura || "").substring(0, 5));
    setHoraFechamento((quadra.horaFechamento || "").substring(0, 5));
    setAtiva(quadra.ativa);
    setDiasFuncionamento(paraArrayDias(quadra.diasFuncionamento));
    setDuracaoReservaMinutos(
      quadra.duracaoReservaMinutos ?? ""
    );

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

      duracaoReservaMinutos: validarCampo(
        duracaoReservaMinutos,
        [
          required("Informe a duração da reserva."),
        ]
      ),

      diasFuncionamento:
        diasFuncionamento.length === 0
          ? "Selecione ao menos um dia de funcionamento."
          : null,

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
        duracaoReservaMinutos: Number(duracaoReservaMinutos),
        diasFuncionamento: diasFuncionamento.join(","),
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
        textoBotao="Nova Quadra"
        onClick={abrirFormulario}

        search={{
          enabled: true,
          placeholder: "Buscar por nome...",
          fields: ["nome"],
        }}

        filters={[
          {
            field: "tipo",
            label: "Tipo",
            options: [
              { value: "todos", label: "Todos" },
              { value: "Futebol", label: "Futebol" },
              { value: "Futsal", label: "Futsal" },
              { value: "Tênis", label: "Tênis" },
              { value: "Vôlei", label: "Vôlei" },
            ],
          },
          {
            field: "ativa",
            label: "Status",
            options: [
              { value: "todos", label: "Todas" },
              { value: true, label: "Ativas" },
              { value: false, label: "Inativas" },
            ],
          },
        ]}

        sortOptions={[
          { field: "nome", label: "Nome" },
          { field: "tipo", label: "Tipo" },
          { field: "precoHora", label: "Preço/hora" },
          { field: "ativa", label: "Status" },
        ]}
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
            field: "diasFuncionamento",
            label: "Dias",
            render: (quadra) => resumoDias(quadra.diasFuncionamento),
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
              select
              label="Hora de abertura"
              value={horaAbertura}
              onChange={(event) => {
                const novaAbertura = event.target.value;

                setHoraAbertura(novaAbertura);

                if (horaFechamento && horaFechamento <= novaAbertura) {
                  setHoraFechamento("");
                }
              }}
              slotProps={{ select: { MenuProps: MENU_HORARIOS } }}
              fullWidth
              required
            >
              {opcoesHorario(horaAbertura).map((hora) => (
                <MenuItem key={hora} value={hora}>
                  {hora}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Hora de fechamento"
              value={horaFechamento}
              onChange={(event) =>
                setHoraFechamento(event.target.value)
              }
              helperText={
                horaAbertura
                  ? `Depois das ${horaAbertura}`
                  : "Escolha a abertura primeiro"
              }
              slotProps={{ select: { MenuProps: MENU_HORARIOS } }}
              fullWidth
              required
            >
              {opcoesHorario(horaFechamento)
                .filter(
                  (hora) =>
                    !horaAbertura ||
                    hora > horaAbertura ||
                    hora === horaFechamento
                )
                .map((hora) => (
                  <MenuItem key={hora} value={hora}>
                    {hora}
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: 13, color: "#718096", mb: 1 }}
            >
              Dias de funcionamento
            </Typography>

            <ToggleButtonGroup
              value={diasFuncionamento}
              onChange={(_, novos) =>
                setDiasFuncionamento(
                  [...novos].sort((a, b) => a - b)
                )
              }
              size="small"
              color="success"
              sx={{ flexWrap: "wrap" }}
            >
              {DIAS_SEMANA.map((dia) => (
                <ToggleButton
                  key={dia.valor}
                  value={dia.valor}
                  aria-label={dia.longo}
                  sx={{ textTransform: "none", px: 1.5 }}
                >
                  {dia.curto}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                size="small"
                onClick={() => setDiasFuncionamento(TODOS_OS_DIAS)}
                sx={{ textTransform: "none" }}
              >
                Todos os dias
              </Button>

              <Button
                size="small"
                onClick={() => setDiasFuncionamento([1, 2, 3, 4, 5])}
                sx={{ textTransform: "none" }}
              >
                Seg a Sex
              </Button>
            </Box>
          </Box>

          <TextField
            select
            label="Duração da reserva"
            value={duracaoReservaMinutos}
            onChange={(event) =>
              setDuracaoReservaMinutos(event.target.value)
            }
            fullWidth
            required
          >
            <MenuItem value="30">
              30 minutos
            </MenuItem>

            <MenuItem value="60">
              1 hora
            </MenuItem>

            <MenuItem value="90">
              1 hora e 30 minutos
            </MenuItem>

            <MenuItem value="120">
              2 horas
            </MenuItem>
          </TextField>


          <StatusSwitch
            checked={ativa}
            onChange={(event) =>
              setAtiva(event.target.checked)
            }
            mostrarTexto
            labelAtivo="Quadra ativa"
            labelInativo="Quadra inativa"
          />

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