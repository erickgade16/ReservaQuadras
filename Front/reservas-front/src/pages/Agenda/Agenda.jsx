import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import PageHeader from "../../components/PageHeader";
import FormDialog from "../../components/FormDialog";
import AppSnackbar from "../../components/AppSnackbar";
import {
  buscarHorariosDisponiveis,
  buscarQuadras,
  buscarReservas,
  buscarUsuarios,
  criarReserva,
} from "../../services/api";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// "08:00:00" -> "08:00"
function hhmm(hora) {
  return hora ? hora.substring(0, 5) : "";
}

// "2026-11-18T00:00:00" -> "2026-11-18"
function soData(dataReserva) {
  return dataReserva ? dataReserva.substring(0, 10) : "";
}

export default function Agenda() {
  const [data, setData] = useState(new Date());
  const [quadras, setQuadras] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [horariosPorQuadra, setHorariosPorQuadra] = useState({});

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroDialog, setErroDialog] = useState("");

  const [snackbarAberto, setSnackbarAberto] = useState(false);
  const [snackbarMensagem, setSnackbarMensagem] = useState("");

  const dataTexto = format(data, "yyyy-MM-dd");

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        const [quadrasData, usuariosData, reservasData] = await Promise.all([
          buscarQuadras(),
          buscarUsuarios(),
          buscarReservas(),
        ]);

        const ativas = quadrasData.filter((q) => q.ativa);

        // Cada quadra devolve os horários do dia (vazio = fechada nesse dia)
        const listas = await Promise.all(
          ativas.map((q) =>
            buscarHorariosDisponiveis(q.id, dataTexto).catch(() => [])
          )
        );

        if (cancelado) return;

        const mapa = {};
        ativas.forEach((q, i) => {
          mapa[q.id] = listas[i];
        });

        setQuadras(ativas);
        setUsuarios(usuariosData);
        setReservas(reservasData);
        setHorariosPorQuadra(mapa);
      } catch (error) {
        if (cancelado) return;
        console.error(error);
        setErro(error.message);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [dataTexto, recarregar]);

  const usuariosDisponiveis = useMemo(
    () => usuarios.filter((u) => u.ativo && !u.bloqueado),
    [usuarios]
  );

  const agora = new Date();
  const hojeTexto = format(agora, "yyyy-MM-dd");
  const horaAgora = format(agora, "HH:mm");

  function situacaoDoHorario(quadra, slot) {
    const inicio = hhmm(slot.horaInicio);
    const fim = hhmm(slot.horaFim);

    const reserva = reservas.find(
      (r) =>
        r.ativo &&
        r.quadraId === quadra.id &&
        soData(r.dataReserva) === dataTexto &&
        inicio < hhmm(r.horaFim) &&
        fim > hhmm(r.horaInicio)
    );

    if (reserva) {
      return { tipo: "ocupado", nome: reserva.usuario?.nome || "Ocupado" };
    }

    if (!slot.disponivel) {
      return { tipo: "ocupado", nome: "Ocupado" };
    }

    const passado =
      dataTexto < hojeTexto ||
      (dataTexto === hojeTexto && inicio < horaAgora);

    return { tipo: passado ? "passado" : "livre" };
  }

  function abrirReserva(quadra, slot) {
    setSlotSelecionado({ quadra, slot });
    setUsuarioId("");
    setErroDialog("");
  }

  function fecharReserva() {
    if (salvando) return;
    setSlotSelecionado(null);
    setErroDialog("");
  }

  async function confirmarReserva() {
    if (salvando || !slotSelecionado) return;

    if (!usuarioId) {
      setErroDialog("Selecione o usuário da reserva.");
      return;
    }

    try {
      setSalvando(true);
      setErroDialog("");

      await criarReserva({
        usuarioId: Number(usuarioId),
        quadraId: slotSelecionado.quadra.id,
        dataReserva: dataTexto,
        horaInicio: `${hhmm(slotSelecionado.slot.horaInicio)}:00`,
        horaFim: `${hhmm(slotSelecionado.slot.horaFim)}:00`,
        ativo: true,
      });

      setSlotSelecionado(null);
      setRecarregar((n) => n + 1);
      setSnackbarMensagem("Reserva criada com sucesso!");
      setSnackbarAberto(true);
    } catch (error) {
      console.error(error);
      setErroDialog(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Box>
      <PageHeader
        titulo="Agenda"
        descricao="Veja os horários livres e ocupados de cada quadra e reserve com um clique."
      />

      {/* BARRA DE DATA */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          px: 3,
          mb: 3,
        }}
      >
        <IconButton
          aria-label="Dia anterior"
          onClick={() => setData((d) => addDays(d, -1))}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            format="dd/MM/yyyy"
            value={data}
            onChange={(novaData) => {
              if (novaData && !Number.isNaN(novaData.getTime())) {
                setData(novaData);
              }
            }}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>

        <IconButton
          aria-label="Próximo dia"
          onClick={() => setData((d) => addDays(d, 1))}
        >
          <ChevronRightRoundedIcon />
        </IconButton>

        <Button
          variant="outlined"
          onClick={() => setData(new Date())}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Hoje
        </Button>

        <Typography
          sx={{
            color: "#183b2a",
            fontWeight: 600,
            textTransform: "capitalize",
            ml: 1,
          }}
        >
          {format(data, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </Typography>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mx: 3, mb: 3 }}>
          {erro}
        </Alert>
      )}

      {carregando ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress sx={{ color: "#198754" }} />
        </Box>
      ) : quadras.length === 0 ? (
        <Typography sx={{ px: 3, color: "#718096" }}>
          Nenhuma quadra ativa cadastrada.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 3,
            px: 3,
            alignItems: "start",
          }}
        >
          {quadras.map((quadra) => {
            const horarios = horariosPorQuadra[quadra.id] || [];

            return (
              <Paper
                key={quadra.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #e2e8e4",
                }}
              >
                <Typography
                  sx={{ color: "#183b2a", fontWeight: 700, fontSize: 17 }}
                  noWrap
                >
                  {quadra.nome}
                </Typography>

                <Typography sx={{ color: "#718096", fontSize: 13, mb: 2 }}>
                  {quadra.tipo} · {moeda.format(Number(quadra.precoHora) || 0)}
                  /hora
                </Typography>

                {horarios.length === 0 ? (
                  <Typography sx={{ color: "#8a9a90", fontSize: 14 }}>
                    Fechada neste dia
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {horarios.map((slot) => {
                      const situacao = situacaoDoHorario(quadra, slot);
                      const livre = situacao.tipo === "livre";
                      const ocupado = situacao.tipo === "ocupado";

                      return (
                        <Box
                          key={slot.horaInicio}
                          component="button"
                          type="button"
                          disabled={!livre}
                          onClick={() => abrirReserva(quadra, slot)}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 1.1,
                            borderRadius: 2,
                            fontFamily: (theme) => theme.typography.fontFamily,
                            fontSize: 14,
                            lineHeight: 1.5,
                            textAlign: "left",
                            border: "1px solid",
                            borderColor: livre ? "#198754" : "#e2e8e4",
                            backgroundColor: livre
                              ? "#fff"
                              : ocupado
                                ? "#f1f5f3"
                                : "#fafafa",
                            color: livre
                              ? "#183b2a"
                              : ocupado
                                ? "#4a5568"
                                : "#a0aec0",
                            cursor: livre ? "pointer" : "default",

                            "&:hover": livre
                              ? { backgroundColor: "#e6f4ec" }
                              : undefined,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {hhmm(slot.horaInicio)} – {hhmm(slot.horaFim)}
                          </span>

                          <span
                            style={{
                              fontSize: 13,
                              color: livre ? "#16a34a" : undefined,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 110,
                            }}
                          >
                            {livre
                              ? "Livre"
                              : ocupado
                                ? situacao.nome
                                : "Encerrado"}
                          </span>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* RESERVA RÁPIDA */}
      <FormDialog
        open={Boolean(slotSelecionado)}
        title="Nova reserva"
        onClose={fecharReserva}
        onSubmit={confirmarReserva}
        loading={salvando}
        submitText="Reservar"
      >
        {slotSelecionado && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#183b2a" }}>
                {slotSelecionado.quadra.nome}
              </Typography>

              <Typography sx={{ color: "#718096" }}>
                {format(data, "dd/MM/yyyy")} ·{" "}
                {hhmm(slotSelecionado.slot.horaInicio)} –{" "}
                {hhmm(slotSelecionado.slot.horaFim)}
              </Typography>
            </Box>

            <Autocomplete
              options={usuariosDisponiveis}
              value={
                usuariosDisponiveis.find(
                  (u) => String(u.id) === usuarioId
                ) ?? null
              }
              onChange={(_, usuario) =>
                setUsuarioId(usuario ? String(usuario.id) : "")
              }
              getOptionLabel={(usuario) =>
                `${usuario.nome} (${usuario.email})`
              }
              isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
              noOptionsText="Nenhum usuário encontrado"
              renderOption={(props, usuario) => {
                const { key, ...resto } = props;

                return (
                  <Box component="li" key={key} {...resto}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }} noWrap>
                        {usuario.nome}
                      </Typography>
                      <Typography
                        sx={{ color: "#718096", fontSize: 13 }}
                        noWrap
                      >
                        {usuario.email}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuário (busque por nome ou e-mail)"
                  required
                />
              )}
              fullWidth
            />

            {erroDialog && (
              <Typography color="error">{erroDialog}</Typography>
            )}
          </Box>
        )}
      </FormDialog>

      <AppSnackbar
        open={snackbarAberto}
        message={snackbarMensagem}
        severity="success"
        onClose={() => setSnackbarAberto(false)}
      />
    </Box>
  );
}
