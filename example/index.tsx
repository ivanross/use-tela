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
function App() {
  const { fill, showConsole } = useControls({
    fill: 'teal',
    showConsole: false,
  });

  const { width, height } = useWindowSize();
  const model = useConst(() => {
    class Dot {
      x = Math.random() * width;
      y = Math.random() * height;

      update(time: number) {
        const { x, y } = this;

        const t = time * 0.008;
        const amp = 2;
        const sp = 0.005;
        this.x += simplex.noise3D(x * sp, y * sp, time * t) * amp;
        this.y += simplex.noise3D(x * sp, y * sp, 10 + time * t) * amp;
      }
    }

    return {
      dots: _.range(5000).map(() => new Dot()),
    };
  });

  const ref = useCanvas({
    width,
    height,
    loop: true,

    draw: e => {
      stats.begin();

      model.dots.forEach(dot => dot.update(e.time));

      C.draw(e.canvas, [
        C.rect(0, 0, e.width, e.height, { fill: 'black', opacity: 0.08 }),

        ...model.dots.map(dot => C.circle(dot.x, dot.y, 2, { fill })),
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
