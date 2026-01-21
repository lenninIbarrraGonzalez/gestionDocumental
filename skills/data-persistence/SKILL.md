# Skill: Data Persistence

## localStorage vs IndexedDB

| Caracteristica | localStorage | IndexedDB |
|---------------|--------------|-----------|
| Capacidad | ~5MB | ~50MB+ |
| Tipo de datos | Solo strings | Cualquier tipo |
| Indices | No | Si |
| Transacciones | No | Si |
| Async | No | Si |
| Uso recomendado | Config, sesion | Datos grandes |

## localStorage Wrapper

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const removeValue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
```

## IndexedDB con Dexie.js

```typescript
// lib/db.ts
import Dexie, { Table } from 'dexie';

export interface Document {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  estado: string;
  empresaId: string;
  trabajadorId?: string;
  archivoUrl?: string;
  archivoNombre?: string;
  archivoTamano?: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaVigencia?: Date;
  creadoPor: string;
  version: number;
}

export interface Company {
  id: string;
  nit: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
  activa: boolean;
}

export interface Worker {
  id: string;
  documento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  empresaId: string;
  cargo: string;
  activo: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  nombre: string;
  rol: 'admin' | 'supervisor' | 'digitador' | 'consultor';
  activo: boolean;
  ultimoAcceso?: Date;
}

export interface AuditLog {
  id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  cambios?: object;
  usuarioId: string;
  usuarioEmail: string;
  timestamp: Date;
}

class AppDatabase extends Dexie {
  documents!: Table<Document>;
  companies!: Table<Company>;
  workers!: Table<Worker>;
  users!: Table<User>;
  auditLogs!: Table<AuditLog>;

  constructor() {
    super('GestionDocumentalDB');

    this.version(1).stores({
      documents: 'id, codigo, tipo, estado, empresaId, trabajadorId, fechaCreacion, fechaVigencia',
      companies: 'id, nit, razonSocial, activa',
      workers: 'id, documento, empresaId, activo',
      users: 'id, email, rol, activo',
      auditLogs: 'id, entidad, entidadId, accion, usuarioId, timestamp',
    });
  }
}

export const db = new AppDatabase();
```

## Hook para IndexedDB

```typescript
// hooks/use-indexed-db.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Table } from 'dexie';

export function useIndexedDB<T>(tableName: keyof typeof db) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const table = db[tableName] as Table<T>;

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await table.toArray();
      setData(items);
      setError(null);
    } catch (err) {
      setError('Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  }, [table]);

  const add = useCallback(async (item: T) => {
    await table.add(item);
    await fetchAll();
  }, [table, fetchAll]);

  const update = useCallback(async (id: string, changes: Partial<T>) => {
    await table.update(id, changes);
    await fetchAll();
  }, [table, fetchAll]);

  const remove = useCallback(async (id: string) => {
    await table.delete(id);
    await fetchAll();
  }, [table, fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, isLoading, error, add, update, remove, refetch: fetchAll };
}
```

## Backup y Restauracion

```typescript
// lib/backup.ts
export async function exportData(): Promise<string> {
  const data = {
    documents: await db.documents.toArray(),
    companies: await db.companies.toArray(),
    workers: await db.workers.toArray(),
    users: await db.users.toArray(),
    auditLogs: await db.auditLogs.toArray(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);

  await db.transaction('rw',
    [db.documents, db.companies, db.workers, db.users, db.auditLogs],
    async () => {
      await db.documents.clear();
      await db.companies.clear();
      await db.workers.clear();
      await db.users.clear();
      await db.auditLogs.clear();

      await db.documents.bulkAdd(data.documents);
      await db.companies.bulkAdd(data.companies);
      await db.workers.bulkAdd(data.workers);
      await db.users.bulkAdd(data.users);
      await db.auditLogs.bulkAdd(data.auditLogs);
    }
  );
}
```

## Manejo de Cuota

```typescript
export async function checkStorageQuota(): Promise<{
  used: number;
  available: number;
  percentage: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const available = estimate.quota || 0;
    return {
      used,
      available,
      percentage: available > 0 ? (used / available) * 100 : 0,
    };
  }
  return { used: 0, available: 0, percentage: 0 };
}
```
