import { BookFace, IClosedBookPlace } from "../common/models";
import { getSpineRatio } from "../common/bookObjectMetrics";
import { getFlightPath } from "../common/flightPath";
import { BookObjectEl, IBookObjectData } from "./bookObjectEl";

/**
 * Starts slowly enough to read as a pull, and settles softly.
 */
const FLIGHT_EASING = 'cubic-bezier(.3, .1, .2, 1)';

/**
 * A copy of a book that flies from one place on the screen to another, turning
 * on the way to show the face that waits at the other end.
 *
 * The book itself does not move. Its object stays where it was placed, and the
 * viewer shows the open book once the copy has landed on top of it.
 */
export class BookFlight {
  /**
   * Settles when the copy has landed - or when the flight was cancelled. It
   * never fails.
   */
  readonly finished: Promise<void>;
  private readonly copy: BookObjectEl;
  private readonly animations: Animation[];
  private isRemoved = false;

  /**
   * True when a flight can be shown: the browser animates elements, and the
   * reader has not asked for less motion.
   */
  static canFly():boolean {
    if(typeof window === 'undefined' || typeof document === 'undefined'){ return false; }
    if(typeof document.documentElement.animate !== 'function'){ return false; }
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }
  /**
   * Starts the flight right away.
   * @param data the book that flies.
   * @param from where it takes off.
   * @param to where it lands.
   * @param duration how long it flies, in milliseconds.
   */
  constructor(data:IBookObjectData, from:IClosedBookPlace, to:IClosedBookPlace, duration:number) {
    const aspect = data.size.width / data.size.height;
    const path = getFlightPath(from, to, { aspect, spineRatio: getSpineRatio(data.pageCount) });
    const width = path.height * aspect;

    // The copy is drawn from its front, so that its layout box is a cover,
    // and turns as a whole to show whichever face each frame asks for.
    this.copy = new BookObjectEl(data, BookFace.Front, { isLazy: false });
    const copyEl = this.copy.element;
    copyEl.classList.add('is-flying');
    copyEl.setAttribute('aria-hidden', 'true');
    copyEl.style.setProperty('--mf-book-height', `${path.height}px`);
    document.body.appendChild(copyEl);

    const timing:KeyframeAnimationOptions = { duration, easing: FLIGHT_EASING, fill: 'forwards' };
    this.animations = [
      copyEl.animate(path.frames.map(frame => ({
        offset: frame.offset,
        transform: `translate(${frame.centerX - width / 2}px, ${frame.centerY - path.height / 2}px) scale(${frame.scale})`,
      })), timing),
      this.copy.bodyEl.animate(path.frames.map(frame => ({
        offset: frame.offset,
        transform: `translate3d(${frame.shiftX}px, 0, ${frame.depth}px) rotateY(${frame.angle}deg)`,
      })), timing),
    ];
    this.finished = Promise.all(this.animations.map(animation => animation.finished))
      .then(() => undefined, () => undefined);
  }
  /**
   * Takes the copy away once it has landed, letting it fade over what it
   * landed on.
   * @param fadeDuration how long it fades, in milliseconds. 0 takes it away at once.
   */
  land(fadeDuration:number = 0){
    if(this.isRemoved){ return; }
    if(fadeDuration <= 0){
      this.remove();
      return;
    }
    const fade = this.copy.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeDuration, fill: 'forwards' });
    fade.finished.then(() => { this.remove(); }, () => { this.remove(); });
  }
  /**
   * Stops the flight where it is and takes the copy away.
   */
  cancel(){
    this.animations.forEach(animation => { animation.cancel(); });
    this.remove();
  }

  private remove(){
    if(this.isRemoved){ return; }
    this.isRemoved = true;
    this.copy.element.remove();
  }
}
