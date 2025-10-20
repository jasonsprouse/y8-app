# Web3 Login PKP Compatibility Fix

## Overview
This fix ensures that Web3 wallet authentication works the same way as Google and Discord authentication, maintaining compatibility with the master branch's PKP (Programmable Key Pair) flow.

## Problem Statement
The Web3 wallet authentication implementation had diverged from the master branch by using a custom AuthMethod creation instead of the Lit Protocol's `EthWalletProvider`. This broke PKP compatibility because:

1. **Master branch**: Used `ethWalletProvider.authenticate({ address, signMessage })`
2. **Dev branch**: Used custom AuthMethod creation with manual signature handling
3. **Issue**: Custom AuthMethod prevented proper PKP minting/fetching through Lit relay

## Root Cause
The `authenticateWithEthWallet()` function in `utils/lit.ts` was modified to create a custom AuthMethod object manually instead of using the Lit Protocol SDK's `EthWalletProvider.authenticate()` method.

### Before (Breaking Change)
```typescript
export async function authenticateWithEthWallet(
  address?: string,
  signMessage?: (message: string) => Promise<string>,
): Promise<AuthMethod> {
  let ethAddress = address;
  let signFn = signMessage;

  if (!ethAddress || !signFn) {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No injected wallet found.');
    }

    const provider = new BrowserProvider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);

    const walletSigner = await provider.getSigner();
    ethAddress = await walletSigner.getAddress();
    signFn = (msg: string) => walletSigner.signMessage(msg);
  }

  const message = `Sign in to Y8 App at ${new Date().toISOString()}`;
  const signature = await signFn(message);

  return {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify({
      address: ethAddress,
      signedMessage: message,
      signature,
    }),
  };
}
```

### After (Fixed)
```typescript
export async function authenticateWithEthWallet(
  address?: string,
  signMessage?: (message: string) => Promise<string>
): Promise<AuthMethod> {
  const ethWalletProvider = getEthWalletProvider();
  return await ethWalletProvider.authenticate({ address, signMessage });
}
```

## Solution
Reverted `authenticateWithEthWallet()` to use the Lit Protocol's `EthWalletProvider.authenticate()` method, matching:
- Master branch implementation ✅
- Google authentication pattern ✅
- Discord authentication pattern ✅

## Authentication Flow Comparison

### Google Authentication
```typescript
const result = await authenticateWithGoogle(window.location.href);
const pkps = await getPKPs(result);
if (!pkps || pkps.length === 0) {
  const newPkp = await mintPKP(result);
  await updateSession(newPkp, result, false);
}
```

### Discord Authentication
```typescript
const result = await authenticateWithDiscord(window.location.href);
const pkps = await getPKPs(result);
if (!pkps || pkps.length === 0) {
  const newPkp = await mintPKP(result);
  await updateSession(newPkp, result, false);
}
```

### Web3 Wallet Authentication (Fixed)
```typescript
const result = await authenticateWithEthWallet();
const pkps = await getPKPs(result);
if (!pkps || pkps.length === 0) {
  const newPkp = await mintPKP(result);
  await updateSession(newPkp, result, true);
}
```

## PKP Flow Consistency
All three authentication methods now follow the **identical PKP flow**:

1. **Authenticate** with the respective provider
   - Google: `authenticateWithGoogle()`
   - Discord: `authenticateWithDiscord()`
   - Wallet: `authenticateWithEthWallet()`

2. **Fetch PKPs** using the auth result
   - `const pkps = await getPKPs(result);`

3. **Handle PKP scenarios**:
   - **No PKPs**: Mint a new one with `mintPKP(result)`
   - **One PKP**: Use it directly
   - **Multiple PKPs**: Show selection UI

## Additional Improvements

### 1. Enhanced Provider Initialization
Improved `getAuthenticatedProvider()` with better error handling:

```typescript
function getAuthenticatedProvider(authMethod: AuthMethod): BaseProvider {
  const origin = typeof window !== 'undefined' ? window.location.origin : ORIGIN;

  switch (authMethod.authMethodType) {
    case AuthMethodType.GoogleJwt:
      return getGoogleProvider(`${origin}/auth/callback/google`);
    case AuthMethodType.Discord:
      return getDiscordProvider(`${origin}/auth/callback/discord`);
    case AuthMethodType.EthWallet:
      return getEthWalletProvider();
    // ... other cases
    default:
      throw new Error(`Auth provider not initialized for type ${authMethod.authMethodType}.`);
  }
}
```

### 2. Fixed React Hook Dependency
Added `router` to `updateSession` callback dependencies in `AuthContext.tsx`:

```typescript
const updateSession = useCallback(async (
  newPKP: IRelayPKP, 
  newAuthMethod: AuthMethod, 
  shouldRedirect: boolean = false
) => {
  // ... session logic
  if (shouldRedirect) {
    router.push('/space');
  }
}, [router]); // Added router dependency
```

### 3. Removed Test API Key
Removed hardcoded test API key from Lit relay initialization:

```typescript
const litRelay = new LitRelay({
  relayUrl: LitRelay.getRelayUrl(SELECTED_LIT_NETWORK),
  // Removed: relayApiKey: 'test-api-key',
});
```

## Web3Modal Integration Preserved
All Web3Modal integration features remain intact:
- ✅ Web3Modal v5 (Reown AppKit) configuration
- ✅ Wagmi v2 connectors (MetaMask, Coinbase, WalletConnect)
- ✅ Automatic authentication when wallet connects
- ✅ Account/Network management UI
- ✅ SSR support

## Testing & Verification

### Build Verification
```bash
npm run build
# ✅ Compiled successfully
```

### Code Review
```
No review comments found.
```

### Security Scan
```
Analysis Result for 'javascript'. Found 0 alert(s):
- javascript: No alerts found.
```

## Files Changed
1. **utils/lit.ts** - Fixed `authenticateWithEthWallet()` to use EthWalletProvider
2. **context/AuthContext.tsx** - Added router dependency to updateSession

## Impact
- ✅ **No breaking changes** with master branch
- ✅ **PKP flow consistency** across all auth methods
- ✅ **Web3Modal integration** preserved
- ✅ **Improved error handling** in provider initialization
- ✅ **Fixed React Hook warnings**

## Conclusion
The Web3 wallet authentication now properly uses the Lit Protocol's EthWalletProvider, ensuring full compatibility with the master branch's PKP flow and maintaining consistency with Google and Discord authentication patterns.
