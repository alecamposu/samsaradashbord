export type Reto = {
  driver: string;
  company: string;
  type: "Mensual" | "Semanal" | string;
  status: "Completado" | "Fallido" | string;
  reason: string | null;
  startDate: string | null;
  endDate: string | null;
  distanceKm: number;
  minDistanceKm: number;
  score: number;
  metric: string;
  count: number;
  limit: number;
  reward: number;
  period: string;
};

export type ProviderEvent = {
  driver: string;
  company: string;
  provider: string | null;
  date: string | null;
  distanceKm: number;
  score: number;
  metric: string;
  eventCount: number;
  period: string;
};

export type TemplateRow = {
  metric: string;
  active: boolean;
  budget: number;
  weeklyLimit: number;
  weeklyReward: number;
  monthlyLimit: number;
  monthlyReward: number;
  monthlyChallenge: number;
  weeklyChallenge: number;
};

export type Dataset = {
  retos: Reto[];
  provider: ProviderEvent[];
  templates: Record<string, TemplateRow[]>;
};
