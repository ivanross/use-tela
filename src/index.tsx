import * as React from 'react';
import { useConst } from './useConst';
import { scaleByDevicePixelRatio } from './scaleByDevicePixelRatio';

interface CanvasProps {
  width: number;
  height: number;
  loop?: boolean;
  maxDpr?: number;
}

interface CanvasEvent {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  time: number;
}

interface CanvasLoopOptions {
  draw?: (ev: CanvasEvent) => void;
  onResize?: (ev: CanvasEvent) => void;
}

const noop = () => {};

export function useCanvas(props: CanvasProps, options: CanvasLoopOptions) {
  const { width, height, maxDpr = 4, loop: shouldLoop = false } = props;
  const { draw = noop, onResize } = options;

  const ref = React.useRef<HTMLCanvasElement>(null);

  const internal = useConst(() => ({
    startTime: Date.now(),

    // @ts-ignore
    get time() {
      return (Date.now() - this.startTime) / 1000;
    },
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

  return ref;
}
