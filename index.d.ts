import * as React from 'react';
  
export interface Dimensions {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface ContainerDimensionsProps {
  /**
   * Can either be a function that's responsible for rendering children.
   * This function should implement the following signature:
   * ({ height, width }) => PropTypes.element
   * Or a React element, with width and height injected into its props.
   */
  children: ((props: Dimensions) => React.ReactNode) | React.ReactNode;
}

/**
 * Component that automatically adjusts the width and height of a single child.
 * Child component should not be declared as a child but should rather be specified by a `ChildComponent` property.
 * All other properties will be passed through to the child component.
 */
declare const ContainerDimensions: React.ComponentType<ContainerDimensionsProps>;
export default ContainerDimensions;
