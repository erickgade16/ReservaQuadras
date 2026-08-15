import { useEffect, useState } from "react";

import {
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import { buscarQuadras, criarQuadra } from "../../services/api";
import NovaQuadra from "./NovaQuadra";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusChip from "../../components/StatusChip";
import PageTable from "../../components/PageTable";
import FormDialog from "../../components/FormDialog";

export default function Quadras() {
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
const [salvando, setSalvando] = useState(false);

const [nome, setNome] = useState("");
const [tipo, setTipo] = useState("");
const [precoHora, setPrecoHora] = useState("");
const [horaAbertura, setHoraAbertura] = useState("");
const [horaFechamento, setHoraFechamento] = useState("");
const [ativa, setAtiva] = useState(true);

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
      setErro("Não foi possível carregar as quadras.");
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
}

function fecharFormulario() {
  limparFormulario();
  setErro("");
  setFormularioAberto(false);
}

async function salvarQuadra() {
  try {
    setSalvando(true);
    setErro("");

    const quadra = {
  nome,
  tipo,
  precoHora: Number(precoHora),
  ativa,
  horaAbertura: `${horaAbertura}:00`,
  horaFechamento: `${horaFechamento}:00`,
};

     await criarQuadra(quadra);

    fecharFormulario();
    await carregarQuadras();
  } catch (error) {
    console.error(error);
    setErro("Não foi possível criar a quadra.");
  } finally {
    setSalvando(false);
  }
}

  return (
    <Box>
<PageTable
  titulo="Quadras"
  descricao="Gerencie as quadras disponíveis para reserva."
  textoBotao="Novo"
  onClick={() => setFormularioAberto(true)}
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
        <StatusChip ativo={quadra.ativa} />
      ),
    },
  ]}
  rows={quadras}
  loading={carregando}
  emptyMessage="Nenhuma quadra cadastrada."
/>

<FormDialog
  open={formularioAberto}
  title="Nova quadra"
  onClose={fecharFormulario}
  onSubmit={salvarQuadra}
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
      onChange={(event) => setNome(event.target.value)}
      fullWidth
      required
    />

    <TextField
      label="Tipo"
      value={tipo}
      onChange={(event) => setTipo(event.target.value)}
      fullWidth
      required
    />

    <TextField
      label="Preço por hora"
      type="number"
      value={precoHora}
      onChange={(event) => setPrecoHora(event.target.value)}
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
        InputLabelProps={{
          shrink: true,
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
        InputLabelProps={{
          shrink: true,
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
        setAtiva(event.target.value === "true")
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
    </Box>
  );
}