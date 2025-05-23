import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountSelection from './AccountSelection'; // Adjust path as needed
import { IRelayPKP } from '@lit-protocol/types';

// Mock Data as specified
const mockAccounts: IRelayPKP[] = [
  { ethAddress: '0x123', publicKey: 'pk1', tokenId: 'token1' }, // Simplified for test matching
  { ethAddress: '0x456', publicKey: 'pk2', tokenId: 'token2' },
];
const mockSetCurrentAccount = jest.fn();

describe('AccountSelection Component', () => {
  beforeEach(() => {
    mockSetCurrentAccount.mockClear();
  });

  // 1. Renders Correctly with Accounts
  it('should render correctly with accounts', () => {
    render(<AccountSelection accounts={mockAccounts} setCurrentAccount={mockSetCurrentAccount} />);

    expect(screen.getByText('Choose your account')).toBeInTheDocument();

    mockAccounts.forEach((account, index) => {
      // Using ethAddress as the accessible name for the radio button, as per typical label association
      const radioOption = screen.getByLabelText(account.ethAddress.toLowerCase());
      expect(radioOption).toBeInTheDocument();
      expect(radioOption).toHaveAttribute('type', 'radio');
      // Radix UI RadioGroup.Item often uses the value prop for its items.
      // Assuming the value is set to the index for selection tracking.
      expect(radioOption).toHaveAttribute('value', index.toString());
      expect(screen.getByText(account.ethAddress.toLowerCase())).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  // 2. Handles Account Selection Change
  it('should handle account selection change', () => {
    render(<AccountSelection accounts={mockAccounts} setCurrentAccount={mockSetCurrentAccount} />);
    
    const firstRadio = screen.getByLabelText(mockAccounts[0].ethAddress.toLowerCase()) as HTMLInputElement;
    const secondRadio = screen.getByLabelText(mockAccounts[1].ethAddress.toLowerCase()) as HTMLInputElement;

    // DefaultValue "0" in Radix RadioGroup implies the first item is initially selected.
    expect(firstRadio).toHaveAttribute('aria-checked', 'true'); // Check Radix's aria-checked attribute
    expect(secondRadio).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(secondRadio);

    // After clicking the second radio, it should become selected.
    // For Radix, this might mean data-state="checked" or aria-checked="true"
    // If direct .checked is not reliable for Radix, this part may need adjustment to how Radix represents selection.
    // Let's assume for now that 'checked' property reflects the selection for testing.
    expect(firstRadio.checked).toBe(false);
    expect(secondRadio.checked).toBe(true); 
  });

  // 3. Handles Form Submission
  describe('Form Submission', () => {
    it('should call setCurrentAccount with the first account by default on submit', () => {
      render(<AccountSelection accounts={mockAccounts} setCurrentAccount={mockSetCurrentAccount} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(mockSetCurrentAccount).toHaveBeenCalledTimes(1);
      expect(mockSetCurrentAccount).toHaveBeenCalledWith(mockAccounts[0]);
    });

    it('should call setCurrentAccount with the selected account on submit', () => {
      render(<AccountSelection accounts={mockAccounts} setCurrentAccount={mockSetCurrentAccount} />);
      
      // Select the second account
      fireEvent.click(screen.getByLabelText(mockAccounts[1].ethAddress.toLowerCase()));
      
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(mockSetCurrentAccount).toHaveBeenCalledTimes(1);
      expect(mockSetCurrentAccount).toHaveBeenCalledWith(mockAccounts[1]);
    });
  });

  // 4. Displays Error Message
  it('should display an error message if error prop is provided', () => {
    const mockError = new Error('Test error message');
    render(<AccountSelection accounts={mockAccounts} setCurrentAccount={mockSetCurrentAccount} error={mockError} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
    // Optional: Check if the error message is contained within an element with a specific class for error styling
    const errorAlert = screen.getByText('Test error message').closest('.alert--error');
    expect(errorAlert).toBeInTheDocument();
  });

  it('should not display an error message if no error prop is provided', () => {
    render(<AccountSelection accounts={mockAccounts} setCurrentAccount={mockSetCurrentAccount} />);
    expect(screen.queryByText('Test error message')).toBeNull(); // Ensure no error message with this text
    expect(document.querySelector('.alert--error')).toBeNull(); // Ensure no element with error class
  });
});
