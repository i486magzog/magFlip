export interface ISize {
  width: number;
  height: number;
}

export interface ISizeExt {
  width: number;
  height: number;
  readonly diagonal: number;
}

export class SizeExt implements ISizeExt {
  width: number;
  height: number;
  readonly diagonal: number;
  constructor(w:number, h:number){
    this.width = w;
    this.height = h;
    this.diagonal = Math.sqrt(w**2+h**2);
  }
}

export interface IBookSize {
  closed: ISizeExt
  opened: ISizeExt
}

export class BookSize {
  closed: ISizeExt;
  opened: ISizeExt;
  constructor(size:IBookSize){
    this.closed = new SizeExt(size.closed.width, size.closed.height);
    this.opened = new SizeExt(size.opened.width, size.opened.height);
  }
}