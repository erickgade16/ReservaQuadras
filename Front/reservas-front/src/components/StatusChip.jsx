import { Chip } from "@mui/material";

export default function StatusChip({
  ativo,
  labelAtivo = "Ativa",
  labelInativo = "Inativa",
}) {
  return (
    <Chip
      label={ativo ? labelAtivo : labelInativo}
      size="small"
      sx={{
        fontWeight: 600,
        backgroundColor: ativo
          ? "#dcfce7"
          : "#fee2e2",
        color: ativo
          ? "#166534"
          : "#991b1b",
      }}
    />
  );
}