import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link as RouterLink, LinkProps as RouterLinkProps, useNavigate } from "react-router-dom";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("pongrush_token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Router Component (maintains compatibility with old API)
interface RouterProps {
  path: string;
  Component: React.ComponentType<any>;
  protectedRoute?: boolean;
  [key: string]: any;
}

// This is exported but not used directly - Routes/Route from react-router-dom are used in App
export function Router({ path, Component, protectedRoute, ...rest }: RouterProps) {
  const element = <Component {...rest} />;
  
  if (protectedRoute) {
    return (
      <Route path={path} element={<ProtectedRoute>{element}</ProtectedRoute>} />
    );
  }
  
  return <Route path={path} element={element} />;
}

// Link Component (wraps react-router-dom Link)
interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <RouterLink to={to} {...rest}>
      {children}
    </RouterLink>
  );
}

// Redirect function
export function redirect(to: string) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// Hook to get programmatic navigation
export function useRedirect() {
  return useNavigate();
}

// BrowserRouter wrapper for App
export { BrowserRouter, Routes, Route, Navigate, ProtectedRoute };
