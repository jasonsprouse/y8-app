# Web3 Wallet Authentication Flow Diagram

## Overview
This document visualizes the complete Web3 wallet authentication flow with Web3Modal, AuthContext, PKP minting, and routing.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY: WEB3 WALLET LOGIN                   │
└─────────────────────────────────────────────────────────────────────┘

Step 1: USER INITIATES WALLET CONNECTION
┌─────────────────────────────────────────┐
│  User navigates to /auth or /           │
│  Clicks "Connect your web3 wallet"      │
│  View changes to 'wallet'               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  WalletMethods Component Renders        │
│  - Shows "Connect Wallet" button        │
│  - Web3Modal integration ready          │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 2: WEB3MODAL OPENS
┌─────────────────────────────────────────┐
│  User clicks "Connect Wallet"           │
│  → handleWeb3ModalOpen() called         │
│  → open() from useWeb3Modal             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Web3Modal UI Opens                     │
│  ┌───────────────────────────────────┐  │
│  │  🔹 MetaMask                      │  │
│  │  🔹 WalletConnect                 │  │
│  │  🔹 Coinbase Wallet               │  │
│  │  🔹 Injected Wallet               │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 3: WALLET SELECTION AND CONNECTION
┌─────────────────────────────────────────┐
│  User selects wallet (e.g., MetaMask)   │
│  Wallet prompts for connection approval │
│  User approves connection               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Wagmi State Updates                    │
│  - isConnected: false → true            │
│  - connector: null → MetaMaskConnector  │
│  - address: "0x..."                     │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 4: AUTO-AUTHENTICATION TRIGGER
┌─────────────────────────────────────────┐
│  WalletMethods useEffect Detects        │
│  ┌───────────────────────────────────┐  │
│  │ useEffect(() => {                 │  │
│  │   if (isConnected) {              │  │
│  │     authWithEthWallet();          │  │
│  │   }                               │  │
│  │ }, [isConnected]);                │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 5: AUTHCONTEXT.LOGINWITHETHWALLET()
┌─────────────────────────────────────────┐
│  AuthContext Flow Begins                │
│  1. setIsLoading(true)                  │
│  2. setError(null)                      │
│  3. Call authenticateWithEthWallet()    │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 6: WALLET MESSAGE SIGNING
┌─────────────────────────────────────────┐
│  authenticateWithEthWallet() in lit.ts  │
│  ┌───────────────────────────────────┐  │
│  │ 1. Get wallet provider            │  │
│  │ 2. Get wallet signer              │  │
│  │ 3. Create message:                │  │
│  │    "Sign in to Y8 App at          │  │
│  │     2025-10-19T15:00:00.000Z"     │  │
│  │ 4. Request signature              │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Wallet Prompts User to Sign            │
│  ┌───────────────────────────────────┐  │
│  │  MetaMask Signature Request       │  │
│  │  ───────────────────────────────  │  │
│  │  Sign in to Y8 App at             │  │
│  │  2025-10-19T15:00:00.000Z         │  │
│  │                                   │  │
│  │  [Cancel]  [Sign]                 │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 7: SIGNATURE CAPTURED, AUTHMETHOD CREATED
┌─────────────────────────────────────────┐
│  Signature Obtained                     │
│  AuthMethod Object Created:             │
│  {                                      │
│    authMethodType: EthWallet,           │
│    accessToken: JSON.stringify({        │
│      address: "0x...",                  │
│      signedMessage: "...",              │
│      signature: "0x..."                 │
│    })                                   │
│  }                                      │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 8: PKP RETRIEVAL
┌─────────────────────────────────────────┐
│  getPKPs(authMethod) Called             │
│  → Queries Lit Protocol Relayer         │
│  → Fetches PKPs linked to wallet        │
└────────────────┬────────────────────────┘
                 │
                 ▼
         ┌───────┴───────┐
         │               │
    NO PKPs         1 PKP        Multiple PKPs
         │               │              │
         ▼               ▼              ▼

