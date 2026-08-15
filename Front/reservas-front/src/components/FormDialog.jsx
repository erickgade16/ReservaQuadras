import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export default function FormDialog({
  open,
  title,
  children,
  onClose,
  onSubmit,
  loading = false,
  submitText = "Salvar",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: "#183b2a",
          borderBottom: "1px solid #e2e8e4",
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {children}
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
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{
            backgroundColor: "#198754",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,

            "&:hover": {
              backgroundColor: "#157347",
            },
          }}
        >
          {loading ? "Salvando..." : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}