'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  isLoading?: boolean
}

export function ChartCard({ title, description, children, className = '', isLoading = false }: ChartCardProps) {
  return (
    <Card className={cn('animate-in fade-in-0 duration-500', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
