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
  const majorStep = step * 4;
  const left = -viewport.x / viewport.scale;
  const top = -viewport.y / viewport.scale;
  const canvasWidth = width / viewport.scale;
  const canvasHeight = height / viewport.scale;

  return (
    <Shape
      listening={false}
      perfectDrawEnabled={false}
      sceneFunc={(context) => {
        const padding = majorStep;
        const x = Math.floor((left - padding) / step) * step;
        const y = Math.floor((top - padding) / step) * step;
        const backgroundWidth = canvasWidth + padding * 2;
        const backgroundHeight = canvasHeight + padding * 2;

        context.fillStyle = dark ? "#0b0b0d" : "#f8f7fc";
        context.fillRect(x, y, backgroundWidth, backgroundHeight);

        const glow = context.createRadialGradient(
          left + canvasWidth * 0.18,
          top + canvasHeight * 0.12,
          0,
          left + canvasWidth * 0.18,
          top + canvasHeight * 0.12,
          Math.max(canvasWidth, canvasHeight) * 0.72,
        );
        glow.addColorStop(
          0,
          dark ? "rgba(139, 92, 246, 0.045)" : "rgba(139, 92, 246, 0.075)",
        );
        glow.addColorStop(1, "rgba(139, 92, 246, 0)");
        context.fillStyle = glow;
        context.fillRect(x, y, backgroundWidth, backgroundHeight);

        context.beginPath();
        for (
          let majorX = Math.floor(x / majorStep) * majorStep;
          majorX <= x + backgroundWidth;
          majorX += majorStep
        ) {
          context.moveTo(majorX, y);
          context.lineTo(majorX, y + backgroundHeight);
        }
        for (
          let majorY = Math.floor(y / majorStep) * majorStep;
          majorY <= y + backgroundHeight;
          majorY += majorStep
        ) {
          context.moveTo(x, majorY);
          context.lineTo(x + backgroundWidth, majorY);
        }
        context.strokeStyle = dark
          ? "rgba(148, 163, 184, 0.08)"
          : "rgba(124, 58, 237, 0.07)";
        context.lineWidth = 0.75 / viewport.scale;
        context.stroke();

        const dotRadius = 1.05 / viewport.scale;
        context.beginPath();
        for (let dotX = x; dotX <= x + backgroundWidth; dotX += step) {
          for (let dotY = y; dotY <= y + backgroundHeight; dotY += step) {
            context.moveTo(dotX + dotRadius, dotY);
            context.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
          }
        }
        context.fillStyle = dark
          ? "rgba(148, 163, 184, 0.22)"
          : "rgba(124, 58, 237, 0.20)";
        context.fill();
      }}
    />
  );
}

export default GridPattern;
