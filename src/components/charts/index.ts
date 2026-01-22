export { ChartCard } from './chart-card'
export { StatusDistributionChart } from './status-distribution-chart'
export { MonthlyTrendChart } from './monthly-trend-chart'
export { TypeDistributionChart } from './type-distribution-chart'
export { CompanyDistributionChart } from './company-distribution-chart'
export { KPIGauge } from './kpi-gauge'
export { STATUS_COLORS, STATUS_LABELS, CHART_PALETTE, getChartColor } from './chart-colors'

// Lazy-loaded versions for better initial page load
export {
  LazyStatusDistributionChart,
  LazyMonthlyTrendChart,
  LazyTypeDistributionChart,
  LazyCompanyDistributionChart,
  LazyKPIGauge,
} from './lazy-charts'
