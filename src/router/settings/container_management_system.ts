import { Router } from "express";
import accessControl from "../../middleware/access-control";
import { checkContainerManagementSystem, deleteContainerManagementSystem, fetchContainerManagement, fetchContainerManagementPagination } from "../../controllers/process-registration/container-management-system";

const router = Router();

// router.use(accessControl);

router.get('/', fetchContainerManagementPagination);
router.get('/get-container-management-system', fetchContainerManagement);
router.delete('/', deleteContainerManagementSystem);
router.post('/check-container-management-system', checkContainerManagementSystem);

export default router;