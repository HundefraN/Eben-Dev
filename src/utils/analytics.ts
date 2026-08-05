import { supabase } from '../core/supabase';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateClientId() {
  let clientId = localStorage.getItem('analytics_client_id');
  if (!clientId) {
    clientId = generateUUID();
    localStorage.setItem('analytics_client_id', clientId);
  }
  return clientId;
}

function generateSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export async function trackEvent(eventType: string, actionDetails: Record<string, any> = {}) {
  try {
    const sessionId = generateSessionId();
    const clientId = generateClientId();
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    const pageUrl = window.location.pathname;

    const eventName = actionDetails.eventName || actionDetails.event_name || eventType;
    const stageName = actionDetails.stageName || actionDetails.stage_name || (typeof actionDetails.stage === 'string' ? actionDetails.stage : (typeof actionDetails.stage === 'number' ? `Stage ${actionDetails.stage}` : null));
    const durationSeconds = typeof actionDetails.durationSeconds === 'number'
      ? actionDetails.durationSeconds
      : (typeof actionDetails.duration_seconds === 'number' ? actionDetails.duration_seconds : null);

    const payload = {
      session_id: sessionId,
      client_id: clientId,
      event_name: eventName,
      event_type: eventType,
      stage_name: stageName,
      action_details: actionDetails,
      user_agent: userAgent,
      page_url: pageUrl,
      url: url,
      duration_seconds: durationSeconds,
    };

    const { error } = await supabase.from('analytics_events').insert([payload]);

    if (error) {
      console.error('[Analytics] Supabase insert failed with error:', error, 'Payload:', payload);
    }
  } catch (error) {
    console.error('[Analytics] Exception in trackEvent:', error);
  }
}

let sessionStartTime = 0;

export function initSessionDurationTracking() {
  if (sessionStartTime === 0) {
    sessionStartTime = Date.now();
    
    const onUnload = () => {
      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      if (durationSeconds > 0) {
        // Send a synchronous-like event or just rely on standard fetch
        trackEvent('session_end', { durationSeconds });
      }
    };

    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        onUnload();
      } else {
        // Optional: reset start time if considering it a new session on return, 
        // but typically session persists across tab visibility if they don't close.
      }
    });
  }
}
