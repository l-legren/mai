// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

afterEach(cleanup);

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()} ariaLabel="Add expense">
        content
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders the dialog with its content when open', () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Add expense">
        <p>content</p>
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: 'Add expense' })).not.toBeNull();
    expect(screen.getByText('content')).not.toBeNull();
  });

  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} ariaLabel="Add expense">
        content
      </Modal>
    );

    fireEvent.click(container.querySelector('[aria-hidden="true"]')!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the dialog content itself is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="Add expense">
        <p>content</p>
      </Modal>
    );

    fireEvent.click(screen.getByText('content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="Add expense">
        content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
