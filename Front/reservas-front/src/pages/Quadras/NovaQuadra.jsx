import { useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { criarQuadra } from "../../services/api";

export default function NovaQuadra({ onVoltar, onCriada }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [precoHora, setPrecoHora] = useState("");
  const [horaAbertura, setHoraAbertura] = useState("");
  const [horaFechamento, setHoraFechamento] = useState("");
  const [ativa, setAtiva] = useState(true);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const novaQuadra = {
        nome,
        tipo,
        precoHora: Number(precoHora),
        ativa,
        horaAbertura: `${horaAbertura}:00`,
        horaFechamento: `${horaFechamento}:00`,
      };

      await criarQuadra(novaQuadra);

      onCriada();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível cadastrar a quadra.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Nova Quadra
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          label="Nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Tipo"
          value={tipo}
          onChange={(event) => setTipo(event.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Preço por hora"
          type="number"
          value={precoHora}
          onChange={(event) => setPrecoHora(event.target.value)}
          required
          fullWidth
          inputProps={{
            min: 0,
            step: "0.01",
          }}
        />

        <TextField
          label="Hora de abertura"
          type="time"
          value={horaAbertura}
          onChange={(event) => setHoraAbertura(event.target.value)}
          required
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          label="Hora de fechamento"
          type="time"
          value={horaFechamento}
          onChange={(event) => setHoraFechamento(event.target.value)}
          required
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={ativa}
              onChange={(event) => setAtiva(event.target.checked)}
            />
          }
          label="Quadra ativa"
        />

        {erro && (
          <Typography color="error">
            {erro}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onVoltar}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={carregando}
          >
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}