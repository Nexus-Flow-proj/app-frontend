import { CANVAS_GRID_SIZE } from "../../constants";
import { Circle } from "react-konva";
import type { CanvasViewport } from "../../types";

interface GridPatternProps {
  width: number;
  height: number;
  viewport: CanvasViewport;
}

function GridPattern({ width, height, viewport }: GridPatternProps) {
  const step = CANVAS_GRID_SIZE; // The distance between grid dots in canvas/world pixels.
  const dots: React.ReactElement[] = []; // You will push many <Circle /> elements into it.

  // Stage already applies x/y/scale to every layer.
  // So the grid must be calculated in canvas/world coordinates, not screen coordinates.
  const left = -viewport.x / viewport.scale;
  const top = -viewport.y / viewport.scale;
  const right = left + width / viewport.scale;
  const bottom = top + height / viewport.scale;

  const startX = Math.floor(left / step) * step;
  const startY = Math.floor(top / step) * step;
  const endX = Math.ceil(right / step) * step;
  const endY = Math.ceil(bottom / step) * step;

  // This loops over the visible canvas/world area, with one extra step as padding.
  for (let x = startX - step; x <= endX + step; x += step) {
    for (let y = startY - step; y <= endY + step; y += step) {
      dots.push(
        <Circle
          key={`${Math.round(x)}-${Math.round(y)}`}
          x={x}
          y={y}
          radius={1 / viewport.scale}
          fill="#CBD5E1"
          opacity={0.7}
        />,
      );
    }
  }

  return <>{dots}</>;
}

export default GridPattern;
