import { prisma } from '../config/database';

export const analyticsService = {
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [totalSchools, totalVisits, visitsToday, visitsThisWeek, visitsThisMonth, activeEmployees, pendingReviews] =
      await Promise.all([
        prisma.school.count(),
        prisma.schoolVisit.count(),
        prisma.schoolVisit.count({ where: { visitDate: { gte: today } } }),
        prisma.schoolVisit.count({ where: { visitDate: { gte: weekAgo } } }),
        prisma.schoolVisit.count({ where: { visitDate: { gte: monthAgo } } }),
        prisma.user.count({ where: { role: 'EMPLOYEE', isActive: true } }),
        prisma.schoolVisit.count({ where: { status: 'COMPLETED' } }),
      ]);

    return {
      totalSchools,
      totalVisits,
      visitsToday,
      visitsThisWeek,
      visitsThisMonth,
      activeEmployees,
      pendingReviews,
    };
  },

  async getEmployeePerformance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        visits: {
          select: { id: true, visitDate: true, status: true },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    return employees.map((emp) => {
      const totalVisits = emp.visits.length;
      const visitsThisMonth = emp.visits.filter((v) => v.visitDate >= monthAgo).length;
      const visitsToday = emp.visits.filter((v) => v.visitDate >= today).length;
      const lastVisit = emp.visits[0]?.visitDate || null;

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        totalVisits,
        visitsThisMonth,
        visitsToday,
        lastVisitDate: lastVisit,
      };
    });
  },

  async getVisitsByDate(startDate: string, endDate: string) {
    const visits = await prisma.schoolVisit.groupBy({
      by: ['visitDate'],
      _count: { id: true },
      where: {
        visitDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { visitDate: 'asc' },
    });

    return visits.map((v) => ({
      date: v.visitDate,
      count: v._count.id,
    }));
  },

  async getRequirementsAggregation() {
    const requirements = await prisma.schoolRequirement.findMany();

    const aggregation = {
      books: { needed: 0, totalQuantity: 0 },
      uniforms: { needed: 0, totalQuantity: 0 },
      furniture: { needed: 0 },
      painting: { needed: 0 },
      tv: { needed: 0, totalQuantity: 0 },
      wifi: { needed: 0 },
      computers: { needed: 0, totalQuantity: 0 },
    };

    for (const req of requirements) {
      if (req.booksNeeded) { aggregation.books.needed++; aggregation.books.totalQuantity += req.booksQuantity || 0; }
      if (req.uniformsNeeded) { aggregation.uniforms.needed++; aggregation.uniforms.totalQuantity += req.uniformsQuantity || 0; }
      if (req.furnitureNeeded) aggregation.furniture.needed++;
      if (req.paintingNeeded) aggregation.painting.needed++;
      if (req.tvNeeded) { aggregation.tv.needed++; aggregation.tv.totalQuantity += req.tvQuantity || 0; }
      if (req.wifiNeeded) aggregation.wifi.needed++;
      if (req.computersNeeded) { aggregation.computers.needed++; aggregation.computers.totalQuantity += req.computersQuantity || 0; }
    }

    return aggregation;
  },
};
