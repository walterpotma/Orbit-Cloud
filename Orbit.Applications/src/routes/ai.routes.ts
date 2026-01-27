import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.get('/', (req, res) => {
    res.send('API de IA está funcionando!');
});

router.post('/find-version', aiController.findVersion);

router.post('/generate-dockerfile', aiController.generateDockerfile);

export default router;