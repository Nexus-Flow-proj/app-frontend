import { CANVAS_GRID_SIZE } from "../../constants";
import { Shape } from "react-konva";
import type { CanvasViewport } from "../../types";

interface GridPatternProps {
  width: number;
  height: number;
  viewport: CanvasViewport;
  dark: boolean;
}

function GridPattern({ width, height, viewport, dark }: GridPatternProps) {
  const step = CANVAS_GRID_SIZE;
  const left = -viewport.x / viewport.scale;
  const top = -viewport.y / viewport.scale;
  const right = left + width / viewport.scale;
  const bottom = top + height / viewport.scale;

  const startX = Math.floor(left / step) * step;
  const startY = Math.floor(top / step) * step;
  const endX = Math.ceil(right / step) * step;
  const endY = Math.ceil(bottom / step) * step;

  return (
    <Shape
      listening={false}
      perfectDrawEnabled={false}
      fill={dark ? "#4c3c70" : "#cbd5e1"}
      opacity={dark ? 0.55 : 0.7}
      sceneFunc={(context, shape) => {
        const radius = 1 / viewport.scale;
        context.beginPath();
        for (let x = startX - step; x <= endX + step; x += step) {
          for (let y = startY - step; y <= endY + step; y += step) {
            context.moveTo(x + radius, y);
            context.arc(x, y, radius, 0, Math.PI * 2, false);
          }
        }
        context.fillStrokeShape(shape);
      }}
    />
  );
}

export default GridPattern;
