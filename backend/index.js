import express from 'express';
import cors from 'cors';
import { env } from './src/config/env.js';
import { conectarMongo } from './src/config/dataBase.js';

import cuentaRoutes from './src/router/cuentaRoutes.js';
import movimientosRoutes from './src/router/movimientosRoutes.js';
import authRoutes from './src/router/authRoutes.js';
import resumenRoutes from './src/router/resumenRoutes.js';
import usuariosRoutes from './src/router/usuariosRoutes.js';
import configuracionRoutes from './src/router/configuracionRoutes.js';

const app = express();

const PORT = env.PORT || 3000;

app.use(cors());
app.use(express.json());

conectarMongo();

app.use('/api/auth', authRoutes);
app.use('/api/cuentas', cuentaRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/resumen', resumenRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracion', configuracionRoutes);

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto: ${PORT}`);
})