import type { FC } from 'react';

export interface BootingAnimationProps {
  /** Optional custom class name applied to both panels */
  className?: string;
}

export const BootingAnimation: FC<BootingAnimationProps> = ({ className = '' }) => {
  return (
    <>
      {/* Upper Panel */}
      <div
        data-testid="boot-panel-top"
        aria-hidden="true"
        role="presentation"
        className={`fixed top-0 left-0 right-0 h-[50dvh] z-50 bg-[#8b0000] border-b-[3px] border-[#212121] animate-boot-curtain-top pointer-events-none overflow-hidden ${className}`}
      >
        <div
          data-testid="boot-half-top"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 chacana-half-top pointer-events-none"
        />
      </div>

      {/* Lower Panel */}
      <div
        data-testid="boot-panel-bottom"
        aria-hidden="true"
        role="presentation"
        className={`fixed bottom-0 left-0 right-0 h-[50dvh] z-50 bg-[#1a1a1a] border-t-[3px] border-[#212121] animate-boot-curtain-bottom pointer-events-none overflow-hidden ${className}`}
      >
        <div
          data-testid="boot-half-bottom"
          className="absolute top-0 left-1/2 -translate-x-1/2 chacana-half-bottom pointer-events-none"
        />
      </div>
    </>
  );
};
