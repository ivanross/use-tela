export function scaleByDevicePixelRatio(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  maxDpr = 4
) {
  const dpr = Math.min(maxDpr, window.devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const context = canvas.getContext('2d');
  context?.scale(dpr, dpr);
}
