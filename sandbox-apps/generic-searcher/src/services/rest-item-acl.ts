import type { Client } from 'openapi-fetch';
import type { ItemAclService, ItemDto, GetItemsQuery, GetItemsResult } from './item-acl';

export interface StyleMetadata {
  bgClass: string;
  textClass: string;
  themeColor: string;
  emoji: string;
}

export function getStyleMetadata(type: string = '', colorName: string = ''): StyleMetadata {
  const normalizedType = type.toLowerCase();
  const normalizedColor = colorName.toLowerCase();

  if (normalizedType === 'grass' || normalizedColor === 'green') {
    return { bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', themeColor: '#74CB48', emoji: '🌱' };
  }
  if (normalizedType === 'fire' || normalizedColor === 'red') {
    return { bgClass: 'bg-amber-100', textClass: 'text-amber-700', themeColor: '#F57D31', emoji: '🔥' };
  }
  if (normalizedType === 'water' || normalizedColor === 'blue') {
    return { bgClass: 'bg-sky-100', textClass: 'text-sky-700', themeColor: '#64B5F6', emoji: '💧' };
  }
  if (normalizedType === 'electric' || normalizedColor === 'yellow') {
    return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', themeColor: '#F9CF30', emoji: '⚡' };
  }
  if (normalizedType === 'ghost' || normalizedType === 'poison' || normalizedColor === 'purple') {
    return { bgClass: 'bg-purple-100', textClass: 'text-purple-700', themeColor: '#A43E9E', emoji: '👻' };
  }
  if (normalizedType === 'fairy' || normalizedColor === 'pink') {
    return { bgClass: 'bg-pink-100', textClass: 'text-pink-700', themeColor: '#E6E5E5', emoji: '🎤' };
  }
  if (normalizedType === 'ground' || normalizedType === 'rock' || normalizedColor === 'brown') {
    return { bgClass: 'bg-amber-200', textClass: 'text-amber-900', themeColor: '#B69E31', emoji: '🪨' };
  }
  if (normalizedType === 'ice' || normalizedColor === 'cyan') {
    return { bgClass: 'bg-cyan-100', textClass: 'text-cyan-700', themeColor: '#9AD6DF', emoji: '❄️' };
  }
  if (normalizedType === 'dark' || normalizedColor === 'black') {
    return { bgClass: 'bg-neutral-800', textClass: 'text-neutral-100', themeColor: '#705746', emoji: '🌙' };
  }
  return { bgClass: 'bg-stone-100', textClass: 'text-stone-700', themeColor: '#A8A77A', emoji: '🦊' };
}

export class RestItemAclService implements ItemAclService {
  constructor(private client: Client<any>) {}

  async getItems(query: GetItemsQuery = {}): Promise<GetItemsResult> {
    const { search = '', cursor, limit = 10 } = query;
    const offset = cursor ? parseInt(cursor, 10) : 0;
    const trimmedSearch = search.trim().toLowerCase();

    const { data, error } = await this.client.GET('/api/v2/pokemon/', {
      params: {
        query: {
          limit: trimmedSearch ? 100 : limit,
          offset: trimmedSearch ? 0 : offset,
          q: trimmedSearch || undefined,
        },
      },
    });

    if (error || !data) {
      return { items: [], nextCursor: undefined };
    }

    let rawResults = (data as any).results || [];

    if (trimmedSearch) {
      rawResults = rawResults.filter((p: any) => {
        const idMatch = p.url.split('/').filter(Boolean).pop();
        return (
          p.name.toLowerCase().includes(trimmedSearch) ||
          idMatch === trimmedSearch ||
          `#${idMatch}` === trimmedSearch
        );
      });
    }

    const sliced = rawResults.slice(0, limit);

    const items: ItemDto[] = await Promise.all(
      sliced.map(async (p: any) => {
        const idStr = p.url.split('/').filter(Boolean).pop() || '1';
        const itemId = parseInt(idStr, 10);

        const detailRes = await this.client.GET('/api/v2/pokemon/{id}/', {
          params: { path: { id: idStr } },
        });

        const detail = (detailRes as any).data;
        const primaryType = detail?.types?.[0]?.type?.name || 'normal';
        const capitalName = p.name.charAt(0).toUpperCase() + p.name.slice(1);
        const style = getStyleMetadata(primaryType);

        const spriteUrl = detail?.sprites?.front_default || '';

        return {
          id: itemId,
          name: capitalName,
          type: primaryType.charAt(0).toUpperCase() + primaryType.slice(1),
          bgClass: style.bgClass,
          textClass: style.textClass,
          emoji: style.emoji,
          spriteUrl,
        };
      })
    );

    const nextOffset = offset + items.length;
    const hasMore = rawResults.length > limit || ((data as any).next !== null && (data as any).next !== undefined && !trimmedSearch);
    const nextCursor = hasMore ? nextOffset.toString() : undefined;

    return {
      items,
      nextCursor,
    };
  }
}
