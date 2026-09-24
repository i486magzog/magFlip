import { ISize } from "../common/dimension";
import { BookFace, IClosedBookPlace } from "../common/models";
import { getSpineRatio } from "../common/bookObjectMetrics";

/**
 * What a book object shows of its book.
 */
export interface IBookObjectData {
  title: string;
  /** Picture for the spine. A cover works too: the spine shows its left edge. */
  spineImage: string;
  frontImage: string;
  backImage: string;
  /** The size of a closed book as it was designed, in its own pixels. */
  size: ISize;
  pageCount: number;
}
/**
 * How a book object behaves.
 */
export interface IBookObjectOptions {
  /**
   * Called when the reader clicks the book, or presses Enter or Space on it.
   * Without it the book is only a picture: it cannot be focused or pressed.
   */
  onActivate?: () => void;
  /**
   * Waits to load and decode the pictures until the book comes near the
   * screen, so that a long shelf loads only what the reader can see. Default
   * true. A copy that must show its pictures in its very first frame - one
   * that is about to fly - sets it to false.
   */
  isLazy?: boolean;
}

const FACE_CLASS: { [face in BookFace]: string } = {
  [BookFace.Front]: 'face-front',
  [BookFace.Spine]: 'face-spine',
  [BookFace.Back]: 'face-back',
};
/**
 * How many colors a book without pictures can get. The title picks one.
 */
const FALLBACK_HUES = 12;

/**
 * One closed book, seen from outside: two covers, a spine with the title on
 * it, and the edges of its pages, drawn as a box in 3D.
 *
 * Its size comes from the book: the covers keep the proportions the book was
 * designed with, and the spine grows with the pages. How tall it is drawn is
 * up to whoever places it, through the `--mf-book-height` CSS variable.
 */
export class BookObjectEl {
  /**
   * The element to place. Its layout box is the face the reader sees: a cover,
   * or the spine.
   */
  readonly element: HTMLElement;
  /**
   * The box that turns inside `element`. The faces are its children.
   */
  readonly bodyEl: HTMLElement;
  private _face: BookFace;
  /**
   * True when the book held the keyboard focus as it was taken out. It gets
   * the focus back when it returns, so a reader on the keyboard goes on from
   * the book they just read.
   */
  private hadFocus = false;

  constructor(data:IBookObjectData, face:BookFace = BookFace.Front, options:IBookObjectOptions = {}) {
    this._face = face;
    ({ element: this.element, bodyEl: this.bodyEl } = this.createElements(data, options));
    this.setSize(data.size, data.pageCount);
    if(options.onActivate){ this.setActivation(options.onActivate); }
  }
  /**
   * The face the reader sees.
   */
  get face():BookFace { return this._face; }
  /**
   * Turns the book to show another face. It turns in place, and its layout box
   * takes the width of the new face.
   */
  setFace(face:BookFace){
    this.element.classList.remove(FACE_CLASS[this._face]);
    this.element.classList.add(FACE_CLASS[face]);
    this._face = face;
  }
  /**
   * Takes the proportions of a book that was resized or grew pages.
   * @param size the size of a closed book as it was designed.
   * @param pageCount the number of pages.
   */
  setSize(size:ISize, pageCount:number){
    const style = this.element.style;
    style.setProperty('--mf-book-aspect', `${size.width / size.height}`);
    style.setProperty('--mf-book-spine', `${getSpineRatio(pageCount)}`);
    style.setProperty('--mf-book-trim-height', `${size.height}`);
  }
  /**
   * Leaves the place of the book empty while the book is somewhere else - open
   * in the viewer, or flying there - and fills it again when it comes back.
   */
  setPickedUp(isPickedUp:boolean){
    const element = this.element;
    if(isPickedUp === element.classList.contains('is-picked-up')){ return; }

    if(isPickedUp){ this.hadFocus = document.activeElement === element; }
    element.classList.toggle('is-picked-up', isPickedUp);
    if(!isPickedUp && this.hadFocus){
      this.hadFocus = false;
      element.focus({ preventScroll: true });
    }
  }
  /**
   * Where the book is drawn and which face the reader sees, or `undefined` when
   * it is not on the screen at all.
   */
  getPlace():IClosedBookPlace|undefined {
    if(!this.element.isConnected){ return undefined; }

    const rect = this.element.getBoundingClientRect();
    if(!rect.width || !rect.height){ return undefined; }

    return {
      box: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
      face: this._face,
      isRaised: this.element.classList.contains('is-raised')
        || matches(this.element, ':hover')
        || matches(this.element, ':focus-visible'),
    };
  }

