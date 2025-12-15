import { dirname, join } from 'node:path';
import { VantResolver } from '@vant/auto-import-resolver';
import { deepmerge, resolve, winPath } from '@winner-fed/utils';
import type { IApi } from '@winner-fed/winjs';
import {
  kebabCase,
  VantVue2Imports,
  VantVue2Resolver,
} from './resolvers/vant.js';

function resolveProjectDep(opts: {
  pkg: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  cwd: string;
  dep: string;
}) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package.json`, {
        basedir: opts.cwd,
      }),
    );
  }
}

export default (api: IApi) => {
  let pkgPath: string = '';
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'vant',
      }) || dirname(require.resolve('vant/package.json'));
  } catch (_e) {
    throw new Error(`Can't find vant package. Please install antd first.`);
  }

  function checkPkgPath() {
    if (!pkgPath) {
      throw new Error(`Can't find vant package. Please install antd first.`);
    }
  }

  const vantVersion = require(`${pkgPath}/package.json`).version;
  const isVant2 = vantVersion?.startsWith('2.');

  api.modifyAppData((memo) => {
    checkPkgPath();
    memo.vant = {
      pkgPath,
      version: vantVersion,
    };
    return memo;
  });

  api.describe({
    key: 'vant',
    config: {
      schema({ zod }) {
        return zod.object({
          legacyFunction: zod.array(zod.string()).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  if (isVant2) {
    const legacyFunction = api.userConfig.vant?.legacyFunction || [];
    const unImports = {
      imports: [VantVue2Imports(legacyFunction)],
      resolvers: [VantVue2Resolver(legacyFunction)],
    };
    const unComponents = {
      resolvers: [VantVue2Resolver(legacyFunction)],
    };

    api.userConfig.autoImport = deepmerge(
      {
        unImports,
        unComponents,
      },
      api.userConfig.autoImport || {},
    );

    // 生成按需引用的文件
    // 全局引入这几个组件和对应样式
    // 可以解决：
    // 1. 一些组件的样式需要全局引入，如 dialog，不然在 app.js 引入时，弹框弹出样式会有问题
    // 2. 在 Vue 组件可以使用 this.$dialog，在 template 里可以自定义使用标签方式 <van-dialog></van-dialog>
    api.onGenerateFiles(() => {
      const components = api.userConfig.vant?.legacyFunction || [];
      let componentsContent = '';
      let componentsStyleContent = '';
      let vueUseComponents = '';

      if (components.length) {
        vueUseComponents = 'Vue';

        componentsContent = `import { ${components.join(',')} } from 'vant';`;

        components.forEach((comp: string) => {
          componentsStyleContent += `import 'vant/es/${kebabCase(comp)}/style/index';\n`;
          vueUseComponents += `.use(${comp})`;
        });

        vueUseComponents += ';';

        // runtime.tsx
        api.writeTmpFile({
          path: 'plugin-vant/runtime.tsx',
          content: `
import Vue from 'vue';

${componentsContent}

${componentsStyleContent}

${vueUseComponents}
      `,
          noPluginDir: true,
        });
      }
    });

    if (legacyFunction.length) {
      api.addRuntimePlugin(() => [
        winPath(join(api.paths.absTmpPath, 'plugin-vant/runtime.tsx')),
      ]);
    }
  } else {
    const unImports = {
      resolvers: [VantResolver()],
    };

    const unComponents = {
      resolvers: [VantResolver()],
    };

    api.userConfig.autoImport = deepmerge(
      {
        unImports,
        unComponents,
      },
      api.userConfig.autoImport || {},
    );
  }
};
