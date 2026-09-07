// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatInputBar from './ChatInputBar';

afterEach(cleanup);

describe('ChatInputBar', () => {
  it('disables the send button when the draft is blank', () => {
    render(<ChatInputBar value="" onChangeText={vi.fn()} onSubmit={vi.fn()} disabled={false} />);

    expect(
      (screen.getByRole('button', { name: /send message/i }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('disables the send button while a reply is in flight, even with a draft', () => {
    render(<ChatInputBar value="Hi" onChangeText={vi.fn()} onSubmit={vi.fn()} disabled />);

    expect(
      (screen.getByRole('button', { name: /send message/i }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('submits on form submit (Enter) once there is a non-blank draft', () => {
    const onSubmit = vi.fn();
    render(
      <ChatInputBar
        value="How much did I spend?"
        onChangeText={vi.fn()}
        onSubmit={onSubmit}
        disabled={false}
      />
    );

    fireEvent.submit(screen.getByRole('textbox'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('reports the new text on every keystroke', () => {
    const onChangeText = vi.fn();
    render(
      <ChatInputBar value="" onChangeText={onChangeText} onSubmit={vi.fn()} disabled={false} />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'How much' } });

    expect(onChangeText).toHaveBeenCalledWith('How much');
  });

  it('does not submit a whitespace-only draft', () => {
    const onSubmit = vi.fn();
    render(
      <ChatInputBar value="   " onChangeText={vi.fn()} onSubmit={onSubmit} disabled={false} />
    );

    fireEvent.submit(screen.getByRole('textbox'));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
