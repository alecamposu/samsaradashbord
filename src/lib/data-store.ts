import { create } from "zustand";
import dataset from "@/data/dataset.json";
import type { Dataset, Reto, ProviderEvent, TemplateRow } from "./types";

type Store = {
  data: Dataset;
  mergeRetos: (retos: Reto[]) => void;
  mergeProvider: (rows: ProviderEvent[]) => void;
  mergeTemplate: (company: string, rows: TemplateRow[]) => void;
  reset: () => void;
};

const initial = dataset as unknown as Dataset;

export const useDataset = create<Store>((set) => ({
  data: initial,
  mergeRetos: (retos) =>
    set((s) => {
      const map = new Map<string, Reto>();
      for (const r of [...s.data.retos, ...retos]) {
        const k = `${r.driver}|${r.type}|${r.startDate}|${r.endDate}|${r.metric}`;
        map.set(k, r);
      }
      return { data: { ...s.data, retos: [...map.values()] } };
    }),
  mergeProvider: (rows) =>
    set((s) => {
      const map = new Map<string, ProviderEvent>();
      for (const r of [...s.data.provider, ...rows]) {
        const k = `${r.driver}|${r.date}|${r.metric}`;
        map.set(k, r);
      }
      return { data: { ...s.data, provider: [...map.values()] } };
    }),
  mergeTemplate: (company, rows) =>
    set((s) => ({
      data: { ...s.data, templates: { ...s.data.templates, [company]: rows } },
    })),
  reset: () => set({ data: initial }),
}));
