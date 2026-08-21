import type { SVGProps } from "react";

type BridgeProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/**
 * BridgeLogo — static mark.
 * Usage: <BridgeLogo className="w-8 h-auto text-foreground" />
 */
export function BridgeLogo({ size, className, ...props }: BridgeProps) {
  return (
    <svg
      viewBox="0 0 160 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bridge"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <g fill="currentColor">
        {/* Long left horizontal */}
        <rect x="16" y="50" width="82" height="8" />

        {/* First vertical — upper section */}
        <rect x="84" y="18" width="8" height="32" />

        {/* First vertical — separated lower section */}
        <rect x="84" y="64" width="8" height="16" />

        {/* Second full vertical */}
        <rect x="106" y="18" width="8" height="62" />

        {/* Right horizontal */}
        <rect x="106" y="50" width="38" height="8" />
      </g>
    </svg>
  );
}

/**
 * BridgeLoader — animated mark (draws itself stroke by stroke).
 * Usage: <BridgeLoader className="w-20 h-auto text-violet-500" />
 */
export function BridgeLoader({ size, className, ...props }: BridgeProps) {
  return (
    <svg
      viewBox="0 0 160 100"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      {/* Long left horizontal */}
      <rect
        x="16"
        y="50"
        width="82"
        height="8"
        fill="currentColor"
      >
        <animate
          attributeName="width"
          values="0;0;82;82;0"
          keyTimes="0;0.05;0.22;0.78;1"
          dur="1.9s"
          repeatCount="indefinite"
        />

        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.05;0.18;0.82;1"
          dur="1.9s"
          repeatCount="indefinite"
        />
      </rect>

      {/* First vertical — upper section */}
      <rect
        x="84"
        y="18"
        width="8"
        height="32"
        fill="currentColor"
      >
        <animate
          attributeName="height"
          values="0;0;32;32;0"
          keyTimes="0;0.16;0.33;0.78;1"
          dur="1.9s"
          repeatCount="indefinite"
        />

        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.16;0.29;0.82;1"
          dur="1.9s"
          repeatCount="indefinite"
        />
      </rect>

      {/* First vertical — separated lower section */}
      <rect
        x="84"
        y="64"
        width="8"
        height="16"
        fill="currentColor"
      >
        <animate
          attributeName="height"
          values="0;0;16;16;0"
          keyTimes="0;0.26;0.42;0.78;1"
          dur="1.9s"
          repeatCount="indefinite"
        />

        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.26;0.38;0.82;1"
          dur="1.9s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Second full vertical */}
      <rect
        x="106"
        y="18"
        width="8"
        height="62"
        fill="currentColor"
      >
        <animate
          attributeName="height"
          values="0;0;62;62;0"
          keyTimes="0;0.34;0.52;0.78;1"
          dur="1.9s"
          repeatCount="indefinite"
        />

        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.34;0.48;0.82;1"
          dur="1.9s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Right horizontal */}
      <rect
        x="106"
        y="50"
        width="38"
        height="8"
        fill="currentColor"
      >
        <animate
          attributeName="width"
          values="0;0;38;38;0"
          keyTimes="0;0.44;0.6;0.78;1"
          dur="1.9s"
          repeatCount="indefinite"
        />

        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.44;0.56;0.82;1"
          dur="1.9s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}
