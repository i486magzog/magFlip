import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Book, BookFace, BookShelfManager } from '@magflip/core';
import { BookShelf, ShelfLayout } from '../src/bookShelf';

const COVER = 'cover.jpg';

function makeBook(id: string, height = 900, lastPageIndex = 15): Book {
  const book = new Book({
    id,
    title: `Title of ${id}`,
    lastPageIndex,
    thumbnails: { spine: COVER, small: COVER, medium: COVER, cover: { front: COVER, back: COVER } },
  });
  book.importPages([], { width: 600, height });
  return book;
}

describe('BookShelf', () => {
  let manager: BookShelfManager;

  beforeEach(() => {
    document.body.innerHTML = '';
    manager = new BookShelfManager();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('takes the #bookShelf element that is already there', () => {
    const existing = document.createElement('div');
    existing.id = 'bookShelf';
    document.body.appendChild(existing);

    const shelf = new BookShelf({ manager });

    expect(shelf.element).toBe(existing);
    expect(existing.classList.contains('mf-shelf')).toBe(true);
    expect(existing.classList.contains('layout-grid')).toBe(true);
  });

  it('makes a #bookShelf element when there is none, and takes it away again', () => {
    const shelf = new BookShelf({ manager, layout: ShelfLayout.Shelf });

    expect(document.getElementById('bookShelf')).toBe(shelf.element);
    expect(shelf.element.classList.contains('layout-shelf')).toBe(true);

    shelf.destroy();
    expect(document.getElementById('bookShelf')).toBeNull();
  });

  it('places the object of each book it is given, turned for the layout', () => {
    const shelf = new BookShelf({ manager, element: document.createElement('div'), layout: ShelfLayout.Shelf });
    const book = makeBook('a');

    shelf.addBook(book);

    expect(shelf.element.querySelectorAll('.mf-shelf-slot')).toHaveLength(1);
    const slot = shelf.element.querySelector('.mf-shelf-slot');
    expect(slot?.contains(book.objectEl)).toBe(true);
    expect(book.objectFace).toBe(BookFace.Spine);
    expect(book.objectEl.classList.contains('face-spine')).toBe(true);
    // The title is on the spine, and under the cover when the books lie in a grid.
    expect(book.objectEl.textContent).toContain('Title of a');
    expect(slot?.querySelector('.mf-shelf-caption')?.textContent).toBe('Title of a');
  });

  it('gives each book to the manager, which opens the one that is pressed', () => {
    const shelf = new BookShelf({ manager, element: document.createElement('div') });
    const open = vi.spyOn(manager, 'pickupAndView').mockImplementation(() => undefined);
    const book = makeBook('a');

    shelf.addBook(book);
    expect(manager.getBook('a')).toBe(book);

    book.objectEl.click();
    expect(open).toHaveBeenCalledWith(book);

    book.objectEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('keeps a book that is added twice in its first place', () => {
    const shelf = new BookShelf({ manager, element: document.createElement('div') });
    const book = makeBook('a');

    shelf.addBook(book);
    shelf.addBook(makeBook('b'));
    shelf.addBook(book);

    expect(shelf.books.map(each => each.id)).toEqual(['a', 'b']);
    expect(shelf.element.querySelectorAll('.mf-shelf-slot')).toHaveLength(2);
  });

  it('turns every book when the layout changes', () => {
    const shelf = new BookShelf({ manager, element: document.createElement('div') });
    const books = [makeBook('a'), makeBook('b')];
    books.forEach(book => { shelf.addBook(book); });

    shelf.setLayout(ShelfLayout.Shelf);

    expect(shelf.layout).toBe(ShelfLayout.Shelf);
    expect(shelf.element.classList.contains('layout-shelf')).toBe(true);
    expect(shelf.element.classList.contains('layout-grid')).toBe(false);
    books.forEach(book => { expect(book.objectFace).toBe(BookFace.Spine); });

    shelf.setLayout(ShelfLayout.Grid);
    books.forEach(book => { expect(book.objectFace).toBe(BookFace.Front); });
  });

  it('tells the CSS how tall the tallest book was designed', () => {
    const shelf = new BookShelf({ manager, element: document.createElement('div') });

    shelf.addBook(makeBook('short', 700));
    shelf.addBook(makeBook('tall', 900));
    expect(shelf.element.style.getPropertyValue('--mf-shelf-tallest')).toBe('900');

    shelf.removeBook('tall');
    expect(shelf.element.style.getPropertyValue('--mf-shelf-tallest')).toBe('700');
    expect(shelf.element.querySelectorAll('.mf-shelf-slot')).toHaveLength(1);

    // An empty shelf has no tallest book.
    shelf.removeBook('short');
    expect(shelf.element.style.getPropertyValue('--mf-shelf-tallest')).toBe('');
  });

  it('leaves an element it was given as it found it', () => {
    const element = document.createElement('section');
    const shelf = new BookShelf({ manager, element });
    shelf.addBook(makeBook('a'));

    shelf.destroy();

    expect(element.className).toBe('');
    expect(element.children).toHaveLength(0);
    expect(element.style.getPropertyValue('--mf-shelf-tallest')).toBe('');
  });
});
