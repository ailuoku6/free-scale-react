import React from "react";

import "./index.css";
import { useFreeScale } from "./use-free-scale";

interface IProps {
  children?: React.ReactNode;
}

export const FreeScaleViewer = (props: IProps) => {
  const { containerRef, childRef, transform } = useFreeScale({
    customTrans: (prev, v) => {
      if (v.scale <= 0.3) {
        return prev;
      }
      return v;
    },
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
