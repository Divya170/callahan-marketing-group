/**
 * Article bodies are stored as structured blocks so the frontend can render them
 * with the site typography. Editors write a lightweight plain-text format:
 *
 *   ## Heading            -> heading block
 *   - item / * item       -> list block (consecutive lines)
 *   anything else         -> paragraph (blank line separates paragraphs)
 */
export type ArticleBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export function parseArticleBody(text: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'paragraph', text: para.join(' ').trim() });
    para = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list });
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h = /^#{1,3}\s+(.*)$/.exec(line);
    const li = /^[-*•]\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push({ type: 'heading', text: h[1].trim() });
    } else if (li) {
      flushPara();
      list.push(li[1].trim());
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks.filter((b) => (b.type === 'list' ? b.items.length > 0 : b.text.length > 0));
}

export function serializeArticleBody(blocks: ArticleBlock[] | null | undefined): string {
  return (blocks || [])
    .map((b) => {
      if (b.type === 'heading') return `## ${b.text}`;
      if (b.type === 'list') return b.items.map((i) => `- ${i}`).join('\n');
      return b.text;
    })
    .join('\n\n');
}
