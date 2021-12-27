import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useWindowSize } from 'react-use';
import { useControls } from 'leva';
import * as C from 'canova';
import { useCanvas } from '../.';

function App() {
  const { fill } = useControls({ fill: 'teal' });

  const size = useWindowSize();
  const ref = useCanvas(
    { ...size, loop: true },
    {
      draw: e => {
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
        ]);
      },
      onResize: d => console.log('resize'),
    }
  );

  return <canvas ref={ref} />;
}

ReactDOM.render(<App />, document.getElementById('root'));
