import { ComponentProps, ElementType } from 'react';

export type MorphContract<
  T extends ElementType,
  IntrinsicShape extends Record<string, any> = {}
> = IntrinsicShape & {
  as?: T;
} & Omit<ComponentProps<T>, keyof IntrinsicShape | 'as'>;
