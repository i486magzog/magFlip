import { ISize } from "@magflip/common";
import { Point } from "@magflip/common";

export interface IFlipData {
  alpa: number;
  a:number;
  b:number;
  c:number;
  d:number;
  page2:{
    top: number;
    left: number;
    rotate: number;
  }
  mask:{
    page2:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    }
    page1:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    }
  }
  shadow: {
    closingDistance: number,
    rect:{
      rotate: number,
      origin: Point
    }
  };
}

export class FlipData implements IFlipData {
  alpa: number = 0;
  a:number = 0;
  b:number = 0;
  c:number = 0;
  d:number = 0;
  page2:{
    top: number;
    left: number;
    rotate: number;
  };
  mask:{
    page2:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    }
    page1:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    },
  };
  shadow: {
    closingDistance: number,
    rect:{
      rotate: number,
      origin: Point
    }
  };

  constructor(flipData:IFlipData){
    this.alpa = flipData.alpa;
    this.a = flipData.a;
    this.b = flipData.b;
    this.c = flipData.c;
    this.d = flipData.d;
    this.page2 = flipData.page2;
    this.mask = flipData.mask;
    this.shadow = flipData.shadow;
  }

  printPage1MaskShape(){
    const pg = this.mask.page1;
    return `${pg.p1.x},${pg.p1.y} ${pg.p2.x},${pg.p2.y} ${pg.p3.x},${pg.p3.y} ${pg.p4.x},${pg.p4.y}`;
  }

  printPage2MaskShape(){
    const pg = this.mask.page2;
    return `${pg.p1.x},${pg.p1.y} ${pg.p2.x},${pg.p2.y} ${pg.p3.x},${pg.p3.y} ${pg.p4.x},${pg.p4.y}`;
  }

  printShadow6(bookSize:ISize){
    const pg = this.mask.page1;
    return `0,0 ${bookSize.width},0 ${bookSize.width},${bookSize.height} 0,${bookSize.height}`;
  }
}