import {
    createMIllProcess,
    fetchMIllProcessPagination,
    updateMIllProcess,
    deleteMIllProcess,
    fetchMIllProcess,
    checkMIllProcess
} from "../../controllers/process-registration/mill-process";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Scope Certificate Routes
router.get('/', fetchMIllProcessPagination);
router.get('/get-mill', fetchMIllProcess);
router.post('/', createMIllProcess);
router.put('/', updateMIllProcess);
router.delete('/', deleteMIllProcess);
router.post('/check-mill', checkMIllProcess);

export default router;  