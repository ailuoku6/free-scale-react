import React from "react";

import "./index.css";
import { useFreeScale, ITransRes } from "./use-free-scale";

interface IProps {
  children?: React.ReactNode;
}

const customTrans = (prev: ITransRes, v: ITransRes) => {
  if (v.scale <= 0.3) {
    return prev;
  }
  return v;
};

export const FreeScaleViewer = (props: IProps) => {
  const {
    transformConfigRef,
    containerRef,
    childRef,
    transform,
    setRotate,
    setScale,
    setTransXY,
  } = useFreeScale({
    customTrans,
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
        <button onClick={() => setRotate((prev) => prev + 30)}>rotate</button>
        <button
          onClick={() => {
            setRotate(0);
            setScale(1);
            const container = containerRef.current;
            const child = childRef.current;
            if (container && child) {
              const containerRect = container.getBoundingClientRect();
              const childRect = child.getBoundingClientRect();
              setTransXY([
                containerRect.width / 2 -
                  childRect.width / transformConfigRef.current.scale / 2,
                containerRect.height / 2 -
                  childRect.height / transformConfigRef.current.scale / 2,
              ]);
            }
          }}
        >
          reset
        </button>
      </div>
    </div>
  );
};
