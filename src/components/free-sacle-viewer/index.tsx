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
  const { containerRef, childRef, transform } = useFreeScale({
    customTrans,
  });

  return (
    <div className="container" ref={containerRef}>
      <div
        className="child"
        ref={childRef}
        style={{
          transform,
        }}
      ></div>
    </div>
  );
};
