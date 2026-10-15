import { Book, BookFace, BookShelfManager } from '@magflip/core';

/**
 * How the books are laid out.
 */
export enum ShelfLayout {
  /** Front covers in rows and columns, each with its title underneath. */
  Grid = 'grid',
  /** Standing on a bookshelf with the spines out, each title on its spine. */
  Shelf = 'shelf',
}

export interface IBookShelfOptions {
  /**
   * Opens a book when the reader presses it. Every book added here is added
   * to it as well.
   */
  manager: BookShelfManager;
  /**
   * Where the books go. Without it the element with id `bookShelf` is used,
   * and created at the end of the body when there is none.
   */
  element?: HTMLElement;
  /** Default `ShelfLayout.Grid`. */
  layout?: ShelfLayout;
}

/**
 * The element a shelf takes when it is given none, as core's shelf once did.
 */
const DEFAULT_ELEMENT_ID = 'bookShelf';
const LAYOUT_CLASS: { [layout in ShelfLayout]: string } = {
  [ShelfLayout.Grid]: 'layout-grid',
  [ShelfLayout.Shelf]: 'layout-shelf',
};
/**
 * The face each layout shows of a book.
 */
const LAYOUT_FACE: { [layout in ShelfLayout]: BookFace } = {
  [ShelfLayout.Grid]: BookFace.Front,
  [ShelfLayout.Shelf]: BookFace.Spine,
};

interface IShelfSlot {
  book: Book;
  /** Holds the book's object, and its title under it in a grid. */
  slotEl: HTMLElement;
}

/**
 * Books for a reader to choose from: a grid of covers, or a bookshelf of
 * spines.
 *
 * The shelf only places books. Each book draws itself (`book.objectEl` in
 * `@magflip/core`) - its cover, its spine with the title, its thickness, the
 * way it comes out under the pointer - and the manager opens the book that is
 * pressed, flying it from its place to the viewer.
 */
export class BookShelf {
  /**
   * The element the books are placed in.
   */
  readonly element: HTMLElement;
  private readonly manager: BookShelfManager;
  private readonly slots = new Map<string, IShelfSlot>();
  private readonly isOwnElement: boolean;
  private _layout: ShelfLayout;

  constructor(options: IBookShelfOptions) {
    this.manager = options.manager;
    this._layout = options.layout ?? ShelfLayout.Grid;

    const found = options.element ?? document.getElementById(DEFAULT_ELEMENT_ID) ?? undefined;
    this.isOwnElement = found === undefined;
    this.element = found ?? createDefaultElement();
    this.element.classList.add('mf-shelf', LAYOUT_CLASS[this._layout]);
    this.element.setAttribute('role', 'list');
  }
  /**
   * How the books are laid out.
   */
  get layout(): ShelfLayout { return this._layout; }
  /**
   * The books on the shelf, in the order they were added.
   */
  get books(): Book[] { return Array.from(this.slots.values(), slot => slot.book); }
  /**
   * Lays the books out another way. Each book turns in its place to show the
   * face the new layout needs.
   */
  setLayout(layout: ShelfLayout): void {
    if (layout === this._layout) { return; }

    this.element.classList.replace(LAYOUT_CLASS[this._layout], LAYOUT_CLASS[layout]);
    this._layout = layout;
    this.slots.forEach(({ book }) => { book.setObjectFace(LAYOUT_FACE[layout]); });
  }
  /**
   * Puts a book at the end of the shelf, and gives it to the manager so that
   * pressing it opens it. A book already on the shelf stays where it is.
   *
   * On a bookshelf a book stands as tall as its pages were designed against
   * the tallest book there, so add it after its pages were imported.
   */
  addBook(book: Book): void {
    if (this.slots.has(book.id)) { return; }

    this.manager.importBookToShelf(book);
    book.setObjectFace(LAYOUT_FACE[this._layout]);

    const slotEl = document.createElement('div');
    slotEl.className = 'mf-shelf-slot';
    slotEl.setAttribute('role', 'listitem');
    slotEl.appendChild(book.objectEl);

    // The title under a cover in a grid. The book already says its title to
    // a screen reader, from its spine.
    const captionEl = document.createElement('div');
    captionEl.className = 'mf-shelf-caption';
    captionEl.setAttribute('aria-hidden', 'true');
    captionEl.textContent = book.title;
    slotEl.appendChild(captionEl);

    this.element.appendChild(slotEl);
    this.slots.set(book.id, { book, slotEl });
    this.updateTallest();
  }
  /**
   * Takes a book off the shelf. The manager can still open it.
   */
  removeBook(id: string): void {
    const slot = this.slots.get(id);
    if (!slot) { return; }

    slot.slotEl.remove();
    this.slots.delete(id);
    this.updateTallest();
  }
  /**
   * Takes every book off, and the shelf's element too if the shelf made it.
   */
  destroy(): void {
    this.slots.forEach(slot => { slot.slotEl.remove(); });
    this.slots.clear();
    if (this.isOwnElement) {
      this.element.remove();
      return;
    }
    this.element.classList.remove('mf-shelf', LAYOUT_CLASS[this._layout]);
    this.element.removeAttribute('role');
    this.element.style.removeProperty('--mf-shelf-tallest');
  }
  /**
   * Tells the CSS the designed height of the tallest book. On a bookshelf
   * every book stands that much shorter than the tallest one.
   */
  private updateTallest(): void {
    const style = this.element.style;
    const tallest = getTallestHeight(this.books);
    const value = tallest > 0 ? `${tallest}` : '';
    if (style.getPropertyValue('--mf-shelf-tallest') === value) { return; }

    // The books take their new heights at once: they turn and rise smoothly
    // for the reader, but a taller book arriving is not something to watch.
    this.element.classList.add('is-resizing');
    if (value) {
      style.setProperty('--mf-shelf-tallest', value);
    } else {
      style.removeProperty('--mf-shelf-tallest');
    }
    void this.element.offsetWidth;
    this.element.classList.remove('is-resizing');
  }
}
/**
 * The height of the tallest book as it was designed, or 0 without books.
 */
function getTallestHeight(books: Book[]): number {
  return books.reduce((tallest, book) => Math.max(tallest, book.size.closed.height), 0);
}

function createDefaultElement(): HTMLElement {
  const element = document.createElement('div');
  element.id = DEFAULT_ELEMENT_ID;
  document.body.appendChild(element);
  return element;
}
