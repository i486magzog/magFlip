import { MZMath } from '../mzMath';
import { AutoFlipType, EventStatus, Zone } from '../models';
import { PageWindow } from './pageWindow';
import { FlipDiagonals } from './flipDiagonals';
import { Point, Rect } from '../shape';
import { Gutter } from './gutter';
import { FlipActionLine } from './flipActionLine';
import { ISize } from '../dimension';
import { FlipData } from './flipData';
/**
 * Flipping class
 */
export class Flipping extends PageWindow {
  /**
   * Current status of the event, initialized to 'None'.
   */
  private _eventStatus:EventStatus = EventStatus.None;
  /**
   * Setter for eventStatus to update the current status of the event.
   */
  set eventStatus(status:EventStatus){ this._eventStatus = status; };
  /**
   * Getter for eventStatus to retrieve the current event status.
   */
  get eventStatus(){ return this._eventStatus; }
  /**
   * The area representing the flipping region. 
   * The width is the same as the opened book width.
   */
  flipGRect:Rect = new Rect();
  /**
   * The gutter of the book, representing the central area between the pages.
   * The position 
   */
  gutter:Gutter = new Gutter();
  /**
   * The current zone where the event is occurring, initialized to the right-bottom (RB) zone.
   */
  eventZone:Zone = Zone.RB;
  /**
   * The previous zone where the event occurred, initialized to the right-top (RT) zone.
   */
  oldEventZone:Zone = Zone.RT;
  /**
   * The center point of the active flipping process.
   */
  activeCenterGP:Point = new Point();
  /**
   * The point representing the active corner during the flip.
   */
  activeCornerGP:Point = new Point();
  /**
   * The opposite corner to the active corner during the flip.
   */
  activeCornerOppositeGP:Point = new Point();
  /**
   * Diagonal values used to calculate flipping geometry.
   * The diagonals are depends on the dragging corner point.
   */
  diagonals:FlipDiagonals = new FlipDiagonals();
  /**
   * A line that represents the action of flipping a page.
   * The width is the same as the opened book width.
   */
  flipActionLine:FlipActionLine = new FlipActionLine();
  /**
   * The current width being used for automatic flipping when the AutoFlipType is FixedWidth.
   */
  curAutoFlipWidth = 0;
  /**
   * The width for automatic flipping, initialized to 20.
   */
  autoFlipWidth = 20;
  /**
   * Returns and sets current mouse pointer global point.
   */
  curMouseGP:Point = new Point();
  /** 
   * Settings related to the flipping behavior.
   */
  setting: {
    autoFlip: {
      type: AutoFlipType
    }
  } = { autoFlip: { type: AutoFlipType.MouseCursor }}

