/**
 * Domain constants shared by the API. These are business rules (allowed values),
 * so they live on the server and are exposed to the frontend through the API.
 */

export const BUDGETS = ['Not sure yet', 'Under $5,000', '$5,000 – $15,000', '$15,000 – $40,000', '$40,000+'] as const;
export const TIMELINES = ['Not sure yet', 'As soon as possible', 'Within 1–3 months', 'Within 3–6 months', 'Flexible'] as const;
export const CONTACT_METHODS = ['Email', 'Phone', 'Either'] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const OTHER_SERVICE = { value: 'other', label: 'Other / Not sure yet' } as const;

export const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'review', label: 'In Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number]['value'];
export const LEAD_STATUS_VALUES = LEAD_STATUSES.map((s) => s.value) as LeadStatus[];
export const LEAD_STATUS_LABEL: Record<string, string> = Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, s.label]));

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_MODES = ['preview', 'production'] as const;
export type ContentMode = (typeof CONTENT_MODES)[number];

/** Card layouts used by the work grid (maps to aspect ratio + flex basis on the frontend). */
export const WORK_LAYOUTS = ['landscape', 'portrait', 'square'] as const;
export type WorkLayout = (typeof WORK_LAYOUTS)[number];

/** Brand accent colours an editor may pick for cards. */
export const ACCENTS = ['#6941C6', '#FF735F', '#865BEE'] as const;

/** Contact form anti-spam rules. */
export const LEAD_RULES = {
  minFillMs: 3000,
  tokenMaxAgeMs: 12 * 60 * 60 * 1000,
  rateWindowMs: 10 * 60 * 1000,
  rateMax: 5,
} as const;

export const LEADS_PAGE_SIZE = 8;
