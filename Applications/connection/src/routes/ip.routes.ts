import { Router } from 'express';
import * as ipController from '../controllers/ip.controller';

const router = Router();

router.get('/', (req, res) => {
    res.send('API de Controle de IP está funcionando!');
});

router.get('/get-ip', ipController.getExternalIp);

export default router;