import { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Paper, Typography } from "@mui/material";
import { format } from "date-fns";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

import PageHeader from "../../components/PageHeader";
import { buscarResumoDashboard } from "../../services/api";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// "2026-11-18T00:00:00" -> "2026-11-18"
function soData(dataReserva) {
  return dataReserva ? dataReserva.substring(0, 10) : "";
}

function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function CardResumo({ titulo, valor, icone, detalhe }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8e4",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2.5,
          backgroundColor: "#e6f4ec",
          color: "#198754",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icone}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "#718096", fontSize: 13, fontWeight: 500 }}>
          {titulo}
        </Typography>

        <Typography
          sx={{ color: "#183b2a", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}
        >
          {valor}
        </Typography>

        {detalhe && (
          <Typography sx={{ color: "#8a9a90", fontSize: 12 }}>
            {detalhe}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function Painel({ titulo, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8e4",
      }}
    >
      <Typography
        sx={{ color: "#183b2a", fontWeight: 700, fontSize: 17, mb: 2 }}
      >
        {titulo}
      </Typography>

      {children}
    </Paper>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        // Os números são calculados no servidor (contagens e somas no banco)
        setDados(
          await buscarResumoDashboard(
            format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
          )
        );
      } catch (error) {
        console.error(error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const resumo = useMemo(() => {
    if (!dados) return null;

    return {
      ...dados,
      maiorTotal: Math.max(1, ...dados.ranking.map((q) => q.total)),
    };
  }, [dados]);

  if (carregando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "#198754" }} />
      </Box>
    );
  }

  if (!resumo) {
    return (
      <Box>
        <PageHeader
          titulo="Dashboard"
          descricao="Resumo das reservas, quadras e usuários"
        />

        <Alert severity="error" sx={{ mx: 3 }}>
          {erro || "Não foi possível carregar o dashboard."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        titulo="Dashboard"
        descricao="Resumo das reservas, quadras e usuários"
      />

      {erro && (
        <Alert severity="error" sx={{ mx: 3, mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Box sx={{ px: 3 }}>
        {/* CARDS DE RESUMO */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 3,
            mb: 3,
          }}
        >
          <CardResumo
            titulo="Reservas hoje"
            valor={resumo.reservasHoje}
            icone={<EventAvailableRoundedIcon />}
            detalhe={`${resumo.reservasMes} neste mês`}
          />

          <CardResumo
            titulo="Quadras ativas"
            valor={resumo.quadrasAtivas}
            icone={<SportsSoccerRoundedIcon />}
            detalhe={`${resumo.quadrasTotal} cadastradas`}
          />

          <CardResumo
            titulo="Usuários ativos"
            valor={resumo.usuariosAtivos}
            icone={<PeopleRoundedIcon />}
            detalhe={`${resumo.usuariosTotal} cadastrados`}
          />

          <CardResumo
            titulo="Receita estimada do mês"
            valor={moeda.format(resumo.receitaMes)}
            icone={<PaidRoundedIcon />}
            detalhe="Preço/hora × duração das reservas ativas"
          />
        </Box>

        {/* PAINÉIS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 3,
          }}
        >
          <Painel titulo="Próximas reservas">
            {resumo.proximas.length === 0 ? (
              <Typography sx={{ color: "#718096" }}>
                Nenhuma reserva futura.
              </Typography>
            ) : (
              resumo.proximas.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                    borderBottom: "1px solid #eef2ef",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: "#183b2a" }} noWrap>
                      {r.quadra?.nome || "Quadra"}
                    </Typography>
                    <Typography sx={{ color: "#718096", fontSize: 13 }} noWrap>
                      {r.usuario?.nome || "-"}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right", flexShrink: 0, ml: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: "#183b2a" }}>
                      {formatarData(soData(r.dataReserva))}
                    </Typography>
                    <Typography sx={{ color: "#718096", fontSize: 13 }}>
                      {(r.horaInicio || "").substring(0, 5)} –{" "}
                      {(r.horaFim || "").substring(0, 5)}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Painel>

          <Painel titulo="Quadras mais reservadas no mês">
            {resumo.ranking.length === 0 ? (
              <Typography sx={{ color: "#718096" }}>
                Nenhuma quadra cadastrada.
              </Typography>
            ) : (
              resumo.ranking.map((q) => (
                <Box key={q.id} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography sx={{ color: "#183b2a", fontWeight: 600 }}>
                      {q.nome}
                    </Typography>
                    <Typography sx={{ color: "#718096" }}>{q.total}</Typography>
                  </Box>

                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e6f4ec",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(q.total / resumo.maiorTotal) * 100}%`,
                        borderRadius: 4,
                        backgroundColor: "#198754",
                      }}
                    />
                  </Box>
                </Box>
              ))
            )}
          </Painel>
        </Box>
      </Box>
    </Box>
  );
}
