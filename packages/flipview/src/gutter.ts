import { IRect, Rect } from "@magflip/core";

export class Gutter extends Rect{
  constructor(gutter?:IRect){
    super(gutter as IRect);
  }
  get topPoint() { return {x:this.left, y:this.top} }
  get bottomPoint() { return {x:this.left, y:this.bottom} }
}