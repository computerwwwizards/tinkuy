// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createComponent, StylingPlugin, CustomBoundFactory } from './index.js';

describe('tinkuy-react createComponent', () => {
  afterEach(() => {
    cleanup();
  });

  it('assigns the correct displayName to the bound component', () => {
    const Inner = (props: { label: string }) => <span>{props.label}</span>;
    const BoundButton = createComponent({
      displayName: 'BoundButton',
      render: Inner,
    });

    expect(BoundButton.displayName).toBe('BoundButton');
  });

  it('renders the inner component with passed base props using React Testing Library', () => {
    const Inner = (props: { label: string }) => <button>{props.label}</button>;

    const BoundButton = createComponent({
      displayName: 'BoundButton',
      render: Inner,
    });

    render(<BoundButton label="Click Me" />);

    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('merges defaultProps with instance props (instance props override defaultProps)', () => {
    const Inner = (props: { label: string; disabled?: boolean }) => (
      <button disabled={props.disabled}>{props.label}</button>
    );

    const BoundButton = createComponent<
      { label: string; disabled?: boolean },
      {}
    >({
      displayName: 'BoundButton',
      render: Inner,
      defaultProps: {
        disabled: true,
        label: 'Default Label',
      },
    });

    const { rerender } = render(<BoundButton label="Custom Label" />);
    const btn = screen.getByRole('button', { name: 'Custom Label' });
    expect(btn).toBeDisabled();

    rerender(<BoundButton label="Custom Label" disabled={false} />);
    expect(btn).not.toBeDisabled();
  });

  it('applies defaultPlugin to transform props into serializable attributes', () => {
    interface BaseProps {
      label: string;
      className?: string;
    }
    interface ExtraProps {
      intent?: 'primary' | 'secondary';
    }

    const Inner = (props: BaseProps) => (
      <button className={props.className}>{props.label}</button>
    );

    const defaultPlugin: StylingPlugin<BaseProps, ExtraProps> = (props) => ({
      className: props.intent === 'primary' ? 'btn-primary' : 'btn-default',
    });

    const BoundButton = createComponent<BaseProps, ExtraProps>({
      displayName: 'BoundButton',
      render: Inner,
      defaultPlugin,
    });

    render(<BoundButton label="Submit Primary" intent="primary" />);

    const btn = screen.getByRole('button', { name: 'Submit Primary' });
    expect(btn).toHaveClass('btn-primary');
  });

  it('allows overriding defaultPlugin with instance stylingPlugin prop', () => {
    interface BaseProps {
      label: string;
      className?: string;
    }
    interface ExtraProps {
      intent?: 'primary' | 'secondary';
    }

    const Inner = (props: BaseProps) => (
      <button className={props.className}>{props.label}</button>
    );

    const defaultPlugin: StylingPlugin<BaseProps, ExtraProps> = () => ({
      className: 'btn-default',
    });

    const customPlugin: StylingPlugin<BaseProps, ExtraProps> = () => ({
      className: 'btn-custom-override',
    });

    const BoundButton = createComponent<BaseProps, ExtraProps>({
      displayName: 'BoundButton',
      render: Inner,
      defaultPlugin,
    });

    render(<BoundButton label="Submit Custom" stylingPlugin={customPlugin} />);

    const btn = screen.getByRole('button', { name: 'Submit Custom' });
    expect(btn).toHaveClass('btn-custom-override');
  });

  it('passes data-* attributes from styling plugin to inner component', () => {
    interface BaseProps {
      label: string;
    }

    const Inner = (props: BaseProps & Record<string, any>) => (
      <button data-testid={props['data-testid']}>{props.label}</button>
    );

    const plugin: StylingPlugin<BaseProps, {}> = () => ({
      'data-testid': 'custom-test-id',
    });

    const BoundButton = createComponent<BaseProps, {}>({
      displayName: 'BoundButton',
      render: Inner,
      defaultPlugin: plugin,
    });

    render(<BoundButton label="Test" />);

    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });

  it('supports customBoundFactory escape hatch', () => {
    const Inner = (props: { label: string; extra?: string }) => (
      <div>{`${props.label}-${props.extra || ''}`}</div>
    );

    const customBoundFactory: CustomBoundFactory<{ label: string }, {}, { label: string; extra?: string }> =
      (config) => {
        return (props) => {
          const RenderComp = config.render;
          return <RenderComp {...props} extra="bound-via-factory" />;
        };
      };

    const CustomBoundComponent = createComponent<{ label: string }, {}, { label: string; extra?: string }>({
      displayName: 'CustomBound',
      render: Inner,
      customBoundFactory,
    });

    render(<CustomBoundComponent label="Hello" />);

    expect(screen.getByText('Hello-bound-via-factory')).toBeInTheDocument();
  });
});
