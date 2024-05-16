import {
    createMandi,
    fetchMandiPagination,
    fetchMandi,
    updateMandi,
    deleteMandi,
    checkMandi
} from "../../controllers/process-registration/mandi";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);
// Scope Certificate Routes
router.get('/', fetchMandiPagination);
router.get('/get-mandi', fetchMandi);
router.post('/', createMandi);
router.put('/', updateMandi);
router.delete('/', deleteMandi);
router.post('/check-mandi', checkMandi);

export default router;  