// global.d.ts
declare module '*.css' {
  const content: string; //{ [className: string]: string };
  export default content;
}