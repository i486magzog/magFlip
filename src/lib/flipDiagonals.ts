import { FlipDiagonal } from './flipDiagonal.js';
import { Point, Rect } from './shape.js';

export class FlipDiagonals {
    area1:{
      length: number
      radian: {
        low: number
        high: number
      }
    };
    area2: {
      length: number
      radian: {
        low: number
        high: number
      }
    };
  
    area3: {
      length: number
      radian: {
        low: number
        high: number
      }
    }
  
    area4: {
      length: number
      radian: {
        low: number
        high: number
      }
    }
  
    /**
     * 
     * @param rect The container that book is spread open.
     * @param actionCenter The center of FlipActionLine.
     */
    constructor(rect?:Rect, actionCenter?:Point){
      const zeroP = new Point();
      const centerLeftP = { x: rect?.left || 0, y:actionCenter?.y || 0 }
      const centerRightP = { x: rect?.right || 0, y:actionCenter?.y || 0 }
      const centerTop = rect?.centerTop || zeroP;
      const centerBottom = rect?.centerBottom || zeroP;
      //
      const diagonalLeftInArea1 = new FlipDiagonal(centerBottom, centerLeftP);
      const diagonalRightInArea1 = new FlipDiagonal(centerBottom, centerRightP);
      const diagonalLeftInArea2 = new FlipDiagonal(centerTop, centerLeftP);
      const diagonalRightInArea2 = new FlipDiagonal(centerTop, centerRightP);
  
      const area3RadianLow = diagonalRightInArea1.radian;
      const area3RadianHigh = diagonalRightInArea2.radian || 2 * Math.PI;
      if(area3RadianHigh < area3RadianLow){
  
      }
      // Upper side
      this.area1 = {
        length: diagonalLeftInArea1.length,
        radian: {
          low: diagonalLeftInArea1.radian,
          high: diagonalRightInArea1.radian || 2 * Math.PI,
        }
      };
      // Lower side
      this.area2 = {
        length: diagonalLeftInArea2.length,
        radian: {
          low: diagonalRightInArea2.radian,
          high: diagonalLeftInArea2.radian,
        }
      };
      // Right side
      this.area3 = {
        length: 0,
        radian: {
          low: diagonalRightInArea1.radian,
          high: diagonalRightInArea2.radian || 2 * Math.PI,
        }
      };
      // Left side
      this.area4 = {
        length: 0,
        radian: {
          low: diagonalLeftInArea2.radian,
          high: diagonalLeftInArea1.radian,
        }
      };
    }
  
  }