import { Project, ProjectWithAll } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjectById = async (id: string): Promise<ProjectWithAll | null> => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      todos: {
        include: {
          relatedTasks: true,
          assignedUsers: true,
          todoFiles: true,
          todoWebhooks: true,
          todoGanttTasks: true,
          todoLinkedItems: true,
          todoHistories: true,
          location: true,
          asset: true,
          report: true,
        },
      },
      files: {
        include: {
          asset: true,
          report: true,
          TodoFile: true,
        },
      },
      permissions: true,
      linkedItems: {
        include: {
          asset: true,
          TodoLinkedItem: true,
        },
      },
      ganttTasks: {
        include: {
          asset: true,
          report: true,
          TodoGanttTask: true,
        },
      },
      webhooks: {
        include: {
          asset: true,
          TodoWebhook: true,
          jobs: true,
        },
      },
      users: {
        include: {
          permissions: true,
          role: true,
          AssignedUser: true,
        },
      },
      histories: true,
      labels: true,
      reports: true,
      jobs: true,
      roles: true,
      notifications: true,
      notificationTemplates: true,
      locations: true,
    },
  });
  if (!project) return null;
  return {
    ...project,
    todos: project.todos.map((todo: any) => ({
      ...todo,
      relatedTaskIds: Array.isArray(todo.relatedTaskIds)
        ? todo.relatedTaskIds
        : typeof todo.relatedTaskIds === 'string'
          ? JSON.parse(todo.relatedTaskIds)
          : null,
    })),
    ganttTasks: project.ganttTasks.map((task: any) => ({
      ...task,
      position: task.position === null ? 0 : task.position,
    })),
    files: project.files.map((file: any) => ({
      ...file,
      position: file.position === undefined || file.position === null ? 0 : file.position,
    })),
    linkedItems: project.linkedItems.map((item: any) => ({
      ...item,
      position: item.position === undefined || item.position === null ? 0 : item.position,
    })),
    permissions: project.permissions.map((permission: any) => ({
      ...permission,
      name: permission.name === null ? undefined : permission.name,
    })),
  };
};

export const getProjects = async (): Promise<ProjectWithAll[]> => {
  const projects = await prisma.project.findMany({
    include: {
      todos: true,
      files: true,
      permissions: true,
      linkedItems: true,
      ganttTasks: true,
      webhooks: true,
      users: true,
    },
  });

  return projects.map((project: any) => ({
    ...project,
    permissions: project.permissions.map((permission: any) => ({
      ...permission,
      name: permission.name === null ? undefined : permission.name,
    })),
  }));
};

export const createProject = async (data: any): Promise<Project> => {
  const project = await prisma.project.create({ data });

  // Create default roles
  const defaultRoles = ['super_admin', 'admin', 'viewer', 'guest'];
  await prisma.role.createMany({
    data: defaultRoles.map((name) => ({ name, projectId: project.id })),
    skipDuplicates: true,
  });

  // Create default labels
  const defaultLabels = [
    { name: 'todo', color: '#f59e42', projectId: project.id },
    { name: 'in-progress', color: '#3b82f6', projectId: project.id },
    { name: 'review', color: '#fbbf24', projectId: project.id },
    { name: 'done', color: '#22c55e', projectId: project.id },
  ];
  await prisma.label.createMany({ data: defaultLabels, skipDuplicates: true });

  // Create default notification templates
  const notificationTemplates = [
    {
      name: 'Task Assigned',
      subject: 'You have been assigned a new task',
      body: 'Hello, you have a new task: {{taskTitle}}. Please check your dashboard.',
      type: 'todo',
      projectId: project.id,
    },
    {
      name: 'Task Completed',
      subject: 'A task has been completed',
      body: 'Task {{taskTitle}} has been marked as completed.',
      type: 'todo',
      projectId: project.id,
    },
    {
      name: 'Task Overdue',
      subject: 'A task is overdue',
      body: 'Task {{taskTitle}} is overdue. Please take action.',
      type: 'todo',
      projectId: project.id,
    },
    {
      name: 'Welcome',
      subject: 'Welcome to {{projectName}}!',
      body: 'Hi {{userName}}, welcome to {{projectName}}. We are glad to have you!',
      type: 'user',
      projectId: project.id,
    },
    {
      name: 'Custom Alert',
      subject: '{{alertTitle}}',
      body: '{{alertMessage}}',
      type: 'resource',
      projectId: project.id,
    },
    {
      name: 'Error Notification',
      subject: 'Error: {{errorTitle}}',
      body: 'An error occurred: {{errorMessage}}',
      type: 'resource',
      projectId: project.id,
    },
  ];
  await prisma.notificationTemplate.createMany({
    data: notificationTemplates,
    skipDuplicates: true,
  });

  // Create super admin user
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: `superadmin+${project.id}@calendation.com`,
      avatarUrl: null,
      projectId: project.id,
      status: 1,
    },
  });

  return project;
};

export const updateProject = async (id: string, data: any): Promise<Project> => {
  // TODO: validate data
  return prisma.project.update({ where: { id }, data });
};

export const deleteProject = async (id: string): Promise<void> => {
  await prisma.project.delete({ where: { id } });
};

// Connect user to project
export const connectUserToProject = async (projectId: string, userId: string): Promise<Project> => {
  return prisma.project.update({
    where: { id: projectId },
    data: { users: { connect: [{ id: userId }] } },
  });
};

export async function searchProjects(query: string, pageIndex = 0, pageSize = 20) {
  // Prisma does not support 'mode' in StringFilter for all versions. Use 'contains' only.
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ name: { contains: query } }, { description: { contains: query } }],
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });
  return projects;
}

export async function searchAllProjectEntities(
  query: string,
  projectId: string,
  pageIndex = 0,
  pageSize = 20,
) {
  // Helper to build filter
  const stringFilter = (field: string) => (query ? { [field]: { contains: query } } : {});
  const orFilter = (fields: string[]) =>
    query ? { OR: fields.map((f) => ({ [f]: { contains: query } })) } : {};

  // Search projects
  const projects = await prisma.project.findMany({
    where: {
      id: projectId,
      ...orFilter(['name', 'description']),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search users
  const users = await prisma.user.findMany({
    where: {
      projectId,
      ...stringFilter('name'),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search todos
  const todos = await prisma.todo.findMany({
    where: {
      projectId,
      ...orFilter(['title', 'description']),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search files
  const files = await prisma.fileItem.findMany({
    where: {
      projectId,
      ...stringFilter('name'),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search webhooks
  const webhooks = await prisma.webhook.findMany({
    where: {
      projectId,
      ...orFilter(['name', 'webhookUrl']),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search linked items
  const linkedItems = await prisma.linkedItem.findMany({
    where: {
      projectId,
      ...stringFilter('title'),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search locations
  const locations = await prisma.location.findMany({
    where: {
      projectId,
      ...stringFilter('name'),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  // Search histories
  const histories = await prisma.history.findMany({
    where: {
      projectId,
      ...stringFilter('action'),
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  return {
    projects,
    users,
    todos,
    files,
    webhooks,
    linkedItems,
    locations,
    histories,
  };
}
