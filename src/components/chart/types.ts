import { ColumnFilter } from "../filters/types";

export interface ValueDistributionChartProps {
  data: any[];
  advancedFilters: ColumnFilter[];
}

export type ChartType = "positive_negative" | "custom";
