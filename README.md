# winjs-plugin-vant

适配 WinJS 的 Vant 插件，支持 Vue 2 和 Vue 3 的 Vant 组件库自动按需引入。

<p>
  <a href="https://npmjs.com/package/@winner-fed/plugin-vant">
   <img src="https://img.shields.io/npm/v/@winner-fed/plugin-vant?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@winner-fed/plugin-vant?minimal=true"><img src="https://img.shields.io/npm/dm/@winner-fed/plugin-vant.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>


## 功能特性

- 🚀 **自动按需引入**: 自动导入 Vant 组件和对应样式
- 🎯 **版本兼容**: 同时支持 Vant 2.x (Vue 2) 和 Vant 4.x (Vue 3)
- 🔧 **函数组件支持**: 针对 Vue 2 提供特殊的函数组件处理 (Toast、Dialog、Notify、ImagePreview)
- 📦 **无缝集成**: 与 WinJS 框架完美集成，配置简单
- 🎨 **样式优化**: 自动处理样式引入，避免样式冲突

## 安装

```bash
npm install @winner-fed/plugin-vant -D
# 或者
yarn add @winner-fed/plugin-vant
# 或者
pnpm add @winner-fed/plugin-vant
```

## 支持的版本

- **Vant 2.x**: 适用于 Vue 2 项目
- **Vant 4.x**: 适用于 Vue 3 项目

## 基础用法

### 1. 在 `.winrc.ts` 中配置插件

```typescript
import { defineConfig } from 'win';

export default defineConfig({
  plugins: ['@winner-fed/plugin-vant'],
  vant: {
    // 配置选项
  }
});
```

### 2. 安装 Vant 依赖

```bash
# Vue 3 项目
npm install vant@4

# Vue 2 项目  
npm install vant@2
```

### 3. 在代码中使用

#### Vue 3 项目 (Vant 4.x)

```vue
<template>
  <div>
    <van-button type="primary">按钮</van-button>
    <van-cell title="单元格" value="内容" />
  </div>
</template>

<script setup>
import { showToast } from 'vant';

// 函数调用
showToast('提示内容');
</script>
```

#### Vue 2 项目 (Vant 2.x)

```vue
<template>
  <div>
    <van-button type="primary">按钮</van-button>
    <van-cell title="单元格" value="内容" />
  </div>
</template>

<script>
export default {
  methods: {
    showToast() {
      // 通过 this 调用
      this.$toast('提示内容');
    }
  }
}
</script>
```

## 配置选项

### legacyFunction (Vue 2 项目专用)

针对 Vue 2 项目，配置需要全局引入的函数组件：

```typescript
export default defineConfig({
  plugins: ['@winner-fed/plugin-vant'],
  vant: {
    legacyFunction: ['Dialog', 'Toast', 'Notify', 'ImagePreview']
  }
});
```

#### 支持的函数组件

- `Dialog` - 弹出框
- `Toast` - 轻提示
- `Notify` - 消息通知
- `ImagePreview` - 图片预览

配置后，这些组件将：
1. 自动全局引入样式
2. 支持 `this.$dialog`、`this.$toast` 等方式调用
3. 支持在模板中使用 `<van-dialog>`、`<van-toast>` 等标签

## 使用示例

### Vue 3 完整示例

```vue
<template>
  <div class="demo">
    <van-button type="primary" @click="handleClick">
      点击按钮
    </van-button>
    
    <van-cell-group>
      <van-cell title="单元格" value="内容" />
      <van-cell title="单元格" value="内容" is-link />
    </van-cell-group>
  </div>
</template>

<script setup>
import { showToast, showDialog } from 'vant';

const handleClick = () => {
  showToast('按钮被点击了');
};

const handleDialog = () => {
  showDialog({
    title: '标题',
    message: '弹窗内容'
  });
};
</script>
```

### Vue 2 完整示例

```vue
<template>
  <div class="demo">
    <van-button type="primary" @click="handleClick">
      点击按钮
    </van-button>
    
    <van-cell-group>
      <van-cell title="单元格" value="内容" />
      <van-cell title="单元格" value="内容" is-link />
    </van-cell-group>
    
    <!-- 函数组件也可以作为标签使用 -->
    <van-dialog v-model="showDialog" title="标题">
      弹窗内容
    </van-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDialog: false
    };
  },
  methods: {
    handleClick() {
      this.$toast('按钮被点击了');
    },
    handleDialog() {
      this.$dialog.alert({
        title: '标题',
        message: '弹窗内容'
      });
    }
  }
}
</script>
```

## 工作原理

### Vue 3 项目

插件使用 `@vant/auto-import-resolver` 自动解析器，实现：
- 自动识别 `van-` 前缀的组件
- 按需引入对应的组件和样式
- 支持 Tree Shaking，减少打包体积

### Vue 2 项目

由于 Vue 2 和 Vant 2.x 的特殊性，插件提供了定制的解析器：
- 自动处理 `van-` 前缀组件的按需引入
- 特殊处理函数组件（Toast、Dialog 等）
- 生成运行时文件处理全局引入

## 注意事项

1. **版本匹配**: 确保使用正确的 Vant 版本
    - Vue 2 项目使用 Vant 2.x
    - Vue 3 项目使用 Vant 4.x

2. **函数组件**: Vue 2 项目中的函数组件需要通过 `legacyFunction` 配置

3. **样式处理**: 插件会自动处理样式引入，无需手动引入 CSS

4. **按需引入**: 未使用的组件不会被打包，自动实现 Tree Shaking

## 常见问题

### Q: 为什么 Vue 2 项目需要 legacyFunction 配置？

A: Vue 2 的 Vant 2.x 中，Toast、Dialog 等函数组件需要特殊处理才能正确引入样式和支持全局调用。

### Q: 可以同时使用标签和函数调用吗？

A: 可以。配置了 `legacyFunction` 后，既可以使用 `<van-dialog>` 标签，也可以使用 `this.$dialog()` 函数调用。

### Q: 如何确认插件是否正常工作？

A: 可以查看生成的 `auto-imports.d.ts` 和 `components.d.ts` 文件，确认类型声明是否正确生成。

## 许可证

[MIT](./LICENSE).