  constructor() {  super(); }
  /**
   * Initializes the flipping process, setting the event zone and configuring the flip action line, 
   * diagonal properties, and active corner points.
   * @param eventZone The zone where the event is happening (e.g., LT, RT).
   * @param mouseGP The current position of the mouse pointer.
   * @param containerRect The rectangle defining the boundaries of the container element.
   */
  setInitFlipping(eventZone:Zone, mouseGP:Point, containerRect:Rect){
    this.eventZone = eventZone;
    let flipActionLineGY:number = mouseGP.y;
    // If dragging a corner, the flipActionLineGY will be the top or bottom of the container.
    switch(eventZone){
      case Zone.LT:
      case Zone.RT:
        flipActionLineGY = this.gutter.top;
        break;
      case Zone.LB:
      case Zone.RB:
        flipActionLineGY = this.gutter.bottom;
        break;
    }
    //
    // Flip Rect
    //
    const left = containerRect.left == this.gutter.left ? containerRect.left - containerRect.width : containerRect.left;
    const right = containerRect.right == this.gutter.right ? containerRect.right + containerRect.width : containerRect.right;
    this.flipGRect = new Rect({
      left: left,
      right: right,
      top: this.gutter.top,
      bottom: this.gutter.bottom,
      width: right - left,
      height: this.gutter.height
    })
    //
    // FlipActionLine, Diagonals, ActiveCenterGP
    //
    this.flipActionLine = new FlipActionLine(left, right, flipActionLineGY);
    this.diagonals = new FlipDiagonals(this.flipGRect, this.flipActionLine.centerP);
    this.activeCenterGP = this.flipActionLine.centerP;
    //
    // ActiveCornerGP
    //
    let originX = 0;
    switch(eventZone){
      case Zone.LT:
      case Zone.LC:
      case Zone.LB:
        originX = this.flipGRect.width/2;
        this.activeCornerGP = this.flipActionLine.leftP;
        break;
      case Zone.RT:
      case Zone.RC:
      case Zone.RB:
        originX = 0;
        this.activeCornerGP = this.flipActionLine.rightP;
        break;
    }
    this.activeCornerOppositeGP = MZMath.findSymmetricPoint(this.activeCenterGP, this.activeCornerGP);
    //
    // Transform origin
    //
    const originY = this.flipActionLine.y - containerRect.top;
    // page2El.style.transformOrigin = `${originX}px ${originY}px`;
    const docEl = document.documentElement;
    docEl.style.setProperty('--page2-origin', `${originX}px ${originY}px`)
    //
    const zoneWidthStr = getComputedStyle(docEl).getPropertyValue('--zone-width').trim();
    this.autoFlipWidth = parseFloat(zoneWidthStr) * 0.9;
  }
  /**
   * Returns the point of the corner that flipping page has to go back.
   * @param mouseGP The current position of the mouse pointer.
   * @returns The corner point closest to the mouse pointer.
   */
  getTargetCorner(mouseGP:Point){
    const activeLength = MZMath.getLength(mouseGP, this.activeCornerGP);
    const inactiveLength = MZMath.getLength(mouseGP, this.activeCornerOppositeGP);
    return inactiveLength < activeLength ? this.activeCornerOppositeGP : this.activeCornerGP;
  }
  /**
   * Retrieves information needed to execute the flip, such as the target corner, 
   * whether the flip is snapping back, and whether the flip is forward.
   * @param mouseGP The current position of the mouse pointer.
   * @returns An object containing the target corner, snap-back status, and flip direction.
   */
  getInfoToFlip(mouseGP:Point){
    const targetCornerGP = this.getTargetCorner(mouseGP);
    const isSnappingBack = targetCornerGP == this.activeCornerGP;
    const isForward = targetCornerGP.x < this.gutter.left ? true : false;
    return {
      targetCornerGP: targetCornerGP,
      isSnappingBack: isSnappingBack,
      isFlippingForward: isForward,
    }
  }
  /**
   * Animates the page flip action, gradually moving from the start point to the target point,
   * while applying easing to make the motion smooth. It supports auto-flip from or to the corner.
   * @param isAutoFlippingFromCorner Whether the flip is an automatic flip from the corner.
   * @param mouseGP The current position of the mouse pointer.
   * @param pageWH The width and height of the page.
   * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
   * @param onComplete A callback executed when the flip is complete.
   */
  private animateReadyToFlip(
    isAutoFlippingFromCorner:boolean,
    mouseGP:Point,
    pageWH:ISize,
    onFlip:(mouseGP:Point, pageWH:ISize)=>void,
    onComplete:()=>void
  ) {

    let currentValue = this.curAutoFlipWidth;
    const isFlipToMouse = (this.setting.autoFlip.type == AutoFlipType.MouseCursor) && !(this.eventZone & Zone.Center);
    const targetValue = isAutoFlippingFromCorner ? this.autoFlipWidth : 0;
    if(isFlipToMouse && !isAutoFlippingFromCorner){ mouseGP = this.activeCornerGP }
    else if(currentValue == targetValue){ return onComplete(); }

    const startTime = performance.now();
    const duration:number = 200; // 2000ms
    let startP:Point = new Point();
    let endP:Point = new Point();
    switch(this.eventZone){
      case Zone.LT: 
        startP = {x:this.activeCornerGP.x + currentValue, y:this.activeCornerGP.y + currentValue}; 
        endP = isFlipToMouse ? mouseGP : {x:this.activeCornerGP.x + targetValue, y:this.activeCornerGP.y + targetValue}; 
        break;
      case Zone.LC: 
        startP = {x:this.activeCornerGP.x + currentValue, y:this.activeCornerGP.y}; 
        endP = isFlipToMouse ? mouseGP : {x:this.activeCornerGP.x + targetValue, y:this.activeCornerGP.y};
        break;
      case Zone.LB: 
        startP = {x:this.activeCornerGP.x + currentValue, y:this.activeCornerGP.y - currentValue}; 
        endP = isFlipToMouse ? mouseGP : {x:this.activeCornerGP.x + targetValue, y:this.activeCornerGP.y - targetValue}; 
        break;
      case Zone.RT:
        startP = {x:this.activeCornerGP.x - currentValue, y:this.activeCornerGP.y + currentValue}; 
        endP = isFlipToMouse ? mouseGP : {x:this.activeCornerGP.x - targetValue, y:this.activeCornerGP.y + targetValue}; 
        break;
      case Zone.RC:
        startP = {x:this.activeCornerGP.x - currentValue, y:this.activeCornerGP.y}; 
        endP = isFlipToMouse ? mouseGP : {x:this.activeCornerGP.x - targetValue, y:this.activeCornerGP.y}; 
        break;
      case Zone.RB:
        startP = {x:this.activeCornerGP.x - currentValue, y:this.activeCornerGP.y - currentValue}; 
        endP = isFlipToMouse ? mouseGP : {x:this.activeCornerGP.x - targetValue, y:this.activeCornerGP.y - targetValue}; 
        break;
    }
    const animationFrame = (currentTime:number) => {
      const eventStatus = this.eventStatus;

      if(isFlipToMouse){
        if(isAutoFlippingFromCorner){ endP = this.curMouseGP; }
        else { startP = this.curMouseGP; }
      }

      if( ( eventStatus != EventStatus.AutoFlipToCorner && eventStatus != EventStatus.AutoFlipFromCorner )
        || (isAutoFlippingFromCorner && eventStatus == EventStatus.AutoFlipToCorner)
        || (!isAutoFlippingFromCorner && eventStatus == EventStatus.AutoFlipFromCorner))
      { 
        return onComplete(); 
      }

      const elapsed = (currentTime - startTime) / duration; // 0 ~ 1 사이 값
      const progress = Math.min(elapsed, 1); // 진행률 계산 (최대 1)
      const easingProgress = this.easeInOutQuad(progress); // easing 함수 적용
      const currentX = startP.x + (endP.x - startP.x) * easingProgress;
      const currentY = startP.y + (endP.y - startP.y) * easingProgress;

      if(isAutoFlippingFromCorner){ currentValue = progress * targetValue; }
      else { currentValue = currentValue - progress * currentValue; }
      this.curAutoFlipWidth = currentValue;

      onFlip( {x:currentX, y:currentY}, pageWH );

      if (progress < 1) { requestAnimationFrame(animationFrame); }
      else { onComplete(); }
    }

    requestAnimationFrame(animationFrame); // 애니메이션 시작
  }
  /**
   * Starts the animation for flipping the page from the corner.
   * @param mouseGP The current position of the mouse pointer.
   * @param pageWH The width and height of the page.
   * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
   * @param onComplete A callback executed when the flip is complete.
   */
  animateFlipFromCorner(mouseGP:Point, pageWH:ISize, onFlip:(mouseGP:Point, pageWH:ISize)=>void, onComplete:()=>void) {
    if(this.oldEventZone != this.eventZone){ this.curAutoFlipWidth = 0; }
    this.oldEventZone = this.eventZone;
    this.animateReadyToFlip(true, mouseGP, pageWH, onFlip, onComplete);
  }
  /**
   * Starts the animation for flipping the page to the corner.
   * @param mouseGP The current position of the mouse pointer.
   * @param pageWH The width and height of the page.
   * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
   * @param onComplete A callback executed when the flip is complete.
   */
  animateFlipToCorner(mouseGP:Point, pageWH:ISize, onFlip:(mouseGP:Point, pageWH:ISize)=>void, onComplete:()=>void) {
    this.oldEventZone = this.eventZone;
    this.animateReadyToFlip(false, mouseGP, pageWH, onFlip, onComplete);
  }
  /**
   * Easing function for smooth transition during the flip animation.
   * @param t A number between 0 and 1 representing the current progress of the animation.
   * @returns A number representing the eased progress value.
   */
  easeInOutQuad(t:number):number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  /**
   * Animates the page flip, interpolating between the start and end points with easing.
   * @param startP The starting point of the flip.
   * @param endP The ending point of the flip.
   * @param pageWH The width and height of the page.
   * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
   * @param onComplete A callback executed when the flip is complete.
   */
  animateFlip(
    startP:Point, 
    endP:Point,
    pageWH:ISize,
    onFlip:(mouseGP:Point, pageWH:ISize)=>void,
    onComplete:()=>void 
  ){
    const startTime = performance.now();
    const duration:number = 500; // 2000ms

    const animationFrame = (currentTime:number) => {
      if(this.eventStatus == EventStatus.Flipping){ return; }

      const elapsed = (currentTime - startTime) / duration; // 0 ~ 1 사이 값
      const progress = Math.min(elapsed, 1); // 진행률 계산 (최대 1)
      const easingProgress = this.easeInOutQuad(progress); // easing 함수 적용
      const currentX = startP.x + (endP.x - startP.x) * easingProgress;
      const currentY = startP.y + (endP.y - startP.y) * easingProgress;

      onFlip( {x:currentX, y:currentY}, pageWH );


      if (progress < 1) { requestAnimationFrame(animationFrame); }
      else { onComplete(); }
    }

    requestAnimationFrame(animationFrame);
  }
  /**
   * Updates and returns the mouse pointer position depends on the area that the mouse pointer position is located in.
   * @param mouseGP The current position of the mouse pointer.
   * @returns The updated mouse pointer position.
   */
  updateMousePointOnArea(mouseGP:Point){
    const radian4Area1 = MZMath.getRadianPositive(this.gutter.centerBottom, mouseGP);
    const isArea1 = mouseGP.y < this.flipActionLine.y 
      && MZMath.getLength(this.gutter.centerBottom, mouseGP) > this.diagonals.area1.length
      && this.diagonals.area1.radian.low <= radian4Area1 && radian4Area1 <= this.diagonals.area1.radian.high;

    const radian4Area2 = MZMath.getRadianPositive(this.gutter.centerTop, mouseGP);
    const isArea2 = mouseGP.y > this.flipActionLine.y 
      && MZMath.getLength(this.gutter.centerTop, mouseGP) > this.diagonals.area2.length
      && this.diagonals.area2.radian.low <= radian4Area2 && radian4Area2 <= this.diagonals.area2.radian.high;

    const radian4Area3 = MZMath.getRadianPositive(this.flipActionLine.rightP, mouseGP);
    const radianLow4Area3 = this.diagonals.area3.radian.low;
    const radianHigh4Area3 = this.diagonals.area3.radian.high;
    const isArea3 = mouseGP.x > this.flipActionLine.rightX
      && MZMath.getLength(this.flipActionLine.rightP, mouseGP) > this.diagonals.area3.length
      && ( radianLow4Area3 <= radian4Area3 && radian4Area3 <= radianHigh4Area3
        // Ex) low = 5.xx, high = 0.4
        || ( radianLow4Area3 > radianHigh4Area3 
            && radianLow4Area3 <= radian4Area3 || radian4Area3 <= radianHigh4Area3 ) );

    const radian4Area4 = MZMath.getRadianPositive(this.flipActionLine.leftP, mouseGP);
    const isArea4 = mouseGP.x < this.flipActionLine.leftX
      && MZMath.getLength(this.flipActionLine.leftP, mouseGP) > this.diagonals.area4.length
      && this.diagonals.area4.radian.low <= radian4Area4 && radian4Area4 <= this.diagonals.area4.radian.high;

    if(isArea1){ mouseGP = MZMath.findPointOnLine(this.gutter.centerBottom, mouseGP, this.diagonals.area1.length); } 
    else if(isArea2){ mouseGP = MZMath.findPointOnLine(this.gutter.centerTop, mouseGP, this.diagonals.area2.length); }
    else if(isArea3){ mouseGP = this.flipActionLine.rightP; }
    else if(isArea4){ mouseGP = this.flipActionLine.leftP; }

    return mouseGP;
  }
  /**
   * Calculates and returns the data needed to flip the page, including the active corner,
   * mask shape, shadow, and rotation angles.
   * @param mouseGP The current position of the mouse pointer.
   * @param pageWH The width and height of the page.
   * @param isSpreadOpen Whether the page is spread open or not.
   * @returns An object containing all the necessary data for rendering the flip.
   */
  flip(
    mouseGP:Point, 
    pageWH:ISize,
    isSpreadOpen:boolean
  ){
    const page2W = pageWH.width;
    const page2H = pageWH.height;
    let page2ActiveCorner:Point;
    let page3ActiveCorner:Point;    
    let zeroX = 0;
    let pivot = 1;
    //
    // Area
    //
    mouseGP = this.updateMousePointOnArea(mouseGP);
    switch(this.eventZone){
      case Zone.LT:
      case Zone.LC:
      case Zone.LB:
        page2ActiveCorner = { x: page2W, y: page2H }
        page3ActiveCorner = { x: 0, y: page2H }
        zeroX = 0;
        pivot = -1;
        break;
      case Zone.RT:
      case Zone.RC:
      case Zone.RB:
        page2ActiveCorner = { x: 0, y: page2H }
        page3ActiveCorner = { x: page2W, y: page2H }
        zeroX = isSpreadOpen ? page2W : 0;
        pivot = 1;
        break;

      default: throw new Error("Not found an event zone.")
    }

    const halfPI = Math.PI/2;
    const diffH = this.gutter.bottom - this.flipActionLine.y;
    const beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
    const alpha = pivot*(halfPI*3 - beta);
    const page2Left = zeroX + (mouseGP.x - this.gutter.left);
    const page2Top = mouseGP.y - this.flipActionLine.y;
    const a = mouseGP.x - this.activeCornerGP.x;    // a < 0
    const b = mouseGP.y - this.activeCornerGP.y;    // b < 0
    const cosTheta = Math.cos(-halfPI + 2*beta);
    const tanAlpa = Math.tan(-halfPI - pivot * beta);
    const d = b == 0 ? page2H : (-a / cosTheta) + diffH;  // d > 0
    const c = b == 0 ? -a*pivot/2 : d / tanAlpa;
    // Mask position on Page 2
    const f = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
    let g = { x: page2ActiveCorner.x+c*pivot, y: page2ActiveCorner.y };
    let h = { x: 0, y: 0 }
    const i = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
    // Shadow
    const closingDistance = MZMath.getLength(mouseGP, this.activeCornerOppositeGP);
    //
    // Update positions
    //
    if(b == 0){ h = { x:g.x, y:i.y } }
    // Mask shape is triangle when top corner is one of the vertices.
    else if(c < 0){
      h.x = page2ActiveCorner.x -pivot * c * (page2H-d) / d;
      h.y = i.y = page2H - page2ActiveCorner.y;
      f.y = page2ActiveCorner.y-d;
      g = f;
    }
    // Mask shape is trapezoid and the top side is longer than the bottom side.
    // It is happend when the corner is dragging under book.
    else if(d < 0){
      h.x = page2ActiveCorner.x + pivot * c * (d-page2H) / d;
      h.y = i.y = page2H - page2ActiveCorner.y;
    }
    // Mask shape is triangle when bottom corner is one of the vertices.
    else if(d < page2H){
      h = i;
    } 
    // Mask shape is trapezoid.
    else if(d > page2H){
      h.x = page2ActiveCorner.x + pivot * c * (d-page2H) / d;
      h.y = i.y = page2H - page2ActiveCorner.y;
    }
    // Mask position on Page 1
    const j = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
    const k = { x: page3ActiveCorner.x + page2ActiveCorner.x - g.x, y: g.y }
    const l = { x: page3ActiveCorner.x + page2ActiveCorner.x - h.x, y: h.y }
    const m = { x: page3ActiveCorner.x, y: i.y }
    
    return new FlipData({
      page2:{
        top: page2Top,
        left: page2Left,
        rotate: (2*beta)%(2*Math.PI)
      },
      mask:{
        page2:{
          p1:f,
          p2:g,
          p3:h,
          p4:i,
        },
        page1:{
          p1:j,
          p2:k,
          p3:l,
          p4:m,
        }
      },
      alpa: alpha,
      a:a,
      b:b,
      c:c,
      d:d,
      shadow:{
        closingDistance: closingDistance,
        rect: {
          rotate: alpha,
          origin: {
            x: g.x,
            y: 0
          }
        },
      },
    })
  }
}