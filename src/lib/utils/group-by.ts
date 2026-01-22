/**
 * Groups an array of items by a key extractor function
 * @param items - Array of items to group
 * @param keyExtractor - Function to extract the grouping key from each item
 * @returns Record where keys are the extracted keys and values are counts
 */
export function groupByCount<T>(
  items: T[],
  keyExtractor: (item: T) => string
): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = keyExtractor(item)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Groups an array of items by a key extractor function and returns grouped items
 * @param items - Array of items to group
 * @param keyExtractor - Function to extract the grouping key from each item
 * @returns Record where keys are the extracted keys and values are arrays of items
 */
export function groupBy<T>(
  items: T[],
  keyExtractor: (item: T) => string
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyExtractor(item)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Converts a grouped count record to an array of objects for charts
 * @param grouped - Record of key-count pairs
 * @param totalCount - Total count for percentage calculation
 * @returns Array of objects with key, count, and percentage
 */
export function groupedToChartData<K extends string>(
  grouped: Record<K, number>,
  totalCount: number
): Array<{ key: K; count: number; percentage: number }> {
  return Object.entries(grouped).map(([key, count]) => ({
    key: key as K,
    count: count as number,
    percentage: totalCount > 0 ? Math.round(((count as number) / totalCount) * 100) : 0,
  }))
}
