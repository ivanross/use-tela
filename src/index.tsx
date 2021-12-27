import * as React from 'react';
import { useConst } from './useConst';
import { scaleByDevicePixelRatio } from './scaleByDevicePixelRatio';

export type Point2 = { x: number; y: number };

export interface CanvasEvent {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  time: number;
  mouse: Point2;
}

export interface CanvasOptions {
  width: number;
  height: number;
  ref?: React.RefObject<HTMLCanvasElement>;

  loop?: boolean;
  maxDpr?: number;

  draw?: (ev: CanvasEvent) => void;
  onResize?: (ev: CanvasEvent) => void;
}

const noop = () => {};

export function useCanvas(options: CanvasOptions) {
  const {
    width,
    height,
    ref: userRef,
    maxDpr = 4,
    loop: shouldLoop = false,
    draw = noop,
    onResize,
  } = options;

  const internalRef = React.useRef<HTMLCanvasElement>(null);
  const ref = userRef ?? internalRef;

  const internal = useConst(() => ({
    startTime: Date.now(),

    // @ts-ignore
    get time() {
      return (Date.now() - this.startTime) / 1000;
    },

    mouse: { x: 0, y: 0 } as Point2,
  }));

  React.useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    scaleByDevicePixelRatio(canvas, width, height, maxDpr);

    const createEvent = (): CanvasEvent => ({
      canvas,
      width,
      height,
      time: internal.time,
      mouse: internal.mouse,
    });

    onResize?.(createEvent());

    let cancel = false;
    const loop = () => {
      draw?.(createEvent());
      requestAnimationFrame(() => !cancel && shouldLoop && loop());
    };

    loop();

    return () => {
      cancel = true;
    };
  }, [width, height, maxDpr, shouldLoop, draw]);

  React.useEffect(() => {
    const canvas = ref.current;

    if (!canvas) return;
    const handleMove = (ev: PointerEvent) => {
      internal.mouse = { x: ev.offsetX, y: ev.offsetY };
    };

    canvas.addEventListener('pointermove', handleMove);
    return () => {
      canvas.removeEventListener('pointermove', handleMove);
    };
  }, []);

  return ref;
}
