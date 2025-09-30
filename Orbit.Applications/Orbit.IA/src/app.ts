import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import aiRoutes from './routes/ai.routes';


const app = express();
const port = 7001;

app.use(cors());
app.use(express.json());

app.use('/api/v1', aiRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});