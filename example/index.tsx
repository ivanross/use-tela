import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useWindowSize } from 'react-use';
import { Leva, useControls } from 'leva';
import * as C from 'canova';
import { LayoutBlock, makeLayout } from 'yogurt-layout';
import Stats from 'stats.js';
// @ts-ignore
import SimplexNoise from 'simplex-noise';
import * as _ from 'lodash';
import * as d3 from 'd3';

import { CanvasEvent, Point2, useCanvas } from '../.';
import { LogsContainer } from './src/LogContainer';
import { useConst } from './src/useConst';

const simplex = new SimplexNoise();
const stats = new Stats();

document.body.appendChild(stats.dom);

interface BlockConfig {
  layout: LayoutBlock;
  fill1: string;
  fill2: string;
  offset: number;
}
const randomLuminosity = (fill: string) =>
  d3
    .color(fill)
    ?.darker((Math.random() * 2 - 1) * 3)
    .toString() ?? fill;
class Dot {
  position: Point2;
  private speed: Point2;
  private acceleration: Point2;

  private offset: number;
  fill: string;
  r: number;

  constructor(block: BlockConfig) {
    this.reset(block);
  }

  reset(block: BlockConfig) {
    this.offset = block.offset;

    this.r = 1.5;

    const px = Math.random();
    const py = Math.random();
    const x = px * block.layout.width + block.layout.left;
    const y = py * block.layout.height + block.layout.top;
    this.position = { x, y };

    this.speed = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };

    this.fill = randomLuminosity(
      d3.interpolateLab(block.fill1, block.fill2)(py)
    );
  }

  private repel(mouse: Point2) {
    const distance: Point2 = {
      x: this.position.x - mouse.x,
      y: this.position.y - mouse.y,
    };

    const squeredDist = distance.x ** 2 + distance.y ** 2;
    const maxDistance = 70;
    const repelled = squeredDist < maxDistance ** 2;

    if (repelled) {
      this.fill = 'purple';
      this.r = 3;

      const dist = Math.sqrt(squeredDist);
      this.acceleration.x += distance.x / dist;
      this.acceleration.y += distance.y / dist;
    }

    return repelled;
  }

  private noise(time: number) {
    const { x, y } = this.position;

    const t = time * 0.5;
    const amp = 2;
    const sp = 0.005;

    this.position.x += amp * simplex.noise3D(x * sp, y * sp, t + this.offset);
    this.position.y +=
      amp * simplex.noise3D(x * sp, y * sp, t + this.offset + 1);
  }

  private move() {
    this.speed.x += this.acceleration.x;
    this.speed.y += this.acceleration.y;

    this.acceleration = { x: 0, y: 0 };

    const dump = 0.7;
    this.speed.x *= dump;
    this.speed.y *= dump;

    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
  }

  update(ev: CanvasEvent) {
    this.repel(ev.mouse);
    this.noise(ev.time);
    this.move();
  }
}

class Model {
  dots: Dot[];
  i = 0;

  constructor(blocks: BlockConfig[]) {
    this.dots = _.range(10_000).map(() => new Dot(_.sample(blocks)!));
  }

  update(blocks: BlockConfig[], ev: CanvasEvent) {
    _.times(150).forEach(() => {
      this.i = (this.i + 1) % this.dots.length;
      this.dots[this.i].reset(_.sample(blocks)!);
    });
    this.dots.forEach(dot => dot.update(ev));
  }
}

function App() {
  const { fill, showConsole } = useControls({
    fill: '#008080',
    showConsole: false,
  });

  const p = '30%';
  const windowDimensions = useWindowSize();
  const layout = makeLayout({
    id: 'canvas',
    width: windowDimensions.width,
    height: windowDimensions.height,
    padding: 90,
    children: [
      { id: 'left' },
      {
        id: 'inside',
        width: 400,
        direction: 'column',
        children: [
          { id: '', children: [{ id: 'top' }, { id: '', width: p }] },
          { id: '', children: [{ id: '', width: p }, { id: 'center' }] },
          { id: '', children: [{ id: 'bottom' }, { id: '', width: p }] },
        ],
      },
      { id: 'right' },
    ],
  });

  const colors = ['#2FF3E0', '#F8D210', '#008080', '#2243e2'];

  const config: BlockConfig[] = [
    { layout: layout.top, fill1: colors[0], fill2: colors[1], offset: 0 },
    { layout: layout.center, fill1: colors[1], fill2: colors[2], offset: 0 },
    { layout: layout.bottom, fill1: colors[2], fill2: colors[3], offset: 0 },
  ];

  const model = useConst(() => new Model(config));

  const ref = useCanvas({
    width: layout.canvas.width,
    height: layout.canvas.height,
    loop: true,

    draw: event => {
      stats.begin();

      model.update(config, event);

      C.draw(event.canvas, [
        C.rect(0, 0, event.width, event.height, {
          fill: 'black',
          opacity: 0.08,
        }),

        ...model.dots.map(dot =>
          C.circle(dot.position.x, dot.position.y, dot.r, {
            fill: dot.fill,
            opacity: 0.3,
          })
        ),
      ]);

      stats.end();
    },
  });

  return (
    <>
      <canvas ref={ref} style={{ backgroundColor: 'black' }} />
      {showConsole && <LogsContainer />}
      <Leva collapsed />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