  private createElements(data:IBookObjectData, options:IBookObjectOptions){
    const element = document.createElement('div');
    element.className = `book-object ${FACE_CLASS[this._face]}`;
    element.style.setProperty('--mf-book-color', fallbackColor(data.title));

    const bodyEl = document.createElement('div');
    bodyEl.className = 'book-object-body';

    const isLazy = options.isLazy !== false;
    const frontEl = this.createFace('front', data.frontImage, isLazy);
    // A cover without a picture still says what the book is.
    const coverTitleEl = document.createElement('span');
    coverTitleEl.className = 'book-object-cover-title';
    coverTitleEl.setAttribute('aria-hidden', 'true');
    coverTitleEl.textContent = data.title;
    frontEl.appendChild(coverTitleEl);

    const spineEl = this.createFace('spine', data.spineImage, isLazy);
    const titleEl = document.createElement('span');
    titleEl.className = 'book-object-title';
    titleEl.textContent = data.title;
    spineEl.appendChild(titleEl);

    bodyEl.append(
      frontEl,
      this.createFace('back', data.backImage, isLazy),
      spineEl,
      this.createFace('edge'),
      this.createFace('top'),
    );
    element.appendChild(bodyEl);
    return { element, bodyEl };
  }
  /**
   * Creates one face of the box, with its picture if it has one.
   * @param image the picture, or `undefined` for a face that never has one
   * (the edges of the pages). An empty picture - a book given no thumbnails -
   * leaves the plain color of the book, as a picture that fails to load does.
   */
  private createFace(name:string, image?:string, isLazy?:boolean):HTMLElement {
    const faceEl = document.createElement('div');
    faceEl.className = `book-object-face ${name}`;
    if(image === undefined){ return faceEl; }
    if(!image){
      faceEl.classList.add('no-image');
      return faceEl;
    }

    const imageEl = document.createElement('img');
    imageEl.alt = '';
    imageEl.decoding = isLazy ? 'async' : 'sync';
    if(isLazy){ imageEl.loading = 'lazy'; }
    // A picture that cannot be loaded leaves the plain color of the book.
    imageEl.addEventListener('error', () => { faceEl.classList.add('no-image'); });
    imageEl.src = image;
    faceEl.appendChild(imageEl);
    return faceEl;
  }
  /**
   * Makes the book something to press, with the mouse or the keyboard.
   */
  private setActivation(onActivate:() => void){
    const element = this.element;
    element.setAttribute('role', 'button');
    element.tabIndex = 0;
    element.addEventListener('click', () => { onActivate(); });
    element.addEventListener('keydown', (event:KeyboardEvent) => {
      if(event.key !== 'Enter' && event.key !== ' '){ return; }
      event.preventDefault();
      onActivate();
    });
  }
}
/**
 * `Element.matches` for a selector an older browser may not know, which then
 * throws instead of answering.
 */
function matches(element:Element, selector:string):boolean {
  try { return element.matches(selector); }
  catch { return false; }
}
/**
 * A color for a book whose pictures are missing, so that such books still
 * differ from one another. The same title always gets the same color.
 */
function fallbackColor(title:string):string {
  let hash = 0;
  for(let i = 0; i < title.length; i++){ hash = (hash * 31 + title.charCodeAt(i)) >>> 0; }
  const hue = (hash % FALLBACK_HUES) * (360 / FALLBACK_HUES);
  return `hsl(${hue}, 32%, 38%)`;
}
