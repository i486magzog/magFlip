// src/index.ts
export * from '@magflip/common';
export * from '@magflip/core';
export * from '@magflip/flipview';

// 각 모듈에서 모든 export된 함수와 객체를 가져옴
// import * as Common from '@magflip/common';
// import * as Core from '@magflip/core';
// import * as FlipView from '@magflip/flipview';


// assignToGlobal(Common);
// assignToGlobal(Core);
// assignToGlobal(FlipView);

// function assignToGlobal(obj){
//   for(const itemStr in obj){
//     console.log(itemStr)
//     Object.assign(globalThis, obj[itemStr])
//   }
// }