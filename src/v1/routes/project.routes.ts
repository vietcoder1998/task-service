import { Router } from 'express';
import * as fileController from '../controllers/file.controller';
import * as labelController from '../controllers/label.controller';
import * as notificationTemplateController from '../controllers/notificationTemplate.controller';
import * as historyController from '../controllers/history.controller';
import * as linkedItemController from '../controllers/linkedItem.controller';
import * as locationController from '../controllers/location.controller';
import * as permissionController from '../controllers/permission.controller';
import * as projectController from '../controllers/project.controller';
import * as userController from '../controllers/user.controller';
import * as webhookController from '../controllers/webhook.controller';
import * as todoController from '../controllers/todo.controller';
import { validateProject } from '../middlewares/project.middleware';
import {
  getPermissionsByProjectUsers,
  getPermissionsByProjectLinkedItems,
  getPermissionsByProjectFiles,
  getPermissionsByProjectWebhooks,
  getPermissionsByProjectHistories,
  getPermissionsByProjectLocations,
} from '../controllers/permission.controller';

const router = Router();

router.get('/', projectController.getProjects);
router.get('/search', projectController.searchAll);
router.get('/:projectId', projectController.getProjectById);
router.get('/:projectId/users', userController.getUsersByProjectId);
router.get('/:projectId/linked-items', linkedItemController.getLinkedItems);
router.get('/:projectId/files', fileController.getFiles);
router.get('/:projectId/webhooks', webhookController.getWebhooks);
router.get('/:projectId/histories', historyController.getHistories);
router.get('/:projectId/locations', locationController.getLocations);
router.get('/:projectId/todos', todoController.getTodoByProjectId);

router.get('/:projectId/labels', labelController.getLabelsByProjectId);
router.get(
  '/:projectId/notification-templates',
  notificationTemplateController.getTemplatesByProjectId,
);
router.get('/:projectId/permissions', permissionController.getPermissions);
router.get('/:projectId/permissions/users', getPermissionsByProjectUsers);
router.get('/:projectId/permissions/linked-items', getPermissionsByProjectLinkedItems);
router.get('/:projectId/permissions/files', getPermissionsByProjectFiles);
router.get('/:projectId/permissions/webhooks', getPermissionsByProjectWebhooks);
router.get('/:projectId/permissions/histories', getPermissionsByProjectHistories);
router.get('/:projectId/permissions/locations', getPermissionsByProjectLocations);

router.post('/', validateProject, projectController.createProject);
router.put('/:projectId', validateProject, projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

export default router;
