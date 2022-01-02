<!-- package-name start -->

# use-canvas

<!-- package-name end -->

## Installation

<!-- installation start -->

```sh
# Yarn
yarn add use-canvas

# NPM
npm install use-canvas
```

<!-- installation end -->

## Usage

<!-- hook-description start -->

Provides functionality to draw on a canvas.
It requires to pass a width and a height value. The hook scales
the canvas based on passed dimensions and the device displayPixelRatio.

The core functionality can be accessed by setting the `draw`
attribute: it is a callback that accepts a `CanvasEvent`. If
`loop` is set to `true`, draw function will be called for every
animation frame, otherwise will be called once.

```jsx
import { useCanvas } from "use-canvas"

const App = () => {
  const ref = useCanvas({
    width: 400,
    height: 400,

    draw: (event) => {
      const ctx = event.canvas.getContext("2d")
      ...
    }
  })
  return <canvas ref={ref} />
}
```

In order to bind the hook to a canvas, you can pass a ref

```js
const ref = useRef()
useCanvas({ ref, ... })
return <canvas ref={ref} />
```

or use the returned one:

```js
const ref = useCanvas({ ... })
return <canvas ref={ref} />
```

<!-- hook-description end -->

## Options

<!-- canvas-options start -->

```ts
interface CanvasOptions {
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
```

<!-- canvas-options end -->

## Event

<!-- canvas-event-description start -->

Event passed to `useCanvas` callbacks (see `draw` or `onResize`).
It holds informations about the canvas, the loop (such as elapsed time)
and user interaction (such as mouse position).

<!-- canvas-event-description end -->

<!-- canvas-event start -->

```ts
interface CanvasEvent {
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
```

<!-- canvas-event end -->