Step 9a: MINT NEW PKP        Step 9b: USE EXISTING    Step 9c: PKP SELECTION
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  mintPKP(result)    │   │  Use PKP directly   │   │  Show Selection UI  │
│  → Calls Lit Relay  │   │  pkps[0]            │   │  User picks PKP     │
│  → Mints new PKP    │   └──────────┬──────────┘   └──────────┬──────────┘
│  → Returns PKP:     │              │                         │
│  {                  │              │                         │
│    tokenId: "...",  │              │                         │
│    publicKey: "..." │              │                         │
│    ethAddress: "..."│              │                         │
│  }                  │              │                         │
└──────────┬──────────┘              │                         │
           │                         │                         │
           └─────────────────────────┴─────────────────────────┘
                                     │
                                     ▼

Step 10: SESSION UPDATE
┌─────────────────────────────────────────┐
│  updateSession(pkp, authMethod, true)   │
│  ┌───────────────────────────────────┐  │
│  │ 1. Generate session signatures    │  │
│  │    → getSessionSigs()             │  │
│  │    → Lit Protocol authentication  │  │
│  │                                   │  │
│  │ 2. Update Context State           │  │
│  │    → setPKPState(pkp)             │  │
│  │    → setAuthMethod(authMethod)    │  │
│  │    → setSessionSigs(sigs)         │  │
│  │    → setIsAuthenticated(true)     │  │
│  │                                   │  │
│  │ 3. Save to localStorage           │  │
│  │    → 'lit-auth-method'            │  │
│  │    → 'lit-pkp'                    │  │
│  │    → 'lit-session-sigs'           │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 11: ROUTING TO /SPACE
┌─────────────────────────────────────────┐
│  if (shouldRedirect) {                  │
│    router.push('/space');  ✅           │
│  }                                      │
└────────────────┬────────────────────────┘
                 │
                 ▼

Step 12: USER AUTHENTICATED & REDIRECTED
┌─────────────────────────────────────────┐
│  ✅ User now at /space                  │
│  ✅ isAuthenticated = true              │
│  ✅ PKP available in context            │
│  ✅ Session sigs available              │
│  ✅ Can access protected features       │
└─────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         SESSION PERSISTENCE                          │
└─────────────────────────────────────────────────────────────────────┘

On Page Refresh:
┌─────────────────────────────────────────┐
│  AuthContext useEffect Runs             │
│  ┌───────────────────────────────────┐  │
│  │ 1. Read from localStorage         │  │
│  │    - lit-auth-method              │  │
│  │    - lit-pkp                      │  │
│  │    - lit-session-sigs             │  │
│  │                                   │  │
│  │ 2. Restore Context State          │  │
│  │    - setAuthMethod(stored)        │  │
│  │    - setPKPState(stored)          │  │
│  │    - setSessionSigs(stored)       │  │
│  │    - setIsAuthenticated(true)     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ✅ User stays logged in!               │
└─────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                              LOGOUT FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

