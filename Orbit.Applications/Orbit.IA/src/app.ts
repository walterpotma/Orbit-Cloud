import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import aiRoutes from './routes/ai.routes';


const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.use('/v1', aiRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});