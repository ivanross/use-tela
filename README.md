<!-- package-name start -->

# use-tela

<!-- package-name end -->

## Installation

<!-- installation start -->

```sh
# Yarn
yarn add use-tela

# NPM
npm install use-tela
```

<!-- installation end -->

## Usage

<!-- hook-description start -->

`useTela` provides functionality to draw on a canvas.
 It requires to pass a width and a height value. The hook scales
 the canvas based on passed dimensions and the device displayPixelRatio.

 The core functionality can be accessed by setting the `draw`
 attribute: it is a callback that accepts a `TelaEvent`. If
 `loop` is set to `true`, draw function will be called for every
 animation frame, otherwise it will be called once.


 ```jsx
 import { useTela } from "use-tela"

 const App = () => {
   const ref = useTela({
     width: 400,
     height: 400,
     loop: true,

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
 useTela({ ref, ... })
 return <canvas ref={ref} />
 ```

 or use the returned one:

 ```js
 const ref = useTela({ ... })
 return <canvas ref={ref} />
 ```

<!-- hook-description end -->

## Options

<!-- canvas-options start -->

```ts
interface TelaOptions {
  /** Tela width */
  width: number;
  /** Tela height */
  height: number;
  /** Max devicePixelRatio value. Default is `4` */
  maxDpr?: number;

  /**
   * Ref holding the canvas element. If you omit
   * it, `useTela` will create and return one for you
   */
  ref?: React.RefObject<HTMLCanvasElement>;

  /** Enables drawing loop when `true`. Default is `false` */
  loop?: boolean;

  /**
   * Callback called for every loop frame (when `loop` is `true`)
   * and when the canvas resizes
   */
  draw?: (ev: TelaEvent) => void;
  /**
   * Callback called when the canvas resizes
   */
  onResize?: (ev: TelaEvent) => void;
}
```

<!-- canvas-options end -->

## Event

<!-- canvas-event-description start -->

Event passed to `useTela` callbacks (see `draw` or `onResize`).
 It holds informations about the canvas, the loop (such as elapsed time)
 and user interaction (such as mouse position).

<!-- canvas-event-description end -->

<!-- canvas-event start -->

```ts
interface TelaEvent {
  /** The canvas DOM element */
  canvas: HTMLCanvasElement;
  /** Tela width */
  width: number;
  /** Tela height */
  height: number;
  /** Elapsed time from first `useTela` call */
  time: number;
  /** Mouse position */
  mouse: Point2;
}
```

<!-- canvas-event end -->
