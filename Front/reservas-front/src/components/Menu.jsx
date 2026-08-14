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
} from "@mui/material";

import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const drawerWidth = 260;

export default function Menu({ paginaAtual, setPaginaAtual }) {
  const opcoes = [
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
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",

          // Verde escuro
          backgroundColor: "#123524",

          color: "#fff",
          borderRight: "1px solid #1b4d34",
        },
      }}
    >
      {/* LOGO */}
      <Box
        sx={{
          height: 72,
          display: "flex",
          alignItems: "center",
          px: 3,
          gap: 1.5,
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
      </Box>

      <Divider sx={{ borderColor: "#1b4d34" }} />

      {/* NAVEGAÇÃO */}
      <Box sx={{ px: 2, pt: 3 }}>
        <Typography
          sx={{
            px: 1.5,
            mb: 1,
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
              <ListItemButton
                key={opcao.nome}
                selected={selecionado}
                onClick={() => setPaginaAtual(opcao.nome)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  minHeight: 46,

                  color: selecionado ? "#fff" : "#b4c8bb",

                  "& .MuiListItemIcon-root": {
                    minWidth: 40,
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

                <ListItemText
                  primary={opcao.nome}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: selecionado ? 600 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* USUÁRIO */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ borderColor: "#1b4d34" }} />

        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
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
            U
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Usuário
            </Typography>

            <Typography
              noWrap
              sx={{
                fontSize: 12,
                color: "#7fa58e",
              }}
            >
              Sistema
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}