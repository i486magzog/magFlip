import { Point, Rect } from './models.js';

export class MZMath {
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
  static findSymmetricPoint(originPoint:Point, targetPoint:Point):Point {
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
  static getDegree(startPoint:Point, destPoint:Point):number {
    const radian = MZMath.getRadian(startPoint, destPoint);
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
  static getDegreePositive(startPoint:Point, destPoint:Point):number {
    const radian = MZMath.getRadian(startPoint, destPoint);
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
  static getRadian(startPoint:Point, destPoint:Point):number {
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
  static getRadianPositive(startPoint:Point, destPoint:Point):number {
    const dx = destPoint.x - startPoint.x;
    const dy = destPoint.y - startPoint.y;
    let radian = Math.atan2(dy, dx)%(2*Math.PI);
    if (radian < 0) {
      radian += 2 * Math.PI; // 음수일 경우 2π를 더해 0 ~ 2π로 변환
    }
    return radian;
  }

  static getOffset(el:HTMLDivElement) {
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
  static getOffset4Fixed(el:HTMLElement):Rect {
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
    return new Rect({
      top:  top,
      left:  left,
      width:  width,
      height:  height,
      bottom: top + height,
      right: left + width,
    });
  }
  // getLength(x1:number, y1:number, x2:number, y2:number):number {
  static getLength(point1:Point, point2:Point):number {
    return Math.sqrt(Math.pow(point1.x-point2.x, 2) + Math.pow(point1.y-point2.y, 2));
  }
  static findPointOnLine(a:Point, b:Point, distance:number):Point{
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