import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import aiService from '../services/aiService';

export const getAllProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            updates: true,
            orders: true,
            files: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ projects });
  } catch (error) {
    throw error;
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
        files: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json({ project });
  } catch (error) {
    throw error;
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, description, targetEndDate, budget, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        budget: budget ? parseFloat(budget) : null,
        ownerId: req.user.userId,
        members: memberIds
          ? {
              create: memberIds.map((userId: string) => ({
                userId,
                role: 'member',
              })),
            }
          : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, progress, status, targetEndDate, budget } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(progress !== undefined && { progress: parseInt(progress) }),
        ...(status && { status }),
        ...(targetEndDate && { targetEndDate: new Date(targetEndDate) }),
        ...(budget !== undefined && { budget: parseFloat(budget) }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role: role || 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Member added successfully',
      member,
    });
  } catch (error) {
    throw error;
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, memberId } = req.params;

    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    throw error;
  }
};

export const addProjectUpdate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { content, milestone } = req.body;

    const update = await prisma.projectUpdate.create({
      data: {
        projectId: id,
        content,
        milestone: milestone || false,
        createdBy: req.user.userId,
      },
    });

    res.status(201).json({
      message: 'Update added successfully',
      update,
    });
  } catch (error) {
    throw error;
  }
};

export const getProjectInsights = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        orders: {
          where: { status: { in: ['REQUESTED', 'APPROVED', 'ORDERED'] } },
        },
        _count: {
          select: {
            members: true,
            files: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const insights = await aiService.generateProjectInsights(project);

    res.json({ insights });
  } catch (error) {
    throw error;
  }
};
