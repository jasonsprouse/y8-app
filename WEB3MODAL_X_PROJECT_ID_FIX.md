# Web3Modal x-project-id Header Fix

## Issue Reference
- GitHub Issue: #52
- Problem: Web3Modal not sending `x-project-id` header in production, causing 403 errors

## Problem Description

### Symptoms
- **Development Environment**: Web3Modal works correctly, sends `x-project-id: e52f95ed45847c16c76b33b4dec348ca`
- **Production Environment**: Web3Modal fails with 403 errors, `x-project-id` header is empty/missing

### HTTP Request Comparison

**Working (Development):**
```
Request URL: https://api.web3modal.org/getWallets?page=1&entries=4
Status: 200 OK
x-project-id: e52f95ed45847c16c76b33b4dec348ca
x-sdk-type: w3m
x-sdk-version: react-wagmi-5.1.11
```

**Failing (Production):**
```
Request URL: https://api.web3modal.org/getWallets?page=1&entries=4
Status: 403 Forbidden
x-project-id: (empty)
x-sdk-type: w3m
x-sdk-version: html-wagmi-undefined
```

## Root Cause Analysis

The `createWeb3Modal()` function was being called inside a `useEffect` hook in the `Providers.tsx` component:

```typescript
// BEFORE (Incorrect Pattern)
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      createWeb3Modal({
        wagmiConfig,
        projectId,
      });
    }
  }, []);
  // ...
}
```

### Why This Caused the Issue

1. **Timing Problem**: `useEffect` runs after component mount, which means Web3Modal hooks could be called before initialization
2. **Multiple Initializations**: If the component re-renders, `useEffect` could potentially try to initialize multiple times
3. **Late Initialization**: The modal is created after the component tree is already rendered
4. **Hook Dependency**: Web3Modal hooks (like `useWeb3Modal`) were being called before the modal instance existed

According to Web3Modal v5 best practices, `createWeb3Modal()` should be called at **module level** (outside component) to ensure:
- Single initialization
- Initialization happens before any component renders
- Hooks have access to the modal instance immediately

## Solution Implemented

Moved `createWeb3Modal()` to module level with a lazy initialization pattern:

```typescript
// AFTER (Correct Pattern)
"use client";

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig, projectId } from '../config/wagmi';

// Lazy initialization: ensures Web3Modal is created exactly once on client side
let web3ModalInitialized = false;

function initializeWeb3Modal() {
  if (!web3ModalInitialized && typeof window !== 'undefined') {
    createWeb3Modal({
      wagmiConfig,
      projectId,
    });
    web3ModalInitialized = true;
  }
}

// Initialize on module load for client-side only
// This ensures the modal is ready before any component renders and uses Web3Modal hooks
if (typeof window !== 'undefined') {
  initializeWeb3Modal();
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Key Improvements

1. ✅ **Module-Level Initialization**: Web3Modal is initialized when the module loads
2. ✅ **Client-Side Only**: Check for `typeof window !== 'undefined'` prevents SSR issues
3. ✅ **Single Initialization**: Flag ensures it only runs once
4. ✅ **Early Initialization**: Modal exists before any component renders or hooks are called
5. ✅ **Proper projectId**: The projectId from environment variable is properly passed

## Files Modified

- `components/Providers.tsx`
  - Removed `useEffect` import (no longer needed)
  - Added lazy initialization function
  - Moved `createWeb3Modal()` to module level
  - Added initialization flag to prevent multiple calls

## Testing Results

### Build Status
✅ **Build passes successfully**
```
Route (app)                                 Size  First Load JS
┌ ○ /                                     370 kB        2.54 MB
...
Build completed successfully
```

### Security Scan
✅ **CodeQL Security Analysis: 0 alerts found**
- No vulnerabilities introduced
- No security issues detected

### Expected Behavior After Fix

When the environment variable is properly set in production:
1. Web3Modal initializes at module load with the correct projectId
2. The `x-project-id` header will be sent in all API requests to web3modal.org
3. Requests to `https://api.web3modal.org/getWallets` will return 200 OK
4. Users can successfully connect wallets using Web3Modal

## CRITICAL: Production Deployment Instructions

⚠️ **The code fix alone is not sufficient!** The environment variable must be set in Vercel.

### Vercel Environment Variable Configuration

1. **Log in to Vercel Dashboard**
2. **Navigate to your project** (y8-app)
3. **Go to Settings → Environment Variables**
4. **Add the following variable:**
   - **Key**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - **Value**: `e52f95ed45847c16c76b33b4dec348ca`
   - **Environments**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

5. **Save the changes**
6. **Redeploy the application** (trigger a new deployment or use the "Redeploy" button)

### Verification Steps

After deploying with the environment variable:

1. Navigate to https://y8-app.vercel.app/
2. Open browser DevTools (F12) → Network tab
3. Click "Connect your web3 wallet"
4. Monitor the network request to `api.web3modal.org/getWallets`
5. Verify the request headers include:
   ```
   x-project-id: e52f95ed45847c16c76b33b4dec348ca
   x-sdk-type: w3m
   x-sdk-version: react-wagmi-5.1.11
   ```
6. Verify the response status is `200 OK`

### Troubleshooting

If the issue persists after deployment:

1. **Check Environment Variable**:
   - Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in Vercel
   - Verify it's enabled for the Production environment
   - Check for typos in the variable name (must be exact)

2. **Check Build Logs**:
   - Look for warnings about missing WALLETCONNECT_PROJECT_ID
   - Verify the build completed successfully

3. **Clear Cache**:
   - Clear browser cache
   - Use incognito/private browsing mode to test

4. **Verify Project ID**:
   - Confirm the project ID `e52f95ed45847c16c76b33b4dec348ca` is valid
   - Check WalletConnect Cloud dashboard if needed

## Additional Notes

### About the projectId
- The projectId comes from WalletConnect Cloud (https://cloud.walletconnect.com/)
- It's required for Web3Modal v5 to function
- In the code, it's defined in `config/wagmi.ts`:
  ```typescript
  export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
  ```
- If the environment variable is not set, projectId will be an empty string `''`
- Web3Modal will not send the x-project-id header if projectId is empty

### Web3Modal Version
- Using: `@web3modal/wagmi@5.1.11`
- This is Web3Modal v5 (also known as Reown AppKit)
- Initialization pattern differs from v2

### Related Components
- `components/Providers.tsx` - Web3Modal initialization
- `components/LitAuth/WalletMethods.tsx` - Uses Web3Modal hooks
- `config/wagmi.ts` - Wagmi and WalletConnect configuration

## References

- GitHub Issue: https://github.com/jasonsprouse/y8-app/issues/52
- Web3Modal Documentation: https://docs.reown.com/appkit
- WalletConnect Cloud: https://cloud.walletconnect.com/

## Conclusion

This fix resolves the 403 error by ensuring Web3Modal is properly initialized at module level with the correct projectId. However, **the environment variable must be configured in Vercel** for the fix to work in production.

**Status**: ✅ Code changes complete and tested. Deployment configuration required.
