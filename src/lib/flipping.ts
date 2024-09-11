import { EventStatus, Point, Rect, Zone } from './models.js';
import { PageWindow } from './pageWindow.js';
/**
 * Flipping class
 */
export class Flipping extends PageWindow {
  private _eventStatus:EventStatus = EventStatus.None;
  set eventStatus(status:EventStatus){ this._eventStatus = status; };
  get eventStatus(){ return this._eventStatus; }

  eventZone:Zone = Zone.RB;
  activeCenterGP:Point = new Point();
  activeCenterOppositeGP:Point = new Point();
  activeCornerGP:Point = new Point();
  activeCornerOppositeGP:Point = new Point();
  
  diagonalRadians:{ low: number, high: number } = { low:0, high:0 };
  diagonalLength:number = 0;

  constructor() { 
    super();
  }
  setDiagonalLength(){
    this.diagonalLength = Math.sqrt(Math.pow(this.activeCornerGP.x - this.activeCenterOppositeGP.x, 2) + Math.pow(this.activeCornerGP.y - this.activeCenterOppositeGP.y, 2)); 
  }

  setInitFlipping(){
    this.setDiagonalLength();
    this.activeCornerOppositeGP = this.findSymmetricPoint(this.activeCenterGP, this.activeCornerGP);
    const radian1 = this.getRadianPositive(this.activeCenterOppositeGP, this.activeCornerGP)
    const radian2 = this.getRadianPositive(this.activeCenterOppositeGP, this.activeCornerOppositeGP )
    this.diagonalRadians = {
      low: Math.min(radian1,radian2),
      high: Math.max(radian1,radian2)
    }
  }
  /**
   * Finds the symmetric point of a given target point with respect to a reference origin point.
   *
   * This function calculates the point that is symmetric to the target point,
   * using the origin point as the reference. The symmetric point is determined by
   * reflecting the target point across the origin.
   *
   * @param {Object} originPoint - The reference point for symmetry, containing x and y coordinates.
   * @param {Object} targetPoint - The point for which the symmetric point is calculated, containing x and y coordinates.
   * @returns {Object} - The symmetric point with x and y coordinates.
   */
  findSymmetricPoint(originPoint:Point, targetPoint:Point):Point {
    const symmetricX = 2 * originPoint.x - targetPoint.x;
    const symmetricY = 2 * originPoint.y - targetPoint.y;
    return { x: symmetricX, y: symmetricY };
  }  
  /**
   * Get degree.
   * 0 <= degree <= 180 or 0 < degree < -180
   * @param startPoint 
   * @param destPoint 
   * @returns 
   */ 
  getDegree(startPoint:Point, destPoint:Point):number {
    const radian = this.getRadian(startPoint, destPoint);
    const degree = radian * 180 / Math.PI;
    return degree;
  }
  /**
   * Get degree.
   * 0 <= degree
   * @param startPoint 
   * @param destPoint 
   * @returns 
   */
  getDegreePositive(startPoint:Point, destPoint:Point):number {
    const radian = this.getRadian(startPoint, destPoint);
    let degree = (radian * 180 / Math.PI)%360;
    if (degree < 0) { degree += 360; }
    return degree;
  }
  /**
   * Get radian angle.
   * 0 <= radian <= pi or 0 < radian < -pi
   * @param startPoint 
   * @param destPoint 
   * @returns 
   */
  getRadian(startPoint:Point, destPoint:Point):number {
    const dx = destPoint.x - startPoint.x;
    const dy = destPoint.y - startPoint.y;
    const radian = Math.atan2(dy, dx);
    return radian;
  }
  /**
   * Get radian angle.
   * 0 <= radian
   * @param startPoint 
   * @param destPoint 
   * @returns 
   */
  getRadianPositive(startPoint:Point, destPoint:Point):number {
    const dx = destPoint.x - startPoint.x;
    const dy = destPoint.y - startPoint.y;
    let radian = Math.atan2(dy, dx)%(2*Math.PI);
    if (radian < 0) {
      radian += 2 * Math.PI; // 음수일 경우 2π를 더해 0 ~ 2π로 변환
    }
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

      switch(this.eventZone){
        case Zone.LT:
          break;
        case Zone.LC:
          break;
        case Zone.LB:
          break;
        case Zone.RT:
          {
            page2ActiveCorner = { x: 0, y: 0 } // !!!
            page3ActiveCorner = { x: page2W, y: 0 }  // !!!

            // Area 1
            if( mouseGP.y > this.activeCenterGP.y && this.getLength(this.activeCenterGP, mouseGP) > page2W){  // !!!
              mouseGP = this.findPointOnLine(this.activeCenterGP, mouseGP, page2W);
            } 
            // Area 2-4
            else if( mouseGP.y < this.activeCenterGP.y && this.getLength(this.activeCenterOppositeGP, mouseGP) > this.diagonalLength){  // !!!
              const r = this.getRadianPositive(this.activeCenterOppositeGP, mouseGP);
              // Area 2
              if(this.diagonalRadians.low <= r && r <= this.diagonalRadians.high){
                mouseGP = this.findPointOnLine(this.activeCenterOppositeGP, mouseGP, this.diagonalLength);
              }
              else { 
                // Area 3
                if(r < this.diagonalRadians.low){ mouseGP = this.activeCornerOppositeGP } // !!!
                // Area 4
                else if(r > this.diagonalRadians.high){ mouseGP = this.activeCornerGP } // !!!
                else { return; }
              }
            }

            beta = this.getRadianPositive(this.activeCornerGP, mouseGP);
            page2Left = mouseGP.x - this.activeCenterGP.x;
            page2Top = mouseGP.y - this.activeCenterGP.y;
            a = mouseGP.x - this.activeCornerGP.x;   // a < 0
            b = mouseGP.y - this.activeCornerGP.y;  // b > 0
            // const theta = -Math.PI/2 + 2*radian;
            const cosTheta = Math.cos(-Math.PI/2 - 2*beta); // !!!
            const c = b == 0 ? -a/2 : (b / cosTheta);  // c > 0 // !!!
            const d = b == 0 ? page2H : (-a / cosTheta);  // d > 0
            console.log(cosTheta)
            console.log(a,b,c,d)
            // const _d = -d;
            // Page 2 좌표 기준
            let f:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
            let g:Point = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
            let h:Point = { x: 0, y: 0 }
            let i:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y+d }; // !!!  
            // Update
            if(b == 0){ h = { x:g.x, y:i.y } }
            // Mask shape is parallelogram and the bottom side is longer than the top side.
            // It is happend when the corner is dragging under book.
            else if(d < 0){
              h.x = c * (d-page2H) / d;
              h.y = i.y = page2H; // !!!
            }
            // Mask shape is triangle.
            else if(d < page2H){
              h = i;
            } 
            // Mask shape is parallelogram.
            else if(d > page2H){
              h.x = c * (d-page2H) / d;
              h.y = i.y = page2H; // !!!
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
        case Zone.RC:
          {
            page2ActiveCorner = { x: 0, y: 0 }
            if(this.getLength(this.activeCenterGP, mouseGP) > page2W){
              mouseGP = this.findPointOnLine(this.activeCenterGP, mouseGP, page2W);
            }
            beta = this.getRadian(this.activeCornerGP, mouseGP);
            page2Top = mouseGP.y - containerGRect.top;
            page2Left = mouseGP.x - containerGRect.left;
            a = mouseGP.x - containerGRect.right; // a < 0
            b = mouseGP.y - containerGRect.top;   // b > 0
            const c = b / Math.cos(-Math.PI/2 - 2*beta);  // d > 0
            const d = a / Math.cos(-Math.PI/2 - 2*beta);  // c < 0
            // Mask
            // maskShapeOnBackPage1?.setAttribute('points', `0,0 0,${c} ${d},0`);
            maskShapeOnPage2?.setAttribute('points', `${page2ActiveCorner.x},${page2ActiveCorner.y} ${page2ActiveCorner.x},${page2ActiveCorner.y-d} ${page2ActiveCorner.x+c},${page2ActiveCorner.y}`);
            maskShapeOnPage3?.setAttribute('points', `${page2W},0 ${page2W-c},0 ${page2W},${-d}`);
            // Back Page 1
            page2El.style.top = `${page2Top}px`;
            page2El.style.left = `${page2Left}px`;
            page2El.style.transform = `rotate(${2*beta}rad)`;
          }
          break;
        case Zone.RB:
          {
            // eventZoneCornerGP = { x: containerGRect.right, y: containerGRect.bottom }
            page2ActiveCorner = { x: 0, y: page2H }
            page3ActiveCorner = { x: page2W, y: page2H }

            // Area 1
            if( mouseGP.y < this.activeCenterGP.y && this.getLength(this.activeCenterGP, mouseGP) > page2W){
              mouseGP = this.findPointOnLine(this.activeCenterGP, mouseGP, page2W);
            } 
            // Area 2-4
            else if( mouseGP.y > this.activeCenterGP.y && this.getLength(this.activeCenterOppositeGP, mouseGP) > this.diagonalLength){
              const r = this.getRadianPositive(this.activeCenterOppositeGP, mouseGP);
              // Area 2
              if(this.diagonalRadians.low <= r && r <= this.diagonalRadians.high){
                mouseGP = this.findPointOnLine(this.activeCenterOppositeGP, mouseGP, this.diagonalLength);
              }
              else { 
                // Area 3
                if(r < this.diagonalRadians.low){ mouseGP = this.activeCornerGP }
                // Area 4
                else if(r > this.diagonalRadians.high){ mouseGP = this.activeCornerOppositeGP }
                else { return; }
              }
            }

            beta = this.getRadianPositive(this.activeCornerGP, mouseGP);
            page2Left = mouseGP.x - this.activeCenterGP.x;
            page2Top = mouseGP.y - this.activeCenterGP.y;
            a = mouseGP.x - this.activeCornerGP.x;   // a < 0
            b = mouseGP.y - this.activeCornerGP.y;  // b < 0
            // const theta = -Math.PI/2 + 2*radian;
            const cosTheta = Math.cos(-Math.PI/2 + 2*beta);
            const c = b == 0 ? -a/2 : (-b / cosTheta);  // c > 0
            const d = b == 0 ? page2H : (-a / cosTheta);  // d > 0
            // Page 2 좌표 기준
            let f:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
            let g:Point = { x: page2ActiveCorner.x+c, y: page2ActiveCorner.y };
            let h:Point = { x: 0, y: 0 }
            let i:Point = { x: page2ActiveCorner.x, y: page2ActiveCorner.y-d }
            // Update
            if(b == 0){ h = { x:g.x, y:i.y } }
            // Mask shape is parallelogram and the top side is longer than the bottom side.
            // It is happend when the corner is dragging under book.
            else if(d < 0){
              h.x = c * (d-page2H) / d;
              h.y = i.y = 0;
            }
            // Mask shape is triangle.
            else if(d < page2H){
              h = i;
            } 
            // Mask shape is parallelogram.
            else if(d > page2H){
              h.x = c * (d-page2H) / d;
              h.y = i.y = 0;
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