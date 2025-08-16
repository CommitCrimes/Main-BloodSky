import React from "react";
import { Paper, Box, Button, Typography } from "@mui/material";
import { ArrowBack, Refresh } from "@mui/icons-material";

type HeaderBarProps = {
  title: string;
  onBack: () => void;
  onRefresh: () => void;
  onOpenHospitals: () => void;
  onOpenAssign: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  onBack,
  onRefresh,
  onOpenHospitals,
  onOpenAssign,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
          Retour
        </Button>
        <Typography variant="h5" sx={{ fontFamily: "Share Tech, monospace" }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh}>
          Actualiser
        </Button>
        <Button
          variant="contained"
          onClick={onOpenHospitals}
          sx={{ bgcolor: "#f44336", "&:hover": { bgcolor: "#d32f2f" } }}
        >
          Hôpitaux
        </Button>
        <Button
          variant="contained"
          onClick={onOpenAssign}
          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#125ea0" } }}
        >
          Assigner livraison
        </Button>
      </Box>
    </Paper>
  );
};

export default React.memo(HeaderBar);
