'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from './chart-card'

interface MonthlyData {
  month: string
  count: number
}

interface MonthlyTrendChartProps {
  data: MonthlyData[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <ChartCard title="Tendencia Mensual">
        <div className="flex h-[250px] items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Tendencia Mensual" description="Documentos creados por mes">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0033A0" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0033A0" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [`${value} documentos`, 'Total']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0033A0"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
              dot={{ r: 4, fill: '#0033A0', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#0033A0', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
