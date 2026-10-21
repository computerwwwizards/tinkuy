// @vitest-environment jsdom

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { BasicContainer } from '@computerwwwizards/dependency-injection';
import { MockItemAclService, INITIAL_MOCK_ITEMS } from '../services/item-acl';
import { MockItemDetailAclService, ServerMockItemDetailAclService, INITIAL_MOCK_ITEM_DETAILS } from '../services/item-detail-acl';
import { RestItemAclService } from '../services/rest-item-acl';
import { RestItemDetailAclService } from '../services/rest-item-detail-acl';
import { IocProvider, useIoc, AppContainerServices } from './ioc';
import { ItemSearchSection } from './components/ItemSearchSection';

afterEach(() => {
  cleanup();
});

describe('MockItemAclService', () => {
  it('returns initial items list', async () => {
    const service = new MockItemAclService(INITIAL_MOCK_ITEMS, 0);
    const result = await service.getItems();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].name).toBe('Jarjacha');
  });

  it('filters items by name search query', async () => {
    const service = new MockItemAclService(INITIAL_MOCK_ITEMS, 0);
    const result = await service.getItems({ search: 'muqui' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Muqui');
  });

  it('filters items by number query', async () => {
    const service = new MockItemAclService(INITIAL_MOCK_ITEMS, 0);
    const result = await service.getItems({ search: '4' });
    expect(result.items.some((p) => p.name === 'Pishtaco')).toBe(true);
  });

  it('supports cursor based pagination', async () => {
    const service = new MockItemAclService(INITIAL_MOCK_ITEMS, 0);
    const page1 = await service.getItems({ limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBe('4');

    const page2 = await service.getItems({ cursor: page1.nextCursor, limit: 2 });
    expect(page2.items[0].id).toBeGreaterThan(4);
  });
});

describe('MockItemDetailAclService', () => {
  it('returns item details by id', async () => {
    const service = new MockItemDetailAclService(INITIAL_MOCK_ITEM_DETAILS, 0);
    const item = await service.getItemById(1);
    expect(item).not.toBeNull();
    expect(item?.name).toBe('Jarjacha');
    expect(item?.formattedNumber).toBe('#001');
    expect(item?.weight).toBe('75,0 kg');
    expect(item?.stats.hp).toBe(75);
  });

  it('returns null for non-existent item id', async () => {
    const service = new MockItemDetailAclService(INITIAL_MOCK_ITEM_DETAILS, 0);
    const item = await service.getItemById(9999);
    expect(item).toBeNull();
  });

  it('throws bailout error in ServerMockItemDetailAclService', async () => {
    const service = new ServerMockItemDetailAclService();
    await expect(service.getItemById(1)).rejects.toThrow('Bail out to client-side rendering');
  });
});

describe('RestItemAclService', () => {
  it('fetches items from openapi client and maps DTOs', async () => {
    const mockClient = {
      GET: vi.fn().mockImplementation((path: string) => {
        if (path === '/api/v2/pokemon/') {
          return Promise.resolve({
            data: {
              results: [
                { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
              ],
              next: null,
            },
          });
        }
        if (path === '/api/v2/pokemon/{id}/') {
          return Promise.resolve({
            data: {
              id: 1,
              name: 'bulbasaur',
              types: [{ type: { name: 'grass' } }],
            },
          });
        }
        return Promise.resolve({ data: null });
      }),
    } as any;

    const service = new RestItemAclService(mockClient);
    const result = await service.getItems();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Bulbasaur');
    expect(result.items[0].type).toBe('Grass');
    expect(result.items[0].emoji).toBe('🌱');
  });
});

describe('RestItemDetailAclService', () => {
  it('fetches item detail and species from openapi client', async () => {
    const mockClient = {
      GET: vi.fn().mockImplementation((path: string) => {
        if (path === '/api/v2/pokemon/{id}/') {
          return Promise.resolve({
            data: {
              id: 25,
              name: 'pikachu',
              weight: 60,
              height: 4,
              types: [{ type: { name: 'electric' } }],
              sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
              stats: [
                { stat: { name: 'hp' }, base_stat: 35 },
                { stat: { name: 'attack' }, base_stat: 55 },
              ],
              moves: [{ move: { name: 'static' } }],
            },
          });
        }
        if (path === '/api/v2/pokemon-species/{id}/') {
          return Promise.resolve({
            data: {
              color: { name: 'yellow' },
              flavor_text_entries: [
                { language: { name: 'en' }, flavor_text: 'Pikachu that can generate powerful electricity.' },
              ],
            },
          });
        }
        return Promise.resolve({ data: null });
      }),
    } as any;

    const service = new RestItemDetailAclService(mockClient);
    const item = await service.getItemById(25);
    expect(item).not.toBeNull();
    expect(item?.name).toBe('Pikachu');
    expect(item?.formattedNumber).toBe('#025');
    expect(item?.weight).toBe('6 kg');
    expect(item?.stats.hp).toBe(35);
    expect(item?.description).toContain('Pikachu that can generate powerful electricity');
  });
});

describe('IocProvider and useIoc hook', () => {
  function TestConsumer() {
    const ioc = useIoc();
    const httpClient = ioc.get('httpClient');
    const itemService = ioc.get('itemService');
    const itemDetailService = ioc.get('itemDetailService');
    return (
      <div data-testid="resolved">
        {httpClient && itemService && itemDetailService ? 'Services Resolved' : 'Missing Service'}
      </div>
    );
  }

  it('provides container and resolves services including httpClient', () => {
    render(
      <IocProvider>
        <TestConsumer />
      </IocProvider>
    );

    expect(screen.getByTestId('resolved').textContent).toBe('Services Resolved');
  });

  it('throws error when used outside IocProvider', () => {
    const suppressConsole = () => {};
    const spy = vi.spyOn(console, 'error').mockImplementation(suppressConsole);

    expect(() => render(<TestConsumer />)).toThrow('useIoc must be used within an IocProvider');

    spy.mockRestore();
  });
});

describe('ItemSearchSection', () => {
  function createFastContainer() {
    const container = new BasicContainer<AppContainerServices>();
    container.bindTo('httpClient', () => ({ GET: vi.fn() } as any), 'singleton');
    container.bindTo('itemService', () => new MockItemAclService(INITIAL_MOCK_ITEMS, 0), 'singleton');
    container.bindTo('itemDetailService', () => new MockItemDetailAclService(INITIAL_MOCK_ITEM_DETAILS, 0), 'singleton');
    return container;
  }

  it('renders search input and initial items via Suspense + use(promise)', async () => {
    await act(async () => {
      render(
        <IocProvider overrideContainer={createFastContainer()}>
          <ItemSearchSection />
        </IocProvider>
      );
    });

    expect(screen.getByPlaceholderText('Search')).toBeDefined();
    expect(screen.getByText('Jarjacha')).toBeDefined();
  });

  it('filters results when search input changes', async () => {
    vi.useFakeTimers();

    await act(async () => {
      render(
        <IocProvider overrideContainer={createFastContainer()}>
          <ItemSearchSection />
        </IocProvider>
      );
    });

    const input = screen.getByPlaceholderText('Search');
    expect(screen.getByText('Jarjacha')).toBeDefined();

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pishtaco' } });
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Pishtaco')).toBeDefined();
    expect(screen.queryByText('Jarjacha')).toBeNull();

    vi.useRealTimers();
  });
});
