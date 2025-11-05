import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getAllProtocols = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, isPublic } = req.query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ];
    }

    const protocols = await prisma.protocol.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ protocols });
  } catch (error) {
    throw error;
  }
};

export const getProtocolById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const protocol = await prisma.protocol.findUnique({
      where: { id },
    });

    if (!protocol) {
      throw new AppError('Protocol not found', 404);
    }

    res.json({ protocol });
  } catch (error) {
    throw error;
  }
};

export const createProtocol = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, description, version, content, category, tags, isPublic } = req.body;

    const protocol = await prisma.protocol.create({
      data: {
        name,
        description,
        version: version || '1.0',
        content,
        category,
        tags: tags || [],
        isPublic: isPublic || false,
        createdBy: req.user.userId,
      },
    });

    res.status(201).json({
      message: 'Protocol created successfully',
      protocol,
    });
  } catch (error) {
    throw error;
  }
};

export const updateProtocol = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, version, content, category, tags, isPublic } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (version) updateData.version = version;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const protocol = await prisma.protocol.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Protocol updated successfully',
      protocol,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteProtocol = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.protocol.delete({
      where: { id },
    });

    res.json({ message: 'Protocol deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getProtocolCategories = async (req: AuthRequest, res: Response) => {
  try {
    const protocols = await prisma.protocol.findMany({
      where: {
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = protocols
      .map(p => p.category)
      .filter(c => c !== null) as string[];

    res.json({ categories });
  } catch (error) {
    throw error;
  }
};
