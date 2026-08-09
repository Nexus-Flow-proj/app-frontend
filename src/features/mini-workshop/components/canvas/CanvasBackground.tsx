import { memo } from "react";
import { Shape } from "react-konva";
import { MINI_CANVAS } from "../../constants/design";

interface CanvasBackgroundProps {
  bounds: { x: number; y: number; width: number; height: number };
  dark: boolean;
  scale: number;
}

/** A single custom Konva shape keeps the branded grid cheap, even on large viewports. */
export const CanvasBackground = memo(function CanvasBackground({ bounds, dark, scale }: CanvasBackgroundProps) {
  const step = MINI_CANVAS.gridSize;
  const majorStep = step * 4;

  return (
    <Shape
      listening={false}
      perfectDrawEnabled={false}
      sceneFunc={(context) => {
        const padding = majorStep;
        const x = Math.floor((bounds.x - padding) / step) * step;
        const y = Math.floor((bounds.y - padding) / step) * step;
        const width = bounds.width + padding * 2;
        const height = bounds.height + padding * 2;

        context.fillStyle = dark ? MINI_CANVAS.backgroundDark : MINI_CANVAS.backgroundLight;
        context.fillRect(x, y, width, height);

        const glow = context.createRadialGradient(
          bounds.x + bounds.width * 0.18,
          bounds.y + bounds.height * 0.12,
          0,
          bounds.x + bounds.width * 0.18,
          bounds.y + bounds.height * 0.12,
          Math.max(bounds.width, bounds.height) * 0.72,
        );
        glow.addColorStop(0, dark ? MINI_CANVAS.ambientDark : MINI_CANVAS.ambientLight);
        glow.addColorStop(1, "rgba(139, 92, 246, 0)");
        context.fillStyle = glow;
        context.fillRect(x, y, width, height);

        context.beginPath();
        for (let majorX = Math.floor(x / majorStep) * majorStep; majorX <= x + width; majorX += majorStep) {
          context.moveTo(majorX, y);
          context.lineTo(majorX, y + height);
        }
        for (let majorY = Math.floor(y / majorStep) * majorStep; majorY <= y + height; majorY += majorStep) {
          context.moveTo(x, majorY);
          context.lineTo(x + width, majorY);
        }
        context.strokeStyle = dark ? MINI_CANVAS.majorGridDark : MINI_CANVAS.majorGridLight;
        context.lineWidth = 0.75 / scale;
        context.stroke();

        const dotRadius = 1.05 / scale;
        context.beginPath();
        for (let dotX = x; dotX <= x + width; dotX += step) {
          for (let dotY = y; dotY <= y + height; dotY += step) {
            context.moveTo(dotX + dotRadius, dotY);
            context.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
          }
        }
        context.fillStyle = dark ? MINI_CANVAS.gridDark : MINI_CANVAS.gridLight;
        context.fill();
      }}
    />
  );
});
