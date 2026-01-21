# Skill: UI Components con shadcn/ui

## Instalacion

```bash
npx shadcn@latest init
npx shadcn@latest add button input card dialog table
```

## Componentes Esenciales

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Guardar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Mas opciones</Button>
<Button disabled>Procesando...</Button>
```

### Input con Label
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="correo@ejemplo.com" />
</div>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Titulo</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido aqui
  </CardContent>
</Card>
```

### Dialog
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titulo del Modal</DialogTitle>
    </DialogHeader>
    <p>Contenido del modal</p>
  </DialogContent>
</Dialog>
```

### Table
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Estado</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Opcion 1</SelectItem>
    <SelectItem value="opt2">Opcion 2</SelectItem>
  </SelectContent>
</Select>
```

## Accesibilidad

- Usar `aria-label` cuando no hay texto visible
- Usar `aria-describedby` para mensajes de error
- Asegurar contraste de colores WCAG AA
- Navegacion por teclado funcional
- Focus visible en elementos interactivos

## Responsive Design

```tsx
// Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Ocultar/mostrar
<div className="hidden md:block">Solo desktop</div>
<div className="md:hidden">Solo mobile</div>
```

## Colores Semanticos

```tsx
// Estados
<Badge variant="default">Activo</Badge>
<Badge variant="secondary">Pendiente</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Info</Badge>
```
