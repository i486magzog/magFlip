import { Point } from "./shape";

export class FlipActionLine {
  private _leftP:Point;
  private _rightP:Point;
  private _centerP:Point;
  leftX:number;
  rightX:number;
  y:number;

  constructor(leftX:number = 0, rightX:number = 0, y:number = 0){
    this.leftX = leftX;
    this.rightX = rightX;
    this.y = y;
    this._leftP = { x: leftX, y: y };
    this._rightP =  { x: rightX, y: y };
    this._centerP = { x: (leftX + rightX)/2, y: y };
  }
  get leftP() { return this._leftP; }
  get rightP() { return this._rightP; }
  get centerP() { return this._centerP; }
}