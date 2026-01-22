'use client'

import { ChartCard } from './chart-card'

interface KPIGaugeProps {
  value: number
  label: string
  description?: string
  approvedCount?: number
  rejectedCount?: number
}

export function KPIGauge({ value, label, description, approvedCount, rejectedCount }: KPIGaugeProps) {
  const getColor = (val: number) => {
    if (val >= 80) return '#22C55E' // green
    if (val >= 50) return '#EAB308' // yellow
    return '#EF4444' // red
  }

  const getColorClass = (val: number) => {
    if (val >= 80) return 'text-green-600'
    if (val >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  // SVG arc calculations
  const size = 200
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  // Arc path for semicircle (180 degrees, from left to right)
  const startAngle = 180
  const endAngle = 0
  const progressAngle = 180 - (value / 100) * 180

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY - r * Math.sin(angleInRadians),
    }
  }

  const describeArc = (x: number, y: number, r: number, startAng: number, endAng: number) => {
    const start = polarToCartesian(x, y, r, startAng)
    const end = polarToCartesian(x, y, r, endAng)
    const largeArcFlag = startAng - endAng <= 180 ? '0' : '1'
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }

  const backgroundArc = describeArc(cx, cy, radius, startAngle, endAngle)
  const progressArc = describeArc(cx, cy, radius, startAngle, progressAngle)

  const showCounts = approvedCount !== undefined && rejectedCount !== undefined

  return (
    <ChartCard title={label} description={description}>
      <div className="h-[250px] flex flex-col items-center justify-center">
        <svg width="100%" height="160" viewBox={`0 0 ${size} ${size / 2 + 20}`} className="max-w-[300px]">
          {/* Background arc */}
          <path
            d={backgroundArc}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={progressArc}
            fill="none"
            stroke={getColor(value)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
        <div className="flex flex-col items-center -mt-4">
          <span className={`text-5xl font-bold ${getColorClass(value)}`}>
            {value}%
          </span>
          {showCounts && (
            <span className="text-sm text-muted-foreground mt-2">
              {approvedCount} aprobados / {rejectedCount} rechazados
            </span>
          )}
        </div>
      </div>
    </ChartCard>
  )
}
