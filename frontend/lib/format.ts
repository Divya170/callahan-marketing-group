export const fmtDateTime = (iso: string | Date) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const fmtDate = (iso: string | Date) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Article date label: drafts read "Unpublished". */
export const articleDate = (a: { isDraft: boolean; publishedAt: string | null }) =>
  a.isDraft || !a.publishedAt ? 'Unpublished' : fmtDate(a.publishedAt);

/** Card layout -> aspect ratio + flex basis used by the work grids. */
export const WORK_LAYOUT_STYLE = {
  landscape: { ratio: '16/10', flex: '2 1 560px' },
  portrait: { ratio: '4/5', flex: '1 1 300px' },
  square: { ratio: '1/1', flex: '1 1 380px' },
} as const;

export const SITE_NAME = 'Callahan Marketing Group';
export const SITE_DESCRIPTION =
  'Callahan Marketing Group is a creative digital marketing agency in Orlando, FL offering digital marketing, SEO, social media, branding and paid advertising.';

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
export const numberWord = (n: number) => WORDS[n] ?? String(n);
