# Skill: Componentes Reutilizables

## Principios SOLID

### Single Responsibility
```tsx
// MAL: Componente hace demasiado
const DocumentCard = ({ doc }) => {
  const [editing, setEditing] = useState(false);
  // fetch, validacion, UI todo junto
};

// BIEN: Separar responsabilidades
const DocumentCard = ({ doc, onEdit }) => <Card>...</Card>;
const DocumentEditor = ({ doc, onSave }) => <Form>...</Form>;
```

### Open/Closed
```tsx
// Extensible via props, no modificacion
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

## Patrones de Composicion

### Compound Components
```tsx
// Uso
<DataTable data={documents}>
  <DataTable.Column accessor="codigo" header="Codigo" />
  <DataTable.Column accessor="titulo" header="Titulo" />
  <DataTable.Column accessor="estado" header="Estado" render={StatusBadge} />
  <DataTable.Actions>
    {(row) => <ActionMenu document={row} />}
  </DataTable.Actions>
</DataTable>
```

### Render Props
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

const List = <T,>({ items, renderItem, renderEmpty }: ListProps<T>) => {
  if (items.length === 0) return renderEmpty?.() ?? <EmptyState />;
  return <ul>{items.map(renderItem)}</ul>;
};
```

### HOC Pattern
```tsx
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Redirect to="/login" />;
    return <Component {...props} />;
  };
}
```

## Componentes Genericos

### DataTable Generico
```tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

function DataTable<T>({ data, columns, ...props }: DataTableProps<T>) {
  // Implementacion con TanStack Table
}
```

### Form Field Generico
```tsx
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'select';
  options?: { value: string; label: string }[];
}
```

## Mejores Practicas

1. **Props con defaults sensatos**
2. **Tipos estrictos con TypeScript**
3. **Documentar con JSDoc**
4. **Tests unitarios para cada variante**
5. **Manejar estados: loading, error, empty**
6. **Accesibilidad desde el diseno**
