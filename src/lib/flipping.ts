import { EventStatus, Point, Rect } from './models.js';
import { PageWindow } from './pageWindow.js';
/**
 * Flipping class
 */
export class Flipping extends PageWindow {
  private _eventStatus:EventStatus = EventStatus.None;
  set eventStatus(status:EventStatus){ this._eventStatus = status; };
  get eventStatus(){ return this._eventStatus; }

  constructor() { 
    super();
  }

  getDegree(centerPoint:Point, mousePoint:Point):number {
    const radian = this.getRadian(centerPoint, mousePoint);
    const degree = radian * 180 / Math.PI;
    return degree;
  }

  getRadian(centerPoint:Point, mousePoint:Point):number {
    const dx = mousePoint.x - centerPoint.x;
    const dy = mousePoint.y - centerPoint.y;
    const radian = Math.atan2(dy, dx);
    return radian;
  }

  getOffset(el:HTMLDivElement) {
    var  top = 0, left = 0, width = 0, height = 0;
    let  bound = el.getBoundingClientRect();
    height = bound.height;
    width = bound.width;
    do {
      bound = el.getBoundingClientRect();
      top += bound.top;
      left += bound.left;
      el = el.offsetParent as HTMLDivElement;
      if (el !== null) {
        bound = el.getBoundingClientRect();
        top -= bound.top - window.scrollY;
        left -= bound.left - window.scrollX;
      }
    } while (el);
    return {
      top:  top,
      left:  left,
      width:  width,
      height:  height,
      bottom: top + height,
      right: left + width,
    };
  }
  /**
   * Ignore the scroll position.
   * @param el 
   * @returns 
   */
  getOffset4Fixed(el:HTMLElement):Rect {
    var  top = 0, left = 0, width = 0, height = 0;
    let  bound = el.getBoundingClientRect();
    height = bound.height;
    width = bound.width;
    do {
      bound = el.getBoundingClientRect();
      top += bound.top;
      left += bound.left;
      el = el.offsetParent as HTMLElement;
      if (el !== null) {
        bound = el.getBoundingClientRect();
        top -= bound.top;
        left -= bound.left;
      }
    } while (el);
    return {
      top:  top,
      left:  left,
      width:  width,
      height:  height,
      bottom: top + height,
      right: left + width,
    };
  }
  // getLength(x1:number, y1:number, x2:number, y2:number):number {
  getLength(point1:Point, point2:Point):number {
    return Math.sqrt(Math.pow(point1.x-point2.x, 2) + Math.pow(point1.y-point2.y, 2));
  }
  findPointOnLine(a:Point, b:Point, distance:number):Point{
    // AB 벡터 계산
    const ab = { x: b.x - a.x, y: b.y - a.y };
    // 벡터 AB의 길이 계산
    const abLength = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    // AB 벡터의 단위 벡터 계산 (방향 벡터)
    const unitVector = { x: ab.x / abLength, y: ab.y / abLength };
    // A에서 B 방향으로 distance만큼 떨어진 점 계산
    const point = {
        x: a.x + unitVector.x * distance,
        y: a.y + unitVector.y * distance
    };

    return point;
  }
  curAutoFlipWidth = 0;
  /**
   * 
   * @param isAutoFlippingInCorner 
   * @param backPage1El 
   * @param maskShapeOnBackPage1 
   * @param maskShapeOnBackPage2 
   * @param onComplete 
   */
  private animateReadyToFlip(
    isAutoFlippingInCorner:boolean,
    // curAutoFlipWidth:number,
    backPage1El:HTMLElement,
    maskShapeOnBackPage1:SVGPolygonElement,
    maskShapeOnBackPage2:SVGPolygonElement, 
    onComplete:()=>void
  ) {
    // let currentValue = isAutoFlippingInCorner ? 0 : 20;
    let currentValue = this.curAutoFlipWidth;
    const targetValue = isAutoFlippingInCorner ? 20 : 0;
    const duration = 500; // 1초 동안 애니메이션
    const startTime = performance.now();

    if(currentValue == targetValue){ return; }

    const animate = (time: number) => {
        if( (isAutoFlippingInCorner && this.eventStatus == EventStatus.AutoFlipOutCorner)
          || (!isAutoFlippingInCorner && this.eventStatus == EventStatus.AutoFlipInCorner)){ return ; }

        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        if(isAutoFlippingInCorner){ currentValue = progress * targetValue; }
        else { currentValue = currentValue - progress * currentValue; }
        this.curAutoFlipWidth = currentValue;

        maskShapeOnBackPage1?.setAttribute('points', `0,900 0,${900 - currentValue} ${currentValue},900`);
        maskShapeOnBackPage2?.setAttribute('points', `600,900 ${600 - currentValue},900 600,${900 - currentValue}`);
        backPage1El.style.top = `${-currentValue}px`;
        backPage1El.style.left = `${600 - currentValue}px`;
        backPage1El.style.transform = `rotate(${(Math.PI / 2)}rad)`;

        if (progress < 1) { requestAnimationFrame(animate); } 
        else { onComplete(); }
    }

    requestAnimationFrame(animate);
  }
  /**
   * 
   * @param pageEl 
   * @param maskShapeOnBackPage1 
   * @param maskShapeOnBackPage2 
   * @param onComplete 
   */
  flipInCorner(pageEl:HTMLElement, maskShapeOnBackPage1:SVGPolygonElement, maskShapeOnBackPage2:SVGPolygonElement, onComplete:()=>void) {
    this.animateReadyToFlip(true, pageEl, maskShapeOnBackPage1, maskShapeOnBackPage2, onComplete);
  }
  /**
   * 
   * @param pageEl 
   * @param maskShapeOnBackPage1 
   * @param maskShapeOnBackPage2 
   * @param onComplete 
   */
  flipOutCorner(pageEl:HTMLElement, maskShapeOnBackPage1:SVGPolygonElement, maskShapeOnBackPage2:SVGPolygonElement, onComplete:()=>void) {
    // const autoFlipWidth = this.curAutoFlipWidth > 0 ? this.curAutoFlipWidth ;
    this.animateReadyToFlip(false, pageEl, maskShapeOnBackPage1, maskShapeOnBackPage2, onComplete);
  }

