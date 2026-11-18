import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TablePagination,
  TextField,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";

import PageHeader from "./PageHeader";
import DataTable from "./DataTable";

export default function PageTable({
  titulo,
  descricao,
  textoBotao,
  onClick,
  columns,
  rows,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",

  // Busca
  search,

  // Filtros
  filters = [],

  // Ordenação
  sortOptions = [],

  // Modo servidor (paginação, busca, filtros e ordenação feitos na API):
  // { total, pagina (0-based), tamanho, onPaginaChange, onTamanhoChange, onConsultaChange }
  servidor,
}) {
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({});
  const [ordenacao, setOrdenacao] = useState("");
  const [direcao, setDirecao] = useState("asc");

  const servidorRef = useRef(servidor);
  servidorRef.current = servidor;
  const ultimaConsulta = useRef(null);

  // No modo servidor, avisa a página quando busca/filtros/ordenação mudam (com espera
  // enquanto a pessoa digita). A primeira execução só registra o estado inicial.
  useEffect(() => {
    if (!servidorRef.current?.onConsultaChange) return undefined;

    const consulta = { busca: busca.trim(), filtros, ordenacao, direcao };
    const chave = JSON.stringify(consulta);

    if (ultimaConsulta.current === null) {
      ultimaConsulta.current = chave;
      return undefined;
    }

    if (ultimaConsulta.current === chave) return undefined;

    const timer = setTimeout(() => {
      ultimaConsulta.current = chave;
      servidorRef.current.onConsultaChange(consulta);
    }, 400);

    return () => clearTimeout(timer);
  }, [busca, filtros, ordenacao, direcao]);

  function obterValor(objeto, caminho) {
    return caminho
      .split(".")
      .reduce((valor, chave) => valor?.[chave], objeto);
  }

  function alterarFiltro(field, value) {
    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [field]: value,
    }));
  }

  function alterarOrdenacao(event) {
    const novoCampo = event.target.value;

    if (novoCampo === ordenacao) {
      setDirecao((direcaoAtual) =>
        direcaoAtual === "asc" ? "desc" : "asc"
      );
      return;
    }

    setOrdenacao(novoCampo);
    setDirecao("asc");
  }

  const rowsProcessadas = useMemo(() => {
    // Modo servidor: as linhas já chegam filtradas, ordenadas e paginadas
    if (servidor) return rows;

    let resultado = [...rows];

    // =========================
    // BUSCA
    // =========================
    if (search?.enabled && busca.trim()) {
      const termo = busca.toLowerCase().trim();

      resultado = resultado.filter((item) =>
        search.fields?.some((field) => {
          const valor = obterValor(item, field);

          return String(valor ?? "")
            .toLowerCase()
            .includes(termo);
        })
      );
    }

    // =========================
    // FILTROS
    // =========================
    filters.forEach((filtro) => {
      const valorFiltro = filtros[filtro.field];

      if (
        valorFiltro === undefined ||
        valorFiltro === "" ||
        valorFiltro === "todos"
      ) {
        return;
      }

      resultado = resultado.filter((item) => {
        const valorItem = obterValor(item, filtro.field);

        return String(valorItem) === String(valorFiltro);
      });
    });

    // =========================
    // ORDENAÇÃO
    // =========================
    if (ordenacao) {
      resultado.sort((a, b) => {
        const valorA = obterValor(a, ordenacao);
        const valorB = obterValor(b, ordenacao);

        if (valorA == null) return 1;
        if (valorB == null) return -1;

        if (
          typeof valorA === "number" &&
          typeof valorB === "number"
        ) {
          return direcao === "asc"
            ? valorA - valorB
            : valorB - valorA;
        }

        const comparacao = String(valorA)
          .toLowerCase()
          .localeCompare(
            String(valorB).toLowerCase(),
            "pt-BR"
          );

        return direcao === "asc"
          ? comparacao
          : -comparacao;
      });
    }

    return resultado;
  }, [
    rows,
    busca,
    filtros,
    ordenacao,
    direcao,
    search,
    filters,
    servidor,
  ]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e2e8e4",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <PageHeader
        titulo={titulo}
        descricao={descricao}
        textoBotao={textoBotao}
        onClick={onClick}
        mb={0}
      />

      {(search?.enabled ||
        filters.length > 0 ||
        sortOptions.length > 0) && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            p: 1.5,
            borderBottom: "1px solid #e2e8e4",
          }}
        >
          {search?.enabled && (
            <TextField
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder={
                search.placeholder || "Buscar..."
              }
              size="small"
              sx={{
                minWidth: 50,
                flex: 1,
                
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {filters.map((filtro) => (
            <FormControl
              key={filtro.field}
              size="small"
              sx={{
                minWidth: 50,
              }}
            >
              <InputLabel>{filtro.label}</InputLabel>

              <Select
                value={filtros[filtro.field] ?? "todos"}
                label={filtro.label}
                onChange={(event) =>
                  alterarFiltro(
                    filtro.field,
                    event.target.value
                  )
                }
              >
                {filtro.options.map((option) => (
                  <MenuItem
                    key={String(option.value)}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          {sortOptions.length > 0 && (
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
              }}
            >
              <InputLabel>Ordenar por</InputLabel>

              <Select
                value={ordenacao}
                label="Ordenar por"
                onChange={alterarOrdenacao}
              >
                <MenuItem value="">
                  Padrão
                </MenuItem>

                {sortOptions.map((option) => (
                  <MenuItem
                    key={option.field}
                    value={option.field}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      <DataTable
        columns={columns}
        rows={rowsProcessadas}
        loading={loading}
        emptyMessage={emptyMessage}
      />

      {servidor && (
        <TablePagination
          component="div"
          count={servidor.total}
          page={servidor.pagina}
          onPageChange={(_, novaPagina) =>
            servidor.onPaginaChange(novaPagina)
          }
          rowsPerPage={servidor.tamanho}
          onRowsPerPageChange={(event) =>
            servidor.onTamanhoChange(Number(event.target.value))
          }
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
          sx={{ borderTop: "1px solid #e2e8e4" }}
        />
      )}
    </Paper>
  );
}