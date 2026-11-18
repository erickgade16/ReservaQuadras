import { useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";

import { buscarUsuariosParaSelecao } from "../services/api";

// Campo de usuário com busca no SERVIDOR (nome ou e-mail): não carrega a lista inteira,
// só os primeiros resultados da busca. Mostra apenas usuários ativos e não bloqueados.
export default function UsuarioAutocomplete({
  value,
  onChange,
  label = "Usuário (busque por nome ou e-mail)",
  required = true,
}) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!aberto) return undefined;

    const controller = new AbortController();

    // Pequena espera enquanto a pessoa digita, para não consultar a cada letra
    const timer = setTimeout(
      async () => {
        try {
          setCarregando(true);

          const dados = await buscarUsuariosParaSelecao(
            termo,
            20,
            controller.signal
          );

          setResultados(dados);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error(error);
            setResultados([]);
          }
        } finally {
          if (!controller.signal.aborted) setCarregando(false);
        }
      },
      termo ? 300 : 0
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [termo, aberto]);

  // O usuário já selecionado sempre aparece nas opções (mesmo fora do resultado da busca)
  const opcoes = useMemo(() => {
    if (value && !resultados.some((u) => u.id === value.id)) {
      return [value, ...resultados];
    }

    return resultados;
  }, [resultados, value]);

  return (
    <Autocomplete
      open={aberto}
      onOpen={() => setAberto(true)}
      onClose={() => setAberto(false)}
      options={opcoes}
      value={value ?? null}
      onChange={(_, usuario) => onChange(usuario)}
      onInputChange={(_, texto, motivo) => {
        if (motivo === "input") setTermo(texto);
        if (motivo === "clear") setTermo("");
      }}
      filterOptions={(opcoesRecebidas) => opcoesRecebidas}
      loading={carregando}
      loadingText="Buscando..."
      noOptionsText={
        termo ? "Nenhum usuário encontrado" : "Nenhum usuário disponível"
      }
      getOptionLabel={(usuario) => `${usuario.nome} (${usuario.email})`}
      isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
      renderOption={(props, usuario) => {
        const { key, ...resto } = props;

        return (
          <Box component="li" key={key} {...resto}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }} noWrap>
                {usuario.nome}
              </Typography>
              <Typography sx={{ color: "#718096", fontSize: 13 }} noWrap>
                {usuario.email}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} required={required} />
      )}
      fullWidth
    />
  );
}
