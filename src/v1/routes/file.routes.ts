import { Router } from 'express';
import multer from 'multer';
import * as fileController from '../controllers/file.controller';
import { validateFile } from '../middlewares/file.middleware';

const router = Router();
const upload = multer();

router.get('/', fileController.getFiles);
router.post('/', upload.single('file'), validateFile, fileController.createFile);
router.put('/:id', validateFile, fileController.updateFile);
router.delete('/:id', fileController.deleteFile);

export default router;
