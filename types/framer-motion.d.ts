declare module 'framer-motion' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    whileInView?: any;
    viewport?: any;
    drag?: any;
    dragConstraints?: any;
    dragElastic?: any;
    dragMomentum?: any;
    dragControls?: any;
    dragListener?: boolean;
    dragTransition?: any;
    layout?: boolean | string;
    layoutId?: string;
    layoutDependency?: any;
    onLayoutAnimationComplete?: () => void;
    onDragStart?: any;
    onDrag?: any;
    onDragEnd?: any;
    onHoverStart?: any;
    onHoverEnd?: any;
    style?: React.CSSProperties;
  }

  export interface HTMLMotionProps<T extends HTMLElement> extends React.HTMLAttributes<T>, MotionProps {}

  export type ForwardRefComponent<T, P> = React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;

  export type MotionComponent<T extends HTMLElement> = ForwardRefComponent<T, HTMLMotionProps<T>>;

  type Motion = {
    div: MotionComponent<HTMLDivElement>;
    span: MotionComponent<HTMLSpanElement>;
    img: MotionComponent<HTMLImageElement>;
    button: MotionComponent<HTMLButtonElement>;
    // Add other HTML elements as needed
  };

  export const motion: Motion;
} 