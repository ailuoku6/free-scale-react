import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// 缩放比例
const defaultScaleStep = 0.1;

export interface ITransRes {
  transXY: [number, number];
  scale: number;
  rotate: number;
}

export type IDomRect = Pick<DOMRect, "height" | "width"> | undefined;

export interface IRectData {
  originConatinerRect: IDomRect;
  originChildRect: IDomRect;
}

export enum IAction {
  MOVE = "move",
  SCALE = "scale",
}

export interface IUseFreeScale {
  // 自定义缩放比例
  scaleStep?: number;
  // 自定义变换结果，如限制缩放比例，边界检测等
  customTrans?: (
    prev: ITransRes,
    v: ITransRes,
    rect: IRectData,
    action: IAction
  ) => ITransRes;
}

export const useFreeScale = ({
  scaleStep = defaultScaleStep,
  customTrans = (_prev, v) => v,
}: IUseFreeScale) => {
  const [transXY, setTransXY] = useState<[number, number]>([0, 0]);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const mousedownLock = useRef(false);
  const mouseXY = useRef<[number, number]>([0, 0]);
  const containerRectRef = useRef<IDomRect>(undefined);
  const childRectRef = useRef<IDomRect>(undefined);

  const touchPointsRef = useRef<Array<[number, number]>>([]);

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

  const getOriginRect = useCallback(() => {
    const originConatinerRect =
      containerRectRef.current || containerRef.current?.getBoundingClientRect();
    containerRectRef.current = originConatinerRect;

    const originChildRect =
      childRectRef.current || childRef.current?.getBoundingClientRect();
    childRectRef.current = originChildRect;

    return { originConatinerRect, originChildRect };
  }, []);

  const handleMove = useCallback(
    ({ point }: { point: [number, number] }) => {
      const transXY_ = transformConfigRef.current.transXY;
      const deltaXY = [
        point[0] - mouseXY.current[0],
        point[1] - mouseXY.current[1],
      ];
      mouseXY.current = [point[0], point[1]];
      const customTransRes = customTrans(
        transformConfigRef.current,
        {
          ...transformConfigRef.current,
          transXY: [transXY_[0] + deltaXY[0], transXY_[1] + deltaXY[1]],
        },
        getOriginRect(),
        IAction.MOVE
      );

      setTransXY(customTransRes.transXY);
    },
    [customTrans, getOriginRect]
  );

  const handleMoveEvent = useCallback(
    (e: MouseEvent) => {
      if (!mousedownLock.current) {
        return;
      }
      e.preventDefault();
      handleMove({ point: [e.clientX, e.clientY] });
    },
    [handleMove]
  );

  const handleScale = useCallback(
    ({
      direc,
      scaleDelta,
      targetPoint,
    }: {
      direc: -1 | 1;
      scaleDelta: number;
      // 焦点
      targetPoint: [number, number];
    }) => {
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

        const deltaOffset = [
          (((targetPoint[0] - childCenter[0]) * direc) /
            transformConfigRef.current.scale) *
            scaleDelta,
          (((targetPoint[1] - childCenter[1]) * direc) /
            transformConfigRef.current.scale) *
            scaleDelta,
        ];

        const customTransRes = customTrans(
          transformConfigRef.current,
          {
            transXY: [
              transformConfigRef.current.transXY[0] - deltaOffset[0],
              transformConfigRef.current.transXY[1] - deltaOffset[1],
            ],
            scale: transformConfigRef.current.scale + direc * scaleDelta,
            rotate: transformConfigRef.current.rotate,
          },
          getOriginRect(),
          IAction.SCALE
        );

        setScale(customTransRes.scale);
        setTransXY(customTransRes.transXY);
        setRotate(customTransRes.rotate);
      }
    },
    [customTrans, getOriginRect]
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

      handleScale({
        direc,
        scaleDelta: scaleStep,
        targetPoint: [e.clientX, e.clientY],
      });
    },
    [handleScale, scaleStep]
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
      };

      container.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMoveEvent);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        container.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMoveEvent);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [handleMoveEvent]);

  // 移动端触摸事件
  useEffect(() => {
    // 在container内可响应放大缩小
    // 在child内可响应移动
    const container = containerRef.current;
    const child = childRef.current;
    if (container && child) {
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          e.preventDefault();
          mousedownLock.current = true;
          mouseXY.current = [e.touches[0].clientX, e.touches[0].clientY];
        } else if (e.touches.length === 2) {
          // 缩放，记录两个触摸点
          e.preventDefault();
          touchPointsRef.current = [
            [e.touches[0].clientX, e.touches[0].clientY],
            [e.touches[1].clientX, e.touches[1].clientY],
          ];
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1 && mousedownLock.current) {
          e.preventDefault();
          const touch = e.touches[0];
          handleMove({ point: [touch.clientX, touch.clientY] });
        } else if (e.touches.length === 2) {
          // 缩放
          e.preventDefault();
          const [p1, p2] = [
            [e.touches[0].clientX, e.touches[0].clientY],
            [e.touches[1].clientX, e.touches[1].clientY],
          ];
          const [preP1, preP2] = touchPointsRef.current;
          const preDistance = Math.sqrt(
            (preP1[0] - preP2[0]) ** 2 + (preP1[1] - preP2[1]) ** 2
          );
          const distance = Math.sqrt(
            (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2
          );

          const direc = distance > preDistance ? 1 : -1;

          // 焦点
          const targetPoint: [number, number] = [
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2,
          ];

          handleScale({
            direc,
            scaleDelta: Math.abs((distance - preDistance) / preDistance),
            targetPoint,
          });
        }
      };

      const handleTouchEnd = () => {
        mousedownLock.current = false;
      };

      container.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        container.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [handleMove, handleScale]);

  const transform = useMemo(() => {
    return `translateX(${transXY[0]}px) translateY(${transXY[1]}px) rotate(${rotate}deg) scale(${scale})`;
  }, [rotate, scale, transXY]);

  return {
    transformConfigRef,
    containerRef,
    childRef,
    transform,
    rotate,
    scale,
    transXY,
    setRotate,
    setScale,
    setTransXY,
  };
};
