// src/services/api.ts
import { Platform } from 'react-native';

const DEV_MACHINE_HOST = '192.168.100.63';
const API_HOST =
  Platform.OS === 'android'
    ? '10.0.2.2'
    : __DEV__
      ? DEV_MACHINE_HOST
      : 'localhost';
const API_URL = `http://${API_HOST}:3000/api`;

const parseResponse = async (response: Response, fallbackMessage: string) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

export const loginRequest = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse(response, 'Error al iniciar sesion');
};

export const registerRequest = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return parseResponse(response, 'Error al registrarse');
};

export const getMeRequest = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response, 'Sesion invalida');
};

export const changePasswordRequest = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  return parseResponse(response, 'Error al cambiar la contrasena');
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  return parseResponse(response, 'Error al enviar el codigo');
};

export const resetPasswordRequest = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  return parseResponse(response, 'Error al restablecer la contrasena');
};
