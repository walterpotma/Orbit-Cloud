import express, { Request, Response } from "express";
import ipRoutes from "./routes/ip.routes";
import path from 'path';

const app = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(express.json());

app.use('/v1', ipRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta :${port}`);
});