import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { VisitStatus, Priority } from '@prisma/client';

export const visitService = {
  async getAll(params: {
    page?: number;
    perPage?: number;
    employeeId?: string;
    schoolId?: string;
    status?: VisitStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, perPage = 10, employeeId, schoolId, status, startDate, endDate } = params;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (schoolId) where.schoolId = schoolId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.visitDate = {};
      if (startDate) where.visitDate.gte = new Date(startDate);
      if (endDate) where.visitDate.lte = new Date(endDate);
    }

    const [visits, total] = await Promise.all([
      prisma.schoolVisit.findMany({
        where,
        include: {
          school: { select: { id: true, name: true, location: true } },
          employee: { select: { id: true, name: true } },
          requirements: true,
          _count: { select: { images: true } },
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { visitDate: 'desc' },
      }),
      prisma.schoolVisit.count({ where }),
    ]);

    return {
      items: visits,
      pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    };
  },

  async getById(id: string) {
    const visit = await prisma.schoolVisit.findUnique({
      where: { id },
      include: {
        school: true,
        employee: { select: { id: true, name: true, email: true } },
        requirements: true,
        images: true,
      },
    });
    if (!visit) throw new AppError('Visit not found', 404);
    return visit;
  },

  async create(data: {
    schoolId: string;
    employeeId: string;
    visitDate: string;
    status?: VisitStatus;
    requirements?: {
      booksNeeded?: boolean;
      booksQuantity?: number;
      uniformsNeeded?: boolean;
      uniformsQuantity?: number;
      furnitureNeeded?: boolean;
      furnitureDetails?: string;
      paintingNeeded?: boolean;
      paintingArea?: string;
      otherCoreRequirements?: string;
      tvNeeded?: boolean;
      tvQuantity?: number;
      wifiNeeded?: boolean;
      wifiDetails?: string;
      computersNeeded?: boolean;
      computersQuantity?: number;
      otherDevRequirements?: string;
      notes?: string;
      estimatedBudget?: number;
      priority?: Priority;
    };
  }) {
    const school = await prisma.school.findUnique({ where: { id: data.schoolId } });
    if (!school) throw new AppError('School not found', 404);

    const visit = await prisma.schoolVisit.create({
      data: {
        schoolId: data.schoolId,
        employeeId: data.employeeId,
        visitDate: new Date(data.visitDate),
        status: data.status || VisitStatus.PENDING,
        requirements: data.requirements ? { create: data.requirements } : undefined,
      },
      include: {
        school: { select: { id: true, name: true, location: true } },
        employee: { select: { id: true, name: true } },
        requirements: true,
      },
    });

    return visit;
  },

  async update(id: string, data: {
    status?: VisitStatus;
    visitDate?: string;
    requirements?: any;
  }) {
    const visit = await prisma.schoolVisit.findUnique({ where: { id } });
    if (!visit) throw new AppError('Visit not found', 404);

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.visitDate) updateData.visitDate = new Date(data.visitDate);

    if (data.requirements) {
      await prisma.schoolRequirement.upsert({
        where: { visitId: id },
        create: { visitId: id, ...data.requirements },
        update: data.requirements,
      });
    }

    return prisma.schoolVisit.update({
      where: { id },
      data: updateData,
      include: {
        school: { select: { id: true, name: true, location: true } },
        employee: { select: { id: true, name: true } },
        requirements: true,
        images: true,
      },
    });
  },

  async delete(id: string) {
    const visit = await prisma.schoolVisit.findUnique({ where: { id } });
    if (!visit) throw new AppError('Visit not found', 404);
    await prisma.schoolVisit.delete({ where: { id } });
  },

  async addImages(visitId: string, images: { imageUrl: string; imageKey: string; imageType?: string; description?: string }[]) {
    const visit = await prisma.schoolVisit.findUnique({ where: { id: visitId } });
    if (!visit) throw new AppError('Visit not found', 404);

    return prisma.visitImage.createMany({
      data: images.map((img) => ({ visitId, ...img })),
    });
  },

  async deleteImage(imageId: string) {
    const image = await prisma.visitImage.findUnique({ where: { id: imageId } });
    if (!image) throw new AppError('Image not found', 404);
    await prisma.visitImage.delete({ where: { id: imageId } });
    return image;
  },
};
