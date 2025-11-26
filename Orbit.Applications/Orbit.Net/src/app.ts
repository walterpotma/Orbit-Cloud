import express, { Request, Response } from "express";
import ipRoutes from "./routes/ip.routes";

const app = express();
const port = 8080;

app.use(express.json());

// --- INICIO DO BLOCO DE DEBUG ---
// Middleware "Espião": Mostra tudo que chega no servidor
app.use((req: Request, res: Response, next) => {
    const timestamp = new Date().toISOString();
    console.log(`------------------------------------------------`);
    console.log(`[${timestamp}] Recebido: ${req.method} ${req.url}`);
    console.log(`Headers Host: ${req.headers.host}`); // Para ver qual domínio o Traefik mandou
    console.log(`User-Agent: ${req.headers['user-agent']}`);
    next(); // Passa para a próxima rota (muito importante!)
});
// --- FIM DO BLOCO DE DEBUG ---

app.use('/api/v1', ipRoutes);

// Rota 404 (Catch-all) para saber se chegou mas não achou rota
app.use('*', (req: Request, res: Response) => {
    console.log(`[ERRO 404] Rota não mapeada tentada: ${req.originalUrl}`);
    res.status(404).json({ error: "Rota não encontrada", path: req.originalUrl });
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta :${port}`);
});