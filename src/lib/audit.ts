import { createServiceRoleClient } from '@/lib/supabase/service-role';

export type AuditEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_reset_requested'
  | 'mfa_enrolled'
  | 'mfa_challenge_success'
  | 'mfa_challenge_failure'
  | 'session_revoked'
  | 'user_created'
  | 'user_suspended'
  | 'role_changed'
  | 'organisation_changed'
  | 'patient_record_accessed'
  | 'referral_accessed'
  | 'clinical_note_accessed'
  | 'clinical_note_created'
  | 'clinical_note_addendum'
  | 'file_uploaded'
  | 'file_previewed'
  | 'file_downloaded'
  | 'referral_status_changed'
  | 'data_exported'
  | 'patient_merged'
  | 'administrative_action'
  | 'security_event';

export interface AuditEventInput {
  eventType: AuditEventType;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  organisationId?: string | null;
  practiceId?: string | null;
  roleAtTime?: string | null;
  outcome?: 'success' | 'failure';
  ipAddress?: string | null;
  userAgent?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * The only writer for public.audit_logs. Uses the service-role client
 * because audit writes must succeed even when the acting user's own RLS
 * grants wouldn't otherwise let them insert an audit row about another
 * organisation's record - this function is the trusted boundary, so every
 * caller must have already performed its own authorisation check before
 * reaching here. audit_logs itself has no UPDATE/DELETE policy for any
 * role, so once written an event can't be altered through the API.
 */
export async function writeAuditEvent(event: AuditEventInput): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('audit_logs').insert({
    event_type: event.eventType,
    entity_type: event.entityType,
    entity_id: event.entityId ?? null,
    actor_id: event.actorId ?? null,
    organisation_id: event.organisationId ?? null,
    practice_id: event.practiceId ?? null,
    role_at_time: event.roleAtTime ?? null,
    outcome: event.outcome ?? 'success',
    ip_address: event.ipAddress ?? null,
    user_agent: event.userAgent ?? null,
    reason: event.reason ?? null,
    metadata: event.metadata ?? null,
  });

  if (error) {
    // Deliberately does not throw: a failed audit write must never block
    // the underlying action the way a failed authorisation check should.
    // It is, however, a serious operational problem - this is a placeholder
    // for the error-monitoring wiring called out in the Stage 1 assessment
    // (§22), not a silent catch.
    console.error('[audit] failed to write audit event', { eventType: event.eventType, error: error.message });
  }
}
