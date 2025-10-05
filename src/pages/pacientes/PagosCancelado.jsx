import { Box, Typography } from "@mui/material";

const PagosCancelado = () => (
  <Box sx={{ textAlign: "center", mt: 8 }}>
    <Typography variant="h5" color="error"> Pago cancelado</Typography>
    <Typography variant="body2">Puedes intentarlo nuevamente desde la sección de pagos.</Typography>
  </Box>
);

export default PagosCancelado;
