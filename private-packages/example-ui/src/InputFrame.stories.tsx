import type { Meta, StoryObj } from '@storybook/react';
import { InputFrame } from './InputFrame';

const meta: Meta<typeof InputFrame> = {
  title: 'Components/InputFrame',
  component: InputFrame,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputFrame>;

export const Default: Story = {
  render: () => (
    <InputFrame>
      <input type="text" placeholder="Search Pokémon..." />
    </InputFrame>
  ),
};

export const WithSlots: Story = {
  render: () => (
    <InputFrame
      startElement={<span className="pl-1">🔍</span>}
      endElement={<button type="button">Clear</button>}
    >
      <input type="text" placeholder="Search with icons..." />
    </InputFrame>
  ),
};

export const MorphedSearch: Story = {
  render: () => (
    <InputFrame as="search" aria-label="Pokédex Search Filter">
      <input type="search" placeholder="Search..." />
    </InputFrame>
  ),
};
