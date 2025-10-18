"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { AuthMethod, IRelayPKP, SessionSigs } from "@lit-protocol/types";
import { AuthMethodType } from "@lit-protocol/constants";
import { LitResourceAbilityRequest } from "@lit-protocol/auth-helpers";
import {
  getSessionSigs,
  signInWithGoogle,
  signInWithDiscord,
  authenticateWithGoogle,
  authenticateWithDiscord,
  authenticateWithEthWallet,
  authenticateWithWebAuthn,
  authenticateWithStytch,
  registerWebAuthn as litRegisterWebAuthn,
  getPKPs,
  mintPKP,
} from "../utils/lit";

// Define state structure
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  pkp: IRelayPKP | null;
  sessionSigs: SessionSigs | null;
  error: Error | null;
  pendingPkpSelection: boolean;
  availablePkps: IRelayPKP[] | null;
  currentAuthMethodForPkpSelection: AuthMethod | null;
}

// Define action types
enum AuthActionType {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  SET_PKP_SELECTION,
  RESET,
}

// Define action structure
type AuthAction =
  | { type: AuthActionType.LOGIN_START }
  | {
      type: AuthActionType.LOGIN_SUCCESS;
      payload: {
        authMethod: AuthMethod;
        pkp: IRelayPKP;
        sessionSigs: SessionSigs;
      };
    }
  | { type: AuthActionType.LOGIN_FAILURE; payload: Error }
  | { type: AuthActionType.LOGOUT }
  | {
      type: AuthActionType.SET_PKP_SELECTION;
      payload: { pkps: IRelayPKP[]; authMethod: AuthMethod };
    }
  | { type: AuthActionType.RESET };

// Define context type
interface AuthContextType extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
  loginWithGoogle: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  loginWithWebAuthn: () => Promise<void>;
  loginWithEthWallet: () => Promise<void>;
  loginWithStytchOtp: (method: "email" | "phone") => Promise<void>;
  registerWebAuthn: () => Promise<void>;
  logOut: () => void;
  setPKP: (pkp: IRelayPKP) => Promise<void>;
}

// Initial state for the reducer
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  authMethod: null,
  pkp: null,
  sessionSigs: null,
  error: null,
  pendingPkpSelection: false,
  availablePkps: null,
  currentAuthMethodForPkpSelection: null,
};

