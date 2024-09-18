import { MZMath } from './mzMath.js';
import { EventStatus, FlipActionLine, FlipData, FlipDiagonals, Gutter, IRect, ISize, Point, Rect, Zone } from './models.js';
import { PageWindow } from './pageWindow.js';
import { Page } from './page.js';
/**
 * Flipping class
 */
export class Flipping extends PageWindow {
  private _eventStatus:EventStatus = EventStatus.None;
  set eventStatus(status:EventStatus){ this._eventStatus = status; };
  get eventStatus(){ return this._eventStatus; }

  flipGRect:Rect = new Rect();
  gutter:Gutter = new Gutter();
  eventZone:Zone = Zone.RB;
  activeCenterGP:Point = new Point();
  activeCornerGP:Point = new Point();
  activeCornerOppositeGP:Point = new Point();
  diagonals:FlipDiagonals = new FlipDiagonals();
  flipActionLine:FlipActionLine = new FlipActionLine();
  curAutoFlipWidth = 0;
  autoCornerFlipWidth = 20;

  constructor() { 
    super();
  }
  
  setInitFlipping(eventZone:Zone, mouseGP:Point, containerRect:Rect, page2El:HTMLElement){
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
    docEl.style.setProperty('--flip-origin', `${originX}px ${originY}px`)
    //
    const zoneWidthStr = getComputedStyle(docEl).getPropertyValue('--zone-width').trim();
    this.autoCornerFlipWidth = parseFloat(zoneWidthStr) * 0.9;
  }

