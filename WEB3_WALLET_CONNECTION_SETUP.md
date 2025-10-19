# Web3 Wallet Connection Setup Guide

## Overview
This application uses Web3Modal (Reown AppKit) for Web3 wallet connections. To enable full functionality, you need to configure a WalletConnect project ID.

## Required Environment Variable

### NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

**Purpose**: Enables Web3Modal for connecting to various Web3 wallets (MetaMask, WalletConnect, Coinbase Wallet, etc.)

**How to get it**:
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Add it to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

## What Happens Without It?

### Graceful Degradation
The application has been designed to handle missing configuration gracefully:

1. **No Client Errors**: The page loads successfully without breaking
2. **Warning Messages**: Console shows helpful warnings about the missing configuration
3. **User-Friendly Alerts**: When users try to use Web3Modal, they see an informative message
4. **Fallback Options**: Direct wallet connector buttons are still available (though they may not work without Web3Modal in some cases)

### Console Messages You'll See
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set
Web3Modal not available: Error: Please call "createWeb3Modal" before using "useWeb3Modal" hook
```

## Setup Instructions

### For Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your WalletConnect Project ID from [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

3. Update `.env.local` with your project ID:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456...
   ```

4. Restart your development server:
   ```bash
   npm run dev
   ```

### For Production

Add the environment variable to your deployment platform:

**Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` with your project ID
4. Redeploy your application

**Other Platforms:**
Follow your platform's documentation for setting environment variables.

## Testing the Connection

1. Start your development server: `npm run dev`
2. Navigate to the home page
3. Click "Connect your web3 wallet"
4. Click "Connect Wallet" button
5. If configured correctly, Web3Modal should open with wallet options
6. If not configured, you'll see a helpful error message

## Technical Details

### Files Modified

- **`components/Providers.tsx`**: Conditionally initializes Web3Modal only when projectId is available
- **`components/LitAuth/WalletMethods.tsx`**: Handles missing Web3Modal gracefully with try-catch
- **`config/wagmi.ts`**: Exports projectId for use in Web3Modal initialization

### Error Handling Flow

```
User clicks "Connect Wallet"
    ↓
Is projectId set?
    ↓
Yes → Open Web3Modal with wallet options
    ↓
No → Show alert: "Web3Modal is not configured. Please use direct wallet connection options."
```

## Troubleshooting

### Issue: "Web3Modal is not configured" alert appears

**Solution**: 
- Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in your `.env.local` file
- Restart your development server after adding the variable
- Verify the project ID is correct from WalletConnect Cloud

### Issue: Wallet connection still not working

**Checklist**:
1. ✅ Environment variable is set
2. ✅ Development server has been restarted
3. ✅ Project ID is valid and active in WalletConnect Cloud
4. ✅ Browser console shows no errors about projectId
5. ✅ Using a supported browser (Chrome, Firefox, Safari, Edge)

### Issue: Console warnings about Web3Modal

**Note**: Some console warnings are expected during development:
- Lit SDK warnings (safe to ignore in development)
- Network request failures to analytics endpoints (blocked by ad blockers)

## Additional Resources

- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal/about)
- [Reown AppKit Documentation](https://docs.reown.com/appkit/overview)

## Support

If you encounter issues:
1. Check the browser console for specific error messages
2. Verify your WalletConnect project ID is active
3. Ensure you're using a compatible wallet
4. Contact support@goodfaith.church for assistance
