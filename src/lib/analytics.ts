/**
 * Analytics tracking utility
 * Supports multiple analytics providers (Mixpanel, PostHog, etc.)
 */

import { logDev } from './logger';

// Analytics provider configuration
const ANALYTICS_PROVIDER =
  process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'mixpanel';
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize analytics (only on client side)
let mixpanel: any = null;
let posthog: any = null;

if (typeof window !== 'undefined') {
  if (ANALYTICS_PROVIDER === 'mixpanel' && MIXPANEL_TOKEN) {
    import('mixpanel-browser').then((mp) => {
      mixpanel = mp.default;
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
      });
    });
  }

  if (ANALYTICS_PROVIDER === 'posthog' && POSTHOG_KEY) {
    import('posthog-js').then((ph) => {
      posthog = ph.default;
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
      });
    });
  }
}

/**
 * Track an analytics event
 * @param event - Event name (e.g., 'signup_completed')
 * @param properties - Event properties/metadata
 */
export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  const isDev = process.env.NODE_ENV === 'development';

  // Development mode: log to console
  if (isDev) {
    logDev(`📊 Analytics Event: ${event}`, properties || {});
  }

  // Client-side tracking only
  if (typeof window === 'undefined') return;

  const enrichedProperties = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    pathname: window.location.pathname,
  };

  // Track via configured provider
  if (ANALYTICS_PROVIDER === 'mixpanel' && mixpanel) {
    mixpanel.track(event, enrichedProperties);
  } else if (ANALYTICS_PROVIDER === 'posthog' && posthog) {
    posthog.capture(event, enrichedProperties);
  }
}

/**
 * Identify a user
 * @param userId - Unique user identifier
 * @param traits - User traits/properties
 */
export function identifyUser(
  userId: string,
  traits?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    logDev(`📊 Identify User: ${userId}`, traits || {});
  }

  if (ANALYTICS_PROVIDER === 'mixpanel' && mixpanel) {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  } else if (ANALYTICS_PROVIDER === 'posthog' && posthog) {
    posthog.identify(userId, traits);
  }
}

/**
 * Reset analytics identity (on logout)
 */
export function resetAnalytics(): void {
  if (typeof window === 'undefined') return;

  if (ANALYTICS_PROVIDER === 'mixpanel' && mixpanel) {
    mixpanel.reset();
  } else if (ANALYTICS_PROVIDER === 'posthog' && posthog) {
    posthog.reset();
  }
}

/**
 * Set user properties
 * @param properties - User properties to set
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  if (ANALYTICS_PROVIDER === 'mixpanel' && mixpanel) {
    mixpanel.people.set(properties);
  } else if (ANALYTICS_PROVIDER === 'posthog' && posthog) {
    posthog.setPersonProperties(properties);
  }
}

/**
 * Track page view
 * @param pathname - Page pathname
 */
export function trackPageView(pathname?: string): void {
  if (typeof window === 'undefined') return;

  const path = pathname || window.location.pathname;

  trackEvent('page_viewed', {
    pathname: path,
    referrer: document.referrer,
  });
}

