import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getAllEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ equipment });
  } catch (error) {
    throw error;
  }
};

export const getEquipmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            startTime: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
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
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    res.json({ equipment });
  } catch (error) {
    throw error;
  }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      model,
      serialNumber,
      location,
      description,
      maintenanceNotes,
      requiresTraining,
      bookingDuration,
    } = req.body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        model,
        serialNumber,
        location,
        description,
        maintenanceNotes,
        requiresTraining: requiresTraining || false,
        bookingDuration: bookingDuration ? parseInt(bookingDuration) : 60,
      },
    });

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment,
    });
  } catch (error) {
    throw error;
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      model,
      serialNumber,
      location,
      description,
      maintenanceNotes,
      isAvailable,
      requiresTraining,
      bookingDuration,
    } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (model) updateData.model = model;
    if (serialNumber) updateData.serialNumber = serialNumber;
    if (location) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (maintenanceNotes !== undefined) updateData.maintenanceNotes = maintenanceNotes;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (requiresTraining !== undefined) updateData.requiresTraining = requiresTraining;
    if (bookingDuration) updateData.bookingDuration = parseInt(bookingDuration);

    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Equipment updated successfully',
      equipment,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.equipment.delete({
      where: { id },
    });

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getEquipmentSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate
      ? new Date(endDate as string)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const bookings = await prisma.booking.findMany({
      where: {
        equipmentId: id,
        startTime: {
          gte: start,
          lte: end,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
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
      orderBy: { startTime: 'asc' },
    });

    res.json({ bookings });
  } catch (error) {
    throw error;
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { equipmentId, startTime, endTime, purpose, notes, isRecurring, recurringPattern } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        equipmentId,
        status: {
          notIn: ['CANCELLED'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new AppError('Time slot is already booked', 409);
    }

    const booking = await prisma.booking.create({
      data: {
        equipmentId,
        userId: req.user.userId,
        startTime: start,
        endTime: end,
        purpose,
        notes,
        isRecurring: isRecurring || false,
        recurringPattern,
      },
      include: {
        equipment: true,
        user: {
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
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    throw error;
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, purpose, notes, status } = req.body;

    const updateData: any = {};
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (purpose !== undefined) updateData.purpose = purpose;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    // If changing time, check for conflicts
    if (startTime || endTime) {
      const currentBooking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!currentBooking) {
        throw new AppError('Booking not found', 404);
      }

      const start = startTime ? new Date(startTime) : currentBooking.startTime;
      const end = endTime ? new Date(endTime) : currentBooking.endTime;

      const conflicts = await prisma.booking.findMany({
        where: {
          id: { not: id },
          equipmentId: currentBooking.equipmentId,
          status: {
            notIn: ['CANCELLED'],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } },
              ],
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } },
              ],
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } },
              ],
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        throw new AppError('Time slot is already booked', 409);
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        equipment: true,
        user: {
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
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.booking.delete({
      where: { id },
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, userId, equipmentId } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (userId) {
      where.userId = userId;
    }

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        equipment: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ bookings });
  } catch (error) {
    throw error;
  }
};
