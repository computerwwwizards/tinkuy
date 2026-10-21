'use client';

import React, { useState, useEffect, useMemo, use, Suspense } from 'react';
import Link from 'next/link';
import {
  AutoGrid,
  InputFrame,
  Paper,
  ItemCard,
} from '@computerwwwizards/example-ui';
import { useIoc } from '../ioc';
import { GetItemsResult } from '../../services/item-acl';

function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

interface ItemListProps {
  queryPromise: Promise<GetItemsResult>;
}

export function ItemList({ queryPromise }: ItemListProps) {
  const data = use(queryPromise);

  if (data.items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-300">
        No items found matching your query.
      </div>
    );
  }

  return (
    <AutoGrid
      as="ul"
      minColumnSize="clamp(6.25rem, 25vw, 12.5rem)"
      gap="0.5rem"
    >
      {data.items.map((item) => {
        const sprite = item.spriteUrl || '';

        return (
          <ItemCard
            key={item.id}
            number={item.id}
            image={
              sprite ? (
                <img
                  src={sprite}
                  alt={item.name}
                  className="w-18 h-18 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <div
                  className={`w-18 h-18 ${item.bgClass} ${item.textClass} rounded-full flex items-center justify-center font-bold text-base`}
                >
                  {item.emoji}
                </div>
              )
            }
            name={
              <Link href={`/item?id=${item.id}`}>
                {item.name}
              </Link>
            }
          />
        );
      })}
    </AutoGrid>
  );
}

export function ItemListSkeleton() {
  return (
    <AutoGrid
      as="ul"
      minColumnSize="clamp(6.25rem, 25vw, 12.5rem)"
      gap="0.5rem"
      className="animate-pulse"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-700/50 rounded-lg p-3 flex flex-col justify-between">
          <div className="h-4 bg-gray-600 rounded w-1/3 self-end" />
          <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto" />
          <div className="h-4 bg-gray-600 rounded w-2/3 mx-auto" />
        </div>
      ))}
    </AutoGrid>
  );
}

export function ItemSearchSection() {
  const ioc = useIoc();
  const itemService = ioc.get('itemService');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryPromise = useMemo(() => {
    return itemService.getItems({ search: debouncedSearchTerm });
  }, [itemService, debouncedSearchTerm]);

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      <div className="max-w-md">
        <InputFrame startElement={<span aria-hidden="true">🔍</span>}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            aria-label="Search items"
          />
        </InputFrame>
      </div>

      <section className="flex-1 flex flex-col min-h-0 pt-2">
        <Paper className="flex-1 px-3 py-4" shadow="inner">
          <Suspense fallback={<ItemListSkeleton />}>
            <ItemList queryPromise={queryPromise} />
          </Suspense>
        </Paper>
      </section>
    </div>
  );
}
