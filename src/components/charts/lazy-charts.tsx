'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartCard } from './chart-card'

// Loading skeleton for charts
function ChartSkeleton({ title }: { title: string }) {
  return (
    <ChartCard title={title}>
      <div className="h-[250px] flex items-center justify-center">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
      </div>
    </ChartCard>
  )
}

function BarChartSkeleton({ title }: { title: string }) {
  return (
    <ChartCard title={title}>
      <div className="h-[250px] flex items-end justify-around gap-2 px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-8"
            style={{ height: `${40 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </ChartCard>
  )
}

// Lazy load heavy chart components
export const LazyStatusDistributionChart = dynamic(
  () => import('./status-distribution-chart').then((mod) => mod.StatusDistributionChart),
  {
    loading: () => <ChartSkeleton title="Distribucion por Estado" />,
    ssr: false,
  }
)

export const LazyMonthlyTrendChart = dynamic(
  () => import('./monthly-trend-chart').then((mod) => mod.MonthlyTrendChart),
  {
    loading: () => <BarChartSkeleton title="Tendencia Mensual" />,
    ssr: false,
  }
)

export const LazyTypeDistributionChart = dynamic(
  () => import('./type-distribution-chart').then((mod) => mod.TypeDistributionChart),
  {
    loading: () => <ChartSkeleton title="Distribucion por Tipo" />,
    ssr: false,
  }
)

export const LazyCompanyDistributionChart = dynamic(
  () => import('./company-distribution-chart').then((mod) => mod.CompanyDistributionChart),
  {
    loading: () => <BarChartSkeleton title="Documentos por Empresa" />,
    ssr: false,
  }
)

export const LazyKPIGauge = dynamic(
  () => import('./kpi-gauge').then((mod) => mod.KPIGauge),
  {
    loading: () => <ChartSkeleton title="Tasa de Aprobacion" />,
    ssr: false,
  }
)
