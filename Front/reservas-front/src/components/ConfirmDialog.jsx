import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

export default function ConfirmDialog({
  open,
  title = "Confirmar ação",
  message = "Tem certeza que deseja continuar?",
  onClose,
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          color: "#183b2a",
          fontWeight: 700,
          fontSize: "1.15rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >

          {title}
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 1,
          pb: 3,
        }}
      >
        <Typography
          sx={{
            color: "#64716b",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #e2e8e4",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 2.5,
            color: "#52615a",
            borderColor: "#d0d8d3",

            "&:hover": {
              borderColor: "#aebbb4",
              backgroundColor: "#f7f9f8",
            },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 2.5,
            backgroundColor: "#198754",
            fontWeight: 600,
            boxShadow: "none",

            "&:hover": {
              backgroundColor: "#157347",
              boxShadow: "none",
            },
          }}
        >
          {loading ? "Aguarde..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}