import { useEffect, useState } from "react";

import {
  Box,
  Chip,
  Typography,
} from "@mui/material";

import { buscarQuadras } from "../../services/api";
import NovaQuadra from "./NovaQuadra";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

export default function Quadras() {
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modo, setModo] = useState("lista");

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

  if (modo === "nova") {
    return (
      <NovaQuadra
        onVoltar={() => setModo("lista")}
        onCriada={() => {
          setModo("lista");
          carregarQuadras();
        }}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        titulo="Quadras"
        descricao="Gerencie as quadras disponíveis para reserva."
        textoBotao="Novo"
        onClick={() => setModo("nova")}
      />

      {erro && (
        <Typography color="error" sx={{ mb: 2 }}>
          {erro}
        </Typography>
      )}

      <DataTable
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
        <Chip
          label={quadra.ativa ? "Ativa" : "Inativa"}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: quadra.ativa
              ? "#dcfce7"
              : "#fee2e2",
            color: quadra.ativa
              ? "#166534"
              : "#991b1b",
          }}
        />
      ),
    },
  ]}
  rows={quadras}
  loading={carregando}
  emptyMessage="Nenhuma quadra cadastrada."
/>
    </Box>
  );
}