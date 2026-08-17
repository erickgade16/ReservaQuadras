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
  buscarReservas,
  buscarUsuarios,
  buscarQuadras,
  criarReserva,
  editarReserva,
} from "../../services/api";

import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";
import StatusChip from "../../components/StatusChip";

import {
  validarCampo,
  required,
} from "../../utils/validation";

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
  const [status, setStatus] = useState("ATIVA");

  useEffect(() => {
    carregarReservas();
    carregarDadosFormulario();
  }, []);

  async function carregarReservas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarReservas();

      setReservas(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar as reservas.");
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
      setErro(
        "Não foi possível carregar os dados do formulário."
      );
    }
  }

  function limparFormulario() {
    setUsuarioId("");
    setQuadraId("");
    setDataReserva("");
    setHoraInicio("");
    setHoraFim("");
    setStatus("ATIVA");
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
      reserva.horaInicio?.substring(0, 5) || ""
    );

    setHoraFim(
      reserva.horaFim?.substring(0, 5) || ""
    );

    setStatus(reserva.status || "ATIVA");

    setFormularioAberto(true);
  }

  function fecharFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(false);
  }

  function validarFormulario() {
    const erros = {
      usuarioId: validarCampo(usuarioId, [
        required("Selecione um usuário."),
      ]),

      quadraId: validarCampo(quadraId, [
        required("Selecione uma quadra."),
      ]),

      dataReserva: validarCampo(dataReserva, [
        required("Informe a data da reserva."),
      ]),

      horaInicio: validarCampo(horaInicio, [
        required("Informe o horário de início."),
      ]),

      horaFim: validarCampo(horaFim, [
        required("Informe o horário de fim."),
      ]),
    };

    return Object.values(erros).find(Boolean) || null;
  }

  async function salvarReserva() {
    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const dados = {
        id: reservaEditando?.id,
        usuarioId: Number(usuarioId),
        quadraId: Number(quadraId),
        dataReserva: dataReserva,
        horaInicio: `${horaInicio}:00`,
        horaFim: `${horaFim}:00`,
        status: status,
      };

      console.log(
        "JSON ENVIADO:",
        JSON.stringify(dados, null, 2)
      );

      if (reservaEditando) {
        await editarReserva(
          reservaEditando.id,
          dados
        );
      } else {
        await criarReserva(dados);
      }

      fecharFormulario();
      await carregarReservas();

    } catch (error) {
      console.error(error);

      setErro(
        reservaEditando
          ? "Não foi possível editar a reserva."
          : "Não foi possível criar a reserva."
      );

    } finally {
      setSalvando(false);
    }
  }

  return (
    <Box>
      <PageTable
        titulo="Reservas"
        descricao="Gerencie as reservas das quadras."
        textoBotao="Novo"
        onClick={abrirFormulario}
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

              return new Date(reserva.dataReserva).toLocaleDateString(
                "pt-BR",
                {
                  timeZone: "UTC",
                }
              );
            },
          },

          {
            field: "horaInicio",
            label: "Início",
          },

          {
            field: "horaFim",
            label: "Fim",
          },

          {
            field: "status",
            label: "Status",
            render: (reserva) => (
              <StatusChip
                ativo={reserva.status === "ATIVA"}
                labelAtivo="Ativa"
                labelInativo="Cancelada"
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
                startIcon={<EditRoundedIcon />}
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
            {usuarios.map((usuario) => (
              <MenuItem
                key={usuario.id}
                value={usuario.id}
              >
                {usuario.nome}
              </MenuItem>
            ))}
          </TextField>

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

          <TextField
            label="Data da reserva"
            type="date"
            value={dataReserva}
            onChange={(event) =>
              setDataReserva(event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
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
              label="Hora de início"
              type="time"
              value={horaInicio}
              onChange={(event) =>
                setHoraInicio(event.target.value)
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
              label="Hora de fim"
              type="time"
              value={horaFim}
              onChange={(event) =>
                setHoraFim(event.target.value)
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
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            fullWidth
          >
            <MenuItem value="ATIVA">
              Ativa
            </MenuItem>

            <MenuItem value="CANCELADA">
              Cancelada
            </MenuItem>
          </TextField>

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