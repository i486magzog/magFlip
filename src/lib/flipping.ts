import { MZMath } from './mzMath.js';
import { EventStatus, FlipActionLine, FlipDiagonals, Gutter, IRect, Point, Rect, Zone } from './models.js';
import { PageWindow } from './pageWindow.js';
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
  // activeCenterOppositeGP:Point = new Point();
  activeCornerGP:Point = new Point();
  activeCornerOppositeGP:Point = new Point();
  diagonals:FlipDiagonals = new FlipDiagonals();
  flipActionLine:FlipActionLine = new FlipActionLine();

  constructor() { 
    super();
  }
  

  setInitFlipping(eventZone:Zone, containerRect:Rect, mouseGP:Point, page2El:HTMLElement){
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
    page2El.style.transformOrigin = `${originX}px ${originY}px`;
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
    backPage1El:HTMLElement,
    maskShapeOnBackPage1:SVGPolygonElement,
    maskShapeOnBackPage2:SVGPolygonElement, 
    onComplete:()=>void
  ) {
    let currentValue = this.curAutoFlipWidth;
    const targetValue = isAutoFlippingInCorner ? 20 : 0;
    const duration = 500; // .5 sec
    const startTime = performance.now();

    if(currentValue == targetValue){ return; }

    const backPageW = backPage1El.offsetWidth;
    const backPageH = backPage1El.offsetHeight;
    let rotateRad = 0;
    let top = 0;
    let left = 0;
    switch(this.eventZone){
      case Zone.LT:
        break;
      case Zone.LC:
        break;
      case Zone.LB:
        break;
      case Zone.RT:
        rotateRad = 0;
        break;
      case Zone.RC:
        break;
      case Zone.RB:
        rotateRad = Math.PI / 2;
        break;
    }

    const animate = (time: number) => {
        if( (isAutoFlippingInCorner && this.eventStatus == EventStatus.AutoFlipOutCorner)
          || (!isAutoFlippingInCorner && this.eventStatus == EventStatus.AutoFlipInCorner)){ return ; }

        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        if(isAutoFlippingInCorner){ currentValue = progress * targetValue; }
        else { currentValue = currentValue - progress * currentValue; }
        this.curAutoFlipWidth = currentValue;

        switch(this.eventZone){
          case Zone.LT:
            break;
          case Zone.LC:
            break;
          case Zone.LB:
            break;
          case Zone.RT:
            top = -backPageH + currentValue;
            left = backPageW - currentValue;
            break;
          case Zone.RC:
            
            left = backPageW - currentValue;
            break;
          case Zone.RB:
            top = -currentValue;
            left = backPageW - currentValue;
            break;
        }


        maskShapeOnBackPage1?.setAttribute('points', `0,${backPageH} 0,${backPageH - currentValue} ${currentValue},${backPageH}`);
        maskShapeOnBackPage2?.setAttribute('points', `${backPageW},${backPageH} ${backPageW - currentValue},${backPageH} ${backPageW},${backPageH - currentValue}`);
        backPage1El.style.top = `${top}px`;
        backPage1El.style.left = `${left}px`;
        backPage1El.style.transform = `rotate(${rotateRad}rad)`;

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
    mouseGPoint:Point, 
    containerGRect:Rect,
    backPage1El:HTMLElement,
    maskShapeOnBackPage1: SVGPolygonElement,
    maskShapeOnBackPage2: SVGPolygonElement,
    onComplete:()=>void 
  ){
    const startTime = performance.now();
    const duration:number = 1000; // 2000ms
    const {x:startX, y:startY} = mouseGPoint;
    const {x:endX, y:endY} = this.activeCornerGP;

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
        containerGRect,
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
    mouseGP:Point, 
    containerGRect:Rect,
    page2El:HTMLElement,
    maskShapeOnPage2: SVGPolygonElement,
    maskShapeOnPage3: SVGPolygonElement
  ){
  
    if(page2El){
      const page2W = page2El.offsetWidth;
      const page2H = page2El.offsetHeight;
      const containerGBottom = containerGRect.bottom;
      let eventZoneCornerGP:Point;
      let page2ActiveCorner:Point;
      let page3ActiveCorner:Point;
      
      let beta = 0;
      let page2Top = 0;
      let page2Left = 0;
      let a = 0;
      let b = 0;
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
      const isArea3 = mouseGP.x > this.flipActionLine.rightX
        && MZMath.getLength(this.flipActionLine.rightP, mouseGP) > this.diagonals.area3.length
        && this.diagonals.area3.radian.low <= radian4Area3 && radian4Area3 <= this.diagonals.area3.radian.high;

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
          break;
        case Zone.LC:
          break;
        case Zone.LB:
          break;
        case Zone.RT:
          // Version 1
          // {
          //   page2ActiveCorner = { x: 0, y: 0 } // !!!
          //   page3ActiveCorner = { x: page2W, y: 0 }  // !!!
          //   const diffH = this.gutter.top - this.flipActionLine.y; // !!!

          //   beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
          //   page2Left = mouseGP.x - this.activeCenterGP.x;
          //   page2Top = mouseGP.y - this.flipActionLine.y;

          //   a = mouseGP.x - this.activeCornerGP.x;   // a < 0
          //   // Method 1
          //   // b = mouseGP.y - this.activeCornerGP.y;  // b > 0
          //   // const cosTheta = Math.cos(-Math.PI/2 - 2*beta); // !!!
          //   // const c = b == 0 ? -a/2 : (b / cosTheta);  // c > 0 // !!!
          //   // const d = b == 0 ? page2H : (-a / cosTheta);  // d > 0
          //   // Method 2
          //   const cosTheta = Math.cos(-Math.PI/2 - 2*beta); // !!!
          //   const tanAlpa = Math.tan(-Math.PI/2 + beta);  // !!!
          //   const d = b == 0 ? page2H : (-a / cosTheta) + diffH;  // d > 0
          //   const c = b == 0 ? -a/2 : d / tanAlpa;
          //   // const _d = -d;
          //   // Page 2 좌표 기준
          //   let f:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
          //   let g:Point = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
          //   let h:Point = { x: 0, y: 0 }
          //   let i:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y+d }; // !!!  
          //   // Update
          //   if(b == 0){ h = { x:g.x, y:i.y } }
          //   else if(c < 0){
          //     h.x = -c * (page2H-d) / d;
          //     h.y = i.y = page2H - page2ActiveCorner.y;
          //     f.y = page2ActiveCorner.y-d;
          //     g = f;
          //   }
          //   // Mask shape is parallelogram and the bottom side is longer than the top side.
          //   // It is happend when the corner is dragging under book.
          //   else if(d < 0){
          //     h.x = c * (d-page2H) / d;
          //     h.y = i.y = page2H - page2ActiveCorner.y;
          //   }
          //   // Mask shape is triangle.
          //   else if(d < page2H){
          //     h = i;
          //   } 
          //   // Mask shape is parallelogram.
          //   else if(d > page2H){
          //     h.x = c * (d-page2H) / d;
          //     h.y = i.y = page2H - page2ActiveCorner.y;
          //   }
          //   // Page 3 좌표 기준
          //   let j:Point = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
          //   let k:Point = { x: page3ActiveCorner.x - g.x, y: g.y }
          //   let l:Point = { x: page3ActiveCorner.x - h.x, y: h.y }
          //   let m:Point = { x: page3ActiveCorner.x, y: i.y }
          //   // Mask
          //   maskShapeOnPage2?.setAttribute('points', `${f.x},${f.y} ${g.x},${g.y} ${h.x},${h.y} ${i.x},${i.y}`);
          //   maskShapeOnPage3?.setAttribute('points', `${j.x},${j.y} ${k.x},${k.y} ${l.x},${l.y} ${m.x},${m.y}`);
          //   // Page 2
          //   page2El.style.top = `${page2Top}px`;
          //   page2El.style.left = `${page2Left}px`;
          //   page2El.style.transform = `rotate(${2*beta}rad)`;
          // }
          // Version 2
          // {
          //   page2ActiveCorner = { x: 0, y: page2H }
          //   page3ActiveCorner = { x: page2W, y: page2H }
          //   const diffH = this.gutter.bottom - this.flipActionLine.y;

          //   beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
          //   page2Left = mouseGP.x - this.activeCenterGP.x;
          //   page2Top = mouseGP.y - this.flipActionLine.y;
          //   a = mouseGP.x - this.activeCornerGP.x;   // a < 0
          //   b = mouseGP.y - this.activeCornerGP.y;  // b < 0
          //   // const theta = -Math.PI/2 + 2*radian;
          //   const cosTheta = Math.cos(-Math.PI/2 + 2*beta);
          //   const tanAlpa = Math.tan(-Math.PI/2 - beta);
          //   const d = b == 0 ? page2H : (-a / cosTheta) + diffH;  // d > 0
          //   const c = b == 0 ? -a/2 : d / tanAlpa;
          //   // Page 2 좌표 기준
          //   let f:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
          //   let g:Point = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
          //   let h:Point = { x: 0, y: 0 }
          //   let i:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
          //   // Update
          //   if(b == 0){ h = { x:g.x, y:i.y } }
          //   else if(c < 0){
          //     h.x = -c * (page2H-d) / d;
          //     h.y = i.y = page2H - page2ActiveCorner.y;
          //     f.y = page2ActiveCorner.y-d;
          //     g = f;
          //   }
          //   // Mask shape is parallelogram and the top side is longer than the bottom side.
          //   // It is happend when the corner is dragging under book.
          //   else if(d < 0){
          //     h.x = c * (d-page2H) / d;
          //     h.y = i.y = page2H - page2ActiveCorner.y;
          //     console.log("a")
          //   }
          //   // Mask shape is triangle.
          //   else if(d < page2H){
          //     h = i;
          //     console.log("b", d)
          //   } 
          //   // Mask shape is parallelogram.
          //   else if(d > page2H){
          //     h.x = c * (d-page2H) / d;
          //     h.y = i.y = page2H - page2ActiveCorner.y;
          //     console.log("c")
          //   }
          //   // Page 3 좌표 기준
          //   let j:Point = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
          //   let k:Point = { x: page3ActiveCorner.x - g.x, y: g.y }
          //   let l:Point = { x: page3ActiveCorner.x - h.x, y: h.y }
          //   let m:Point = { x: page3ActiveCorner.x, y: i.y }
          //   // Mask
          //   maskShapeOnPage2?.setAttribute('points', `${f.x},${f.y} ${g.x},${g.y} ${h.x},${h.y} ${i.x},${i.y}`);
          //   maskShapeOnPage3?.setAttribute('points', `${j.x},${j.y} ${k.x},${k.y} ${l.x},${l.y} ${m.x},${m.y}`);
          //   // Page 2
          //   page2El.style.top = `${page2Top}px`;
          //   page2El.style.left = `${page2Left}px`;
          //   page2El.style.transform = `rotate(${2*beta}rad)`;
          // }
          // break;
        case Zone.RC:
          {
            page2ActiveCorner = { x: 0, y: page2H }
            page3ActiveCorner = { x: page2W, y: page2H }
            const diffH = this.gutter.bottom - this.flipActionLine.y;

            beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
            page2Left = mouseGP.x - this.activeCenterGP.x;
            page2Top = mouseGP.y - this.flipActionLine.y;
            a = mouseGP.x - this.activeCornerGP.x;   // a < 0
            b = mouseGP.y - this.activeCornerGP.y;  // b < 0
            const cosTheta = Math.cos(-Math.PI/2 + 2*beta);
            const tanAlpa = Math.tan(-Math.PI/2 - beta);
            const d = b == 0 ? page2H : (-a / cosTheta) + diffH;  // d > 0
            const c = b == 0 ? -a/2 : d / tanAlpa;
            // Page 2 좌표 기준
            let f:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
            let g:Point = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
            let h:Point = { x: 0, y: 0 }
            let i:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
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
              console.log("a")
            }
            // Mask shape is triangle.
            else if(d < page2H){
              h = i;
              console.log("b", d)
            } 
            // Mask shape is parallelogram.
            else if(d > page2H){
              h.x = c * (d-page2H) / d;
              h.y = i.y = page2H - page2ActiveCorner.y;
              console.log("c")
            }
            // Page 3 좌표 기준
            let j:Point = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
            let k:Point = { x: page3ActiveCorner.x - g.x, y: g.y }
            let l:Point = { x: page3ActiveCorner.x - h.x, y: h.y }
            let m:Point = { x: page3ActiveCorner.x, y: i.y }
            // Mask
            maskShapeOnPage2?.setAttribute('points', `${f.x},${f.y} ${g.x},${g.y} ${h.x},${h.y} ${i.x},${i.y}`);
            maskShapeOnPage3?.setAttribute('points', `${j.x},${j.y} ${k.x},${k.y} ${l.x},${l.y} ${m.x},${m.y}`);
            // Page 2
            page2El.style.top = `${page2Top}px`;
            page2El.style.left = `${page2Left}px`;
            page2El.style.transform = `rotate(${2*beta}rad)`;
          }
          break;
        case Zone.RB:
          {
            page2ActiveCorner = { x: 0, y: page2H }
            page3ActiveCorner = { x: page2W, y: page2H }
            const diffH = this.gutter.bottom - this.flipActionLine.y;

            beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
            page2Left = mouseGP.x - this.activeCenterGP.x;
            page2Top = mouseGP.y - this.flipActionLine.y;
            a = mouseGP.x - this.activeCornerGP.x;   // a < 0
            b = mouseGP.y - this.activeCornerGP.y;  // b < 0
            // Method 1
            // const cosTheta = Math.cos(-Math.PI/2 + 2*beta);
            // const c = b == 0 ? -a/2 : (-b / cosTheta);  // c > 0
            // const d = b == 0 ? page2H : (-a / cosTheta);  // d > 0
            // Method 2
            const cosTheta = Math.cos(-Math.PI/2 + 2*beta);
            const tanAlpa = Math.tan(-Math.PI/2 - beta);
            const d = b == 0 ? page2H : (-a / cosTheta) + diffH;  // d > 0
            const c = b == 0 ? -a/2 : d / tanAlpa;
            // Page 2 좌표 기준
            let f:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
            let g:Point = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
            let h:Point = { x: 0, y: 0 }
            let i:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
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
            let j:Point = { x: page3ActiveCorner.x, y: page3ActiveCorner.y }
            let k:Point = { x: page3ActiveCorner.x - g.x, y: g.y }
            let l:Point = { x: page3ActiveCorner.x - h.x, y: h.y }
            let m:Point = { x: page3ActiveCorner.x, y: i.y }
            // Mask
            maskShapeOnPage2?.setAttribute('points', `${f.x},${f.y} ${g.x},${g.y} ${h.x},${h.y} ${i.x},${i.y}`);
            maskShapeOnPage3?.setAttribute('points', `${j.x},${j.y} ${k.x},${k.y} ${l.x},${l.y} ${m.x},${m.y}`);
            // Page 2
            page2El.style.top = `${page2Top}px`;
            page2El.style.left = `${page2Left}px`;
            page2El.style.transform = `rotate(${2*beta}rad)`;
          }
          break;
      }
    }
  }
}