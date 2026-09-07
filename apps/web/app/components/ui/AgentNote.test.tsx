// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AgentNote from './AgentNote';

afterEach(cleanup);

describe('AgentNote', () => {
  it('renders the confirm-gate actions by default', () => {
    render(
      <AgentNote
        message="You spent 20% more on drinks this week."
        primaryLabel="Do it"
        secondaryLabel="Talk about it"
      />
    );

    expect(screen.getByRole('button', { name: 'Do it' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Talk about it' })).not.toBeNull();
  });

  it('hides the confirm-gate actions for read-only remarks', () => {
    render(
      <AgentNote
        message="You spent 20% more on drinks this week."
        primaryLabel="Do it"
        secondaryLabel="Talk about it"
        showActions={false}
      />
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('hides the byline when there is no bylineLabel even though showByline is true', () => {
    render(<AgentNote message="Note" primaryLabel="Do it" secondaryLabel="Talk about it" />);

    expect(screen.queryByText('Moniq')).toBeNull();
  });

  it('shows the byline when a bylineLabel is given', () => {
    render(
      <AgentNote
        message="Note"
        primaryLabel="Do it"
        secondaryLabel="Talk about it"
        bylineLabel="Moniq"
      />
    );

    expect(screen.getByText('Moniq')).not.toBeNull();
  });

  it('hides the byline when showByline is false, even with a bylineLabel', () => {
    render(
      <AgentNote
        message="Note"
        primaryLabel="Do it"
        secondaryLabel="Talk about it"
        bylineLabel="Moniq"
        showByline={false}
      />
    );

    expect(screen.queryByText('Moniq')).toBeNull();
  });
});
