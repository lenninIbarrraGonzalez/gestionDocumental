'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartCard } from './chart-card'
import { getChartColor } from './chart-colors'
import { DOCUMENT_TYPES } from '@/lib/constants'

interface TypeData {
  tipo: string
  count: number
  percentage: number
}

interface TypeDistributionChartProps {
  data: TypeData[]
}

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
  const chartData = data
    .map((item) => ({
      name: DOCUMENT_TYPES[item.tipo as keyof typeof DOCUMENT_TYPES] || item.tipo,
      shortName: item.tipo,
      count: item.count,
      percentage: item.percentage,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const hasData = data.length > 0 && data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <ChartCard title="Distribucion por Tipo">
        <div className="flex h-[250px] items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Distribucion por Tipo" description="Documentos por tipo de documento">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={95}
            />
            <Tooltip
              formatter={(value) => [`${value} documentos`, 'Cantidad']}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload
                return item?.name || label
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getChartColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
