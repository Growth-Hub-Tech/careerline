import type { Consent, Consents, DataExport } from '../../lib/api';

const consent = (key: Consent['key'], granted: boolean): Consent => ({
  key,
  granted,
  updated_at: '2026-10-30T08:00:00Z',
});

export const consents = (shared = true, marketing = false, research = true): Consents => ({
  items: [
    consent('share_profile_with_recruiters', shared),
    consent('marketing_emails', marketing),
    consent('product_research', research),
  ],
});

export const dataExport = (status: DataExport['status']): DataExport => ({
  export_id: 4,
  status,
  requested_at: '2026-11-03T09:00:00Z',
  download_url: status === 'ready' ? 'https://files.test/export-4.zip' : null,
  expires_at: status === 'ready' ? '2026-11-10T09:00:00Z' : null,
});
