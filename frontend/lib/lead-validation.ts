/**
 * Client-side mirror of the server's enquiry rules, for instant feedback.
 * The NestJS API re-validates everything and is the source of truth.
 */

export interface LeadForm {
  name: string;
  email: string;
  company: string;
  website: string;
  service: string;
  goals: string;
  budget: string;
  timeline: string;
  method: string;
  phone: string;
  hp: string;
}

export const LEAD_FIELDS = ['name', 'email', 'company', 'website', 'service', 'goals', 'phone'] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

export const emptyLeadForm = (): LeadForm => ({
  name: '',
  email: '',
  company: '',
  website: '',
  service: '',
  goals: '',
  budget: 'Not sure yet',
  timeline: 'Not sure yet',
  method: 'Email',
  phone: '',
  hp: '',
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WEBSITE_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i;
const PHONE_RE = /^[+()\d\s.-]{7,30}$/;

export function validateLead(f: LeadForm, serviceValues: string[]): Partial<Record<LeadField, string>> {
  const e: Partial<Record<LeadField, string>> = {};
  const s = (v: string) => String(v || '').trim();
  if (s(f.name).length < 2) e.name = 'Please enter your name.';
  else if (s(f.name).length > 100) e.name = 'Name must be 100 characters or fewer.';
  if (!s(f.email)) e.email = 'Please enter your business email.';
  else if (!EMAIL_RE.test(s(f.email)) || s(f.email).length > 254) e.email = 'Enter an email address like name@company.com.';
  if (!s(f.company)) e.company = 'Please enter your company name.';
  else if (s(f.company).length > 120) e.company = 'Company name must be 120 characters or fewer.';
  if (s(f.website) && !WEBSITE_RE.test(s(f.website))) e.website = 'Enter a web address like example.com.';
  if (!serviceValues.includes(f.service)) e.service = 'Choose the service you’re most interested in.';
  if (s(f.goals).length < 20) e.goals = 'Tell us a little more — at least 20 characters.';
  else if (s(f.goals).length > 3000) e.goals = 'Please keep this under 3,000 characters.';
  if ((f.method === 'Phone' || f.method === 'Either') && !PHONE_RE.test(s(f.phone))) e.phone = 'Enter a phone number we can reach you on.';
  return e;
}
