import * as React from 'react';
import { useConst } from './useConst';
import { scaleByDevicePixelRatio } from './scaleByDevicePixelRatio';
import { noop } from './noop';

export type Point2 = { x: number; y: number };

/**
 * Event passed to `useCanvas` callbacks (see `draw` or `onResize`).
 * It holds informations about the canvas, the loop (such as elapsed time)
 * and user interaction (such as mouse position).
 */
export interface CanvasEvent {
  /** The canvas DOM element */
  canvas: HTMLCanvasElement;
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Elapsed time from first `useCanvas` call */
  time: number;
  /** Mouse position */
  mouse: Point2;
}

export interface CanvasOptions {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Max devicePixelRatio value. Default is `4` */
  maxDpr?: number;

  /**
   * Ref holding the canvas element. If you omit
   * it, `useCanvas` will create and return one for you
   */
  ref?: React.RefObject<HTMLCanvasElement>;

  /** Enables drawing loop when `true`. Default is `false` */
  loop?: boolean;

  /**
   * Callback called for every loop frame (when `loop` is `true`)
   * and when the canvas resizes
   */
  draw?: (ev: CanvasEvent) => void;
  /**
   * Callback called when the canvas resizes
   */
  onResize?: (ev: CanvasEvent) => void;
}

/**
 * Provides functionality to draw on a canvas.
 * It requires to pass a width and a height value. The hook scales
 * the canvas based on passed dimensions and the device displayPixelRatio.
 *
 * The core functionality can be accessed by setting the `draw`
 * attribute: it is a callback that accepts a `CanvasEvent`. If
 * `loop` is set to `true`, draw function will be called for every
 * animation frame.
 *
 *
 * ```jsx
 * import { useCanvas } from "use-canvas"
 *
 * const App = () => {
 *   const ref = useCanvas({
 *     width: 400,
 *     height: 400,
 *
 *     draw: (event) => {
 *       const ctx = event.canvas.getContext("2d")
 *       ...
 *     }
 *   })
 *   return <canvas ref={ref} />
 * }
 * ```
 *
 * In order to bind the hook to a canvas, you can pass a ref
 *
 * ```js
 * const ref = useRef()
 * useCanvas({ ref, ... })
 * return <canvas ref={ref} />
 * ```
 *
 * or use the returned one:
 *
 * ```js
 * const ref = useCanvas({ ... })
 * return <canvas ref={ref} />
 * ```
 *
 */
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

  const event = React.useCallback(
    (canvas: HTMLCanvasElement): CanvasEvent => ({
      canvas,
      width,
      height,
      time: internal.time,
      mouse: internal.mouse,
    }),
    [width, height, internal]
  );

  React.useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    scaleByDevicePixelRatio(canvas, width, height, maxDpr);
    onResize?.(event(canvas));
  }, [width, height, maxDpr, event]);

  React.useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let cancel = false;
    const loop = () => {
      draw?.(event(canvas));
      requestAnimationFrame(() => !cancel && shouldLoop && loop());
    };

    loop();

    return () => {
      cancel = true;
    };
  }, [shouldLoop, draw, event]);

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
