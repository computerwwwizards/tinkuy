import type { CSSProperties, JSXElementConstructor, ReactElement } from 'react';

/**
 * 1. Compile-Time Serialization Firewall
 * Restricts plugin outputs to RSC-serializable primitives and CSSProperties.
 * Explicitly prevents plugins from returning functions (event handlers),
 * ReactElements (`children`), or Symbols.
 */
type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | CSSProperties;

export type SerializableSubset<InnerProps, ExtraProps = {}> = {
  [K in keyof InnerProps as InnerProps[K] extends SerializableValue
    ? K
    : never]?: InnerProps[K];
} & {
  // Allows plugins to nullify their own flat variant props (`intent: undefined`)
  // so custom props never leak to native DOM spreads inside `InnerProps`.
  [K in keyof ExtraProps]?: undefined;
} & Record<`data-${string}`, string | number | boolean | undefined>;

/**
 * 2. Styling Plugin Contract
 * Infers flat `ExtraProps` (variants) at definition time while locking
 * the output to `SerializableSubset`.
 */
export type StylingPlugin<
  BaseProps extends Record<string, any>,
  ExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
> = (
  props: Readonly<BaseProps & ExtraProps>
) => SerializableSubset<InnerProps, ExtraProps>;

/**
 * 3. Plug-and-Play Custom Bound Bridge Escape Hatch
 * Only invoked at module initialization if a component requires non-standard bridging.
 */
export type CustomBoundFactory<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any>,
  InnerProps extends Record<string, any>
> = (
  config: ComponentFactoryConfig<BaseProps, DefaultExtraProps, InnerProps>
) => BoundComponentType<BaseProps, DefaultExtraProps, InnerProps>;

export interface ComponentFactoryConfig<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
> {
  displayName: string;
  render: JSXElementConstructor<InnerProps>;
  defaultPlugin?: StylingPlugin<BaseProps, DefaultExtraProps, InnerProps>;
  defaultProps?: Partial<BaseProps & DefaultExtraProps>;
  customBoundFactory?: CustomBoundFactory<
    BaseProps,
    DefaultExtraProps,
    InnerProps
  >;
}

export type BoundComponentType<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
> = {
  <InstanceExtraProps extends Record<string, any> = DefaultExtraProps>(
    props: BaseProps &
      InstanceExtraProps & {
        stylingPlugin?: StylingPlugin<BaseProps, InstanceExtraProps, InnerProps>;
      }
  ): ReactElement;
  displayName?: string;
};

/**
 * 4. The Universal Bridge Factory
 */
export function createComponent<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
>(
  config: ComponentFactoryConfig<BaseProps, DefaultExtraProps, InnerProps>
): BoundComponentType<BaseProps, DefaultExtraProps, InnerProps> {
  const {
    displayName,
    render: InnerComponent,
    defaultPlugin,
    defaultProps,
    customBoundFactory,
  } = config;

  function DefaultBoundBridge<
    InstanceExtraProps extends Record<string, any> = DefaultExtraProps
  >(
    props: BaseProps &
      InstanceExtraProps & {
        stylingPlugin?: StylingPlugin<BaseProps, InstanceExtraProps, InnerProps>;
      }
  ): ReactElement {
    const {
      stylingPlugin = defaultPlugin as
        | StylingPlugin<BaseProps, InstanceExtraProps, InnerProps>
        | undefined,
      ...restProps
    } = props;

    // Avoid extra object allocation when `defaultProps` is not configured
    const mergedProps = (
      defaultProps ? { ...defaultProps, ...restProps } : restProps
    ) as BaseProps & InstanceExtraProps;

    const serializableStyleProps = stylingPlugin
      ? stylingPlugin(mergedProps)
      : undefined;

    // Additive spread guarantees a plugin cannot strip core behavioral props
    return (
      <InnerComponent
        {...(mergedProps as unknown as InnerProps)}
        {...serializableStyleProps}
      />
    );
  }

  const BoundComponent: BoundComponentType<
    BaseProps,
    DefaultExtraProps,
    InnerProps
  > = customBoundFactory
    ? customBoundFactory(config)
    : DefaultBoundBridge;

  Object.defineProperty(BoundComponent, 'displayName', {
    value: displayName,
    writable: false,
  });

  return BoundComponent;
}
