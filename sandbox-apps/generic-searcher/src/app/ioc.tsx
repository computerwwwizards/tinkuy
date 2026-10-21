'use client';

import React, { createContext, useContext, useState } from 'react';
import createClient, { type Client } from 'openapi-fetch';
import { BasicContainer } from '@computerwwwizards/dependency-injection';
import { ItemAclService, MockItemAclService, ServerMockItemAclService } from '../services/item-acl';
import { ItemDetailAclService, MockItemDetailAclService, ServerMockItemDetailAclService } from '../services/item-detail-acl';
import { RestItemAclService } from '../services/rest-item-acl';
import { RestItemDetailAclService } from '../services/rest-item-detail-acl';

export interface AppContainerServices {
  httpClient: Client<any>;
  itemService: ItemAclService;
  itemDetailService: ItemDetailAclService;
}

export const IocContext = createContext<BasicContainer<AppContainerServices> | null>(null);

export interface IocProviderProps {
  children: React.ReactNode;
  overrideContainer?: BasicContainer<AppContainerServices>;
}

export function IocProvider({ children, overrideContainer }: IocProviderProps) {
  const [ioc] = useState(() => {
    if (overrideContainer) {
      return overrideContainer;
    }
    const container = new BasicContainer<AppContainerServices>();

    container.bindTo('httpClient', () => createClient<any>({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    }), 'singleton');

    container.bindTo('itemService', () => {
      if (typeof window === 'undefined') {
        return new ServerMockItemAclService();
      }
      if (process.env.NEXT_PUBLIC_API_URL) {
        return new RestItemAclService(container.get('httpClient'));
      }
      return new MockItemAclService();
    }, 'singleton');

    container.bindTo('itemDetailService', () => {
      if (typeof window === 'undefined') {
        return new ServerMockItemDetailAclService();
      }
      if (process.env.NEXT_PUBLIC_API_URL) {
        return new RestItemDetailAclService(container.get('httpClient'));
      }
      return new MockItemDetailAclService();
    }, 'singleton');

    return container;
  });

  return <IocContext value={ioc}>{children}</IocContext>;
}

export function useIoc(): BasicContainer<AppContainerServices> {
  const ioc = useContext(IocContext);
  if (!ioc) {
    throw new Error('useIoc must be used within an IocProvider');
  }
  return ioc;
}
