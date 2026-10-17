import type { ArticleBlock } from '../../common/utils/article-body';
import type { WorkLayout } from '../../common/constants/domain';
import type { ServicePoint, ServiceGlyph } from '../../modules/service-catalog/marketing-service.entity';

/** Initial content, taken from the approved prototype. */

export const SEED_SERVICES: Array<{
  slug: string;
  number: string;
  name: string;
  longName: string | null;
  shortDescription: string;
  glyph: ServiceGlyph;
  headline: string;
  description: string;
  audience: string | null;
  extra: string | null;
  pointsLabel: string | null;
  pointsNote: string | null;
  points: ServicePoint[];
  ctaLabel: string;
  visualLabel: string | null;
}> = [
  {
    slug: 'digital-marketing',
    number: '01',
    name: 'Digital Marketing',
    longName: null,
    shortDescription: 'Planning and coordinating your marketing across the online channels your customers already use.',
    glyph: { left: '8px', top: '8px', size: '28px', color: '#6941C6' },
    headline: 'One plan for every channel you’re on.',
    description:
      'Digital marketing is the broad mix of online activity — your website, search, social, email and advertising — and how those pieces work together toward a business goal.',
    audience: 'Businesses that know they need to be more visible online, but aren’t sure which channels to prioritize or in what order.',
    extra: null,
    pointsLabel: null,
    pointsNote: null,
    points: [],
    ctaLabel: 'Discuss digital marketing',
    visualLabel: 'channel plan / campaign visual',
  },
  {
    slug: 'seo',
    number: '02',
    name: 'SEO',
    longName: 'Search Engine Optimization',
    shortDescription: 'Helping the right people find you through organic search, without promises of rankings.',
    glyph: { left: '18px', top: '-6px', size: '50px', color: '#6941C6' },
    headline: 'Your customers are already searching. SEO helps them find you.',
    description:
      'SEO work focuses on discoverability: how search engines understand your website, and how well your content answers what people are looking for. Search results depend on many factors outside anyone’s control, so we don’t promise rankings or traffic numbers.',
    audience: null,
    extra: null,
    pointsLabel: 'Areas we can look at',
    pointsNote: '— scope agreed per project',
    points: [{ title: 'Technical health of your website' }, { title: 'On-page content and structure' }, { title: 'Search visibility review' }],
    ctaLabel: 'Discuss SEO',
    visualLabel: null,
  },
  {
    slug: 'social-media',
    number: '03',
    name: 'Social Media',
    longName: 'Social Media Marketing',
    shortDescription: 'Strategy and campaign execution for the platforms your audience actually uses.',
    glyph: { left: '16px', top: '16px', size: '14px', color: '#FF735F' },
    headline: 'Show up where your audience spends its time.',
    description:
      'Social media marketing covers the strategy behind what you post and why, and the execution of campaigns on the platforms that matter to your audience.',
    audience: 'Businesses posting without a clear plan, or planning a campaign that needs a consistent voice across channels.',
    extra: null,
    pointsLabel: null,
    pointsNote: null,
    points: [],
    ctaLabel: 'Discuss social media',
    visualLabel: null,
  },
  {
    slug: 'branding',
    number: '04',
    name: 'Branding',
    longName: null,
    shortDescription: 'Positioning, identity and the visual consistency that makes a business recognizable.',
    glyph: { left: '-14px', top: '14px', size: '42px', color: '#211D26' },
    headline: 'Be recognizable before you say a word.',
    description:
      'Branding work looks at how your business is positioned, how it presents itself visually, and how consistently that shows up across every place people meet you.',
    audience: null,
    extra: 'It’s a good fit for new businesses, businesses that have outgrown their identity, and those considering a rebrand.',
    pointsLabel: null,
    pointsNote: null,
    points: [],
    ctaLabel: 'Discuss branding',
    visualLabel: null,
  },
  {
    slug: 'paid-advertising',
    number: '05',
    name: 'Paid Advertising',
    longName: null,
    shortDescription: 'Campaign planning, audience targeting and performance evaluation for paid media.',
    glyph: { left: '16px', top: '-16px', size: '42px', color: '#FF735F' },
    headline: 'Put the right message in front of the right people.',
    description:
      'Paid advertising covers planning campaigns, defining who they should reach, and evaluating how they perform against the goals you set at the start.',
    audience: null,
    extra: null,
    pointsLabel: null,
    pointsNote: null,
    points: [
      { title: 'Campaign planning', text: 'Agreeing objectives, channels and budget before anything goes live.' },
      { title: 'Audience targeting', text: 'Defining who each campaign should reach, and who it shouldn’t.' },
      { title: 'Performance evaluation', text: 'Reviewing results against the agreed objectives and adjusting from there.' },
    ],
    ctaLabel: 'Discuss paid advertising',
    visualLabel: null,
  },
];

