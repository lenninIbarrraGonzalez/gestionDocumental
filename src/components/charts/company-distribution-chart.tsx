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

interface CompanyData {
  id: string
  name: string
  count: number
}

interface CompanyDistributionChartProps {
  data: CompanyData[]
}

export function CompanyDistributionChart({ data }: CompanyDistributionChartProps) {
  const chartData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      ...item,
      shortName: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    }))

  const hasData = data.length > 0 && data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <ChartCard title="Top 10 Empresas">
        <div className="flex h-[250px] items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Top 10 Empresas" description="Empresas con mas documentos">
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
              width={130}
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
