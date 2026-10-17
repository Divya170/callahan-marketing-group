import { BUDGETS, CONTACT_METHODS, TIMELINES, type ContactMethod } from '../../common/constants/domain';
import { clip, str } from '../../common/utils/text';

export interface LeadInput {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  website?: unknown;
  service?: unknown;
  goals?: unknown;
  budget?: unknown;
  timeline?: unknown;
  method?: unknown;
  phone?: unknown;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const WEBSITE_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i;
export const PHONE_RE = /^[+()\d\s.-]{7,30}$/;

/**
 * Authoritative enquiry validation (same rules and wording as the prototype).
 * Returns a map of field -> message; empty when valid.
 */
export function validateLead(f: LeadInput, serviceValues: string[]): Record<string, string> {
  const e: Record<string, string> = {};
  const name = str(f.name);
  const email = str(f.email);
  const company = str(f.company);
  const website = str(f.website);
  const goals = str(f.goals);
  const method = str(f.method);

  if (name.length < 2) e.name = 'Please enter your name.';
  else if (name.length > 100) e.name = 'Name must be 100 characters or fewer.';

  if (!email) e.email = 'Please enter your business email.';
  else if (!EMAIL_RE.test(email) || email.length > 254) e.email = 'Enter an email address like name@company.com.';

  if (!company) e.company = 'Please enter your company name.';
  else if (company.length > 120) e.company = 'Company name must be 120 characters or fewer.';

  if (website && (!WEBSITE_RE.test(website) || website.length > 200)) e.website = 'Enter a web address like example.com.';

  if (!serviceValues.includes(str(f.service))) e.service = 'Choose the service you’re most interested in.';

  if (goals.length < 20) e.goals = 'Tell us a little more — at least 20 characters.';
  else if (goals.length > 3000) e.goals = 'Please keep this under 3,000 characters.';

  if ((method === 'Phone' || method === 'Either') && !PHONE_RE.test(str(f.phone))) e.phone = 'Enter a phone number we can reach you on.';

  return e;
}

/** Normalises a valid submission into storable values. */
export function sanitizeLead(f: LeadInput) {
  const method: ContactMethod = (CONTACT_METHODS as readonly string[]).includes(str(f.method)) ? (str(f.method) as ContactMethod) : 'Email';
  return {
    name: clip(f.name, 100),
    email: clip(f.email, 254).toLowerCase(),
    company: clip(f.company, 120),
    website: clip(f.website, 200),
    service: str(f.service),
    goals: clip(f.goals, 3000),
    budget: (BUDGETS as readonly string[]).includes(str(f.budget)) ? str(f.budget) : 'Not sure yet',
    timeline: (TIMELINES as readonly string[]).includes(str(f.timeline)) ? str(f.timeline) : 'Not sure yet',
    method,
    phone: method === 'Email' ? '' : clip(f.phone, 30),
  };
}
