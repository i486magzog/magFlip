import { PageWindow } from './pageWindow.js';
/**
 * Flipping class
 */
export class Flipping extends PageWindow {
    constructor() { 
      super();
    }
  
    getDegree(centerX:number, centerY:number, mouseX: number, mouseY: number):number {
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const radian = Math.atan2(dy, dx);
      const degree = radian * 180 / Math.PI;
      return degree;
    }
  
    getRadian(centerX:number, centerY:number, mouseX: number, mouseY: number):number {
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
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
    getOffset4Fixed(el:HTMLDivElement) {
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
    getLength(x1:number, y1:number, x2:number, y2:number):number {
      return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
    }
    findPointOnLine(a:{x:number, y:number}, b:{x:number, y:number}, distance:number):{x:number, y:number}{
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
  }