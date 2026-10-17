/** Shapes returned by the NestJS API. */

export interface SiteInfo {
  contentMode: 'preview' | 'production';
  preview: boolean;
  booking: { enabled: boolean; url: string };
  contact: {
    name: string;
    email: string;
    phone: string;
    phoneHref: string;
    addressLine1: string;
    addressLine2: string;
    mapsUrl: string;
  };
}

export interface ServiceItem {
  slug: string;
  number: string;
  name: string;
  longName: string | null;
  shortDescription: string;
  glyph: { left: string; top: string; size: string; color: string };
  headline: string;
  description: string;
  audience: string | null;
  extra: string | null;
  pointsLabel: string | null;
  pointsNote: string | null;
  points: { title: string; text?: string }[];
  ctaLabel: string;
  visualLabel: string | null;
}

export type WorkLayout = 'landscape' | 'portrait' | 'square';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface WorkCard {
  slug: string;
  title: string;
  subtitle: string;
  serviceSlug: string;
  serviceName: string;
  layout: WorkLayout;
  accent: string;
  isDraft: boolean;
}

export interface WorkList {
  items: WorkCard[];
  filters: { slug: string; name: string; count: number }[];
  activeCat: string;
  total: number;
  filtered: number;
}

export interface WorkDetail {
  item: WorkCard & {
    client: string;
    statusLabel: string;
    context: string;
    objectives: string;
    approach: string;
    deliverables: string[];
    results: string;
    publishedAt: string | null;
  };
  next: { slug: string; title: string } | null;
}

export type ArticleBlock = { type: 'heading'; text: string } | { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

export interface ArticleCard {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  accent: string;
  isDraft: boolean;
  publishedAt: string | null;
}

export interface ArticleList {
  items: ArticleCard[];
  categories: string[];
  activeCat: string;
  total: number;
}

export interface ArticleDetail {
  item: ArticleCard & { body: ArticleBlock[] };
  related: { slug: string; title: string; category: string }[];
}

export interface LeadOptions {
  services: { value: string; label: string }[];
  budgets: string[];
  timelines: string[];
  methods: string[];
}

export type LeadStatus = 'new' | 'review' | 'contacted' | 'closed';

export interface LeadRow {
  id: string;
  name: string;
  company: string;
  email: string;
  service: string;
  serviceName: string;
  status: LeadStatus;
  statusLabel: string;
  createdAt: string;
}

export interface LeadList {
  items: LeadRow[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  counts: Record<'all' | LeadStatus, number>;
  statuses: { value: LeadStatus; label: string }[];
}

export interface LeadDetail extends LeadRow {
  website: string;
  goals: string;
  budget: string;
  timeline: string;
  method: string;
  phone: string;
  notes: string;
  userAgent: string;
  statusChangedAt: string;
  history: { status: LeadStatus; label: string; at: string }[];
}

export interface ContentRow {
  id: number;
  type: 'work' | 'article';
  typeLabel: string;
  title: string;
  meta: string;
  path: string;
  status: ContentStatus;
  updatedAt: string;
}

export interface AdminCaseStudy {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  serviceSlug: string;
  client: string;
  context: string;
  objectives: string;
  approach: string;
  deliverables: string[];
  results: string;
  layout: WorkLayout;
  accent: string;
  status: ContentStatus;
  sortOrder: number;
  publishedAt: string | null;
}

export interface AdminArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  accent: string;
  bodyText: string;
  status: ContentStatus;
  sortOrder: number;
  publishedAt: string | null;
}

export interface AdminSettings {
  contentMode: 'preview' | 'production';
  bookingUrl: string;
  simulateServerError: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
}
