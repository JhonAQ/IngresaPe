import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { NodeBaseNext } from './path-node/NodeBaseNext';
import { NodeBaseCompleted } from './path-node/NodeBaseCompleted';
import { NodeBaseUnavailable } from './path-node/NodeBaseUnavailable';
import { NodeBaseGold } from './path-node/NodeBaseGold';
import { LevelBookIcon } from './icons/LevelBookIcon';
import { LevelHeadphonesIcon } from './icons/LevelHeadphonesIcon';
import { LevelMicrophoneIcon } from './icons/LevelMicrophoneIcon';
import { LevelStarIcon } from './icons/LevelStarIcon';
import { LevelVideoIcon } from './icons/LevelVideoIcon';
import { LevelWeightsIcon } from './icons/LevelWeightsIcon';
import type { PathNodeTheme } from './path-node/tokens';
import { PATH_NODE_THEMES } from './path-node/tokens';

export type { PathNodeTheme } from './path-node/tokens';
export type PathNodeStatus = 'locked' | 'current' | 'completed' | 'gold';
export type PathNodeIcon =
  | 'book'
  | 'headphones'
  | 'microphone'
  | 'star'
  | 'video'
  | 'weights';

export interface PathNodeProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  status: PathNodeStatus;
  /** Icono superpuesto para current/completed/gold. locked muestra candado. */
  icon?: PathNodeIcon;
  /** Tema de color del nodo. Se ignora cuando status es 'locked'. */
  theme?: PathNodeTheme;
  /** Ancho del nodo en píxeles. Por defecto 71. */
  size?: number;
}

const ICON_COMPONENTS: Record<
  PathNodeIcon,
  React.FC<React.SVGProps<SVGSVGElement> & { theme?: PathNodeTheme }>
> = {
  book: LevelBookIcon,
  headphones: LevelHeadphonesIcon,
  microphone: LevelMicrophoneIcon,
  star: LevelStarIcon,
  video: LevelVideoIcon,
  weights: LevelWeightsIcon,
};

export const PathNode = forwardRef<HTMLButtonElement, PathNodeProps>(
  (
    {
      status,
      icon = 'book',
      theme = 'purple',
      size = 71,
      className = '',
      ...props
    },
    ref
  ) => {
    const isLocked = status === 'locked';
    const isCurrent = status === 'current';
    const isCompleted = status === 'completed';
    const isGold = status === 'gold';

    const renderBase = (): ReactNode => {
      if (isLocked)
        return <NodeBaseUnavailable className="w-full h-full" />;
      if (isCompleted)
        return (
          <NodeBaseCompleted
            className="w-full h-full"
            theme={isGold ? 'gold' : theme}
          />
        );
      if (isGold) return <NodeBaseGold className="w-full h-full" />;
      return <NodeBaseNext className="w-full h-full" theme={theme} />;
    };

    const renderOverlayIcon = (): ReactNode => {
      // Los nodos dorados no llevan icono superpuesto (el SVG ya incluye la estrella).
      if (isGold) return null;

      const IconComponent = ICON_COMPONENTS[icon];

      if (isLocked) {
        return (
          <IconComponent
            theme={theme}
            className="h-[58%] w-auto"
            style={{
              transform: 'translateY(-2px)',
              filter: 'grayscale(100%) brightness(1.15)',
            }}
          />
        );
      }

      return (
        <IconComponent
          theme={theme}
          className="h-[58%] w-auto"
          style={{ transform: 'translateY(-2px)' }}
        />
      );
    };

    const nodeStyle = {
      width: size,
      height: Math.round((size * 65) / 71),
    };

    const isInteractive = !isLocked;

    const haloSize = Math.round(size * 1.22);
    const haloOffset = Math.round((size - haloSize) / 2);
    const colors = isCurrent ? PATH_NODE_THEMES[theme] : null;

    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={nodeStyle}
      >
        <style>{`
          @keyframes halo-pulse {
            0%, 100% { transform: scale(1); opacity: 0.45; }
            50% { transform: scale(1.25); opacity: 0.85; }
          }
          @keyframes halo-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.75); opacity: 0; }
          }
          @keyframes halo-core {
            0%, 100% { transform: scale(0.92); opacity: 0.7; }
            50% { transform: scale(1.08); opacity: 1; }
          }
        `}</style>

        {/* Indicador de nodo activo con color del tema */}
        {isCurrent && colors && (
          <>
            <div
              className="absolute rounded-full z-0 border-[6px]"
              style={{
                top: haloOffset,
                left: haloOffset,
                width: haloSize,
                height: haloSize,
                borderColor: colors.base,
                backgroundColor: 'transparent',
                boxShadow: `0 0 18px 6px ${colors.light}66, inset 0 0 12px 2px ${colors.light}44`,
                animation: 'halo-pulse 1.4s ease-in-out infinite',
              }}
            />
            <div
              className="absolute rounded-full z-0 border-[5px]"
              style={{
                top: haloOffset,
                left: haloOffset,
                width: haloSize,
                height: haloSize,
                borderColor: colors.light,
                backgroundColor: 'transparent',
                animation: 'halo-ring 1.4s ease-out infinite',
              }}
            />
            <div
              className="absolute rounded-full z-0"
              style={{
                top: Math.round((size - Math.round(size * 0.35)) / 2),
                left: Math.round((size - Math.round(size * 0.35)) / 2),
                width: Math.round(size * 0.35),
                height: Math.round(size * 0.35),
                backgroundColor: colors.ice,
                opacity: 0.9,
                animation: 'halo-core 1.4s ease-in-out infinite',
              }}
            />
          </>
        )}

        <button
          ref={ref}
          disabled={isLocked}
          className={`
            relative z-10 w-full h-full
            flex items-center justify-center
            transition-all duration-100 outline-none
            drop-shadow-[0px_6px_5px_rgba(0,0,0,0.16)]
            ${isInteractive ? 'cursor-pointer hover:brightness-110 active:translate-y-[6px] active:drop-shadow-none' : 'cursor-not-allowed opacity-90'}
          `}
          {...props}
        >
          <span className="absolute inset-0 z-0">{renderBase()}</span>
          <span className="relative z-10 flex items-center justify-center">
            {renderOverlayIcon()}
          </span>
        </button>
      </div>
    );
  }
);

PathNode.displayName = 'PathNode';
