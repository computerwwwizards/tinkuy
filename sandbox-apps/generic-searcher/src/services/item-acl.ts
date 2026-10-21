export interface ItemDto {
  id: number;
  name: string;
  type: string;
  bgClass: string;
  textClass: string;
  emoji: string;
  spriteUrl?: string;
}

export interface GetItemsQuery {
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface GetItemsResult {
  items: ItemDto[];
  nextCursor?: string;
}

export interface ItemAclService {
  getItems(query?: GetItemsQuery): Promise<GetItemsResult>;
}

export const INITIAL_MOCK_ITEMS: ItemDto[] = [
  { id: 1, name: 'Jarjacha', type: 'Mythical', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', emoji: '🦙', spriteUrl: '' },
  { id: 4, name: 'Pishtaco', type: 'Shadow', bgClass: 'bg-amber-100', textClass: 'text-amber-700', emoji: '🗡️', spriteUrl: '' },
  { id: 7, name: 'Tunche', type: 'Spirit', bgClass: 'bg-sky-100', textClass: 'text-sky-700', emoji: '👻', spriteUrl: '' },
  { id: 25, name: 'Muqui', type: 'Earth', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', emoji: '⛏️', spriteUrl: '' },
  { id: 39, name: 'Chullachaqui', type: 'Nature', bgClass: 'bg-pink-100', textClass: 'text-pink-700', emoji: '🌿', spriteUrl: '' },
  { id: 94, name: 'Supay', type: 'Underworld', bgClass: 'bg-purple-100', textClass: 'text-purple-700', emoji: '👹', spriteUrl: '' },
  { id: 133, name: 'Amaru', type: 'Dragon', bgClass: 'bg-stone-100', textClass: 'text-stone-700', emoji: '🐍', spriteUrl: '' },
  { id: 143, name: 'Ekeko', type: 'Fortune', bgClass: 'bg-blue-100', textClass: 'text-blue-700', emoji: '🧧', spriteUrl: '' },
  { id: 150, name: 'Naylamp', type: 'Divine', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700', emoji: '🦅', spriteUrl: '' },
];

const err = new Error('Bail out to client-side rendering') as Error & {
  digest?: string;
};

err.digest = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';

export class ServerMockItemAclService implements ItemAclService {
  async getItems(query: GetItemsQuery = {}): Promise<GetItemsResult> {
    throw err;
  }
}

export class MockItemAclService implements ItemAclService {
  constructor(
    private initialData: ItemDto[] = INITIAL_MOCK_ITEMS,
    private delayMs = 200
  ) {}

  async getItems(query: GetItemsQuery = {}): Promise<GetItemsResult> {
    const { search = '', cursor, limit = 10 } = query;
    const trimmedSearch = search.trim().toLowerCase();

    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    let filtered = this.initialData.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(trimmedSearch);
      const matchesNumber = p.id.toString() === trimmedSearch || `#${p.id}` === trimmedSearch;
      return matchesName || matchesNumber;
    });

    if (cursor) {
      const cursorId = parseInt(cursor, 10);
      if (!isNaN(cursorId)) {
        filtered = filtered.filter((p) => p.id > cursorId);
      }
    }

    const items = filtered.slice(0, limit);
    const lastItem = items[items.length - 1];
    const hasMore = filtered.length > limit;
    const nextCursor = hasMore && lastItem ? lastItem.id.toString() : undefined;

    return {
      items,
      nextCursor,
    };
  }
}
