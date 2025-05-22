import { renderHook, act } from '@testing-library/react';
import useAuthenticate from './useAuthenticate'; // Changed to default import
import {
  authenticateWithGoogle as mockAuthenticateWithGoogle,
  authenticateWithDiscord as mockAuthenticateWithDiscord,
  authenticateWithEthWallet as mockAuthenticateWithEthWallet,
  authenticateWithWebAuthn as mockAuthenticateWithWebAuthn,
  authenticateWithStytch as mockAuthenticateWithStytch,
} from '../utils/lit'; 
import { useConnect } from 'wagmi'; 
import { isSignInRedirect, getProviderFromUrl } from '@lit-protocol/lit-auth-client'; 
import { AuthMethod } from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';

// Mock ../utils/lit.ts
jest.mock('../utils/lit', () => ({
  __esModule: true,
  authenticateWithGoogle: jest.fn(),
  authenticateWithDiscord: jest.fn(),
  authenticateWithEthWallet: jest.fn(),
  authenticateWithWebAuthn: jest.fn(),
  authenticateWithStytch: jest.fn(),
}));

// Mock wagmi - simplified to avoid SyntaxError with requireActual
const mockConnectAsync = jest.fn();
const mockGetWalletClient = jest.fn(); // Specific mock for getWalletClient
jest.mock('wagmi', () => ({
  useConnect: jest.fn(), // Only mock useConnect
}));

// Mock @lit-protocol/lit-auth-client specific functions
jest.mock('@lit-protocol/lit-auth-client', () => ({
  isSignInRedirect: jest.fn(), // Mock only the functions we need
  getProviderFromUrl: jest.fn(),
}));

const mockAuthMethod: AuthMethod = {
  authMethodType: AuthMethodType.GoogleJwt, 
  accessToken: 'mock_access_token',
};

const mockConnector = { 
  id: 'mockConnector', 
  name: 'Mock MetaMask',
  getWalletClient: mockGetWalletClient,
} as any;


