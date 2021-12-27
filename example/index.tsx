import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useWindowSize } from 'react-use';
import { useControls } from 'leva';
import * as C from 'canova';
import Stats from 'stats.js';
import { useCanvas } from '../.';
import { LogsContainer } from './src/LogContainer';

const stats = new Stats();
document.body.appendChild(stats.dom);
function App() {
  const { fill, showConsole } = useControls({
    fill: 'teal',
    showConsole: false,
  });

  const size = useWindowSize();
  const ref = useCanvas(
    { ...size, loop: true },
    {
      draw: e => {
        stats.begin();
        const t = e.time;
        const r = 100 + Math.cos(t * 10) * 10;

        C.draw(e.canvas, [
          C.rect(0, 0, e.width, e.height, { fill: 'black' }),
          C.circle(
            e.width / 2 + r * Math.cos(t),
            e.height / 2 + r * Math.sin(t),
            r / 4,
            { fill }
          ),
          C.circle(e.mouse.x, e.mouse.y, 20, { fill: 'red' }),
        ]);

        stats.end();
      },
      onResize: d => console.log('resize'),
    }
  );

  return (
    <>
      <canvas ref={ref} />
      {showConsole && <LogsContainer />}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
