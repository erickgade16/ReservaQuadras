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
  const erroValidacao = validarFormulario();

  if (erroValidacao) {
    setErro(erroValidacao);
    return;
  }

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


    if (horaFim <= horaInicio) {
      setErro(
        "O horário de fim deve ser maior que o horário de início."
      );
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

      console.log("Dados enviados:", dados);

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

      /*
       * Caso a API retorne uma mensagem específica,
       * tenta mostrar para facilitar o diagnóstico.
       */
      const mensagemApi =
        error?.response?.data?.message ||
        error?.response?.data?.title;

      setErro(
        mensagemApi ||
          (
            reservaEditando
              ? "Não foi possível editar a reserva."
              : "Não foi possível criar a reserva."
          )
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(reserva) {
  const novoAtivo = !reserva.ativo;

  try {
    setErro("");

    await alterarStatusReserva(
      reserva.id,
      novoAtivo
    );

    setReservas((reservasAtuais) =>
      reservasAtuais.map((item) =>
        item.id === reserva.id
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
      "Não foi possível alterar o status da reserva."
    );
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
  onChange={() =>
    alterarStatus(reserva)
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
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
            required
          />

          {/* HORÁRIOS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 2,
            }}
          >
            <TextField
              label="Hora de início"
              type="time"
              value={horaInicio}
              onChange={(event) =>
                setHoraInicio(
                  event.target.value
                )
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
                setHoraFim(
                  event.target.value
                )
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

          {/* ERRO */}
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