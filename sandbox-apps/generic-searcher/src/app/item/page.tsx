'use client';

import React, { use, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Paper } from '@computerwwwizards/example-ui';
import { useIoc } from '../ioc';
import { ItemDetailDto } from '../../services/item-detail-acl';

interface ItemDetailContentProps {
  detailPromise: Promise<ItemDetailDto | null>;
}

function ItemDetailContent({ detailPromise }: ItemDetailContentProps) {
  const item = use(detailPromise);

  if (!item) {
    return (
      <Paper className="p-8 text-center text-gray-300 space-y-4">
        <p className="text-xl font-semibold">Item not found</p>
        <div>
          <Link href="/" className="text-red-400 hover:underline">
            &larr; Back to list
          </Link>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className="p-8 text-center max-w-md mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
      <div>
        <Link href="/" className="text-red-600 hover:underline text-sm">
          &larr; Back to list
        </Link>
      </div>
    </Paper>
  );
}

function ItemDetailSkeleton() {
  return (
    <Paper className="p-8 text-center max-w-md mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
    </Paper>
  );
}

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const ioc = useIoc();
  const itemDetailService = ioc.get('itemDetailService');

  const detailPromise = useMemo(() => {
    if (!id) return Promise.resolve(null);
    return itemDetailService.getItemById(id);
  }, [itemDetailService, id]);

  return (
    <main className="p-4 max-w-[64rem] mx-auto min-h-screen flex flex-col justify-center items-center">
      <Suspense fallback={<ItemDetailSkeleton />}>
        <ItemDetailContent detailPromise={detailPromise} />
      </Suspense>
    </main>
  );
}
