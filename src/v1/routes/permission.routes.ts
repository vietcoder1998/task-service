import { Router } from 'express';
import * as permissionController from '../controllers/permission.controller';
import { validatePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', permissionController.getPermissions);
router.post('/', validatePermission, permissionController.createPermission);
router.put('/:id', validatePermission, permissionController.updatePermission);
router.delete('/:id', permissionController.deletePermission);

export default router;