// Onboarding events
export const OnboardingEvents = {
  signupStarted: (method: 'email' | 'google') =>
    trackEvent('signup_started', { method }),

  signupCompleted: (method: 'email' | 'google') =>
    trackEvent('signup_completed', { method }),

  signupFailed: (error: string) => trackEvent('signup_failed', { error }),

  companyDetailsViewed: () => trackEvent('company_details_viewed'),

  companyDetailsCompleted: (industry: string, currency: string) =>
    trackEvent('company_details_completed', { industry, currency }),

  companyDetailsFailed: (error: string) =>
    trackEvent('company_details_failed', { error }),

  teamInviteViewed: () => trackEvent('team_invite_viewed'),

  teamInviteSent: (
    inviteCount: number,
    technicianCount: number,
    coordinatorCount: number
  ) =>
    trackEvent('team_invite_sent', {
      invite_count: inviteCount,
      technician_count: technicianCount,
      coordinator_count: coordinatorCount,
    }),

  teamInviteSkipped: () => trackEvent('team_invite_skipped'),

  teamInviteFailed: (error: string, failedCount: number) =>
    trackEvent('team_invite_failed', { error, failed_count: failedCount }),

  firstCustomerViewed: () => trackEvent('first_customer_viewed'),

  firstCustomerCreated: (hasContactPerson: boolean, hasPhone: boolean) =>
    trackEvent('first_customer_created', {
      has_contact_person: hasContactPerson,
      has_phone: hasPhone,
    }),

  firstCustomerFailed: (error: string) =>
    trackEvent('first_customer_failed', { error }),

  firstCustomerSkipped: () => trackEvent('first_customer_skipped'),

  firstJobViewed: () => trackEvent('first_job_viewed'),

  firstJobCreated: (
    hasTechnicianAssigned: boolean,
    scheduledHoursFromNow: number
  ) =>
    trackEvent('first_job_created', {
      has_technician_assigned: hasTechnicianAssigned,
      scheduled_hours_from_now: scheduledHoursFromNow,
    }),

  firstJobFailed: (error: string) => trackEvent('first_job_failed', { error }),

  firstJobSkipped: () => trackEvent('first_job_skipped'),

  onboardingCompleted: (
    totalTimeSeconds?: number,
    teamInvitedCount?: number,
    firstJobCreated?: boolean
  ) =>
    trackEvent('onboarding_completed', {
      total_time_seconds: totalTimeSeconds,
      team_invited_count: teamInvitedCount,
      first_job_created: firstJobCreated,
    }),

  // Invite acceptance events
  invitePageViewed: (codeOrToken: string) =>
    trackEvent('invite_page_viewed', { code_or_token: codeOrToken }),

  inviteVerified: (orgName: string, role: string) =>
    trackEvent('invite_verified', { org_name: orgName, role }),

  inviteAccepted: (codeOrToken: string, role: string, orgName: string) =>
    trackEvent('invite_accepted', {
      code_or_token: codeOrToken,
      role,
      org_name: orgName,
    }),

  inviteAcceptFailed: (codeOrToken: string, error: string) =>
    trackEvent('invite_accept_failed', { code_or_token: codeOrToken, error }),
};

// Invite events
export const InviteEvents = {
  inviteSent: (
    inviteId: string,
    contactType: 'phone' | 'email',
    role: string
  ) =>
    trackEvent('invite_sent', {
      invite_id: inviteId,
      contact_type: contactType,
      role,
    }),

  inviteLinkClicked: (inviteId: string, source: 'sms' | 'email' | 'direct') =>
    trackEvent('invite_link_clicked', { invite_id: inviteId, source }),

  inviteAccepted: (
    inviteId: string,
    acceptanceMethod: 'code' | 'link',
    timeToAcceptHours: number
  ) =>
    trackEvent('invite_accepted', {
      invite_id: inviteId,
      acceptance_method: acceptanceMethod,
      time_to_accept_hours: timeToAcceptHours,
    }),

  inviteExpired: (inviteId: string) =>
    trackEvent('invite_expired', { invite_id: inviteId }),
};

// Dashboard events
export const DashboardEvents = {
  dashboardViewed: (isFirstVisit: boolean) =>
    trackEvent('dashboard_viewed', { is_first_visit: isFirstVisit }),

  quickTipsViewed: () => trackEvent('quick_tips_viewed'),

  quickTipsItemClicked: (item: string) =>
    trackEvent('quick_tips_item_clicked', { item }),

  quickTipsDismissed: () => trackEvent('quick_tips_dismissed'),
};

// Team management events
export const TeamEvents = {
  teamManagementViewed: () => trackEvent('team_management_viewed'),

  teamMemberRoleChanged: (userId: string, oldRole: string, newRole: string) =>
    trackEvent('team_member_role_changed', {
      user_id: userId,
      old_role: oldRole,
      new_role: newRole,
    }),

  teamMemberRemoved: (userId: string, role: string) =>
    trackEvent('team_member_removed', { user_id: userId, role }),

  inviteResent: (inviteId: string, method: 'sms' | 'email') =>
    trackEvent('invite_resent', { invite_id: inviteId, method }),

  inviteCancelled: (inviteId: string) =>
    trackEvent('invite_cancelled', { invite_id: inviteId }),
};

// Settings events
export const SettingsEvents = {
  orgSettingsViewed: () => trackEvent('org_settings_viewed'),

  orgSettingsUpdated: (fieldsChanged: string[]) =>
    trackEvent('org_settings_updated', { fields_changed: fieldsChanged }),

  orgDeleteRequested: () => trackEvent('org_delete_requested'),

  orgDeleted: () => trackEvent('org_deleted'),
};
