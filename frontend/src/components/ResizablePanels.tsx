import React, { useState, useRef, useEffect } from 'react';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  leftWidth?: number;
  rightWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
}

export const ResizablePanels = ({
  leftPanel,
  centerPanel,
  rightPanel,
  leftWidth = 320,
  rightWidth = 320,
  minLeftWidth = 200,
  minRightWidth = 200
}: ResizablePanelsProps) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(leftWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(rightWidth);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, isLeft: boolean) => {
    e.preventDefault();
    if (isLeft) {
      setIsDraggingLeft(true);
    } else {
      setIsDraggingRight(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;

    if (isDraggingLeft) {
      const newLeftWidth = Math.max(minLeftWidth, Math.min(e.clientX - containerRect.left, containerWidth - minRightWidth - 100));
      setLeftPanelWidth(newLeftWidth);
    } else if (isDraggingRight) {
      const newRightWidth = Math.max(minRightWidth, Math.min(containerWidth - (e.clientX - containerRect.left), containerWidth - minLeftWidth - 100));
      setRightPanelWidth(newRightWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  };

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingLeft, isDraggingRight]);

  return (
    <div 
      ref={containerRef}
      className="flex h-full"
      style={{ cursor: isDraggingLeft || isDraggingRight ? 'col-resize' : 'default' }}
    >
      {/* Left Panel */}
      <div style={{ width: leftPanelWidth, minWidth: minLeftWidth }}>
        {leftPanel}
      </div>

      {/* Left Resizer */}
      <div
        className="w-1 bg-slate-600 hover:bg-primary-600 cursor-col-resize transition-colors"
        onMouseDown={(e) => handleMouseDown(e, true)}
      />

      {/* Center Panel */}
      <div className="flex-1 min-w-0">
        {centerPanel}
      </div>

      {/* Right Resizer */}
      {rightPanel && (
        <div
          className="w-1 bg-slate-600 hover:bg-primary-600 cursor-col-resize transition-colors"
          onMouseDown={(e) => handleMouseDown(e, false)}
        />
      )}

      {/* Right Panel */}
      {rightPanel && (
        <div style={{ width: rightPanelWidth, minWidth: minRightWidth }}>
          {rightPanel}
        </div>
      )}
    </div>
  );
}; 