const CS_CONTEXT = 'Approved project context goes here: who the client is, what they needed, and why the project started.';
const CS_OBJECTIVES = 'The objectives agreed with the client at the start of the project. These describe intent, not results.';
const CS_APPROACH = 'How the work was planned and executed — the strategy, the creative direction and the key decisions along the way.';
const CS_DELIVERABLES = ['Deliverable listed in the CMS', 'Deliverable listed in the CMS', 'Deliverable listed in the CMS'];

export const SEED_WORK: Array<{ slug: string; title: string; subtitle: string; serviceSlug: string; layout: WorkLayout; accent: string }> = [
  { slug: 'concept-study-01', title: 'Concept Study 01', subtitle: 'A key-visual system for a seasonal campaign', serviceSlug: 'branding', layout: 'landscape', accent: '#6941C6' },
  { slug: 'concept-study-02', title: 'Concept Study 02', subtitle: 'A short-form social content series', serviceSlug: 'social-media', layout: 'portrait', accent: '#FF735F' },
  { slug: 'concept-study-03', title: 'Concept Study 03', subtitle: 'A search-led service landing page', serviceSlug: 'seo', layout: 'portrait', accent: '#865BEE' },
  { slug: 'concept-study-04', title: 'Concept Study 04', subtitle: 'A paid media creative set across formats', serviceSlug: 'paid-advertising', layout: 'landscape', accent: '#FF735F' },
  { slug: 'concept-study-05', title: 'Concept Study 05', subtitle: 'A multichannel launch plan', serviceSlug: 'digital-marketing', layout: 'square', accent: '#6941C6' },
  { slug: 'concept-study-06', title: 'Concept Study 06', subtitle: 'An identity refresh presentation', serviceSlug: 'branding', layout: 'square', accent: '#865BEE' },
];

export const SEED_WORK_DETAIL = {
  client: '',
  context: CS_CONTEXT,
  objectives: CS_OBJECTIVES,
  approach: CS_APPROACH,
  deliverables: CS_DELIVERABLES,
  results: '',
};

const SAMPLE_BODY: ArticleBlock[] = [
  {
    type: 'paragraph',
    text: 'This is a sample article layout. When an approved article is published from the CMS, its body replaces this text, using the same typography for headings, paragraphs, lists and links.',
  },
  { type: 'heading', text: 'A section heading' },
  {
    type: 'paragraph',
    text: 'Body copy is set at a comfortable reading size with a measure of around 65–75 characters, so long-form articles stay easy to follow on any screen.',
  },
  {
    type: 'list',
    items: ['Lists are supported for steps and checklists', 'Inline links pick up the brand violet', 'Images can sit inside the column or run full width'],
  },
  { type: 'heading', text: 'Another section' },
  { type: 'paragraph', text: 'Related articles and a contextual call to action appear at the end of every article.' },
];

export const SEED_ARTICLES = [
  {
    slug: 'preparing-for-a-strategy-call',
    title: 'What to prepare before a strategy call',
    excerpt: 'A short checklist of the information that makes a first conversation with an agency more useful.',
    category: 'Process',
    accent: '#FF735F',
    body: SAMPLE_BODY,
  },
  {
    slug: 'search-visibility-without-chasing-rankings',
    title: 'Reading search visibility without chasing rankings',
    excerpt: 'Sample excerpt: how to think about organic search as discoverability rather than a single position.',
    category: 'SEO',
    accent: '#6941C6',
    body: SAMPLE_BODY,
  },
  {
    slug: 'when-a-rebrand-is-the-right-call',
    title: 'When a rebrand is the right call',
    excerpt: 'Sample excerpt: the questions worth asking before changing how your business looks and sounds.',
    category: 'Branding',
    accent: '#865BEE',
    body: SAMPLE_BODY,
  },
];
