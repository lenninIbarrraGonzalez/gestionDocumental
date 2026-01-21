# Skill: State Management con Zustand

## Crear Store Basico

```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

## Persistencia con localStorage

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        // Validar credenciales
        const user = await validateCredentials(email, password);
        set({ user, token: generateToken() });
      },
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

## Selectores para Optimizacion

```typescript
// MAL: Re-render en cualquier cambio del store
const { documents, filter, sort } = useDocumentStore();

// BIEN: Solo re-render cuando cambia lo que necesitas
const documents = useDocumentStore((state) => state.documents);
const addDocument = useDocumentStore((state) => state.addDocument);

// Selector derivado con shallow comparison
import { shallow } from 'zustand/shallow';

const { documents, total } = useDocumentStore(
  (state) => ({
    documents: state.documents,
    total: state.documents.length,
  }),
  shallow
);
```

## Store con Acciones Async

```typescript
interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  addDocument: (doc: CreateDocumentDTO) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const docs = await db.documents.toArray();
      set({ documents: docs, isLoading: false });
    } catch (error) {
      set({ error: 'Error cargando documentos', isLoading: false });
    }
  },

  addDocument: async (doc) => {
    const newDoc = { ...doc, id: generateId(), createdAt: new Date() };
    await db.documents.add(newDoc);
    set((state) => ({ documents: [...state.documents, newDoc] }));
  },
}));
```

## Slices para Stores Grandes

```typescript
// slices/documentSlice.ts
export const createDocumentSlice = (set, get) => ({
  documents: [],
  addDocument: (doc) => set((state) => ({
    documents: [...state.documents, doc]
  })),
});

// slices/filterSlice.ts
export const createFilterSlice = (set) => ({
  filter: { status: 'all', search: '' },
  setFilter: (filter) => set({ filter }),
});

// store.ts
export const useStore = create((...args) => ({
  ...createDocumentSlice(...args),
  ...createFilterSlice(...args),
}));
```

## Debugging

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      // ... state
    }),
    { name: 'DocumentStore' }
  )
);
```

## Testing Stores

```typescript
describe('DocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.setState({ documents: [], isLoading: false });
  });

  it('adds document', () => {
    const { addDocument } = useDocumentStore.getState();
    addDocument({ titulo: 'Test' });

    expect(useDocumentStore.getState().documents).toHaveLength(1);
  });
});
```
