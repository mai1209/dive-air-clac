import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMeRequest,
  loginRequest,
  registerRequest,
} from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  updateProfile: (updates: { name: string; avatarUri?: string | null }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
const DEMO_TOKEN = 'demo-token';
const PROFILE_OVERRIDES_KEY = 'profile-overrides';
const DEMO_USER: User = {
  _id: 'demo-user',
  name: 'Demo Diver',
  email: 'demo@divemetric.app',
  avatarUri: null,
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyStoredProfileOverrides = async (baseUser: User) => {
    const rawOverrides = await AsyncStorage.getItem(PROFILE_OVERRIDES_KEY);

    if (!rawOverrides) {
      return baseUser;
    }

    try {
      const overrides = JSON.parse(rawOverrides) as {
        name?: string;
        avatarUri?: string | null;
      };

      return {
        ...baseUser,
        name: overrides.name?.trim() || baseUser.name,
        avatarUri:
          overrides.avatarUri !== undefined
            ? overrides.avatarUri
            : baseUser.avatarUri ?? null,
      };
    } catch {
      return baseUser;
    }
  };

  // Auto login
 useEffect(() => {
  const loadUser = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');

      if (!savedToken) {
        setLoading(false);
        return;
      }

      if (savedToken === DEMO_TOKEN) {
        const mergedDemoUser = await applyStoredProfileOverrides(DEMO_USER);
        setUser(mergedDemoUser);
        setToken(DEMO_TOKEN);
        setLoading(false);
        return;
      }

      const userData = await getMeRequest(savedToken);
      const mergedUser = await applyStoredProfileOverrides({
        ...userData,
        avatarUri: null,
      });

      setUser(mergedUser);
      setToken(savedToken);
    } catch {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  loadUser();
}, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);

    const nextUser = await applyStoredProfileOverrides({
      _id: data._id,
      name: data.name,
      email: data.email,
      avatarUri: null,
    });
    setUser(nextUser);

    setToken(data.token);

    await AsyncStorage.setItem('token', data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await registerRequest(name, email, password);

    const nextUser = await applyStoredProfileOverrides({
      _id: data._id,
      name: data.name,
      email: data.email,
      avatarUri: null,
    });
    setUser(nextUser);

    setToken(data.token);

    await AsyncStorage.setItem('token', data.token);
  };

  const continueAsGuest = async () => {
    const nextUser = await applyStoredProfileOverrides(DEMO_USER);
    setUser(nextUser);
    setToken(DEMO_TOKEN);
    await AsyncStorage.setItem('token', DEMO_TOKEN);
  };

  const updateProfile = async (updates: {
    name: string;
    avatarUri?: string | null;
  }) => {
    setUser(currentUser => {
      if (!currentUser) {
        return currentUser;
      }

      return {
        ...currentUser,
        name: updates.name.trim() || currentUser.name,
        avatarUri:
          updates.avatarUri !== undefined
            ? updates.avatarUri
            : currentUser.avatarUri ?? null,
      };
    });

    await AsyncStorage.setItem(
      PROFILE_OVERRIDES_KEY,
      JSON.stringify({
        name: updates.name.trim(),
        avatarUri: updates.avatarUri ?? null,
      }),
    );
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        continueAsGuest,
        updateProfile,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
