import React, { useRef, forwardRef } from 'react';
import Draggable, { DraggableProps, DraggableCore, DraggableCoreProps } from 'react-draggable';

// Create a wrapper for DraggableCore that doesn't use findDOMNode
export const DraggableCoreWrapper: React.FC<DraggableCoreProps & { children: React.ReactNode }> = (props) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={nodeRef} style={{ display: 'inline-block' }}>
      <DraggableCore
        {...props}
        nodeRef={nodeRef}
      >
        {props.children}
      </DraggableCore>
    </div>
  );
};

// Create a wrapper for Draggable that doesn't use findDOMNode
export const DraggableWrapper: React.FC<DraggableProps & { children: React.ReactNode }> = (props) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  return (
    <Draggable
      {...props}
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} style={{ display: 'inline' }}>
        {props.children}
      </div>
    </Draggable>
  );
};

DraggableWrapper.displayName = 'DraggableWrapper';