  getTargetCorner(mouseGP:Point){
    const activeLength = MZMath.getLength(mouseGP, this.activeCornerGP);
    const inactiveLength = MZMath.getLength(mouseGP, this.activeCornerOppositeGP);
    return inactiveLength < activeLength ? this.activeCornerOppositeGP : this.activeCornerGP;
  }

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
   * 
   * @param isAutoFlippingFromCorner 
   * @param pageWH 
   * @param onFlip 
   * @param onComplete 
   * @returns 
   */
  private animateReadyToFlip(
    isAutoFlippingFromCorner:boolean,
    pageWH:ISize,
    onFlip:(mouseGP:Point, pageWH:ISize)=>void,
    onComplete:()=>void
  ) {

    let currentValue = this.curAutoFlipWidth;
    const targetValue = isAutoFlippingFromCorner ? 20 : 0;
    if(currentValue == targetValue){ return; }

    const startTime = performance.now();
    const duration:number = 500; // 2000ms
    let startP:Point = new Point();
    let endP:Point = new Point();
    switch(this.eventZone){
      case Zone.LT: 
        startP = {x:this.activeCornerGP.x + currentValue, y:this.activeCornerGP.y + currentValue}; 
        endP = {x:this.activeCornerGP.x + targetValue, y:this.activeCornerGP.y + targetValue}; 
        break;
      case Zone.LC: 
        startP = {x:this.activeCornerGP.x + currentValue, y:this.gutter.centerCenter.y}; 
        endP = {x:this.activeCornerGP.x + targetValue, y:this.gutter.centerCenter.y};
        break;
      case Zone.LB: 
        startP = {x:this.activeCornerGP.x + currentValue, y:this.activeCornerGP.y - currentValue}; 
        endP = {x:this.activeCornerGP.x + targetValue, y:this.activeCornerGP.y - targetValue}; 
        break;
      case Zone.RT:
        startP = {x:this.activeCornerGP.x - currentValue, y:this.activeCornerGP.y + currentValue}; 
        endP = {x:this.activeCornerGP.x - targetValue, y:this.activeCornerGP.y + targetValue}; 
        break;
      case Zone.RC:
        startP = {x:this.activeCornerGP.x - currentValue, y:this.gutter.centerCenter.y}; 
        endP = {x:this.activeCornerGP.x - targetValue, y:this.gutter.centerCenter.y}; 
        break;
      case Zone.RB:
        startP = {x:this.activeCornerGP.x - currentValue, y:this.activeCornerGP.y - currentValue}; 
        endP = {x:this.activeCornerGP.x - targetValue, y:this.activeCornerGP.y - targetValue}; 
        break;
    }
    const animationFrame = (currentTime:number) => {
      const eventStatus = this.eventStatus;
      if( ( eventStatus != EventStatus.AutoFlipToCorner 
            && eventStatus != EventStatus.AutoFlipFromCorner )
        || (isAutoFlippingFromCorner && eventStatus == EventStatus.AutoFlipToCorner)
        || (!isAutoFlippingFromCorner && eventStatus == EventStatus.AutoFlipFromCorner)){ return ; }
console.log(currentValue)
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
   * 
   * @param pageWH 
   * @param onFlip 
   * @param onComplete 
   */
  animateFlipFromCorner(pageWH:ISize, onFlip:(mouseGP:Point, pageWH:ISize)=>void, onComplete:()=>void) {
    this.animateReadyToFlip(true, pageWH, onFlip, onComplete);
  }
  /**
   * 
   * @param pageWH 
   * @param onFlip 
   * @param onComplete 
   */
  animateFlipToCorner(pageWH:ISize, onFlip:(mouseGP:Point, pageWH:ISize)=>void, onComplete:()=>void) {
    this.animateReadyToFlip(false, pageWH, onFlip, onComplete);
  }

  easeInOutQuad(t:number):number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  animateFlip(
    startP:Point, 
    endP:Point,
    pageWH:ISize,
    onFlip:(mouseGP:Point, pageWH:ISize)=>void,
    onComplete:()=>void 
  ){
    const startTime = performance.now();
    const duration:number = 1000; // 2000ms

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

  flip(
    mouseGP:Point, 
    pageWH:ISize,
    isSpreadOpen:boolean
  ){
    const page2W = pageWH.width;
    const page2H = pageWH.height;
    let page2ActiveCorner:Point;
    let page3ActiveCorner:Point;
    
    let beta = 0;
    let page2Top = 0;
    let page2Left = 0;
    let a = 0;
    let b = 0;
    let f = new Point();
    let g = new Point();
    let h = new Point();
    let i = new Point();
    let j = new Point();
    let k = new Point();
    let l = new Point();
    let m = new Point();
    //
    // Area
    //
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

    switch(this.eventZone){
      case Zone.LT:
      case Zone.LC:
      case Zone.LB:
        {
          page2ActiveCorner = { x: page2W, y: page2H }
          page3ActiveCorner = { x: 0, y: page2H }
          const diffH = this.gutter.bottom - this.flipActionLine.y;

          beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
          page2Left = mouseGP.x - this.gutter.left;    // !!!
          page2Top = mouseGP.y - this.flipActionLine.y;
          a = mouseGP.x - this.activeCornerGP.x;    // a > 0
          b = mouseGP.y - this.activeCornerGP.y;    // b < 0
          const cosTheta = Math.cos(-Math.PI/2 - 2*beta);
          const tanAlpa = Math.tan(-Math.PI/2 + beta);
          const d = b == 0 ? page2H : (a / cosTheta) + diffH;  // d > 0
          const c = b == 0 ? a/2 : d / tanAlpa;

          // Page 2 좌표 기준
          f = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
          g = { x: page2ActiveCorner.x-c, y: page2ActiveCorner.y };
          h = { x: 0, y: 0 }
          i = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
          // Update
          if(b == 0){ h = { x:g.x, y:i.y } }
          else if(c < 0){
            h.x = page2ActiveCorner.x + c * (page2H-d) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
            f.y = page2ActiveCorner.y-d;
            g = f;
          }
          // Mask shape is Trapezoid and the top side is longer than the bottom side.
          // It is happend when the corner is dragging under book.
          else if(d < 0){
            h.x = page2ActiveCorner.x - c * (d-page2H) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
          }
          // Mask shape is triangle.
          else if(d < page2H){
            h = i;
          } 
          // Mask shape is Trapezoid.
          else if(d > page2H){
            h.x = page2ActiveCorner.x - c * (d-page2H) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
          }
          // Page 3 좌표 기준
          j = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
          k = { x: page3ActiveCorner.x + page2ActiveCorner.x - g.x, y: g.y }
          l = { x: page3ActiveCorner.x + page2ActiveCorner.x - h.x, y: h.y }
          m = { x: page3ActiveCorner.x, y: i.y }
        }
        break;
      case Zone.RT:
      case Zone.RC:
      case Zone.RB:
        {
          page2ActiveCorner = { x: 0, y: page2H }
          page3ActiveCorner = { x: page2W, y: page2H }
          const diffH = this.gutter.bottom - this.flipActionLine.y;

          beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
          page2Left = mouseGP.x - ( isSpreadOpen ? this.flipActionLine.leftX : this.gutter.left );
          page2Top = mouseGP.y - this.flipActionLine.y;
          a = mouseGP.x - this.activeCornerGP.x;    // a < 0
          b = mouseGP.y - this.activeCornerGP.y;    // b < 0
          const cosTheta = Math.cos(-Math.PI/2 + 2*beta);
          const tanAlpa = Math.tan(-Math.PI/2 - beta);
          const d = b == 0 ? page2H : (-a / cosTheta) + diffH;  // d > 0
          const c = b == 0 ? -a/2 : d / tanAlpa;
          // Page 2 좌표 기준
          f = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
          g = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
          h = { x: 0, y: 0 }
          i = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
          // Update
          if(b == 0){ h = { x:g.x, y:i.y } }
          else if(c < 0){
            h.x = -c * (page2H-d) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
            f.y = page2ActiveCorner.y-d;
            g = f;
          }
          // Mask shape is parallelogram and the top side is longer than the bottom side.
          // It is happend when the corner is dragging under book.
          else if(d < 0){
            h.x = c * (d-page2H) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
          }
          // Mask shape is triangle.
          else if(d < page2H){
            h = i;
          } 
          // Mask shape is parallelogram.
          else if(d > page2H){
            h.x = c * (d-page2H) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
          }
          // Page 3 좌표 기준
          j = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
          k = { x: page3ActiveCorner.x + page2ActiveCorner.x - g.x, y: g.y }
          l = { x: page3ActiveCorner.x + page2ActiveCorner.x - h.x, y: h.y }
          m = { x: page3ActiveCorner.x, y: i.y }
        }
        break;
    }
    

    return new FlipData({
      page2:{
        top: page2Top,
        left: page2Left,
        rotate: 2*beta
      },
      mask:{
        page2:{
          p1:f,
          p2:g,
          p3:h,
          p4:i,
        },
        page3:{
          p1:j,
          p2:k,
          p3:l,
          p4:m,
        }
      }
    })
  }
}