import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validateUser } from '../middlewares/user.middleware';

const router = Router();

router.get('/', userController.getUsers);
router.post('/', validateUser, userController.createUser);
router.put('/:id', validateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
