import { repositories } from "@/repositories";

export class DashboardService {
  async getMetrics() {
    return repositories.dashboard.getMetrics();
  }

  async getExecutionTrend(days = 14) {
    return repositories.dashboard.getExecutionTrend(days);
  }

  async getFailureTrend(days = 14) {
    return repositories.dashboard.getFailureTrend(days);
  }

  async getDlqTrend(days = 14) {
    return repositories.dashboard.getDlqTrend(days);
  }

  async getProviderUsage() {
    return repositories.dashboard.getProviderUsage();
  }

  async getStatusDistribution() {
    return repositories.dashboard.getStatusDistribution();
  }
}

export const dashboardService = new DashboardService();