User clicks Logout:
┌─────────────────────────────────────────┐
│  logOut() Called                        │
│  ┌───────────────────────────────────┐  │
│  │ 1. Clear Context State            │  │
│  │    - setIsAuthenticated(false)    │  │
│  │    - setAuthMethod(null)          │  │
│  │    - setPKPState(null)            │  │
│  │    - setSessionSigs(null)         │  │
│  │                                   │  │
│  │ 2. Clear localStorage             │  │
│  │    - removeItem('lit-auth-method')│  │
│  │    - removeItem('lit-pkp')        │  │
│  │    - removeItem('lit-session-sigs')│ │
│  │                                   │  │
│  │ 3. Redirect to Home               │  │
│  │    - router.push('/')             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ✅ User logged out, back at /          │
└─────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                       │
└────────────────────────────────────────────────────────────────┘

                         app/layout.tsx
                              │
                              ▼
                      ┌───────────────┐
                      │   Providers   │◄────── Web3Modal
                      │   Component   │        Configuration
                      └───────┬───────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ WagmiProvider│    │ QueryClient  │
            └──────┬───────┘    │   Provider   │
                   │            └──────────────┘
                   │
                   ▼
           ┌──────────────┐
           │ AuthProvider │◄────── Context with:
           │  (AuthContext)│       - isAuthenticated
           └──────┬───────┘       - authMethod
                  │               - pkp
                  │               - sessionSigs
                  │               - loginWithEthWallet
                  │               - etc.
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  ┌─────────┐         ┌─────────────┐
  │  App    │         │ AuthLogin   │
  │ Pages   │         │ Component   │
  └─────────┘         └──────┬──────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ WalletMethods  │◄────── useWeb3Modal
                    │   Component    │        useAccount
                    └────────┬───────┘        useConnect
                             │
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        ┌──────────┐                 ┌──────────┐
        │ Web3Modal│                 │ Wagmi    │
        │   UI     │                 │ Connectors│
        └──────────┘                 └──────────┘
              │                             │
              │                             │
              └──────────────┬──────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ User's Wallet  │
                    │  (MetaMask,    │
                    │ WalletConnect, │
                    │   etc.)        │
                    └────────────────┘
```

## Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                              │
└────────────────────────────────────────────────────────────────┘

1. User Action
   └─> Click "Connect Wallet"

2. Web3Modal UI
   └─> Display wallet options

3. Wallet Connection
   └─> User connects wallet
   └─> Wagmi state: isConnected = true

4. Auto-Authentication
   └─> WalletMethods useEffect detects connection
   └─> Calls authWithEthWallet() (loginWithEthWallet from AuthContext)

5. Message Signing
   └─> authenticateWithEthWallet() in utils/lit.ts
   └─> Wallet prompts user to sign message
   └─> Returns AuthMethod object

6. PKP Management
   └─> getPKPs(authMethod)
   └─> If no PKPs: mintPKP(authMethod)
   └─> Returns PKP object

7. Session Creation
   └─> updateSession(pkp, authMethod, shouldRedirect=true)
   └─> getSessionSigs() generates session signatures
   └─> Updates AuthContext state
   └─> Saves to localStorage

8. Navigation
   └─> router.push('/space')
   └─> User redirected to protected route

9. State Persistence
   └─> localStorage contains:
       - lit-auth-method
       - lit-pkp
       - lit-session-sigs
   └─> On page refresh, state restored from localStorage
```

## Key Integration Points

### 1. Web3Modal ↔ Wagmi
- Web3Modal provides wallet connection UI
- Wagmi manages connection state
- Connected wallet available via `useAccount()`

### 2. Wagmi ↔ WalletMethods Component
- `useAccount()` provides `isConnected` and `connector`
- `useWeb3Modal()` provides `open()` function
- `useEffect` watches `isConnected` to trigger auth

### 3. WalletMethods ↔ AuthContext
- WalletMethods receives `authWithEthWallet` prop
- Maps to `loginWithEthWallet` from AuthContext
- Triggered automatically on connection

### 4. AuthContext ↔ Lit Protocol
- `authenticateWithEthWallet()` signs message
- `getPKPs()` fetches PKPs from Lit Relayer
- `mintPKP()` creates new PKP if needed
- `getSessionSigs()` generates session signatures

### 5. AuthContext ↔ Next.js Router
- `updateSession()` uses `router.push('/space')`
- Redirects user after successful auth
- Protected by RouteGuard component

### 6. AuthContext ↔ localStorage
- Saves auth state for persistence
- Loads auth state on initialization
- Clears on logout

## Success Criteria ✅

All requirements met:

1. ✅ **Web3Modal Integrated**: Proper configuration with AuthContext
2. ✅ **PKP Minting**: Automatic for new users, existing PKP reused
3. ✅ **Routing**: Redirects to /space after authentication
4. ✅ **State Management**: Persists across page refreshes
5. ✅ **Error Handling**: Errors displayed in UI
6. ✅ **Type Safety**: All TypeScript types correct
7. ✅ **Security**: No vulnerabilities found (CodeQL scan)
