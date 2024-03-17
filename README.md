# useFreeScale

`useFreeScale` is a custom React Hook that provides the functionality of free scaling and dragging on HTML elements. It uses touchpad two-finger zoom and mouse dragging for scaling and moving operations.

## Usage

First, you need to call `useFreeScale` in your component and pass in a configuration object. This object has two optional properties: `scaleStep` and `customTrans`. `scaleStep` is the scale ratio, and `customTrans` is a function that takes the current transformation result and the new transformation result and returns a new transformation result.

```jsx
const customTrans = (prev: ITransRes, v: ITransRes) => {
  if (v.scale <= 0.3) {
    return prev;
  }
  return v;
};
const { containerRef, childRef, transform } = useFreeScale({
  customTrans,
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

This Hook can only be used in environments that support `wheel` events and `mousedown`, `mousemove`, `mouseup` events, such as modern web browsers. In addition, you need to ensure that your container element and child element are both block elements, and the size of the container element is large enough to accommodate the enlargement and movement of the child element.
