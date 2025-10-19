import {
    DiscordProvider,
    GoogleProvider,
    EthWalletProvider,
    WebAuthnProvider,
    BaseProvider,
    LitRelay,
    StytchAuthFactorOtpProvider,
  } from '@lit-protocol/lit-auth-client';
  import { LitNodeClient } from '@lit-protocol/lit-node-client';
  import {
    AuthMethodScope,
    AuthMethodType,
    LIT_ABILITY,
  } from '@lit-protocol/constants';
  import {
    AuthMethod,
    GetSessionSigsProps,
    IRelayPKP,
    SessionSigs,
    LIT_NETWORKS_KEYS,
  } from '@lit-protocol/types';
  import { LitPKPResource } from '@lit-protocol/auth-helpers';
  
  export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
  export const ORIGIN =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? `https://${DOMAIN}`
      : `http://${DOMAIN}:3000`;
  
  export const SELECTED_LIT_NETWORK = 
    (process.env.NEXT_PUBLIC_LIT_NETWORK as LIT_NETWORKS_KEYS) || 
    'datil';
  
  export const litNodeClient: LitNodeClient = new LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: SELECTED_LIT_NETWORK,
    debug: true,
  });
  
  (async () => {
    try {
      await litNodeClient.connect();
    } catch (err) {
      console.error("Error connecting to Lit Node:", err);
    }
  })();
  
  const litRelay = new LitRelay({
    relayUrl: LitRelay.getRelayUrl(SELECTED_LIT_NETWORK),
    relayApiKey: 'test-api-key',
  });
  
  let googleProvider: GoogleProvider;
  let discordProvider: DiscordProvider;
  let ethWalletProvider: EthWalletProvider;
  let webAuthnProvider: WebAuthnProvider;
  let stytchEmailOtpProvider: StytchAuthFactorOtpProvider<'email'>;
  let stytchSmsOtpProvider: StytchAuthFactorOtpProvider<'sms'>;
  
  /**
   * @function getAuthenticatedProvider
   * @description Get the provider that is authenticated with the given auth method
   * @param {AuthMethod} authMethod - The auth method to get the provider for
   * @returns {BaseProvider} The authenticated provider
   */
  function getAuthenticatedProvider(authMethod: AuthMethod): BaseProvider {
    const providers = {
      [AuthMethodType.GoogleJwt]: googleProvider,
      [AuthMethodType.Discord]: discordProvider,
      [AuthMethodType.EthWallet]: ethWalletProvider,
      [AuthMethodType.WebAuthn]: webAuthnProvider,
      [AuthMethodType.StytchEmailFactorOtp]: stytchEmailOtpProvider,
      [AuthMethodType.StytchSmsFactorOtp]: stytchSmsOtpProvider,
    };
  
    return providers[authMethod.authMethodType];
  }
  
  /**
   * @function getGoogleProvider
   * @description Get the Google provider
   * @param {string} redirectUri - The redirect URI for Google auth
   * @returns {GoogleProvider} The Google provider
   */
  function getGoogleProvider(redirectUri: string): GoogleProvider {
    if (!googleProvider) {
      googleProvider = new GoogleProvider({
        relay: litRelay,
        litNodeClient,
        redirectUri,
      });
    }
    return googleProvider;
  }

  /**
   * @function getDiscordProvider
   * @description Get the Discord provider
   * @param {string} redirectUri - The redirect URI for Discord auth
   * @returns {DiscordProvider} The Discord provider
   */
  function getDiscordProvider(redirectUri: string): DiscordProvider {
    if (!discordProvider) {
      discordProvider = new DiscordProvider({
        relay: litRelay,
        litNodeClient,
        redirectUri,
      });
    }
    return discordProvider;
  }

  /**
   * @function getEthWalletProvider
   * @description Get the Ethereum wallet provider
   * @returns {EthWalletProvider} The Ethereum wallet provider
   */
  function getEthWalletProvider(): EthWalletProvider {
    if (!ethWalletProvider) {
      ethWalletProvider = new EthWalletProvider({
        relay: litRelay,
        litNodeClient,
        domain: DOMAIN,
        origin: ORIGIN,
      });
    }
    return ethWalletProvider;
  }

  /**
   * @function getWebAuthnProvider
   * @description Get the WebAuthn provider
   * @returns {WebAuthnProvider} The WebAuthn provider
   */
  function getWebAuthnProvider(): WebAuthnProvider {
    if (!webAuthnProvider) {
      webAuthnProvider = new WebAuthnProvider({
        relay: litRelay,
        litNodeClient,
      });
    }
    return webAuthnProvider;
  }

  /**
   * @function getStytchEmailOtpProvider
   * @description Get the Stytch email OTP provider
   * @returns {StytchAuthFactorOtpProvider<'email'>} The Stytch email OTP provider
   */
  function getStytchEmailOtpProvider(): StytchAuthFactorOtpProvider<'email'> {
    if (!stytchEmailOtpProvider) {
      stytchEmailOtpProvider = new StytchAuthFactorOtpProvider<'email'>(
        {
          relay: litRelay,
          litNodeClient,
        },
        { appId: process.env.NEXT_PUBLIC_STYTCH_PROJECT_ID },
        'email',
      );
    }
    return stytchEmailOtpProvider;
  }

  /**
   * @function getStytchSmsOtpProvider
   * @description Get the Stytch SMS OTP provider
   * @returns {StytchAuthFactorOtpProvider<'sms'>} The Stytch SMS OTP provider
   */
  function getStytchSmsOtpProvider(): StytchAuthFactorOtpProvider<'sms'> {
    if (!stytchSmsOtpProvider) {
      stytchSmsOtpProvider = new StytchAuthFactorOtpProvider<'sms'>(
        {
          relay: litRelay,
          litNodeClient,
        },
        { appId: process.env.NEXT_PUBLIC_STYTCH_PROJECT_ID },
        'sms',
      );
    }
    return stytchSmsOtpProvider;
  }
  
  /**
   * @function isSocialLoginSupported
   * @description Check if a social login provider is supported
   * @param {string} provider - The provider to check
   * @returns {boolean} Whether the provider is supported
   */
  export function isSocialLoginSupported(provider: string): boolean {
    return ['google', 'discord'].includes(provider);
  }
  
  /**
   * @function signInWithGoogle
   * @description Redirect to Google login
   * @param {string} redirectUri - The redirect URI for Google auth
   */
  export async function signInWithGoogle(redirectUri: string): Promise<void> {
    const googleProvider = getGoogleProvider(redirectUri);
    await googleProvider.signIn();
  }
  
  /**
   * @function authenticateWithGoogle
   * @description Get auth method object from Google redirect
   * @param {string} redirectUri - The redirect URI for Google auth
   * @returns {Promise<AuthMethod>} The auth method object
   */
  export async function authenticateWithGoogle(redirectUri: string): Promise<AuthMethod> {
    const googleProvider = getGoogleProvider(redirectUri);
    return await googleProvider.authenticate();
  }
  
  /**
   * @function signInWithDiscord
   * @description Redirect to Discord login
   * @param {string} redirectUri - The redirect URI for Discord auth
   */
  export async function signInWithDiscord(redirectUri: string): Promise<void> {
    const discordProvider = getDiscordProvider(redirectUri);
    await discordProvider.signIn();
  }
  
  /**
   * @function authenticateWithDiscord
   * @description Get auth method object from Discord redirect
   * @param {string} redirectUri - The redirect URI for Discord auth
   * @returns {Promise<AuthMethod>} The auth method object
   */
  export async function authenticateWithDiscord(redirectUri: string): Promise<AuthMethod> {
    const discordProvider = getDiscordProvider(redirectUri);
    return await discordProvider.authenticate();
  }
  
  /**
   * @function authenticateWithEthWallet
   * @description Get auth method object by signing a message with an Ethereum wallet
   * @param {string} [address] - The user's wallet address
   * @param {(message: string) => Promise<string>} [signMessage] - The function to sign a message
   * @returns {Promise<AuthMethod>} The auth method object
   */
  export async function authenticateWithEthWallet(
    address?: string,
    signMessage?: (message: string) => Promise<string>
  ): Promise<AuthMethod> {
    const ethWalletProvider = getEthWalletProvider();
    return await ethWalletProvider.authenticate({ address, signMessage });
  }
  
  /**
   * @function registerWebAuthn
   * @description Register a new WebAuthn credential
   * @returns {Promise<IRelayPKP>} The new PKP
   */
  export async function registerWebAuthn(): Promise<IRelayPKP> {
    const webAuthnProvider = getWebAuthnProvider();
    const options = await webAuthnProvider.register();
    const txHash = await webAuthnProvider.verifyAndMintPKPThroughRelayer(options);
    const response = await webAuthnProvider.relay.pollRequestUntilTerminalState(txHash);
    if (response.status !== 'Succeeded') {
      throw new Error('Minting failed');
    }
    return {
      tokenId: response.pkpTokenId,
      publicKey: response.pkpPublicKey,
      ethAddress: response.pkpEthAddress,
    };
  }
  
  /**
   * @function authenticateWithWebAuthn
   * @description Authenticate with a WebAuthn credential
   * @returns {Promise<AuthMethod>} The auth method object
   */
  export async function authenticateWithWebAuthn(): Promise<AuthMethod> {
    const webAuthnProvider = getWebAuthnProvider();
    return await webAuthnProvider.authenticate();
  }
  
  /**
   * @function authenticateWithStytch
   * @description Authenticate with Stytch
   * @param {string} accessToken - The Stytch access token
   * @param {string} [userId] - The user's ID
   * @param {string} [method] - The authentication method ('email' or 'sms')
   * @returns {Promise<AuthMethod>} The auth method object
   */
  export async function authenticateWithStytch(
    accessToken: string,
    userId?: string,
    method?: string
  ): Promise<AuthMethod> {
    const provider = method === 'email' ? getStytchEmailOtpProvider() : getStytchSmsOtpProvider();
    return await provider?.authenticate({ accessToken, userId });
  }
  
  /**
   * @function getSessionSigs
   * @description Generate session sigs for the given params
   * @param {object} params - The params for generating session sigs
   * @param {string} params.pkpPublicKey - The user's PKP public key
   * @param {AuthMethod} params.authMethod - The auth method used
   * @param {GetSessionSigsProps} params.sessionSigsParams - The session sigs params
   * @returns {Promise<SessionSigs>} The session sigs
   */
  export async function getSessionSigs({
    pkpPublicKey,
    authMethod,
    sessionSigsParams,
  }: {
    pkpPublicKey: string;
    authMethod: AuthMethod;
    sessionSigsParams: GetSessionSigsProps;
  }): Promise<SessionSigs> {
    await litNodeClient.connect();
    return await litNodeClient.getPkpSessionSigs({
      ...sessionSigsParams,
      pkpPublicKey,
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LIT_ABILITY.PKPSigning,
        },
      ],
    });
  }
  
  /**
   * @function updateSessionSigs
   * @description Update the session sigs
   * @param {GetSessionSigsProps} params - The session sigs params
   * @returns {Promise<SessionSigs>} The updated session sigs
   */
  export async function updateSessionSigs(params: GetSessionSigsProps): Promise<SessionSigs> {
    return await litNodeClient.getSessionSigs(params);
  }
  
  /**
   * @function getPKPs
   * @description Fetch PKPs associated with the given auth method
   * @param {AuthMethod} authMethod - The auth method to fetch PKPs for
   * @returns {Promise<IRelayPKP[]>} A list of PKPs
   */
  export async function getPKPs(authMethod: AuthMethod): Promise<IRelayPKP[]> {
    try {
      const provider = getAuthenticatedProvider(authMethod);
      const allPKPs = await provider.fetchPKPsThroughRelayer(authMethod);
      if (!Array.isArray(allPKPs)) {
        console.error('PKPs response is not an array:', allPKPs);
        return [];
      }
      return allPKPs;
    } catch (error) {
      console.error('Error fetching PKPs:', error);
      throw error;
    }
  }
  
  /**
   * @function mintPKP
   * @description Mint a new PKP for the current auth method
   * @param {AuthMethod} authMethod - The auth method to mint a PKP for
   * @returns {Promise<IRelayPKP>} The new PKP
   */
  export async function mintPKP(authMethod: AuthMethod): Promise<IRelayPKP> {
    const provider = getAuthenticatedProvider(authMethod);
    const options = {
      permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
    };
  
    let txHash: string;
  
    if (authMethod.authMethodType === AuthMethodType.WebAuthn) {
      const webAuthnProvider = provider as WebAuthnProvider;
      const webAuthnInfo = await webAuthnProvider.register();
      txHash = await webAuthnProvider.verifyAndMintPKPThroughRelayer(webAuthnInfo, options);
    } else {
      txHash = await provider.mintPKPThroughRelayer(authMethod, options);
    }
  
    let attempts = 3;
    let response = null;
  
    while (attempts > 0) {
      try {
        response = await provider.relay.pollRequestUntilTerminalState(txHash);
        break;
      } catch (err) {
        console.warn('Minting failed, retrying...', err);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts--;
      }
    }
  
    if (!response || response.status !== 'Succeeded') {
      throw new Error('Minting failed');
    }
  
    return {
      tokenId: response.pkpTokenId,
      publicKey: response.pkpPublicKey,
      ethAddress: response.pkpEthAddress,
    };
  }