// Reducer function to manage auth state
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionType.LOGIN_START:
      return { ...state, isLoading: true, error: null };
    case AuthActionType.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        authMethod: action.payload.authMethod,
        pkp: action.payload.pkp,
        sessionSigs: action.payload.sessionSigs,
        error: null,
        pendingPkpSelection: false,
      };
    case AuthActionType.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case AuthActionType.LOGOUT:
      return { ...initialState, isLoading: false };
    case AuthActionType.SET_PKP_SELECTION:
      return {
        ...state,
        isLoading: false,
        pendingPkpSelection: true,
        availablePkps: action.payload.pkps,
        currentAuthMethodForPkpSelection: action.payload.authMethod,
      };
    case AuthActionType.RESET:
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  dispatch: () => {},
  loginWithGoogle: async () => {},
  loginWithDiscord: async () => {},
  loginWithWebAuthn: async () => {},
  loginWithEthWallet: async () => {},
  loginWithStytchOtp: async () => {},
  registerWebAuthn: async () => {},
  logOut: () => {},
  setPKP: async () => {},
});

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Centralized session update logic
  const updateSession = useCallback(
    async (newPKP: IRelayPKP, newAuthMethod: AuthMethod) => {
      dispatch({ type: AuthActionType.LOGIN_START });
      try {
        const sessionSigsResult = await getSessionSigs({
          pkpPublicKey: newPKP.publicKey,
          authMethod: newAuthMethod,
          sessionSigsParams: {
            chain: "ethereum",
            resourceAbilityRequests: [
              {
                resource: { resource: "*", resourcePrefix: "lit-litaction" },
                ability: "lit-action-execution",
              } as LitResourceAbilityRequest,
            ],
          },
        });

        localStorage.setItem("lit-auth-method", JSON.stringify(newAuthMethod));
        localStorage.setItem("lit-pkp", JSON.stringify(newPKP));
        localStorage.setItem(
          "lit-session-sigs",
          JSON.stringify(sessionSigsResult)
        );

        dispatch({
          type: AuthActionType.LOGIN_SUCCESS,
          payload: {
            authMethod: newAuthMethod,
            pkp: newPKP,
            sessionSigs: sessionSigsResult,
          },
        });
      } catch (err) {
        console.error("Error updating session:", err);
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: AuthActionType.LOGIN_FAILURE, payload: error });
        throw error;
      }
    },
    []
  );

  // Centralized login handler
  const handleLogin = useCallback(
    async (authenticate: () => Promise<AuthMethod>) => {
      dispatch({ type: AuthActionType.LOGIN_START });
      try {
        const authMethod = await authenticate();
        const pkps = await getPKPs(authMethod);

        if (pkps && pkps.length > 0) {
          if (pkps.length === 1) {
            await updateSession(pkps[0], authMethod);
          } else {
            dispatch({
              type: AuthActionType.SET_PKP_SELECTION,
              payload: { pkps, authMethod },
            });
          }
        } else {
          const newPkp = await mintPKP(authMethod);
          await updateSession(newPkp, authMethod);
        }
      } catch (err) {
        // Don't treat redirect as an error
        if (err instanceof Error && err.message.includes("Redirecting")) {
          return;
        }
        console.error("Login failed:", err);
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: AuthActionType.LOGIN_FAILURE, payload: error });
      }
    },
    [updateSession]
  );

  // Specific login methods
  const loginWithGoogle = useCallback(async () => {
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    if (window.location.pathname !== "/auth/callback/google") {
      await signInWithGoogle(redirectUri);
      return;
    }
    await handleLogin(() => authenticateWithGoogle(window.location.href));
  }, [handleLogin]);

  const loginWithDiscord = useCallback(async () => {
    const redirectUri = `${window.location.origin}/auth/callback/discord`;
    if (window.location.pathname !== "/auth/callback/discord") {
      await signInWithDiscord(redirectUri);
      return;
    }
    await handleLogin(() => authenticateWithDiscord(window.location.href));
  }, [handleLogin]);

  const loginWithWebAuthn = useCallback(
    () => handleLogin(authenticateWithWebAuthn),
    [handleLogin]
  );
  const loginWithEthWallet = useCallback(
    () => handleLogin(authenticateWithEthWallet),
    [handleLogin]
  );
  const loginWithStytchOtp = useCallback(
    (method: "email" | "phone") =>
      handleLogin(() => authenticateWithStytch(method)),
    [handleLogin]
  );

  // Register with WebAuthn
  const registerWebAuthn = useCallback(async () => {
    dispatch({ type: AuthActionType.LOGIN_START });
    try {
      const newPKP = await litRegisterWebAuthn();
      const authMethod = await authenticateWithWebAuthn();
      await updateSession(newPKP, authMethod);
    } catch (err) {
      console.error("Error registering with WebAuthn:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatch({ type: AuthActionType.LOGIN_FAILURE, payload: error });
    }
  }, [updateSession]);

  // Set selected PKP
  const setPKP = useCallback(
    async (selectedPkp: IRelayPKP) => {
      if (!state.currentAuthMethodForPkpSelection) {
        const error = new Error("No auth method available for PKP selection");
        dispatch({ type: AuthActionType.LOGIN_FAILURE, payload: error });
        return;
      }
      await updateSession(selectedPkp, state.currentAuthMethodForPkpSelection);
    },
    [state.currentAuthMethodForPkpSelection, updateSession]
  );

  // Logout
  const logOut = useCallback(() => {
    localStorage.removeItem("lit-auth-method");
    localStorage.removeItem("lit-pkp");
    localStorage.removeItem("lit-session-sigs");
    dispatch({ type: AuthActionType.LOGOUT });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        loginWithGoogle,
        loginWithDiscord,
        loginWithWebAuthn,
        loginWithEthWallet,
        loginWithStytchOtp,
        registerWebAuthn,
        logOut,
        setPKP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);