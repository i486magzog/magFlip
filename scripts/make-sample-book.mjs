/**
 * Builds the published sample book used by `docs/examples/local`.
 *
 * It goes through the same path a real book takes: a document is written with
 * @magflip/doc, validated, and then published into the JSON files the viewer
 * downloads. Run it after changing the document model or the publisher:
 *
 *   npm run build:local -w packages/doc
 *   npm run sample:book
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createBookDoc,
  createElement,
  createOrdersBetween,
  createSurfaceDoc,
  ElementType,
  FillKind,
  hasError,
  LinkKind,
  MediaFit,
  ShapeKind,
  SurfaceKind,
  TextAlign,
  TextBlockType,
  TextFieldKind,
  VerticalAlign,
} from '@magflip/doc';
import { publishBookBundle, validateBookBundle } from '@magflip/doc/authoring';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT_DIR, 'docs/examples/local/sample-book');
/** Images are shared with the prebuild example and resolved from `docs/examples/local/`. */
const IMAGE_DIR = '../prebuild/resources/book1';
const PAGE_SIZE = { width: 600, height: 900 };

/** Assets of the book. The server owns these rows in real life; here they are literals. */
const ASSETS = Object.fromEntries([0, 1, 2, 3, 4, 5].map(index => [`img${index}`, {
  id: `img${index}`,
  kind: 'image',
  mimeType: 'image/jpeg',
  byteSize: 0,
  width: 1000,
  height: 1414,
}]));

function makeText(id, init) {
  const { inlines, align = TextAlign.Start, style, ...rest } = init;
  return createElement(ElementType.Text, {
    id,
    order: 'a1',
    content: { blocks: [{ type: TextBlockType.Paragraph, align, inlines }] },
    style: { ...createElement(ElementType.Text).style, ...style },
    ...rest,
  });
}

function makeImage(id, init) {
  return createElement(ElementType.Image, { id, fit: MediaFit.Cover, order: 'a0', ...init });
}

/**
 * Cover: one full page image with the title over it.
 */
function createCover() {
  return createSurfaceDoc({
    id: 'cover',
    elements: toRecord([
      makeImage('coverPhoto', { assetId: 'img0', x: 0, y: 0, width: PAGE_SIZE.width, height: PAGE_SIZE.height }),
      createElement(ElementType.Shape, {
        id: 'coverScrim',
        order: 'a1',
        x: 0, y: 520, width: PAGE_SIZE.width, height: 380,
        shape: ShapeKind.Rectangle,
        fill: { kind: FillKind.LinearGradient, angle: 0, stops: [
          { offset: 0, color: '#000000cc' },
          { offset: 1, color: '#00000000' },
        ] },
      }),
      makeText('coverTitle', {
        order: 'a2',
        x: 48, y: 640, width: PAGE_SIZE.width - 96, height: 200,
        style: { fontSize: 64, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 },
        inlines: [{ text: 'Magzog' }, { text: ' Sample', marks: { fontWeight: 300 } }],
      }),
    ]),
  });
}
/**
 * A spread carrying one image across both pages, which is the case a
 * page-by-page model cannot express.
 */
function createPanorama() {
  const width = PAGE_SIZE.width * 2;
  return createSurfaceDoc({
    id: 'panorama',
    masterId: 'masterPages',
    elements: toRecord([
      makeImage('panoramaPhoto', { assetId: 'img1', x: 0, y: 0, width, height: PAGE_SIZE.height }),
      makeText('panoramaCaption', {
        x: width / 2 - 260, y: 700, width: 520, height: 120,
        align: TextAlign.Center,
        style: { fontSize: 28, color: '#ffffff', lineHeight: 1.4 },
        inlines: [{ text: 'One image over two pages. It crosses the gutter because both pages are one surface.' }],
      }),
    ]),
  });
}
/**
 * A page designed wider than it is shown. Readers may expand it.
 */
function createExpandable() {
  const extentWidth = PAGE_SIZE.width * 2;
  return createSurfaceDoc({
    id: 'expandable',
    masterId: 'masterPages',
    extent: {
      rect: { x: 0, y: 0, width: extentWidth, height: PAGE_SIZE.height },
      isViewerVisible: true,
    },
    elements: toRecord([
      makeImage('expandablePhoto', { assetId: 'img2', x: 0, y: 0, width: extentWidth, height: PAGE_SIZE.height }),
      makeText('expandableHint', {
        x: 48, y: 96, width: PAGE_SIZE.width - 96, height: 160,
        style: { fontSize: 30, fontWeight: 600, color: '#ffffff', lineHeight: 1.3 },
        inlines: [{ text: 'This page is twice as wide as it is shown. Press Expand.' }],
      }),
      makeText('expandableExtra', {
        order: 'a2',
        x: PAGE_SIZE.width + 48, y: 96, width: PAGE_SIZE.width - 96, height: 160,
        style: { fontSize: 30, fontWeight: 600, color: '#ffffff', lineHeight: 1.3 },
        inlines: [{ text: 'Here is the part only the expanded view shows.' }],
      }),
      // Sits outside the extent: the pasteboard, which is never published.
      makeText('scratchNote', {
        order: 'a3',
        x: extentWidth + 40, y: 40, width: 400, height: 80,
        inlines: [{ text: 'Editor-only note that must never reach a reader.' }],
      }),
    ]),
  });
}
/**
 * A plain page with shapes, text and a link back to the cover.
 */
