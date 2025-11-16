import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  showIcon = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = -tooltipRect.height - 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.height + 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = -tooltipRect.width - 8;
          break;
        case 'right':
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.width + 8;
          break;
      }

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    }
  }, [isVisible, position]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        showIcon && (
          <HelpCircle
            size={16}
            style={{
              color: '#9ca3af',
              cursor: 'help',
            }}
          />
        )
      )}

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'absolute',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            lineHeight: '1.4',
            maxWidth: '200px',
            zIndex: 1000,
            whiteSpace: 'normal',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            ...tooltipStyle,
          }}
        >
          {content}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(position === 'top' && {
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '4px 4px 0 4px',
                borderColor: '#1f2937 transparent transparent transparent',
              }),
              ...(position === 'bottom' && {
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 4px 4px 4px',
                borderColor: 'transparent transparent #1f2937 transparent',
              }),
              ...(position === 'left' && {
                right: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '4px 0 4px 4px',
                borderColor: 'transparent transparent transparent #1f2937',
              }),
              ...(position === 'right' && {
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '4px 4px 4px 0',
                borderColor: 'transparent #1f2937 transparent transparent',
              }),
            }}
          />
        </div>
      )}
    </div>
  );
}
