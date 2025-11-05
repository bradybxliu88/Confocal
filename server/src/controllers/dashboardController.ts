import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get counts
    const [
      activeProjects,
      protocolsCount,
      lowStockCount,
      totalOrders,
      pendingOrders,
    ] = await Promise.all([
      prisma.project.count({
        where: { status: 'active' },
      }),
      prisma.protocol.count(),
      prisma.reagent.count({
        where: { isLowStock: true },
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { status: 'REQUESTED' },
      }),
    ]);

    // Get recent projects with progress
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // Get recent protocols
    const recentProtocols = await prisma.protocol.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    // Get critical stock alerts (low stock + expiring)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const criticalStockAlerts = await prisma.reagent.findMany({
      where: {
        OR: [
          { isLowStock: true },
          {
            expirationDate: {
              lte: thirtyDaysFromNow,
              gte: new Date(),
            },
          },
        ],
      },
      take: 10,
      orderBy: [
        { isLowStock: 'desc' },
        { expirationDate: 'asc' },
      ],
    });

    // Get today's equipment schedule
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySchedule = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      stats: {
        activeProjects,
        protocolsCount,
        lowStockCount,
        totalOrders,
        pendingOrders,
      },
      recentProjects,
      recentProtocols,
      criticalStockAlerts,
      todaySchedule,
      recentOrders,
    });
  } catch (error) {
    throw error;
  }
};

export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    // Get recent project updates
    const recentUpdates = await prisma.projectUpdate.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Combine and sort by date
    const activities = [
      ...recentUpdates.map(u => ({
        type: 'project_update',
        data: u,
        timestamp: u.createdAt,
      })),
      ...recentBookings.map(b => ({
        type: 'booking',
        data: b,
        timestamp: b.createdAt,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);

    res.json({ activities });
  } catch (error) {
    throw error;
  }
};

export const getUserAlerts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const alerts = await prisma.alert.findMany({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ alerts });
  } catch (error) {
    throw error;
  }
};

export const markAlertAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    throw error;
  }
};

export const markAllAlertsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    await prisma.alert.updateMany({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    throw error;
  }
};
