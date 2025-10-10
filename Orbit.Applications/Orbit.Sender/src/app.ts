import express, { Request, Response } from 'express';
import Router from './routes/routes';

const app = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Olá, mundo! API com Express e TypeScript está funcionando!');
});

app.use(express.json());
app.use('/api/v1', Router);

app.listen(port, () => {
  console.log(`⚡️ Servidor rodando em http://localhost:${port}`);
});