import { Box, Switch, Typography } from "@mui/material";

export default function StatusSwitch({
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        disableRipple
        sx={{
          width: 42,
          height: 24,
          padding: 0,

          "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: "2px",
            transition: "transform 200ms ease",

            "&.Mui-checked": {
              transform: "translateX(18px)",
              color: "#fff",

              "& + .MuiSwitch-track": {
                backgroundColor: "#16a34a",
                opacity: 1,
              },
            },
          },

          "& .MuiSwitch-thumb": {
            width: 20,
            height: 20,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
          },

          "& .MuiSwitch-track": {
            borderRadius: 12,
            backgroundColor: "#cbd5e1",
            opacity: 1,
            transition: "background-color 200ms ease",
          },
        }}
      />

      <Typography
        variant="body2"
        sx={{
          fontSize: 13,
          fontWeight: 500,
          color: checked ? "#16a34a" : "#64748b",
          transition: "color 200ms ease",
        }}
      >
        {checked ? "Ativo" : "Inativo"}
      </Typography>
    </Box>
  );
}