import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const userService = {
  async getAll(page = 1, perPage = 10, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users,
      pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async update(id: string, data: { name?: string; phone?: string; password?: string }) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true },
    });
    return user;
  },

  async toggleActive(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    return updated;
  },

  async delete(id: string) {
    await prisma.user.delete({ where: { id } });
  },
};
