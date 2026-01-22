// Chart color palette based on SURA corporate colors

export const STATUS_COLORS: Record<string, string> = {
  borrador: '#94A3B8',
  pendiente_revision: '#EAB308',
  en_revision: '#4990E2',
  requiere_correccion: '#F59E0B',
  aprobado: '#22C55E',
  rechazado: '#EF4444',
  vencido: '#DC2626',
  archivado: '#6B7280',
}

export const STATUS_LABELS: Record<string, string> = {
  borrador: 'Borrador',
  pendiente_revision: 'Pendiente Revision',
  en_revision: 'En Revision',
  requiere_correccion: 'Requiere Correccion',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
  archivado: 'Archivado',
}

export const CHART_PALETTE = [
  '#0033A0', // SURA Blue
  '#4990E2', // Light Blue
  '#D4E157', // Lime
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
]

export const getChartColor = (index: number): string => {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}
