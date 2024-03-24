# useFreeScale

[中文文档](https://github.com/ailuoku6/use-free-scale/blob/main/README_CN.md)

`useFreeScale` is a lightweight and high-performance custom React Hook that provides the functionality of free scaling and dragging (compatible with mobile touch events) on HTML elements. It uses touchpad two-finger zoom and mouse dragging for scaling and moving operations.

## Preview

![Preview](https://github.com/ailuoku6/use-free-scale/blob/main/snapshot/preview2.gif)

## Install

```bash
npm i use-free-scale
```

## Usage

First, you need to call `useFreeScale` in your component and pass in a configuration object. This object has two optional properties: `scaleStep` and `customTrans`. `scaleStep` is the scale ratio, and `customTrans` is a function that takes the current transformation result and the new transformation result and returns a new transformation result.

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

Then, you need to assign `containerRef` and `childRef` to your container element and child element, respectively. `transform` is a string that represents the current transformation state. You need to assign it to your child element's `style.transform` property.

```jsx
<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
  <div ref={childRef} style={{ transform }}>
    Content
  </div>
</div>
```

You can also use `setRotate`, `setScale`, and `setTransXY` to manually set the rotation angle, scale ratio, and displacement.

## API

### `useFreeScale(config: IUseFreeScale)`

#### Parameters

- `config`: A configuration object with two optional properties.
  - `scaleStep`: The scale ratio, the default value is 0.1.
  - `customTrans`: A custom transformation function. It takes two parameters: the current transformation result and the new transformation result, and returns a new transformation result. The default value is an identity function.

#### Return Value

- `containerRef`: A `React.RefObject`, you need to assign it to your container element.
- `childRef`: A `React.RefObject`, you need to assign it to your child element.
- `transform`: A string that represents the current transformation state. You need to assign it to your child element's `style.transform` property.
- `setRotate`: A function that you can use to manually set the rotation angle.
- `setScale`: A function that you can use to manually set the scale ratio.
- `setTransXY`: A function that you can use to manually set the displacement.

## Notes

This Hook can be used in environments that support `wheel` events, `mousedown`, `mousemove`, `mouseup` events, as well as mobile touch events, such as modern web browsers. In addition, you need to ensure that your container element and child element are both block elements, and the size of the container element is large enough to accommodate the enlargement and movement of the child element.
