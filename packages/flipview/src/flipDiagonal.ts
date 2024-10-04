
import { MZMath } from '@magflip/common';
import { Point } from '@magflip/common';

export class FlipDiagonal {
    private _length: number = 0;
    private _radian: number = 0;
    get length() { return this._length; }
    get radian(){ return this._radian; }
  
    constructor(startP:Point, endP:Point){
      this._length = MZMath.getLength(startP, endP);
      this._radian = MZMath.getRadianPositive(startP, endP);
    }
  }
  