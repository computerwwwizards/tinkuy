import type { Client } from 'openapi-fetch';
import type { ItemDetailAclService, ItemDetailDto } from './item-detail-acl';
import { getStyleMetadata } from './rest-item-acl';

export class RestItemDetailAclService implements ItemDetailAclService {
  constructor(private client: Client<any>) {}

  async getItemById(id: number | string): Promise<ItemDetailDto | null> {
    const idStr = String(id);
    const numId = typeof id === 'number' ? id : parseInt(id, 10);

    const { data: item, error } = await this.client.GET('/api/v2/pokemon/{id}/', {
      params: { path: { id: idStr } },
    });

    if (error || !item) {
      return null;
    }

    const itemData = item as any;

    const speciesRes = await this.client.GET('/api/v2/pokemon-species/{id}/', {
      params: { path: { id: idStr } },
    }).catch(() => ({ data: null }));

    const species = (speciesRes as any)?.data;
    const colorName = species?.color?.name || '';
    const types = itemData.types?.map((t: any) => (t.type?.name ? t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1) : 'Normal')) || ['Normal'];
    const primaryType = types[0] || 'Normal';
    const style = getStyleMetadata(primaryType, colorName);

    const formattedNumber = `#${numId.toString().padStart(3, '0')}`;
    const capitalName = itemData.name.charAt(0).toUpperCase() + itemData.name.slice(1);

    const englishFlavor = species?.flavor_text_entries?.find(
      (entry: any) => entry.language?.name === 'en'
    );
    const description = englishFlavor?.flavor_text
      ? englishFlavor.flavor_text.replace(/[\n\f]/g, ' ')
      : `A wild ${capitalName} appeared in the generic searcher.`;

    const weightKg = itemData.weight ? (itemData.weight / 10).toString().replace('.', ',') + ' kg' : '0,0 kg';
    const heightM = itemData.height ? (itemData.height / 10).toString().replace('.', ',') + ' m' : '0,0 m';

    const moves = itemData.moves
      ?.slice(0, 2)
      .map((m: any) => (m.move?.name ? m.move.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Tackle')) || ['Tackle'];

    const getStatValue = (statName: string) => {
      const found = itemData.stats?.find((s: any) => s.stat?.name === statName);
      return found?.base_stat ?? 50;
    };

    return {
      id: numId,
      name: capitalName,
      formattedNumber,
      spriteUrl: itemData.sprites?.front_default || '',
      types,
      emoji: style.emoji,
      bgClass: style.bgClass,
      textClass: style.textClass,
      themeColor: style.themeColor,
      weight: weightKg,
      height: heightM,
      moves,
      description,
      stats: {
        hp: getStatValue('hp'),
        atk: getStatValue('attack'),
        def: getStatValue('defense'),
        satk: getStatValue('special-attack'),
        sdef: getStatValue('special-defense'),
        spd: getStatValue('speed'),
      },
    };
  }
}
