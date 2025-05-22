import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext'; // Adjust path as needed
import {
  getSessionSigs as mockUtilGetSessionSigs, // Aliased to avoid collision
  signInWithGoogle as mockUtilSignInWithGoogle,
  authenticateWithGoogle as mockUtilAuthenticateWithGoogle,
  authenticateWithEthWallet as mockUtilAuthenticateWithEthWallet,
  // Assuming other utils/lit functions are not directly called by AuthContext, 
  // or they'd need to be mocked here too if AuthContext itself calls them.
} from '../utils/lit';
import useAccountsActual from '../hooks/useAccounts'; // For type casting
import { AuthMethod, IRelayPKP, SessionSigs } from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { usePathname, useRouter } from 'next/navigation';

// --- Mock ../utils/lit.ts ---
jest.mock('../utils/lit', () => ({
  __esModule: true,
  getSessionSigs: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithDiscord: jest.fn(), // Keep if AuthContext calls it
  authenticateWithGoogle: jest.fn(),
  authenticateWithDiscord: jest.fn(), // Keep if AuthContext calls it
  authenticateWithEthWallet: jest.fn(),
  authenticateWithWebAuthn: jest.fn(), // Keep if AuthContext calls it
  authenticateWithStytch: jest.fn(),   // Keep if AuthContext calls it
  registerWebAuthn: jest.fn(),      // Keep if AuthContext calls it
}));

// --- Mock ../hooks/useAccounts ---
const mockFetchAccounts = jest.fn();
const mockCreateAccount = jest.fn();
const mockSetCurrentAccountHook = jest.fn();
jest.mock('../hooks/useAccounts', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// --- Mock next/navigation ---
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ // Mock the useRouter hook itself
    push: mockRouterPush,
    replace: mockRouterReplace,
  })),
  usePathname: jest.fn(() => mockUsePathname()), // Ensure usePathname is also a jest.fn
}));


// --- Mock localStorage ---
let store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => store[key] || null,
  setItem: (key: string, value: string): void => {
    store[key] = value.toString();
  },
  removeItem: (key: string): void => {
    delete store[key];
  },
  clear: (): void => {
    store = {};
  },
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true, writable: true });


// --- Test Wrapper ---
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

// --- Mock Data ---
const mockAuthMethodGoogleInstance: AuthMethod = {
  authMethodType: AuthMethodType.GoogleJwt,
  accessToken: 'google-access-token',
};
const mockPKPInstance: IRelayPKP = { tokenId: 'pkpTokenId1', publicKey: 'pkpPublicKey1', ethAddress: 'pkpEthAddress1' };
const mockPKP2Instance: IRelayPKP = { tokenId: 'pkpTokenId2', publicKey: 'pkpPublicKey2', ethAddress: 'pkpEthAddress2' };
const mockSessionSigsInstance: SessionSigs = { sig1: 'generatedSigValue1' } as any;


describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store = {}; 
    mockUsePathname.mockReturnValue('/'); // Default pathname for most tests

    // Reset useAccounts mock implementation for each test
    (require('../hooks/useAccounts').default as jest.Mock<ReturnType<typeof useAccountsActual>>).mockReturnValue({
      fetchAccounts: mockFetchAccounts,
      createAccount: mockCreateAccount,
      setCurrentAccount: mockSetCurrentAccountHook,
      accounts: [],
      currentAccount: null,
      loading: false,
      error: null,
    });

     // Mock useRouter specifically for each test context if needed, or ensure it's reset
     (useRouter as jest.Mock).mockReturnValue({
        push: mockRouterPush,
        replace: mockRouterReplace,
      });
  });

  // 1. Initial State & localStorage Restoration
  describe('Initial State & localStorage Restoration', () => {
    it('should have correct clean initial state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.pkp).toBeNull();
      expect(result.current.authMethod).toBeNull();
      expect(result.current.sessionSigs).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should restore state from valid localStorage', async () => {
      localStorage.setItem('lit-auth-method', JSON.stringify(mockAuthMethodGoogleInstance));
      localStorage.setItem('lit-pkp', JSON.stringify(mockPKPInstance));
      localStorage.setItem('lit-session-sigs', JSON.stringify(mockSessionSigsInstance));

      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.authMethod).toEqual(mockAuthMethodGoogleInstance);
      expect(result.current.pkp).toEqual(mockPKPInstance);
      expect(result.current.sessionSigs).toEqual(mockSessionSigsInstance);
    });

    it('should default to unauthenticated with invalid localStorage data', async () => {
      localStorage.setItem('lit-auth-method', 'invalid-json');
      localStorage.setItem('lit-pkp', 'invalid-json-pkp');
      
      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.pkp).toBeNull();
    });
  });

  // 2. loginWithGoogle() (Initiation)
  describe('loginWithGoogle (Initiation)', () => {
    it('should call signInWithGoogle (from utils/lit) and set loading state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });
      
      await act(async () => {
         result.current.loginWithGoogle();
      });
      
      // isLoading is true while signInWithGoogle is "running"
      expect(result.current.isLoading).toBe(true); 
      await waitFor(() => expect(mockUtilSignInWithGoogle).toHaveBeenCalledTimes(1));
      // The isLoading state might be reset by the time signInWithGoogle resolves if it's fast
      // or if it's expected to not fully complete due to browser redirect.
      // The prompt example implies checking isLoading during the call.
    });
  });

  // 3. Redirect Handling (Google Callback)
  describe('Redirect Handling (Google Callback)', () => {
    const googleRedirectPath = '/auth/callback/google';
    const mockAuthMethodFromRedirect: AuthMethod = { authMethodType: AuthMethodType.GoogleJwt, accessToken: 'redirectedGoogleToken' };

    it('should process redirect, fetch 1 PKP, get session sigs, and authenticate', async () => {
      mockUsePathname.mockReturnValue(googleRedirectPath);
      // Simulate URL params for the redirect (window.location.search is usually involved)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=testcode&state=teststate' },
        writable: true,
      });

      (mockUtilAuthenticateWithGoogle as jest.Mock).mockResolvedValue(mockAuthMethodFromRedirect);
      mockFetchAccounts.mockResolvedValue([mockPKPInstance]);
      (mockUtilGetSessionSigs as jest.Mock).mockResolvedValue(mockSessionSigsInstance);

      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.isAuthenticated).toBe(true), { timeout: 4000 });
      
      expect(mockUtilAuthenticateWithGoogle).toHaveBeenCalledWith(expect.stringContaining(window.location.origin + googleRedirectPath));
      expect(mockFetchAccounts).toHaveBeenCalledWith(mockAuthMethodFromRedirect);
      expect(mockUtilGetSessionSigs).toHaveBeenCalledWith(expect.objectContaining({
        pkpPublicKey: mockPKPInstance.publicKey,
        authMethod: mockAuthMethodFromRedirect,
      }));
      expect(result.current.pkp).toEqual(mockPKPInstance);
      expect(result.current.sessionSigs).toEqual(mockSessionSigsInstance);
      expect(mockRouterPush).toHaveBeenCalledWith('/space');
      expect(result.current.pendingPkpSelection).toBe(false);
    });

    it('should process redirect, fetch 0 PKPs, create account, get session sigs, and authenticate', async () => {
      mockUsePathname.mockReturnValue(googleRedirectPath);
      Object.defineProperty(window, 'location', { value: { search: '?code=testcode' }, writable: true });

      (mockUtilAuthenticateWithGoogle as jest.Mock).mockResolvedValue(mockAuthMethodFromRedirect);
      mockFetchAccounts.mockResolvedValue([]); // No PKPs
      mockCreateAccount.mockResolvedValue(mockPKPInstance); // createAccount returns new PKP
      (mockUtilGetSessionSigs as jest.Mock).mockResolvedValue(mockSessionSigsInstance);
      
      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.isAuthenticated).toBe(true), { timeout: 2000 });

      expect(mockUtilAuthenticateWithGoogle).toHaveBeenCalled();
      expect(mockFetchAccounts).toHaveBeenCalledWith(mockAuthMethodFromRedirect);
      expect(mockCreateAccount).toHaveBeenCalledWith(mockAuthMethodFromRedirect);
      expect(mockUtilGetSessionSigs).toHaveBeenCalledWith(expect.objectContaining({
        pkpPublicKey: mockPKPInstance.publicKey,
        authMethod: mockAuthMethodFromRedirect,
      }));
      expect(result.current.pkp).toEqual(mockPKPInstance);
      expect(mockRouterPush).toHaveBeenCalledWith('/space');
    });

    it('should process redirect, fetch multiple PKPs, and set pendingPkpSelection to true', async () => {
      mockUsePathname.mockReturnValue(googleRedirectPath);
      Object.defineProperty(window, 'location', { value: { search: '?code=testcode' }, writable: true });
      const multiplePKPs = [mockPKPInstance, mockPKP2Instance];
      
      (mockUtilAuthenticateWithGoogle as jest.Mock).mockResolvedValue(mockAuthMethodFromRedirect);
      mockFetchAccounts.mockResolvedValue(multiplePKPs);

      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.pendingPkpSelection).toBe(true), { timeout: 2000 });
      
      expect(mockUtilAuthenticateWithGoogle).toHaveBeenCalled();
      expect(mockFetchAccounts).toHaveBeenCalledWith(mockAuthMethodFromRedirect);
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockUtilGetSessionSigs).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(result.current.availablePkps).toEqual(multiplePKPs);
    });
  });
  
  // 4. loginWithEthWallet() (Simplified Test - Focus on processAuthMethod after obtaining AuthMethod)
  describe('loginWithEthWallet (Simplified)', () => {
    const mockEthAuthMethod: AuthMethod = { authMethodType: AuthMethodType.EthWallet, accessToken: 'eth-wallet-token' };

    it('should call processAuthMethod, handle 1 PKP, and set session', async () => {
      // This test assumes loginWithEthWallet has somehow obtained mockEthAuthMethod
      // and now we're testing the subsequent flow via processAuthMethod.
      // This bypasses the direct wagmi interaction for simplicity as per prompt.
      (mockUtilAuthenticateWithEthWallet as jest.Mock).mockResolvedValue(mockEthAuthMethod); // Mock this for completeness if it's called
      mockFetchAccounts.mockResolvedValue([mockPKPInstance]);
      (mockUtilGetSessionSigs as jest.Mock).mockResolvedValue(mockSessionSigsInstance);

      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      // Directly call processAuthMethod as if loginWithEthWallet successfully got the auth method
      await act(async () => {
        await result.current.processAuthMethod(mockEthAuthMethod);
      });
      
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
      expect(mockFetchAccounts).toHaveBeenCalledWith(mockEthAuthMethod);
      expect(mockUtilGetSessionSigs).toHaveBeenCalledWith(expect.objectContaining({
        pkpPublicKey: mockPKPInstance.publicKey,
        authMethod: mockEthAuthMethod,
      }));
      expect(result.current.pkp).toEqual(mockPKPInstance);
      expect(mockRouterPush).toHaveBeenCalledWith('/space');
    });
  });
  
  // 5. setPKP() (PKP Selection)
  describe('setPKP (PKP Selection)', () => {
    it('should set PKP, get session sigs, and authenticate if pendingPkpSelection is true', async () => {
      const selectedPKP = mockPKP2Instance;
      const authMethodForSelection: AuthMethod = { authMethodType: AuthMethodType.WebAuthn, accessToken: 'selectionToken' };

      // Simulate the state where PKP selection is pending
      mockUsePathname.mockReturnValue('/some-path-that-led-to-selection'); 
      (mockUtilAuthenticateWithGoogle as jest.Mock).mockResolvedValue(authMethodForSelection); // Simulate an initial auth
      mockFetchAccounts.mockResolvedValue([mockPKPInstance, mockPKP2Instance]); // Fetched multiple PKPs
      
      const { result, rerender } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      // Trigger the condition that sets pendingPkpSelection (e.g. a redirect that found multiple accounts)
      // This is complex to trigger perfectly without re-testing the whole redirect logic.
      // An alternative is to make currentAuthMethodForPkpSelection available or mock its setting.
      // For this test, we'll manually set the conditions as best as possible and then call setPKP.
      // The AuthContext internally sets currentAuthMethodForPkpSelection.
      
      // Step 1: Simulate the multi-PKP scenario to set internal states.
      await act(async () => {
        // Simulate a redirect that leads to pending selection.
        // This depends on the internal logic of useEffect in AuthContext.
        // We need to make sure processAuthMethod is called and leads to pendingPkpSelection=true
        // and currentAuthMethodForPkpSelection is set.
        mockUsePathname.mockReturnValue('/auth/callback/google');
        Object.defineProperty(window, 'location', { value: { search: '?code=testcode' }, writable: true });
        await result.current.processAuthMethod(authMethodForSelection); // Manually trigger to simulate this part
      });
      
      // Wait for pendingPkpSelection to be true. This requires the mock for useAccounts
      // to be updated to reflect the state after processAuthMethod has run.
      (require('../hooks/useAccounts').default as jest.Mock<ReturnType<typeof useAccountsActual>>).mockReturnValue({
        fetchAccounts: mockFetchAccounts.mockResolvedValueOnce([mockPKPInstance, mockPKP2Instance]), // Ensure it returns multiple
        createAccount: mockCreateAccount,
        setCurrentAccount: mockSetCurrentAccountHook,
        accounts: [mockPKPInstance, mockPKP2Instance], // Simulate accounts are loaded
        currentAccount: null, // No current account yet
        loading: false,
        error: null,
      });
      
      // Re-render or wait for state to propagate if necessary.
      // The state `currentAuthMethodForPkpSelection` is set internally.
      // We need to ensure `processAuthMethod` has run and set it.
      // The test above "should process redirect, fetch multiple PKPs..." already tests this setup.
      // We'll directly test setPKP assuming the context is in the correct state.
      // This requires a way to set the internal state of AuthContext for `pendingPkpSelection` and `currentAuthMethodForPkpSelection`.
      // This is hard without exposing setters or refactoring AuthContext.
      // The prompt suggests: "Manually set context state... or test implicitly via multi-PKP redirect."
      // The implicit test is better.

      // Test: After redirect leads to pendingPkpSelection, call setPKP
      // (This is essentially re-testing part of the multi-PKP redirect test but focusing on setPKP action)
      mockUsePathname.mockReturnValue('/auth/callback/google');
      Object.defineProperty(window, 'location', { value: { search: '?code=testcode' }, writable: true });
      (mockUtilAuthenticateWithGoogle as jest.Mock).mockResolvedValue(authMethodForSelection);
      mockFetchAccounts.mockResolvedValue([mockPKPInstance, mockPKP2Instance]); // Multiple PKPs
      (mockUtilGetSessionSigs as jest.Mock).mockResolvedValue(mockSessionSigsInstance);


      const { result: resultForSetPKPTest } = renderHook(() => useAuth(), { wrapper: AllTheProviders });
      
      // Wait for the pending selection state
      await waitFor(() => expect(resultForSetPKPTest.current.pendingPkpSelection).toBe(true));
      expect(resultForSetPKPTest.current.availablePkps).toEqual([mockPKPInstance, mockPKP2Instance]);

      // Now, call setPKP
      await act(async () => {
        await resultForSetPKPTest.current.setPKP(selectedPKP);
      });

      await waitFor(() => expect(resultForSetPKPTest.current.isAuthenticated).toBe(true));
      expect(mockUtilGetSessionSigs).toHaveBeenCalledWith(expect.objectContaining({
        pkpPublicKey: selectedPKP.publicKey,
        authMethod: authMethodForSelection,
      }));
      expect(resultForSetPKPTest.current.pkp).toEqual(selectedPKP);
      expect(resultForSetPKPTest.current.sessionSigs).toEqual(mockSessionSigsInstance);
      expect(resultForSetPKPTest.current.pendingPkpSelection).toBe(false);
      expect(mockRouterPush).toHaveBeenCalledWith('/space');
    });
  });

  // 6. logOut()
  describe('logOut', () => {
    it('should clear auth state, localStorage, and redirect to /login', async () => {
      localStorage.setItem('lit-auth-method', JSON.stringify(mockAuthMethodGoogleInstance));
      localStorage.setItem('lit-pkp', JSON.stringify(mockPKPInstance));
      localStorage.setItem('lit-session-sigs', JSON.stringify(mockSessionSigsInstance));

      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true)); 

      await act(async () => { // Ensure logOut's state updates are wrapped
        result.current.logOut();
      });
      
      await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/login'));

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.pkp).toBeNull();
      expect(result.current.authMethod).toBeNull();
      expect(result.current.sessionSigs).toBeNull();
      expect(localStorage.getItem('lit-auth-method')).toBeNull();
    });
  });

  // 7. Error Handling (Example for Google Redirect)
  describe('Error Handling (Google Redirect)', () => {
    it('should set error state if redirect authentication fails', async () => {
      const mockError = new Error('Google Auth Failed');
      mockUsePathname.mockReturnValue('/auth/callback/google');
      Object.defineProperty(window, 'location', { value: { search: '?code=testcode' }, writable: true });
      (mockUtilAuthenticateWithGoogle as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.error).toEqual(mockError));
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
