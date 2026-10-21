import { INITIAL_MOCK_ITEMS } from './item-acl';

export interface ItemStats {
  hp: number;
  atk: number;
  def: number;
  satk: number;
  sdef: number;
  spd: number;
}

export interface ItemDetailDto {
  id: number;
  name: string;
  formattedNumber: string;
  spriteUrl: string;
  types: string[];
  emoji: string;
  bgClass: string;
  textClass: string;
  themeColor: string;
  weight: string;
  height: string;
  moves: string[];
  description: string;
  stats: ItemStats;
}

export interface ItemDetailAclService {
  getItemById(id: number | string): Promise<ItemDetailDto | null>;
}

const err = new Error('Bail out to client-side rendering') as Error & {
  digest?: string;
};

err.digest = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';

export class ServerMockItemDetailAclService implements ItemDetailAclService {
  async getItemById(id: number | string): Promise<ItemDetailDto | null> {
    throw err;
  }
}

export const INITIAL_MOCK_ITEM_DETAILS: Record<number, ItemDetailDto> = {
  1: {
    id: 1,
    name: 'Jarjacha',
    formattedNumber: '#001',
    spriteUrl: '',
    types: ['Mythical', 'Beast'],
    emoji: '🦙',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    themeColor: '#74CB48',
    weight: '75,0 kg',
    height: '1,8 m',
    moves: ['Night Howl', 'Terror Glance'],
    description: 'A two-headed llama-like creature born from ancient transgression that terrorizes the Andes mountains at night.',
    stats: {
      hp: 75,
      atk: 80,
      def: 70,
      satk: 65,
      sdef: 65,
      spd: 85,
    },
  },
  4: {
    id: 4,
    name: 'Pishtaco',
    formattedNumber: '#004',
    spriteUrl: '',
    types: ['Shadow'],
    emoji: '🗡️',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    themeColor: '#F57D31',
    weight: '80,0 kg',
    height: '1,8 m',
    moves: ['Fat Extract', 'Silent Shadow'],
    description: 'A sinister pale figure that haunts lonely mountain highways, harvesting fat from unwary travelers.',
    stats: {
      hp: 70,
      atk: 85,
      def: 60,
      satk: 75,
      sdef: 65,
      spd: 90,
    },
  },
  7: {
    id: 7,
    name: 'Tunche',
    formattedNumber: '#007',
    spriteUrl: '',
    types: ['Spirit'],
    emoji: '👻',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-700',
    themeColor: '#64B5F6',
    weight: '0,0 kg',
    height: '1,5 m',
    moves: ['Jungle Whistle', 'Mist Vanish'],
    description: 'A mysterious whistle echoing through the Amazonian jungle, guarding the forest and luring travelers.',
    stats: {
      hp: 60,
      atk: 65,
      def: 70,
      satk: 95,
      sdef: 90,
      spd: 80,
    },
  },
  25: {
    id: 25,
    name: 'Muqui',
    formattedNumber: '#025',
    spriteUrl: '',
    types: ['Earth'],
    emoji: '⛏️',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-700',
    themeColor: '#F9CF30',
    weight: '25,0 kg',
    height: '0,5 m',
    moves: ['Gold Pulse', 'Mine Collapse'],
    description: 'A mischievous dwarf goblin inhabiting Andean mines, guarding hidden gold and silver veins.',
    stats: {
      hp: 65,
      atk: 75,
      def: 85,
      satk: 70,
      sdef: 70,
      spd: 60,
    },
  },
};

export class MockItemDetailAclService implements ItemDetailAclService {
  constructor(
    private detailsRecord: Record<number, ItemDetailDto> = INITIAL_MOCK_ITEM_DETAILS,
    private delayMs = 200
  ) {}

  async getItemById(id: number | string): Promise<ItemDetailDto | null> {
    const numId = typeof id === 'number' ? id : parseInt(id, 10);

    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    if (this.detailsRecord[numId]) {
      return this.detailsRecord[numId];
    }

    const base = INITIAL_MOCK_ITEMS.find((p) => p.id === numId);
    if (!base) return null;

    return {
      id: base.id,
      name: base.name,
      formattedNumber: `#${base.id.toString().padStart(3, '0')}`,
      spriteUrl: '',
      types: [base.type],
      emoji: base.emoji,
      bgClass: base.bgClass,
      textClass: base.textClass,
      themeColor: '#A8A77A',
      weight: '10,0 kg',
      height: '1,0 m',
      moves: ['Tackle'],
      description: `A wild ${base.name} appeared in the generic searcher probe.`,
      stats: {
        hp: 50,
        atk: 50,
        def: 50,
        satk: 50,
        sdef: 50,
        spd: 50,
      },
    };
  }
}
