import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import aiService from '../services/aiService';

export const getAllReagents = async (req: AuthRequest, res: Response) => {
  try {
    const { lowStock, expired, search } = req.query;

    const where: any = {};

    if (lowStock === 'true') {
      where.isLowStock = true;
    }

    if (expired === 'true') {
      where.isExpired = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { vendor: { contains: search as string, mode: 'insensitive' } },
        { catalogNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const reagents = await prisma.reagent.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ reagents });
  } catch (error) {
    throw error;
  }
};

export const getReagentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const reagent = await prisma.reagent.findUnique({
      where: { id },
    });

    if (!reagent) {
      throw new AppError('Reagent not found', 404);
    }

    res.json({ reagent });
  } catch (error) {
    throw error;
  }
};

export const createReagent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      barcode,
      vendor,
      catalogNumber,
      lotNumber,
      quantity,
      unit,
      lowStockThreshold,
      storageLocation,
      storageTemp,
      handlingNotes,
      receivedDate,
      expirationDate,
    } = req.body;

    // Check if reagent already exists with this barcode
    if (barcode) {
      const existing = await prisma.reagent.findUnique({
        where: { barcode },
      });

      if (existing) {
        throw new AppError('Reagent with this barcode already exists', 400);
      }
    }

    const parsedQuantity = parseFloat(quantity);
    const parsedThreshold = parseFloat(lowStockThreshold);

    const reagent = await prisma.reagent.create({
      data: {
        name,
        barcode,
        vendor,
        catalogNumber,
        lotNumber,
        quantity: parsedQuantity,
        unit: unit || 'mL',
        lowStockThreshold: parsedThreshold,
        storageLocation,
        storageTemp,
        handlingNotes,
        receivedDate: new Date(receivedDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        isLowStock: parsedQuantity <= parsedThreshold,
        isExpired: expirationDate ? new Date(expirationDate) < new Date() : false,
      },
    });

    res.status(201).json({
      message: 'Reagent created successfully',
      reagent,
    });
  } catch (error) {
    throw error;
  }
};

export const updateReagent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantity,
      unit,
      lowStockThreshold,
      storageLocation,
      storageTemp,
      handlingNotes,
      expirationDate,
    } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (quantity !== undefined) {
      const parsedQuantity = parseFloat(quantity);
      updateData.quantity = parsedQuantity;

      // Get current reagent to check threshold
      const current = await prisma.reagent.findUnique({ where: { id } });
      if (current) {
        const threshold = lowStockThreshold ? parseFloat(lowStockThreshold) : current.lowStockThreshold;
        updateData.isLowStock = parsedQuantity <= threshold;
      }
    }
    if (unit) updateData.unit = unit;
    if (lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = parseFloat(lowStockThreshold);
    }
    if (storageLocation) updateData.storageLocation = storageLocation;
    if (storageTemp) updateData.storageTemp = storageTemp;
    if (handlingNotes !== undefined) updateData.handlingNotes = handlingNotes;
    if (expirationDate) {
      updateData.expirationDate = new Date(expirationDate);
      updateData.isExpired = new Date(expirationDate) < new Date();
    }

    const reagent = await prisma.reagent.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Reagent updated successfully',
      reagent,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteReagent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.reagent.delete({
      where: { id },
    });

    res.json({ message: 'Reagent deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const scanBarcode = async (req: AuthRequest, res: Response) => {
  try {
    const { barcode } = req.params;

    // Check if reagent already exists
    const existingReagent = await prisma.reagent.findUnique({
      where: { barcode },
    });

    if (existingReagent) {
      return res.json({
        exists: true,
        reagent: existingReagent,
        message: 'Reagent already exists in inventory',
      });
    }

    res.json({
      exists: false,
      barcode,
      message: 'New reagent detected',
    });
  } catch (error) {
    throw error;
  }
};

export const getStorageSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const { name, vendor, catalogNumber, category } = req.body;

    if (!name) {
      throw new AppError('Reagent name is required', 400);
    }

    const suggestions = await aiService.generateStorageSuggestions({
      name,
      vendor,
      catalogNumber,
      category,
    });

    res.json({ suggestions });
  } catch (error) {
    throw error;
  }
};

export const getLowStockAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const lowStockReagents = await prisma.reagent.findMany({
      where: { isLowStock: true },
      orderBy: { quantity: 'asc' },
    });

    res.json({ alerts: lowStockReagents });
  } catch (error) {
    throw error;
  }
};

export const getExpiringReagents = async (req: AuthRequest, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringReagents = await prisma.reagent.findMany({
      where: {
        expirationDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    res.json({ reagents: expiringReagents });
  } catch (error) {
    throw error;
  }
};
