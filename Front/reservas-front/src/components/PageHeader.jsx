import { Box, Button, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default function PageHeader({
  titulo,
  descricao,
  textoBotao,
  onClick,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#183b2a",
          }}
        >
          {titulo}
        </Typography>

        <Typography
          sx={{
            color: "#718096",
            mt: 0.5,
          }}
        >
          {descricao}
        </Typography>
      </Box>

      {textoBotao && (
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onClick}
          sx={{
            backgroundColor: "#198754",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 1.2,

            "&:hover": {
              backgroundColor: "#157347",
            },
          }}
        >
          {textoBotao}
        </Button>
      )}
    </Box>
  );
}