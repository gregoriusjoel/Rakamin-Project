"use client";

import AppRouter from './AppRouter';

export function LoginRoute() {
  return <AppRouter initialPage="login" />;
}

export function RegisterRoute() {
  return <AppRouter initialPage="register" />;
}

export function DashboardRoute() {
  return <AppRouter initialPage="dashboard" />;
}

export default {
  LoginRoute,
  RegisterRoute,
  DashboardRoute,
};
