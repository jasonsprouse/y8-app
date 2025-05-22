import { renderHook, act } from '@testing-library/react';
import useAccounts from './useAccounts'; // Changed to default import
import {
  getPKPs as mockGetPKPs,
  mintPKP as mockMintPKP,
} from '../utils/lit'; 
import { AuthMethod, IRelayPKP } from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';

// Mock ../utils/lit.ts
jest.mock('../utils/lit', () => ({
  __esModule: true,
  getPKPs: jest.fn(),
  mintPKP: jest.fn(),
}));

const mockAuthMethod: AuthMethod = {
  authMethodType: AuthMethodType.GoogleJwt,
  accessToken: 'mock_access_token',
};

const mockPKPList: IRelayPKP[] = [
  { tokenId: '1', publicKey: 'pk1', ethAddress: 'addr1' },
  { tokenId: '2', publicKey: 'pk2', ethAddress: 'addr2' },
];

const newMockPKP: IRelayPKP = {
  tokenId: '3',
  publicKey: 'pk3',
  ethAddress: 'addr3',
};

describe('useAccounts Hook', () => {
  beforeEach(() => {
    (mockGetPKPs as jest.Mock).mockClear();
    (mockMintPKP as jest.Mock).mockClear();
  });

  describe('fetchAccounts', () => {
    it('should fetch accounts, set them, and set the first as current if multiple exist', async () => {
      (mockGetPKPs as jest.Mock).mockResolvedValue(mockPKPList);
      const { result } = renderHook(() => useAccounts());

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        // The hook itself doesn't return the accounts from fetchAccounts, it updates its internal state
        await result.current.fetchAccounts(mockAuthMethod);
      });

      expect(mockGetPKPs).toHaveBeenCalledWith(mockAuthMethod);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.accounts).toEqual(mockPKPList);
      expect(result.current.currentAccount).toEqual(mockPKPList[0]);
    });
    
    it('should fetch accounts, set them, and set the only one as current if one exists', async () => {
      const singlePKPList = [mockPKPList[0]];
      (mockGetPKPs as jest.Mock).mockResolvedValue(singlePKPList);
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.fetchAccounts(mockAuthMethod);
      });

      expect(result.current.accounts).toEqual(singlePKPList);
      expect(result.current.currentAccount).toEqual(singlePKPList[0]);
    });

    it('should handle fetching zero accounts', async () => {
      (mockGetPKPs as jest.Mock).mockResolvedValue([]);
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.fetchAccounts(mockAuthMethod);
      });
      
      expect(result.current.accounts).toEqual([]);
      expect(result.current.currentAccount).toBeNull();
    });

    it('should set loading state correctly during fetchAccounts', async () => {
      let resolvePromise: any;
      (mockGetPKPs as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { resolvePromise = resolve; }));
      const { result } = renderHook(() => useAccounts());

      act(() => {
        result.current.fetchAccounts(mockAuthMethod); 
      });
      
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise(mockPKPList); 
        await new Promise(process.nextTick); 
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state if fetchAccounts fails', async () => {
      const mockError = new Error('Failed to fetch PKPs');
      (mockGetPKPs as jest.Mock).mockRejectedValue(mockError);
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.fetchAccounts(mockAuthMethod);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
      expect(result.current.accounts).toEqual([]);
      expect(result.current.currentAccount).toBeNull();
    });
  });

  describe('createAccount', () => {
    it('should mint a new PKP, add it to accounts, and set it as current', async () => {
      (mockMintPKP as jest.Mock).mockResolvedValue(newMockPKP);
      (mockGetPKPs as jest.Mock).mockResolvedValue([mockPKPList[0]]); // Pre-populate with one account
      
      const { result } = renderHook(() => useAccounts());

      // Initialize with some accounts first for this specific test logic
      await act(async () => {
          await result.current.fetchAccounts(mockAuthMethod); 
      });
      expect(result.current.accounts).toEqual([mockPKPList[0]]);


      let createdPKPResult: IRelayPKP | null = null;
      await act(async () => {
        createdPKPResult = await result.current.createAccount(mockAuthMethod);
      });
      
      expect(createdPKPResult).toEqual(newMockPKP);
      expect(mockMintPKP).toHaveBeenCalledWith(mockAuthMethod);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      // Assuming createAccount internally calls fetchAccounts or manually updates the list
      // For this test, let's assume it adds to the list and sets current.
      // The exact behavior depends on useAccounts implementation.
      // If createAccount itself calls fetchAccounts, then mockGetPKPs would be called again.
      // Based on the prompt, createAccount returns the new PKP.
      // The hook should then update its internal state.
      // A common pattern is to re-fetch or add manually.
      // Let's assume it adds manually for this test.
      // This might need adjustment based on actual hook implementation details.
      // For now, let's assume the hook's logic is to add the new PKP to the existing list.
      // If useAccounts().createAccount refetches all accounts, the mock for getPKPs needs to be adjusted.
      // Assuming it appends for now:
      expect(result.current.accounts).toContainEqual(newMockPKP); 
      expect(result.current.currentAccount).toEqual(newMockPKP);
    });

    it('should set loading state correctly during createAccount', async () => {
      let resolvePromise: any;
      (mockMintPKP as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { resolvePromise = resolve; }));
      const { result } = renderHook(() => useAccounts());

      act(() => {
        result.current.createAccount(mockAuthMethod);
      });
      
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise(newMockPKP);
        await new Promise(process.nextTick);
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state if createAccount fails', async () => {
      const mockError = new Error('Failed to mint PKP');
      (mockMintPKP as jest.Mock).mockRejectedValue(mockError);
      const { result } = renderHook(() => useAccounts());
      
      let createdPKPResult: IRelayPKP | null = null;
      await act(async () => {
        createdPKPResult = await result.current.createAccount(mockAuthMethod);
      });
      
      expect(createdPKPResult).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('setCurrentAccount', () => {
    it('should update the currentAccount when accounts are already loaded', async () => {
      // Pre-populate accounts using fetchAccounts
      (mockGetPKPs as jest.Mock).mockResolvedValue(mockPKPList);
      const { result } = renderHook(() => useAccounts());
      await act(async () => {
        await result.current.fetchAccounts(mockAuthMethod);
      });

      // Now test setCurrentAccount
      act(() => {
        result.current.setCurrentAccount(mockPKPList[1]);
      });
      expect(result.current.currentAccount).toEqual(mockPKPList[1]);

      act(() => {
        result.current.setCurrentAccount(null);
      });
      expect(result.current.currentAccount).toBeNull();
    });
  });
});
