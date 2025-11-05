import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { OrderStatus } from '@prisma/client';

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, projectId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            budget: true,
            budgetUsed: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({ order });
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const {
      projectId,
      itemName,
      vendor,
      catalogNumber,
      quantity,
      unitPrice,
      justification,
      notes,
    } = req.body;

    const parsedQuantity = parseInt(quantity);
    const parsedUnitPrice = parseFloat(unitPrice);
    const totalPrice = parsedQuantity * parsedUnitPrice;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        projectId: projectId || null,
        itemName,
        vendor,
        catalogNumber,
        quantity: parsedQuantity,
        unitPrice: parsedUnitPrice,
        totalPrice,
        justification,
        notes,
        createdById: req.user.userId,
        status: 'REQUESTED',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const updateData: any = {
      status,
    };

    // Set timestamp based on status
    if (status === 'APPROVED') {
      updateData.approvedDate = new Date();
      updateData.approvedById = req.user.userId;
    } else if (status === 'ORDERED') {
      updateData.orderedDate = new Date();
    } else if (status === 'RECEIVED') {
      updateData.receivedDate = new Date();
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update project budget if order is received
    if (status === 'RECEIVED' && order.projectId) {
      await prisma.project.update({
        where: { id: order.projectId },
        data: {
          budgetUsed: {
            increment: order.totalPrice,
          },
        },
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      itemName,
      vendor,
      catalogNumber,
      quantity,
      unitPrice,
      justification,
      notes,
      trackingNumber,
    } = req.body;

    const updateData: any = {};

    if (itemName) updateData.itemName = itemName;
    if (vendor) updateData.vendor = vendor;
    if (catalogNumber) updateData.catalogNumber = catalogNumber;
    if (justification !== undefined) updateData.justification = justification;
    if (notes !== undefined) updateData.notes = notes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    if (quantity !== undefined || unitPrice !== undefined) {
      const currentOrder = await prisma.order.findUnique({ where: { id } });
      if (!currentOrder) {
        throw new AppError('Order not found', 404);
      }

      const newQuantity = quantity ? parseInt(quantity) : currentOrder.quantity;
      const newUnitPrice = unitPrice ? parseFloat(unitPrice) : currentOrder.unitPrice;

      updateData.quantity = newQuantity;
      updateData.unitPrice = newUnitPrice;
      updateData.totalPrice = newQuantity * newUnitPrice;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: { id },
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'REQUESTED',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            budget: true,
            budgetUsed: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { requestedDate: 'asc' },
    });

    res.json({ orders: pendingOrders });
  } catch (error) {
    throw error;
  }
};
