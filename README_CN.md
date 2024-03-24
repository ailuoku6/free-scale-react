# useFreeScale

`useFreeScale` 是一个轻量级且高性能的自定义 React Hook，它为 HTML 元素提供了自由缩放和拖动的功能（兼容移动端触摸事件）。它使用触摸板的双指缩放和鼠标拖动来进行缩放和移动操作。

## 预览

![预览](https://github.com/ailuoku6/use-free-scale/blob/main/snapshot/preview2.gif)

## 安装

```bash
npm i use-free-scale
```

## 使用方法

首先，你需要在你的组件中调用 `useFreeScale` 并传入一个配置对象。这个对象有两个可选属性：`scaleStep` 和 `customTrans`。`scaleStep` 是缩放比例，`customTrans` 是一个函数，它接收当前的变换结果和新的变换结果，并返回一个新的变换结果。

```jsx
import { useFreeScale, ITransRes, IRectData } from "use-free-scale";

const customLimitScaleTrans = (
  prev: ITransRes,
  v: ITransRes,
  rects: IRectData
) => {
  if (v.scale <= 0.3 || v.scale >= 3) {
    return prev;
  }
  return v;
};

const customFreeTrans = (_: ITransRes, v: ITransRes) => v;

const containerLimitTrans = (
  prev: ITransRes,
  v: ITransRes,
  rects: IRectData
) => {
  // 限制变换后的子元素不能超出容器
  const { originConatinerRect, originChildRect } = rects;
  // 高度加变换距离绝对值，小于容器高度
  const limitY =
    Math.abs(v.transXY[1]) + ((originChildRect?.height || 0) * v.scale) / 2 <
    (originConatinerRect?.height || 0) / 2;
  // 宽度加变换距离绝对值，小于容器宽度
  const limitX =
    Math.abs(v.transXY[0]) + ((originChildRect?.width || 0) * v.scale) / 2 <
    (originConatinerRect?.width || 0) / 2;

  if (!limitX || !limitY) {
    return prev;
  }
  return v;
};

const { containerRef, childRef, transform } = useFreeScale({
  customTrans: customLimitScaleTrans,
});
```

然后，你需要将 `containerRef` 和 `childRef` 分别赋给你的容器元素和子元素。`transform` 是一个表示当前变换状态的字符串，你需要将它赋给你的子元素的 `style.transform` 属性。

```jsx
<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
  <div ref={childRef} style={{ transform }}>
    内容
  </div>
</div>
```

你也可以使用 `setRotate`, `setScale`, 和 `setTransXY` 来手动设置旋转角度，缩放比例，和位移。

## API

### `useFreeScale(config: IUseFreeScale)`

#### 参数

- `config`: 一个带有两个可选属性的配置对象。
  - `scaleStep`: 缩放比例，默认值是 0.1。
  - `customTrans`: 自定义变换函数。它接收两个参数：当前的变换结果和新的变换结果，并返回一个新的变换结果。默认值是恒等函数。

#### 返回值

- `containerRef`: 一个 `React.RefObject`，你需要将它赋给你的容器元素。
- `childRef`: 一个 `React.RefObject`，你需要将它赋给你的子元素。
- `transform`: 一个表示当前变换状态的字符串，你需要将它赋给你的子元素的 `style.transform` 属性。
- `setRotate`: 一个函数，你可以用它来手动设置旋转角度。
- `setScale`: 一个函数，你可以用它来手动设置缩放比例。
- `setTransXY`: 一个函数，你可以用它来手动设置位移。

## 注意事项

这个 Hook 可以在支持 `wheel` 事件、`mousedown`、`mousemove`、`mouseup` 事件以及移动端触摸事件的环境中使用，例如现代的网页浏览器。另外，你需要确保你的容器元素和子元素都是块级元素，且容器元素的大小足够大，能够容纳子元素的放大和移动。
