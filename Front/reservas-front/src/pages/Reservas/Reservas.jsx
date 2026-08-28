import { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  buscarReservas,
  buscarUsuarios,
  buscarQuadras,
  criarReserva,
  buscarHorariosDisponiveis,
  editarReserva,
  alterarStatusReserva,
} from "../../services/api";
import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";
import StatusSwitch from "../../components/StatusSwitch";
import {
  validarCampo,
  required,
  horaMaiorQue,
  dataFutura,
  horarioDentroDoFuncionamento,
} from "../../utils/validation";
import ConfirmDialog from "../../components/ConfirmDialog";
import AppSnackbar from "../../components/AppSnackbar";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [quadras, setQuadras] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);

  const [usuarioId, setUsuarioId] = useState("");
  const [quadraId, setQuadraId] = useState("");
  const [dataReserva, setDataReserva] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [reservaStatusPendente, setReservaStatusPendente] = useState(null);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [snackbarAberto, setSnackbarAberto] = useState(false);
  const [snackbarMensagem, setSnackbarMensagem] = useState("");
  const [snackbarSeveridade, setSnackbarSeveridade] = useState("success");

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);


  useEffect(() => {
    carregarReservas();
    carregarDadosFormulario();
    carregarHorariosDisponiveis();
  }, [quadraId, dataReserva]);

  async function carregarReservas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarReservas();



      setReservas(dados);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDadosFormulario() {
    try {
      const [usuariosData, quadrasData] = await Promise.all([
        buscarUsuarios(),
        buscarQuadras(),
      ]);

      setUsuarios(usuariosData);
      setQuadras(quadrasData);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  }

  function limparFormulario() {
    setUsuarioId("");
    setQuadraId("");
    setDataReserva("");
    setHoraInicio("");
    setHoraFim("");
    setAtivo(true);
    setReservaEditando(null);
  }

  function abrirFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(true);
  }

  function abrirFormularioEdicao(reserva) {
    setErro("");

    setReservaEditando(reserva);

    setUsuarioId(String(reserva.usuarioId));
    setQuadraId(String(reserva.quadraId));

    setDataReserva(
      reserva.dataReserva
        ? reserva.dataReserva.substring(0, 10)
        : ""
    );


    setHoraInicio(
      reserva.horaInicio
        ? reserva.horaInicio.substring(0, 5)
        : ""
    );

    setHoraFim(
      reserva.horaFim
        ? reserva.horaFim.substring(0, 5)
        : ""
    );

    setAtivo(
      reserva.ativo !== undefined
        ? reserva.ativo
        : true
    );

    setFormularioAberto(true);
  }

  function fecharFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(false);
  }

  function validarFormulario() {

    const quadraSelecionada = quadras.find(
      (quadra) => quadra.id === Number(quadraId)
    );

    const erros = {
      usuarioId: validarCampo(usuarioId, [
        required("Selecione um usuário."),
      ]),

      quadraId: validarCampo(quadraId, [
        required("Selecione uma quadra."),
      ]),

      dataReserva: validarCampo(dataReserva, [
        required("Informe a data da reserva."),
        () =>
          dataFutura(
            dataReserva,
            "A data da reserva não pode ser anterior a hoje."
          ),
      ]),

      horaInicio: validarCampo(horaInicio, [
        required("Informe o horário de início."),
      ]),

      horaFim: validarCampo(horaFim, [
        required("Informe o horário de fim."),

        () =>
          horaMaiorQue(
            horaInicio,
            horaFim,
            "O horário de fim deve ser maior que o horário de início."
          ),

        () =>
          horarioDentroDoFuncionamento(
            horaInicio,
            horaFim,
            quadraSelecionada?.horaAbertura,
            quadraSelecionada?.horaFechamento,
            `A reserva deve estar entre ${quadraSelecionada?.horaAbertura} e ${quadraSelecionada?.horaFechamento}.`
          ),
      ]),


    };

    return Object.values(erros).find(Boolean) || null;
  }

  async function salvarReserva() {

    if (salvando) {
      return;
    }
    const erroValidacao = validarFormulario();

    const quadraSelecionada = quadras.find(
      (quadra) => quadra.id === Number(quadraId)
    );

    if (!quadraSelecionada) {
      setErro("Quadra não encontrada.");
      return;
    }

    if (!quadraSelecionada.ativa) {
      setErro("A quadra selecionada está inativa.");
      return;
    }

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const dados = {
        ...(reservaEditando?.id && {
          id: reservaEditando.id,
        }),

        usuarioId: Number(usuarioId),
        quadraId: Number(quadraId),
        dataReserva,
        horaInicio: `${horaInicio}:00`,
        horaFim: `${horaFim}:00`,
        ativo,
      };

      if (reservaEditando) {
        await editarReserva(
          reservaEditando.id,
          dados
        );

        fecharFormulario();
        await carregarReservas();

        mostrarSnackbar(
          "Reserva atualizada com sucesso!"
        );
      } else {
        await criarReserva(dados);

        fecharFormulario();
        await carregarReservas();

        mostrarSnackbar(
          "Reserva criada com sucesso!"
        );
      }
    } catch (error) {
      console.error(error);

      mostrarSnackbar(
        error.message ||
        (
          reservaEditando
            ? "Não foi possível editar a reserva."
            : "Não foi possível criar a reserva."
        ),
        "error"
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus() {
    if (!reservaStatusPendente) {
      return;
    }

    const novoAtivo = !reservaStatusPendente.ativo;

    try {
      setAlterandoStatus(true);
      setErro("");

      await alterarStatusReserva(
        reservaStatusPendente.id,
        novoAtivo
      );

      setReservas((reservasAtuais) =>
        reservasAtuais.map((item) =>
          item.id === reservaStatusPendente.id
            ? {
              ...item,
              ativo: novoAtivo,
            }
            : item
        )
      );

      setConfirmacaoAberta(false);
      setReservaStatusPendente(null);

      mostrarSnackbar(
        novoAtivo
          ? "Reserva ativada com sucesso!"
          : "Reserva desativada com sucesso!"
      );
    } catch (error) {
      console.error(error);

      mostrarSnackbar(
        error.message,
        "error"
      );
    } finally {
      setAlterandoStatus(false);
    }
  }

  function abrirConfirmacaoStatus(reserva) {
    setReservaStatusPendente(reserva);
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

  async function carregarHorariosDisponiveis() {
    if (!quadraId || !dataReserva) {
      setHorariosDisponiveis([]);
      return;
    }

    try {
      setCarregandoHorarios(true);

      const horarios = await buscarHorariosDisponiveis(
        quadraId,
        dataReserva
      );

      setHorariosDisponiveis(horarios);
    } catch (error) {
      console.error(error);
      setHorariosDisponiveis([]);
      setErro(error.message);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  return (
    <Box>
      <PageTable
        titulo="Reservas"
        descricao="Gerencie as reservas das quadras."
        textoBotao="Nova Reserva"
        onClick={abrirFormulario}

        search={{
          enabled: true,
          placeholder: "Buscar por usuário ou quadra...",
          fields: ["usuario.nome", "quadra.nome"],
        }}

        filters={[
          {
            field: "status",
            label: "Status",
            options: [
              { value: "todos", label: "Todos" },
              { value: "Confirmada", label: "Confirmadas" },
              { value: "Cancelada", label: "Canceladas" },
            ],
          },
        ]}

        sortOptions={[
          { field: "dataReserva", label: "Data" },
          { field: "horaInicio", label: "Horário" },
          { field: "usuario.nome", label: "Usuário" },
          { field: "quadra.nome", label: "Quadra" },
          { field: "status", label: "Status" },
        ]}
        columns={[
          {
            field: "usuario",
            label: "Usuário",
            render: (reserva) =>
              reserva.usuario?.nome || "-",
          },

          {
            field: "quadra",
            label: "Quadra",
            render: (reserva) =>
              reserva.quadra?.nome || "-",
          },

          {
            field: "dataReserva",
            label: "Data",
            render: (reserva) => {
              if (!reserva.dataReserva) {
                return "-";
              }

              return new Date(
                reserva.dataReserva
              ).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              });
            },
          },

          {
            field: "horaInicio",
            label: "Início",
            render: (reserva) =>
              reserva.horaInicio
                ? reserva.horaInicio.substring(0, 5)
                : "-",
          },

          {
            field: "horaFim",
            label: "Fim",
            render: (reserva) =>
              reserva.horaFim
                ? reserva.horaFim.substring(0, 5)
                : "-",
          },

          {
            field: "ativo",
            label: "Status",
            render: (reserva) => (
              <StatusSwitch
                checked={Boolean(reserva.ativo)}
                disabled={
                  alterandoStatus &&
                  reservaStatusPendente?.id === reserva.id
                }
                onChange={() =>
                  abrirConfirmacaoStatus(reserva)
                }
              />
            ),
          },

          {
            field: "acoes",
            label: "Ações",
            render: (reserva) => (
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <EditRoundedIcon />
                }
                onClick={() =>
                  abrirFormularioEdicao(reserva)
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
        rows={reservas}
        loading={carregando}
        emptyMessage="Nenhuma reserva cadastrada."
      />

      <FormDialog
        open={formularioAberto}
        title={
          reservaEditando
            ? "Editar reserva"
            : "Nova reserva"
        }
        onClose={fecharFormulario}
        onSubmit={salvarReserva}
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
          {/* USUÁRIO */}
          <TextField
            select
            label="Usuário"
            value={usuarioId}
            onChange={(event) =>
              setUsuarioId(event.target.value)
            }
            fullWidth
            required
          >
            {usuarios
              .filter((usuario) => usuario.ativo)
              .map((usuario) => (
                <MenuItem
                  key={usuario.id}
                  value={usuario.id}
                >
                  {usuario.nome}
                </MenuItem>
              ))}
          </TextField>

          {/* QUADRA */}
          <TextField
            select
            label="Quadra"
            value={quadraId}
            onChange={(event) =>
              setQuadraId(event.target.value)
            }
            fullWidth
            required
          >
            {quadras
              .filter((quadra) => quadra.ativa)
              .map((quadra) => (
                <MenuItem
                  key={quadra.id}
                  value={quadra.id}
                >
                  {quadra.nome}
                </MenuItem>
              ))}
          </TextField>

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              label="Data da reserva"
              format="dd/MM/yyyy"
              value={
                dataReserva
                  ? new Date(`${dataReserva}T00:00:00`)
                  : null
              }
              onChange={(novaData) => {
                if (!novaData) {
                  setDataReserva("");
                  return;
                }

                const ano = novaData.getFullYear();
                const mes = String(
                  novaData.getMonth() + 1
                ).padStart(2, "0");
                const dia = String(
                  novaData.getDate()
                ).padStart(2, "0");

                setDataReserva(`${ano}-${mes}-${dia}`);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                mb: 1,
              }}
            >
              Horários disponíveis
            </Typography>

            {carregandoHorarios ? (
              <Typography color="text.secondary">
                Carregando horários...
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: 1,
                }}
              >
                {horariosDisponiveis.map((horario) => {
                  const inicio =
                    horario.horaInicio.substring(0, 5);

                  const fim =
                    horario.horaFim.substring(0, 5);

                  const selecionado =
                    horaInicio === inicio &&
                    horaFim === fim;

                  return (
                    <Button
                      key={`${inicio}-${fim}`}
                      variant={selecionado ? "contained" : "outlined"}
                      disabled={!horario.disponivel}
                      onClick={() => {
                        setHoraInicio(inicio);
                        setHoraFim(fim);
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,

                        color: horario.disponivel
                          ? "#198754"
                          : "#9ca3af",

                        borderColor: horario.disponivel
                          ? "#198754"
                          : "#d1d5db",

                        backgroundColor: selecionado
                          ? "#198754"
                          : "transparent",

                        "&:hover": {
                          backgroundColor: horario.disponivel
                            ? "#e8f5ee"
                            : "transparent",
                          borderColor: horario.disponivel
                            ? "#157347"
                            : "#d1d5db",
                        },

                        "&.Mui-disabled": {
                          color: "#9ca3af",
                          borderColor: "#e5e7eb",
                          backgroundColor: "#f3f4f6",
                        },
                      }}
                    >
                      {inicio} - {fim}
                    </Button>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* ERRO */}
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
          reservaStatusPendente?.ativo
            ? "Desativar reserva"
            : "Ativar reserva"
        }
        message={
          reservaStatusPendente?.ativo
            ? "Tem certeza que deseja desativar esta reserva?"
            : "Tem certeza que deseja ativar esta reserva?"
        }
        onClose={() => {
          if (!alterandoStatus) {
            setConfirmacaoAberta(false);
            setReservaStatusPendente(null);
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