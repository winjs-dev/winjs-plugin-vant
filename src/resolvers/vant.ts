/**
 * vant
 * @Author: liwb (lwbhtml@163.com)
 * @Date: 2024-05-13 09:44
 * @LastEditTime: 2024-05-13 09:44
 * @Description: vant Vue2 的 resolver
 */

/**
 * Button->button; ButtonGroup->button-group
 */
export function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim();
  return result.split(' ').join('-').toLowerCase();
}

// Vant 导出的函数特殊处理，只识别在 .vue 文件 script 里使用的，如 Toast, Dialog, Notify, ImagePreview
// js 文件识别不出来，需要手动引入。
const vant2Function = ['Toast', 'Dialog', 'Notify', 'ImagePreview'];

function checkIfElementsExist(legacyFunction: Array<string> = []) {
  const sideEffects: Array<string> = [];
  legacyFunction.forEach((legacyFunc) => {
    if (vant2Function.includes(legacyFunc)) {
      sideEffects.push(legacyFunc);
    }
  });

  return sideEffects;
}

function getSideEffects(dirName: string, moduleType: string, legacyFunction: Array<string>) {
  const sideEffects: Array<string> = [`vant/${moduleType}/${dirName}/style/index`];
  const vanFunctions = checkIfElementsExist(legacyFunction);
  vanFunctions.forEach((dirName) => {
    sideEffects.push(`vant/${moduleType}/${kebabCase(dirName)}/style/index`);
  });

  return sideEffects;
}

export function VantVue2Resolver(legacyFunction: [] = []) {
  const moduleType = 'es';
  return {
    type: 'component',
    resolve: (componentName: string) => {
      // 通过 runtime 引入的组件不需要自动引入样式，改为全局引入了
      // 在生成的 components.d.ts 里不会出现这几个组件
      if (componentName === 'VanToast' || componentName === 'VanDialog' || componentName === 'VanNotify' || componentName === 'VanImagePreview') {
        return;
      }
      // where `componentName` is always CapitalCase
      if (componentName.startsWith('Van')) {
        const partialName = componentName.slice(3);
        const vanName = kebabCase(partialName);
        return {
          from: `vant/${moduleType}/${vanName}`,
          sideEffects: getSideEffects(vanName, moduleType, legacyFunction)
        };
      }
    }
  };
}

// 处理在 js 文件里引用的函数，避免还得手动引入
// 如：import { Toast } from 'vant';  Toast('xxx');
export function VantVue2Imports(legacyFunction: Array<string> = []) {
  const sideEffects: Array<string> = [];
  legacyFunction.forEach((legacyFunc) => {
    if (vant2Function.includes(legacyFunc)) {
      sideEffects.push(legacyFunc);
    }
  });
  if (sideEffects.length) {
    return {
      'vant/es': sideEffects
    };
  }
  return {};
}
