import React from "react";

import "./index.css";
import { useFreeScale, ITransRes, IRectData } from "../hooks/use-free-scale";

interface IProps {
  children?: React.ReactNode;
}

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

const transOptionsMap = {
  free: customFreeTrans,
  "limit scale": customLimitScaleTrans,
  "container limit": containerLimitTrans,
};

export const FreeScaleViewer = (props: IProps) => {
  const [customTrans, setCustomTrans] =
    React.useState<keyof typeof transOptionsMap>("free");

  const {
    // transformConfigRef,
    containerRef,
    childRef,
    transform,
    setRotate,
    setScale,
    setTransXY,
  } = useFreeScale({
    customTrans: transOptionsMap[customTrans],
  });

  return (
    <div>
      <div className="container" ref={containerRef}>
        <div
          className="child"
          ref={childRef}
          style={{
            transform,
          }}
        >
          content
        </div>
      </div>
      <div className="action">
        {Object.keys(transOptionsMap).map((key) => {
          // 单选项
          return (
            <label key={key}>
              <input
                type="radio"
                value={key}
                checked={customTrans === key}
                onChange={() => {
                  setRotate(0);
                  setScale(1);
                  setTransXY([0, 0]);
                  setCustomTrans(key as keyof typeof transOptionsMap);
                }}
              />
              {key}
            </label>
          );
        })}
      </div>

      <div className="action">
        <button onClick={() => setRotate((prev) => prev + 30)}>rotate</button>
        <button
          onClick={() => {
            setRotate(0);
            setScale(1);
            setTransXY([0, 0]);
          }}
        >
          reset
        </button>
      </div>
    </div>
  );
};
