import type { ContentStatus } from '../constants/domain';

/**
 * Publishing rule from the prototype:
 *  - "published" items are always public
 *  - "draft" items are shown only while the site is in preview mode (with a label)
 *  - "archived" items are hidden everywhere
 */
export function visibleStatuses(preview: boolean): ContentStatus[] {
  return preview ? ['published', 'draft'] : ['published'];
}

export function isVisible(status: ContentStatus, preview: boolean): boolean {
  return visibleStatuses(preview).includes(status);
}
