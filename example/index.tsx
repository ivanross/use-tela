import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useWindowSize } from 'react-use';
import { Leva, useControls } from 'leva';
import * as C from 'canova';
import Stats from 'stats.js';
import SimplexNoise from 'simplex-noise';
import * as _ from 'lodash';

import { useCanvas } from '../.';
import { LogsContainer } from './src/LogContainer';
import { useConst } from './src/useConst';

const simplex = new SimplexNoise();
const stats = new Stats();

document.body.appendChild(stats.dom);

class Dot {
  x: number;
  y: number;

  constructor(width: number, height: number) {
    this.random(width, height);
  }

  random(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
  }
  update(time: number) {
    const { x, y } = this;

    const t = time * 0.4;
    const amp = 2;
    const sp = 0.005;
    this.x += amp * simplex.noise3D(x * sp, y * sp, t);
    this.y += amp * simplex.noise3D(x * sp, y * sp, t + 1);
  }
}

class Model {
  dots: Dot[];
  i = 0;

  constructor(width: number, height: number) {
    this.dots = _.range(10000).map(() => new Dot(width, height));
  }

  update(width: number, height: number, time: number) {
    _.times(150).forEach(() => {
      this.i = (this.i + 1) % this.dots.length;
      this.dots[this.i].random(width, height);
    });

    this.dots.forEach(dot => dot.update(time));
  }
}

function App() {
  const { fill, showConsole } = useControls({
    fill: 'teal',
    showConsole: false,
  });

  const { width, height } = useWindowSize();
  const model = useConst(() => new Model(width, height));

  const ref = useCanvas({
    width,
    height,
    loop: true,

    draw: e => {
      stats.begin();

      model.update(e.width, e.height, e.time);

      C.draw(e.canvas, [
        C.rect(0, 0, e.width, e.height, { fill: 'black', opacity: 0.08 }),

        ...model.dots.map(dot =>
          C.circle(dot.x, dot.y, 1, { fill, opacity: 0.3 })
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
