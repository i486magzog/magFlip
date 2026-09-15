import * as Y from 'yjs';
import { SCHEMA_VERSION } from '../common/constants';
import { ElementType, IElement } from '../model/element';
import { IMasterOverride, ISurfaceDoc } from '../model/surface';
import { ITextContent } from '../model/text';
import { readTextContent, writeTextContent } from './textYXml';

/**
 * Top-level keys of a surface room.
 */
export const SURFACE_KEYS = {
  surface: 'surface',
  elements: 'elements',
  masterOverrides: 'masterOverrides',
} as const;
/**
 * Key of the rich text of a text element inside its element map.
 */
const CONTENT_KEY = 'content';

/**
 * Writes a whole surface into a Yjs document, replacing what is there.
 * Used to create a room and to restore one from a snapshot.
 */
export function writeSurfaceDoc(ydoc: Y.Doc, surface: ISurfaceDoc): void {
  ydoc.transact(() => {
    const surfaceMap = ydoc.getMap(SURFACE_KEYS.surface);
    surfaceMap.set('schemaVersion', SCHEMA_VERSION);
    surfaceMap.set('id', surface.id);
    surfaceMap.set('background', surface.background);
    surfaceMap.set('extent', surface.extent);
    surfaceMap.set('masterId', surface.masterId);

    const overrides = ydoc.getMap<IMasterOverride>(SURFACE_KEYS.masterOverrides);
    overrides.clear();
    for (const [key, override] of Object.entries(surface.masterOverrides)) { overrides.set(key, override); }

    const elements = getElementsMap(ydoc);
    elements.clear();
    for (const element of Object.values(surface.elements)) { writeElement(ydoc, element); }
  });
}
/**
 * Reads a surface back from a Yjs document.
 */
export function readSurfaceDoc(ydoc: Y.Doc): ISurfaceDoc {
  const surfaceMap = ydoc.getMap(SURFACE_KEYS.surface);
  const elements: Record<string, IElement> = {};
  for (const [id, elementMap] of getElementsMap(ydoc).entries()) {
    const element = readElementMap(elementMap);
    if (element) { elements[id] = element; }
  }

  return {
    id: String(surfaceMap.get('id') ?? ''),
    background: (surfaceMap.get('background') ?? null) as ISurfaceDoc['background'],
    extent: (surfaceMap.get('extent') ?? null) as ISurfaceDoc['extent'],
    masterId: (surfaceMap.get('masterId') ?? null) as string | null,
    masterOverrides: ydoc.getMap<IMasterOverride>(SURFACE_KEYS.masterOverrides).toJSON() as Record<string, IMasterOverride>,
    elements,
  };
}
/**
 * Writes one element, replacing it when it already exists.
 *
 * Every field becomes its own entry, so two people changing different fields
 * of the same element - one moving it, one recoloring it - keep both changes.
 */
export function writeElement(ydoc: Y.Doc, element: IElement): void {
  ydoc.transact(() => {
    const elementMap = new Y.Map<unknown>();
    getElementsMap(ydoc).set(element.id, elementMap);
    for (const [key, value] of Object.entries(element)) {
      if (key === CONTENT_KEY && element.type === ElementType.Text) { continue; }
      elementMap.set(key, value);
    }
    if (element.type === ElementType.Text) { setTextContent(elementMap, element.content); }
  });
}
/**
 * Changes single fields of an element. Fields that are not in the patch stay
 * as they are, including changes other people made at the same time.
 *
 * A field set to `undefined` is removed, which is how an optional field such
 * as `link` goes away.
 */
export function patchElement(ydoc: Y.Doc, id: string, patch: Partial<IElement>): void {
  const elementMap = getElementsMap(ydoc).get(id);
  if (!elementMap) { return; }

  ydoc.transact(() => {
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) {
        elementMap.delete(key);
        continue;
      }
      if (key === CONTENT_KEY) {
        setTextContent(elementMap, value as ITextContent);
        continue;
      }
      elementMap.set(key, value);
    }
  });
}
/**
 * Removes an element. Removing a group does not remove its children;
 * `buildElementTree` moves them back onto the surface.
 */
export function removeElement(ydoc: Y.Doc, id: string): void {
  getElementsMap(ydoc).delete(id);
}
/**
 * Returns the rich text of a text element, which a rich text editor binds to.
 */
export function getTextFragment(ydoc: Y.Doc, elementId: string): Y.XmlFragment | undefined {
  const content = getElementsMap(ydoc).get(elementId)?.get(CONTENT_KEY);
  return content instanceof Y.XmlFragment ? content : undefined;
}
/**
 * The fields of the surface itself, the ones that are not elements.
 */
export type ISurfaceSettings = Pick<ISurfaceDoc, 'background' | 'extent' | 'masterId'>;

/**
 * Writes one setting of the surface: its background, the area it is designed
 * on, or the master it follows.
 *
 * One entry per field, like the fields of an element: an editor widening the
 * extent and another one picking a master do not overwrite each other.
 */
export function setSurfaceSetting<K extends keyof ISurfaceSettings>(ydoc: Y.Doc, key: K, value: ISurfaceSettings[K]): void {
  ydoc.getMap(SURFACE_KEYS.surface).set(key, value);
}
/**
 * Sets or removes the override of one master element.
 */
export function setMasterOverride(ydoc: Y.Doc, key: string, override: IMasterOverride | null): void {
  const overrides = ydoc.getMap<IMasterOverride>(SURFACE_KEYS.masterOverrides);
  if (override === null) { overrides.delete(key); } else { overrides.set(key, override); }
}
/**
 * Returns the map that holds the elements of the surface.
 */
export function getElementsMap(ydoc: Y.Doc): Y.Map<Y.Map<unknown>> {
  return ydoc.getMap<Y.Map<unknown>>(SURFACE_KEYS.elements);
}

function readElementMap(elementMap: Y.Map<unknown>): IElement | undefined {
  const element: Record<string, unknown> = {};
  for (const [key, value] of elementMap.entries()) {
    element[key] = value instanceof Y.XmlFragment ? readTextContent(value) : value;
  }
  return typeof element['id'] === 'string' && typeof element['type'] === 'string'
    ? element as unknown as IElement
    : undefined;
}

function setTextContent(elementMap: Y.Map<unknown>, content: ITextContent): void {
  const existing = elementMap.get(CONTENT_KEY);
  const fragment = existing instanceof Y.XmlFragment ? existing : new Y.XmlFragment();
  if (fragment !== existing) { elementMap.set(CONTENT_KEY, fragment); }
  writeTextContent(fragment, content);
}