describe('useAuthenticate Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 

    (useConnect as jest.Mock).mockReturnValue({
      connectAsync: mockConnectAsync,
      connectors: [mockConnector], 
      error: null,
      isLoading: false, // wagmi's isLoading, not the hook's
      pendingConnector: undefined,
    });
  });

  describe('authWithEthWallet', () => {
    it('should authenticate with EthWallet and set authMethod', async () => {
      const mockSignMessage = jest.fn().mockResolvedValue('mockSignature');
      mockGetWalletClient.mockResolvedValue({ signMessage: mockSignMessage });
      // connectAsync needs to return an object that includes the connector with getWalletClient
      mockConnectAsync.mockResolvedValue({ 
        account: 'mockAccount', 
        chain: {id: 1}, 
        connector: mockConnector // This connector instance should have getWalletClient
      });
      (mockAuthenticateWithEthWallet as jest.Mock).mockResolvedValue(mockAuthMethod);

      const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));

      await act(async () => {
        await result.current.authWithEthWallet(mockConnector);
      });

      expect(mockConnectAsync).toHaveBeenCalledWith({ connector: mockConnector });
      expect(mockGetWalletClient).toHaveBeenCalledTimes(1);
      expect(mockSignMessage).toHaveBeenCalledTimes(1); 
      expect(mockAuthenticateWithEthWallet).toHaveBeenCalled(); 
      expect(result.current.authMethod).toEqual(mockAuthMethod);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state during authWithEthWallet', async () => {
      let resolveAuth: any;
      mockGetWalletClient.mockResolvedValue({ signMessage: jest.fn().mockResolvedValue('sig') });
      mockConnectAsync.mockResolvedValue({ account: 'mockAccount', chain: {id: 1}, connector: mockConnector });
      (mockAuthenticateWithEthWallet as jest.Mock).mockImplementationOnce(() => new Promise(res => { resolveAuth = res; }));
      const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));

      act(() => {
        result.current.authWithEthWallet(mockConnector); 
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveAuth(mockAuthMethod);
        await new Promise(process.nextTick);
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state if authWithEthWallet fails', async () => {
      const mockError = new Error('EthWallet auth failed');
      mockGetWalletClient.mockResolvedValue({ signMessage: jest.fn().mockResolvedValue('sig') });
      mockConnectAsync.mockResolvedValue({ account: 'mockAccount', chain: {id: 1}, connector: mockConnector });
      (mockAuthenticateWithEthWallet as jest.Mock).mockRejectedValue(mockError);
      const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));

      await act(async () => {
        await result.current.authWithEthWallet(mockConnector);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('authWithWebAuthn', () => {
    it('should authenticate with WebAuthn and set authMethod', async () => {
      (mockAuthenticateWithWebAuthn as jest.Mock).mockResolvedValue(mockAuthMethod);
      const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));

      await act(async () => {
        await result.current.authWithWebAuthn();
      });

      expect(mockAuthenticateWithWebAuthn).toHaveBeenCalledTimes(1);
      expect(result.current.authMethod).toEqual(mockAuthMethod);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state if authWithWebAuthn fails', async () => {
        const mockError = new Error('WebAuthn auth failed');
        (mockAuthenticateWithWebAuthn as jest.Mock).mockRejectedValue(mockError);
        const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));
  
        await act(async () => {
          await result.current.authWithWebAuthn();
        });
  
        expect(result.current.error).toEqual(mockError);
        expect(result.current.isLoading).toBe(false);
      });
  });

  describe('authWithStytch', () => {
    // Adjusted to match the hook's parameter names if they are different from the prompt
    const stytchToken = 'stytchToken';
    const stytchUserId = 'user1'; // Assuming these are the actual params used by the hook
    const stytchMethod = 'otp'; // Or whatever method your hook might pass to utils/lit

    it('should authenticate with Stytch and set authMethod', async () => {
      (mockAuthenticateWithStytch as jest.Mock).mockResolvedValue(mockAuthMethod);
      const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));

      await act(async () => {
        // Assuming the hook calls utils/lit's authenticateWithStytch like this:
        await result.current.authWithStytch(stytchToken, stytchUserId, stytchMethod); 
      });

      expect(mockAuthenticateWithStytch).toHaveBeenCalledWith(stytchToken, stytchUserId, stytchMethod);
      expect(result.current.authMethod).toEqual(mockAuthMethod);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state if authWithStytch fails', async () => {
        const mockError = new Error('Stytch auth failed');
        (mockAuthenticateWithStytch as jest.Mock).mockRejectedValue(mockError);
        const { result } = renderHook(() => useAuthenticate('mockRedirectUri'));
  
        await act(async () => {
            await result.current.authWithStytch(stytchToken, stytchUserId, stytchMethod);
        });
  
        expect(result.current.error).toEqual(mockError);
        expect(result.current.isLoading).toBe(false);
      });
  });

  describe('Redirect Logic (useEffect)', () => {
    const redirectUriWithCode = 'http://localhost/?code=xyz';

    it('should authenticate with Google on redirect if provider is google', async () => {
      (isSignInRedirect as jest.Mock).mockReturnValue(true);
      (getProviderFromUrl as jest.Mock).mockReturnValue('google');
      (mockAuthenticateWithGoogle as jest.Mock).mockResolvedValue(mockAuthMethod);

      const { result } = renderHook(() => useAuthenticate(redirectUriWithCode));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); 
      });

      expect(isSignInRedirect).toHaveBeenCalledWith(redirectUriWithCode);
      expect(getProviderFromUrl).toHaveBeenCalledWith(redirectUriWithCode);
      expect(mockAuthenticateWithGoogle).toHaveBeenCalledWith(redirectUriWithCode);
      expect(result.current.authMethod).toEqual(mockAuthMethod);
      expect(result.current.isLoading).toBe(false); 
    });

    it('should authenticate with Discord on redirect if provider is discord', async () => {
        const discordRedirectUri = 'http://localhost/?code=xyz&access_token=abc';
        (isSignInRedirect as jest.Mock).mockReturnValue(true);
        (getProviderFromUrl as jest.Mock).mockReturnValue('discord');
        (mockAuthenticateWithDiscord as jest.Mock).mockResolvedValue(mockAuthMethod);
  
        const { result } = renderHook(() => useAuthenticate(discordRedirectUri));
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });
  
        expect(mockAuthenticateWithDiscord).toHaveBeenCalledWith(discordRedirectUri);
        expect(result.current.authMethod).toEqual(mockAuthMethod);
        expect(result.current.isLoading).toBe(false);
      });

    it('should not call authentication if not a sign-in redirect', async () => {
      const nonRedirectUri = 'http://localhost/';
      (isSignInRedirect as jest.Mock).mockReturnValue(false);
      renderHook(() => useAuthenticate(nonRedirectUri));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAuthenticateWithGoogle).not.toHaveBeenCalled();
      expect(mockAuthenticateWithDiscord).not.toHaveBeenCalled();
    });

    it('should set error state if redirect authentication fails', async () => {
        const mockError = new Error('Redirect auth failed');
        (isSignInRedirect as jest.Mock).mockReturnValue(true);
        (getProviderFromUrl as jest.Mock).mockReturnValue('google');
        (mockAuthenticateWithGoogle as jest.Mock).mockRejectedValue(mockError);
  
        const { result } = renderHook(() => useAuthenticate(redirectUriWithCode));
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });
  
        expect(result.current.error).toEqual(mockError);
        expect(result.current.isLoading).toBe(false);
      });
  });
});
