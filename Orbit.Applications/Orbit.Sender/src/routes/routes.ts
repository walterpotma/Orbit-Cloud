import { Router } from 'express';
import * as emailController from '../controllers/email';

const router = Router();

router.get('/', (req, res) => {
    res.send('API Sender está funcionando!');
});

router.post('/send-email', emailController.SendEmail);

export default router;