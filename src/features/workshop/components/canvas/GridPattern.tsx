import { CANVAS_GRID_SIZE } from "../../constants";
import { Circle } from "react-konva";
import type { CanvasViewport } from "../../types";

interface GridPatternProps {
  width: number;
  height: number;
  viewport: CanvasViewport;
}

function GridPattern({ width, height, viewport }: GridPatternProps) {
  const step = CANVAS_GRID_SIZE;
  const dots: React.ReactElement[] = [];
  const scaledStep = step * viewport.scale;
  const offsetX = viewport.x % scaledStep;
  const offsetY = viewport.y % scaledStep;

  for (let x = offsetX - scaledStep; x < width + scaledStep; x += scaledStep) {
    for (
      let y = offsetY - scaledStep;
      y < height + scaledStep;
      y += scaledStep
    ) {
      dots.push(
        <Circle
          key={`${Math.round(x)}-${Math.round(y)}`}
          x={x}
          y={y}
          radius={1}
          fill="#CBD5E1"
          opacity={0.55}
        />,
      );
    }
  }

  return <>{dots}</>;
}

export default GridPattern;
