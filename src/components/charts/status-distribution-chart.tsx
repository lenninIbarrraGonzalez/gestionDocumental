'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts'
import { ChartCard } from './chart-card'
import { STATUS_COLORS, STATUS_LABELS } from './chart-colors'

interface StatusData {
  status: string
  count: number
  percentage: number
}

interface StatusDistributionChartProps {
  data: StatusData[]
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    fill: STATUS_COLORS[item.status] || '#94A3B8',
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const hasData = data.length > 0 && data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <ChartCard title="Distribucion por Estado">
        <div className="flex h-[250px] items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Distribucion por Estado" description="Documentos agrupados por estado de workflow">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                          {total}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-xs">
                          documentos
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} documentos`, name]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
              wrapperStyle={{ paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
