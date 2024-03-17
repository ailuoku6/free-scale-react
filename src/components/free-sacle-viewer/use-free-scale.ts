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
  const [rotate, setRotate] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const mousedownLock = useRef(false);
  const mouseXY = useRef<[number, number]>([0, 0]);

  const requestAnimationRef = useRef<number | null>(null);

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

  const handleMove = useCallback(
    (e: MouseEvent) => {
      if (!mousedownLock.current) {
        return;
      }
      e.preventDefault();
      const transXY_ = transformConfigRef.current.transXY;
      const deltaXY = [
        e.clientX - mouseXY.current[0],
        e.clientY - mouseXY.current[1],
      ];
      mouseXY.current = [e.clientX, e.clientY];
      const customTransRes = customTrans(transformConfigRef.current, {
        ...transformConfigRef.current,
        transXY: [transXY_[0] + deltaXY[0], transXY_[1] + deltaXY[1]],
      });
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
      requestAnimationRef.current = requestAnimationFrame(() => {
        setTransXY(customTransRes.transXY);
      });
      // setTransXY(customTransRes.transXY);
    },
    [customTrans]
  );

  const handleGesture = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY === 0) {
        return;
      }

      if (mousedownLock.current) {
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

        if (requestAnimationRef.current) {
          cancelAnimationFrame(requestAnimationRef.current);
        }
        requestAnimationRef.current = requestAnimationFrame(() => {
          setScale(customTransRes.scale);
          setTransXY(customTransRes.transXY);
          setRotate(customTransRes.rotate);
        });
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

  useEffect(() => {
    const child = childRef.current;
    const container = containerRef.current;

    if (child && container) {
      const handleMouseDown = (e: MouseEvent) => {
        mousedownLock.current = true;
        mouseXY.current = [e.clientX, e.clientY];
      };

      const handleMouseUp = () => {
        mousedownLock.current = false;
        if (requestAnimationRef.current) {
          cancelAnimationFrame(requestAnimationRef.current);
          requestAnimationRef.current = null;
        }
      };

      child.addEventListener("mousedown", handleMouseDown);
      child.addEventListener("mouseup", handleMouseUp);
      child.addEventListener("mousemove", handleMove);
      container.addEventListener("mouseup", handleMouseUp);

      return () => {
        child.removeEventListener("mousedown", handleMouseDown);
        child.removeEventListener("mouseup", handleMouseUp);
        child.removeEventListener("mousemove", handleMove);
        container.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [handleMove]);

  useEffect(() => {
    return () => {
      const requestFrameId = requestAnimationRef.current;
      if (requestFrameId) {
        cancelAnimationFrame(requestFrameId);
      }
    };
  }, []);

  const transform = useMemo(() => {
    return `translateX(${transXY[0]}px) translateY(${transXY[1]}px) rotate(${rotate}deg) scale(${scale})`;
  }, [rotate, scale, transXY]);

  return {
    containerRef,
    childRef,
    transform,
    setRotate,
    setScale,
    setTransXY,
  };
};
