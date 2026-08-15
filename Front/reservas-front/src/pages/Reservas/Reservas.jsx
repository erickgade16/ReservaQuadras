import { useEffect, useState } from "react";

import {
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  buscarReservas,
  buscarUsuarios,
  buscarQuadras,
  criarReserva,
} from "../../services/api";

import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";
import StatusChip from "../../components/StatusChip";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [quadras, setQuadras] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [formularioAberto, setFormularioAberto] = useState(false);

  const [usuarioId, setUsuarioId] = useState("");
  const [quadraId, setQuadraId] = useState("");
  const [dataReserva, setDataReserva] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");

  useEffect(() => {
    carregarReservas();
    carregarDadosFormulario();
  }, []);

  async function carregarReservas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarReservas();

      console.log("Reservas recebidas:", dados);

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
  }

  function abrirFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(true);
  }

  function fecharFormulario() {
    limparFormulario();
    setErro("");
    setFormularioAberto(false);
  }

  async function salvarReserva() {
  if (
    !usuarioId ||
    !quadraId ||
    !dataReserva ||
    !horaInicio ||
    !horaFim
  ) {
    setErro("Preencha todos os campos.");
    return;
  }

  if (horaInicio >= horaFim) {
    setErro(
      "A hora de fim deve ser maior que a hora de início."
    );
    return;
  }

  try {
    setSalvando(true);
    setErro("");

    const reserva = {
      usuarioId: Number(usuarioId),
      quadraId: Number(quadraId),

      // 2026-08-16 -> 16/08/2026
      dataReserva: formatarDataParaApi(dataReserva),

      // 13:00 -> 13:00:00
      horaInicio: `${horaInicio}:00`,
      horaFim: `${horaFim}:00`,

      status: "ATIVA",
    };

    console.log("Enviando reserva:", reserva);

    await criarReserva(reserva);

    fecharFormulario();

    await carregarReservas();
  } catch (error) {
    console.error(error);
    setErro("Não foi possível criar a reserva.");
  } finally {
    setSalvando(false);
  }
}

  function formatarDataParaApi(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
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
            render: (reserva) =>
              reserva.dataReserva || "-",
          },

          {
            field: "horaInicio",
            label: "Início",
            render: (reserva) =>
              reserva.horaInicio || "-",
          },

          {
            field: "horaFim",
            label: "Fim",
            render: (reserva) =>
              reserva.horaFim || "-",
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
        ]}
        rows={reservas}
        loading={carregando}
        emptyMessage="Nenhuma reserva cadastrada."
      />

      <FormDialog
        open={formularioAberto}
        title="Nova reserva"
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
            {usuarios.map((usuario) => (
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

          {/* DATA */}
          <TextField
            label="Data da reserva"
            type="date"
            value={dataReserva}
            onChange={(event) =>
              setDataReserva(event.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            required
          />

          {/* HORÁRIOS */}
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
              InputLabelProps={{
                shrink: true,
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
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              required
            />
          </Box>

          {/* ERRO */}
          {erro && (
            <Typography
              color="error"
              sx={{
                fontSize: 14,
              }}
            >
              {erro}
            </Typography>
          )}
        </Box>
      </FormDialog>
    </Box>
  );
}