  easeInOutQuad(t:number):number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  flipOut(
    viewport:Point, 
    bottomCenter:Point, 
    containerRect:Rect,
    backPage1El:HTMLElement,
    maskShapeOnBackPage1: SVGPolygonElement,
    maskShapeOnBackPage2: SVGPolygonElement,
    onComplete:()=>void 
  ){
    const startTime = performance.now();
    const duration:number = 1000; // 2000ms
    const {x:startX, y:startY} = viewport;
    const {right:endX, bottom:endY} = containerRect;

    const animationFrame = (currentTime:number) => {
      if(this.eventStatus == EventStatus.Flipping){ return; }

      const elapsed = (currentTime - startTime) / duration; // 0 ~ 1 사이 값
      const progress = Math.min(elapsed, 1); // 진행률 계산 (최대 1)
      
      const easingProgress = this.easeInOutQuad(progress); // easing 함수 적용

      const currentX = startX + (endX - startX) * easingProgress;
      const currentY = startY + (endY - startY) * easingProgress;

      // box.style.transform = `translate(${currentX}px, ${currentY}px)`;
      // backPage1El.style.top = `${currentY}px`;
      // backPage1El.style.left = `${currentX}px`;
      this.flip(
        {x:currentX, y:currentY},
        bottomCenter,
        containerRect,
        backPage1El,
        maskShapeOnBackPage1,
        maskShapeOnBackPage2
      )

      if (progress < 1) { requestAnimationFrame(animationFrame); }
      else { onComplete(); }
    }

    requestAnimationFrame(animationFrame); // 애니메이션 시작

  }

  flip(
    viewport:Point, 
    bottomCenter:Point, 
    containerRect:Rect,
    backPage1El:HTMLElement,
    maskShapeOnBackPage1: SVGPolygonElement,
    maskShapeOnBackPage2: SVGPolygonElement
  ){
    // The position of mouse pointer in the viewport.
    if(this.getLength(bottomCenter, viewport) > 600){
      viewport = this.findPointOnLine(bottomCenter, viewport, 600);
    }
    const radian = this.getRadian({x:containerRect.right, y:containerRect.bottom}, viewport);
    if(backPage1El){
      const b = containerRect.bottom - viewport.y;
      const c = containerRect.right - viewport.x;
      const d = c / Math.cos(Math.PI*3/2 + 2*radian);
      const e = b / Math.cos(Math.PI*3/2 + 2*radian);
      // Mask
      maskShapeOnBackPage1?.setAttribute('points', `0,900 0,${900-d} ${e},900`);
      maskShapeOnBackPage2?.setAttribute('points', `600,900 ${600-e},900 600,${900-d}`);
      // Back Page 1
      backPage1El.style.top = `${viewport.y - containerRect.top - containerRect.height}px`;
      backPage1El.style.left = `${viewport.x - containerRect.left}px`;
      backPage1El.style.transform = `rotate(${2*radian}rad)`;
    }
  }
}