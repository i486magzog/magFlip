import { ElementType, PublishedElement } from '@magflip/doc';

/**
 * A published element of one concrete type, e.g. `PublishedElementOf<ElementType.Image>`.
 */
export type PublishedElementOf<T extends ElementType> = Extract<PublishedElement, { type: T }>;
