import { useState, type ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

const setup = (props: Partial<ComponentProps<typeof Dialog>> = {}) => {
  const onClose = vi.fn();
  render(
    <Dialog
      open
      onClose={onClose}
      title="Delete report"
      description="This cannot be undone."
      footer={
        <>
          <button type="button">Cancel</button>
          <button type="button">Confirm</button>
        </>
      }
      {...props}
    >
      <p>Body text</p>
    </Dialog>,
  );
  return { onClose };
};

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    setup({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a modal dialog named by its title', () => {
    setup();

    const dialog = screen.getByRole('dialog', { name: 'Delete report' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('describes the dialog with its description', () => {
    setup();

    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('shows its content and footer', () => {
    setup();

    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('closes from the close button', async () => {
    const { onClose } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const { onClose } = setup();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked but not when the panel is', async () => {
    const { onClose } = setup();

    await userEvent.click(screen.getByText('Body text'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByTestId('dialog-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores backdrop clicks when closeOnBackdrop is false', async () => {
    const { onClose } = setup({ closeOnBackdrop: false });

    await userEvent.click(screen.getByTestId('dialog-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus inside when opened', () => {
    setup();

    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('keeps Tab focus inside the dialog', async () => {
    setup();
    const close = screen.getByRole('button', { name: 'Close dialog' });
    expect(close).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
  });

  it('keeps Shift+Tab focus inside the dialog', async () => {
    setup();

    await userEvent.tab({ shift: true });

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });

  it('returns focus to the trigger when closed', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Delete report">
            <p>Body text</p>
          </Dialog>
        </>
      );
    };
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