function createArticle() {
  return createSurfaceDoc({
    id: 'article',
    masterId: 'masterPages',
    background: { kind: FillKind.Solid, color: '#f7f4ee' },
    elements: toRecord([
      createElement(ElementType.Shape, {
        id: 'rule',
        order: 'a0',
        x: 64, y: 150, width: PAGE_SIZE.width - 128, height: 4,
        shape: ShapeKind.Line,
        stroke: { color: '#c2410c', width: 4, dash: [] },
      }),
      makeText('articleTitle', {
        x: 64, y: 180, width: PAGE_SIZE.width - 128, height: 120,
        style: { fontSize: 44, fontWeight: 700, color: '#1f2937', lineHeight: 1.2 },
        inlines: [{ text: 'Elements on a page' }],
      }),
      makeText('articleBody', {
        order: 'a2',
        x: 64, y: 320, width: PAGE_SIZE.width - 128, height: 360,
        style: { fontSize: 22, color: '#374151', lineHeight: 1.6 },
        inlines: [
          { text: 'Text, shapes, images and links are drawn by ' },
          { text: '@magflip/render', marks: { fontWeight: 700, color: '#c2410c' } },
          { text: ', the same code the editor will use. Page numbers come from the master page, so this page never stores its own number.' },
        ],
      }),
      makeText('backToCover', {
        order: 'a3',
        x: 64, y: 700, width: 300, height: 48,
        style: { fontSize: 22, fontWeight: 600, color: '#1d4ed8' },
        inlines: [{ text: 'Back to the cover →', marks: { link: { kind: LinkKind.Page, surfaceId: 'cover', surfaceX: 0 } } }],
      }),
    ]),
  });
}
/**
 * The master: a page number on the outer corner of each page of a spread.
 */
function createMaster() {
  const numberStyle = { fontSize: 20, color: '#9ca3af' };
  return createSurfaceDoc({
    id: 'masterPages',
    elements: toRecord([
      makeText('leftNumber', {
        x: 48, y: PAGE_SIZE.height - 80, width: 120, height: 40,
        style: numberStyle,
        inlines: [{ field: TextFieldKind.PageNumber }],
        verticalAlign: VerticalAlign.Middle,
      }),
      makeText('rightNumber', {
        x: PAGE_SIZE.width * 2 - 168, y: PAGE_SIZE.height - 80, width: 120, height: 40,
        align: TextAlign.End,
        style: numberStyle,
        inlines: [{ field: TextFieldKind.PageNumber }],
        verticalAlign: VerticalAlign.Middle,
      }),
    ]),
  });
}

function toRecord(elements) {
  return Object.fromEntries(elements.map(element => [element.id, element]));
}

function createBundle() {
  const surfaceDocs = [createCover(), createPanorama(), createExpandable(), createArticle()];
  const kinds = [SurfaceKind.Single, SurfaceKind.Spread, SurfaceKind.Single, SurfaceKind.Single];
  const orders = createOrdersBetween(null, null, surfaceDocs.length);
  const master = createMaster();

  const book = createBookDoc({
    id: 'sample',
    meta: { title: 'MagFlip Sample', author: 'Magzog', description: 'Published with @magflip/doc.', language: 'en' },
    pageSize: PAGE_SIZE,
    pageNumbering: { firstNumberedPageIndex: 1, firstNumber: 1 },
    surfaces: Object.fromEntries(surfaceDocs.map((doc, index) => [doc.id, {
      id: doc.id,
      kind: kinds[index],
      order: orders[index],
      name: doc.id,
    }])),
    masters: { [master.id]: { id: master.id, kind: SurfaceKind.Spread, name: 'Page numbers' } },
  });

  return {
    book,
    surfaces: Object.fromEntries([...surfaceDocs, master].map(doc => [doc.id, doc])),
  };
}

async function main() {
  const bundle = createBundle();
  const problems = validateBookBundle(bundle);
  report('validate', problems);
  if (hasError(problems)) { process.exit(1); }

  const result = publishBookBundle(bundle, {
    assets: ASSETS,
    resolveAssetUrl: asset => `${IMAGE_DIR}/page${asset.id.slice(3)}.jpg`,
    resolveFontUrl: font => `fonts/${font.assetId}.woff2`,
    version: 1,
    publishedAt: new Date().toISOString(),
  });
  report('publish', result.problems);
  if (hasError(result.problems)) { process.exit(1); }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(join(OUT_DIR, 'surfaces'), { recursive: true });
  await writeFile(join(OUT_DIR, 'book.json'), `${JSON.stringify(result.book, null, 2)}\n`);
  for (const surface of Object.values(result.surfaces)) {
    await writeFile(join(OUT_DIR, 'surfaces', `${surface.id}.json`), `${JSON.stringify(surface, null, 2)}\n`);
  }

  console.log(`Published ${result.book.pageCount} pages to docs/examples/local/sample-book/`);
}

function report(step, problems) {
  for (const problem of problems) {
    console.log(`[${step}] ${problem.severity}: ${problem.message}`);
  }
}

main();
