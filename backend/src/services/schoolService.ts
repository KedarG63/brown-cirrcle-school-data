import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const schoolService = {
  async getAll(page = 1, perPage = 10, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
            { district: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: { createdBy: { select: { id: true, name: true } } },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.school.count({ where }),
    ]);

    return {
      items: schools,
      pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    };
  },

  async getById(id: string) {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        visits: {
          include: {
            employee: { select: { id: true, name: true } },
            requirements: true,
            images: true,
          },
          orderBy: { visitDate: 'desc' },
        },
      },
    });
    if (!school) throw new AppError('School not found', 404);
    return school;
  },

  async create(data: {
    name: string;
    location: string;
    address?: string;
    contactPerson?: string;
    contactPhone?: string;
    district?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    createdById: string;
  }) {
    return prisma.school.create({ data });
  },

  async update(id: string, data: Partial<{
    name: string;
    location: string;
    address: string;
    contactPerson: string;
    contactPhone: string;
    district: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  }>) {
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) throw new AppError('School not found', 404);
    return prisma.school.update({ where: { id }, data });
  },

  async delete(id: string) {
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) throw new AppError('School not found', 404);
    await prisma.school.delete({ where: { id } });
  },
};
