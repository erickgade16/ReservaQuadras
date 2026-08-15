import { Paper } from "@mui/material";

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
  emptyMessage,
}) {
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

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage={emptyMessage}
      />
    </Paper>
  );
}