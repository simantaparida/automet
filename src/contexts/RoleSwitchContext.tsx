import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type UserRole = 'owner' | 'coordinator' | 'technician';

interface RoleSwitchContextType {
  actualRole: UserRole | null;
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
  resetRole: () => void;
  fetchUserRole: () => Promise<void>;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const RoleSwitchContext = createContext<RoleSwitchContextType | undefined>(undefined);

const STORAGE_KEY = 'automet_active_role';

/**
 * Calculate which roles a user can view as based on their actual role
 */
function getAvailableRoles(actualRole: UserRole | null): UserRole[] {
  if (!actualRole) return [];
  
  switch (actualRole) {
    case 'owner':
      return ['owner', 'coordinator', 'technician'];
    case 'coordinator':
      return ['coordinator', 'technician'];
    case 'technician':
      return ['technician'];
    default:
      return [];
  }
}

/**
 * Validate that a role switch is allowed (no privilege escalation)
 */
function canSwitchToRole(actualRole: UserRole | null, targetRole: UserRole): boolean {
  if (!actualRole) return false;
  
  const availableRoles = getAvailableRoles(actualRole);
  return availableRoles.includes(targetRole);
}

export function RoleSwitchProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [actualRole, setActualRole] = useState<UserRole | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const availableRoles = getAvailableRoles(actualRole);

  /**
   * Fetch the user's actual role from the API
   */
  const fetchUserRole = useCallback(async () => {
    if (!user) {
      setActualRole(null);
      setActiveRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profile = await response.json();
        const role = profile.role as UserRole | null;
        
        setActualRole(role);
        
        // Restore active role from localStorage if valid
        if (typeof window !== 'undefined') {
          const storedActiveRole = localStorage.getItem(STORAGE_KEY) as UserRole | null;
          
          // Validate stored role is still allowed
          if (storedActiveRole && role && canSwitchToRole(role, storedActiveRole)) {
            setActiveRole(storedActiveRole);
          } else {
            // Default to actual role if stored role is invalid
            setActiveRole(role);
            if (storedActiveRole) {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } else {
          setActiveRole(role);
        }
      } else {
        // If API fails, set both to null
        setActualRole(null);
        setActiveRole(null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setActualRole(null);
      setActiveRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Switch to a different role (role impersonation)
   */
  const switchRole = useCallback((role: UserRole) => {
    if (!actualRole) {
      console.error('Cannot switch role: actual role not loaded');
      return;
    }

    // Validate that the switch is allowed
    if (!canSwitchToRole(actualRole, role)) {
      console.error(`Cannot switch to ${role}: privilege escalation not allowed`);
      return;
    }

    setActiveRole(role);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, role);
    }
  }, [actualRole]);

  /**
   * Reset to actual role
   */
  const resetRole = useCallback(() => {
    setActiveRole(actualRole);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [actualRole]);

  /**
   * Wrapper for fetch that includes active role header
   * Use this for all API requests to ensure role switching works
   */
  const apiFetch = useCallback((url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    
    // Add Content-Type if not present and body is provided
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add active role header if role is switched
    if (activeRole && activeRole !== actualRole) {
      headers.set('X-Active-Role', activeRole);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }, [activeRole, actualRole]);

  // Fetch user role when user changes or on mount
  useEffect(() => {
    if (!authLoading) {
      fetchUserRole();
    }
  }, [user, authLoading, fetchUserRole]);

  // Clear role switch on logout
  useEffect(() => {
    if (!user) {
      setActualRole(null);
      setActiveRole(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [user]);

  const value: RoleSwitchContextType = {
    actualRole,
    activeRole,
    availableRoles,
    isLoading: isLoading || authLoading,
    switchRole,
    resetRole,
    fetchUserRole,
    apiFetch,
  };

  return (
    <RoleSwitchContext.Provider value={value}>
      {children}
    </RoleSwitchContext.Provider>
  );
}

export function useRoleSwitch() {
  const context = useContext(RoleSwitchContext);
  if (context === undefined) {
    throw new Error('useRoleSwitch must be used within a RoleSwitchProvider');
  }
  return context;
}

