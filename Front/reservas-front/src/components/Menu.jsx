import { useState } from "react";

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 260;
const drawerWidthRecolhido = 76;

export default function Menu({ paginaAtual, setPaginaAtual }) {

  const { logout, usuario } = useAuth();

  // Menu recolhido (só ícones). A escolha fica salva no navegador.
  const [recolhido, setRecolhido] = useState(() => {
    try {
      return localStorage.getItem("menuRecolhido") === "1";
    } catch {
      return false;
    }
  });

  function alternarMenu() {
    setRecolhido((atual) => {
      const novo = !atual;

      try {
        localStorage.setItem("menuRecolhido", novo ? "1" : "0");
      } catch {
        // sem armazenamento: o menu só não lembra a escolha
      }

      return novo;
    });
  }

  const largura = recolhido ? drawerWidthRecolhido : drawerWidth;

  const opcoes = [
    {
      nome: "Dashboard",
      icone: <DashboardRoundedIcon />,
    },
    {
      nome: "Agenda",
      icone: <TodayRoundedIcon />,
    },
    {
      nome: "Quadras",
      icone: <SportsSoccerRoundedIcon />,
    },
     {
       nome: "Reservas",
       icone: <EventRoundedIcon />,
     },
    {
      nome: "Usuários",
      icone: <PeopleRoundedIcon />,
    },
    {
      nome: "Perfil",
      icone: <AccountCircleRoundedIcon />,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: largura,
        flexShrink: 0,
        transition: "width 200ms ease",

        "& .MuiDrawer-paper": {
          width: largura,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 200ms ease",

          // Verde escuro
          backgroundColor: "#123524",

          color: "#fff",
          borderRight: "1px solid #1b4d34",
        },
      }}
    >
      {/* LOGO (clique volta para o Dashboard) */}
      <Box
        role="button"
        tabIndex={0}
        aria-label="Ir para o Dashboard"
        onClick={() => setPaginaAtual("Dashboard")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setPaginaAtual("Dashboard");
          }
        }}
        sx={{
          height: 72,
          display: "flex",
          alignItems: "center",
          px: recolhido ? 0 : 3,
          justifyContent: recolhido ? "center" : "flex-start",
          gap: 1.5,
          cursor: "pointer",
          outline: "none",

          "&:focus-visible": {
            backgroundColor: "#1b4d34",
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: "#198754",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CalendarMonthRoundedIcon />
        </Box>

        {!recolhido && (
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.2,
            }}
          >
            Reserva
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "#a7c4b2",
            }}
          >
            Quadras
          </Typography>
        </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "#1b4d34" }} />

      {/* RECOLHER / EXPANDIR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: recolhido ? "center" : "flex-end",
          px: recolhido ? 0 : 2,
          pt: 1.5,
        }}
      >
        <Tooltip
          title={recolhido ? "Expandir menu" : "Recolher menu"}
          placement="right"
        >
          <IconButton
            onClick={alternarMenu}
            aria-label={recolhido ? "Expandir menu" : "Recolher menu"}
            size="small"
            sx={{
              color: "#b4c8bb",
              "&:hover": {
                color: "#fff",
                backgroundColor: "#1b4d34",
              },
            }}
          >
            {recolhido ? (
              <ChevronRightRoundedIcon />
            ) : (
              <ChevronLeftRoundedIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* NAVEGAÇÃO */}
      <Box sx={{ px: recolhido ? 1.25 : 2, pt: 1.5 }}>
        <Typography
          sx={{
            px: 1.5,
            mb: 1,
            display: recolhido ? "none" : "block",
            fontSize: 11,
            fontWeight: 600,
            color: "#7fa58e",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Menu
        </Typography>

        <List sx={{ p: 0 }}>
          {opcoes.map((opcao) => {
            const selecionado = paginaAtual === opcao.nome;

            return (
              <Tooltip
                key={opcao.nome}
                title={recolhido ? opcao.nome : ""}
                placement="right"
              >
              <ListItemButton
                selected={selecionado}
                onClick={() => setPaginaAtual(opcao.nome)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  minHeight: 46,
                  justifyContent: recolhido ? "center" : "flex-start",
                  px: recolhido ? 0 : 2,

                  color: selecionado ? "#fff" : "#b4c8bb",

                  "& .MuiListItemIcon-root": {
                    minWidth: recolhido ? 0 : 40,
                    color: selecionado ? "#fff" : "#88aa96",
                  },

                  "&:hover": {
                    backgroundColor: "#1b4d34",
                    color: "#fff",

                    "& .MuiListItemIcon-root": {
                      color: "#7ee2a8",
                    },
                  },

                  "&.Mui-selected": {
                    backgroundColor: "#198754",
                    color: "#fff",

                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                  },

                  "&.Mui-selected:hover": {
                    backgroundColor: "#157347",
                  },
                }}
              >
                <ListItemIcon>
                  {opcao.icone}
                </ListItemIcon>

                {!recolhido && (
                <ListItemText
                  primary={opcao.nome}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: selecionado ? 600 : 500,
                  }}
                />
                )}
              </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* USUÁRIO */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ borderColor: "#1b4d34" }} />

        <Box
          sx={{
            p: recolhido ? 1.5 : 2,
            display: "flex",
            flexDirection: recolhido ? "column" : "row",
            alignItems: "center",
            gap: recolhido ? 1 : 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              backgroundColor: "#198754",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {(usuario?.nome?.trim()?.[0] || "U").toUpperCase()}
          </Avatar>

          {!recolhido && (
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {usuario?.nome || "Usuário"}
            </Typography>

          </Box>
          )}

          <Tooltip title="Sair" placement="right">
            <IconButton
              onClick={logout}
              aria-label="Sair"
              sx={{
                color: "#b4c8bb",
                "&:hover": {
                  color: "#fff",
                  backgroundColor: "#1b4d34",
                },
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}