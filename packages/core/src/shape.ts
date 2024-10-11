import { IPoint } from "./models";

export interface ILine {
  p1:Point
  p2:Point
}

export interface ITopBottom{
  top: number,
  bottom: number,
}
export interface ILeftRight{
  left: number,
  right: number,
}
export interface IRect extends ITopBottom, ILeftRight {
  width: number,
  height: number,
}


export class Point implements IPoint{
  x:number;
  y:number;
  constructor(point?:IPoint){
    this.x = point?.x || 0;
    this.y = point?.y || 0;
  }
  toString(): string { return `${this.x},${this.y}`; }
}

export class Line {
  p1:Point
  p2:Point
  constructor(p1:Point, p2:Point){
    this.p1 = p1;
    this.p2 = p2;
  }
}

export class Rect implements IRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width:number;
  height:number;
  private center: Point;

  constructor(rect?:IRect){
    this.left = rect?.left || 0;
    this.right = rect?.right || 0;
    this.top = rect?.top || 0;
    this.bottom = rect?.bottom || 0;
    this.width = rect?.width || 0;
    this.height = rect?.height || 0;
    this.center = new Point({x:(this.left + this.right)/2, y:(this.top+this.bottom)/2})
  }
  get leftTop(){ return { x: this.left, y:this.top } }
  get leftCenter(){ return { x: this.left, y:this.center.y } }
  get leftBottom() { return { x: this.left, y:this.bottom } }
  get rightTop(){ return { x: this.right, y:this.top } }
  get rightCenter() { return { x: this.right, y:this.center.y } }
  get rightBottom() { return { x: this.right, y:this.bottom } }
  get centerTop() { return { x: this.center.x, y: this.top } }
  get centerCenter() { return this.center }
  get centerBottom() { return { x: this.center.x, y: this.bottom } }
}