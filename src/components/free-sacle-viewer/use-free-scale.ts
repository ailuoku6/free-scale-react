import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// 缩放比例
const defaultScaleStep = 0.1;

interface ITransRes {
  transXY: [number, number];
  scale: number;
  rotate: number;
}

interface IUseFreeScale {
  // 自定义缩放比例
  scaleStep?: number;
  // 自定义变换结果，如限制缩放比例，边界检测等
  customTrans?: (prev: ITransRes, v: ITransRes) => ITransRes;
}

export const useFreeScale = ({
  scaleStep = defaultScaleStep,
  customTrans = (prev, v) => v,
}: IUseFreeScale) => {
  const [transXY, setTransXY] = useState<[number, number]>([0, 0]);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(45);

  const containerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const transformConfigRef = useRef<ITransRes>({
    transXY,
    scale,
    rotate,
  });

  transformConfigRef.current = {
    transXY,
    scale,
    rotate,
  };

  useEffect(() => {
    // 初始化，将子元素放在容器中心
    const container = containerRef.current;
    const child = childRef.current;
    if (container && child) {
      const containerRect = container.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      setTransXY([
        containerRect.width / 2 - childRect.width / 2,
        containerRect.height / 2 - childRect.height / 2,
      ]);
    }
  }, []);

  const handleGesture = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      console.log("handleGesture", e);

      if (e.deltaY === 0) {
        return;
      }

      const direc = e.deltaY > 0 ? -1 : 1;

      // 缩放中心点，缩放方向
      // 先假定缩放中心点为容器中心
      const container = containerRef.current;
      const child = childRef.current;
      if (container && child) {
        // const containerRect = container.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();
        const childCenter = [
          childRect.left + childRect.width / 2,
          childRect.top + childRect.height / 2,
        ];

        // 焦点
        const targetPoint = [e.clientX, e.clientY];

        const deltaOffset = [
          (((targetPoint[0] - childCenter[0]) * direc) /
            transformConfigRef.current.scale) *
            scaleStep,
          (((targetPoint[1] - childCenter[1]) * direc) /
            transformConfigRef.current.scale) *
            scaleStep,
        ];

        const customTransRes = customTrans(transformConfigRef.current, {
          transXY: [
            transformConfigRef.current.transXY[0] - deltaOffset[0],
            transformConfigRef.current.transXY[1] - deltaOffset[1],
          ],
          scale: transformConfigRef.current.scale + direc * scaleStep,
          rotate: transformConfigRef.current.rotate,
        });

        setScale(customTransRes.scale);
        setTransXY(customTransRes.transXY);
        setRotate(customTransRes.rotate);
      }
    },
    [customTrans, scaleStep]
  );

  useEffect(() => {
    const container = containerRef.current;
    const child = childRef.current;
    if (container && child) {
      container.addEventListener("wheel", handleGesture);
      return () => {
        container.removeEventListener("wheel", handleGesture);
      };
    }
  }, [handleGesture]);

  const transform = useMemo(() => {
    return `translateX(${transXY[0]}px) translateY(${transXY[1]}px) rotate(${rotate}deg) scale(${scale})`;
  }, [rotate, scale, transXY]);

  return {
    containerRef,
    childRef,
    transform,
    setRotate,
  };
};
