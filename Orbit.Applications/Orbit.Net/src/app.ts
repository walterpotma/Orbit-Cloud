import express, { Request, Response } from "express";
import ipRoutes from "./routes/ip.routes";

const app = express();
const port = 3700;

app.use(express.json());

app.use('/api/v1', ipRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta :${port}`);
});