import type { UserRole } from '@/contexts/RoleSwitchContext';

/**
 * Make an API request with role switch header
 * This ensures all API requests include the X-Active-Role header
 * when a role is switched
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {},
  activeRole?: UserRole | null
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  
  // Add Content-Type if not present and body is provided
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add active role header if provided
  if (activeRole) {
    headers.set('X-Active-Role', activeRole);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

