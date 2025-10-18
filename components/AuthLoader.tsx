"use client";

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthLoader() {
  const { dispatch } = useAuth();

  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedAuthMethod = localStorage.getItem("lit-auth-method");
        const storedPKP = localStorage.getItem("lit-pkp");
        const storedSessionSigs = localStorage.getItem("lit-session-sigs");

        if (storedAuthMethod && storedPKP && storedSessionSigs) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              authMethod: JSON.parse(storedAuthMethod),
              pkp: JSON.parse(storedPKP),
              sessionSigs: JSON.parse(storedSessionSigs),
            },
          });
        } else {
          dispatch({ type: 'RESET' });
        }
      } catch (err) {
        console.error("Error loading auth from localStorage:", err);
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: err instanceof Error ? err : new Error(String(err)),
        });
      }
    };

    loadAuth();
  }, [dispatch]);

  return null;
}