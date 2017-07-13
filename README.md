# react-container-dimensions [![Build Status](https://travis-ci.org/okonet/react-container-dimensions.svg?branch=master)](https://travis-ci.org/okonet/react-container-dimensions) [![npm version](https://badge.fury.io/js/react-container-dimensions.svg)](https://badge.fury.io/js/react-container-dimensions)
Wrapper component that detects parent (container) element resize and passes new dimensions down the 
tree. Based on [element-resize-detector](https://github.com/wnr/element-resize-detector).

`npm install --save react-container-dimensions`

It is especially useful when you create components with dimensions that change over 
time and you want to explicitely pass the container dimensions to the children. For example, SVG 
visualization needs to be updated in order to fit into container.

It uses [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) and passes values for all `top`, `right`, `bottom`, `left`, `width`, `height` CSs attributes down the tree.

## Usage

* Wrap your existing components. Children component will recieve `top`, `right`, `bottom`, `left`, `width`, `height` as props. 

```jsx
<ContainerDimensions>
    <MyComponent/>
</ContainerDimensions>    
```

* Use a function to pass width or height explicitely or do some calculation. Function callback will be called with an object `{ width: number, height: number }` as an argument and it expects the output to be a React Component or an element. 

```jsx
<ContainerDimensions>
    { ({ height }) => <MyComponent height={height}/> }
</ContainerDimensions>    
```

## How is it different from [similar_component_here]

*It does not create a new element in the DOM but relies on the `parentNode` which must be present.* So, basically, it acts as a middleware to pass the dimensions of _your_ styled component to your children components. This makes it _very easy_ to integrate with your existing code base.

For example, if your parent container has `display: flex`, only adjacent children will be affected by this rule. This means if your children rely on `flex` CSS property, you can't wrap it in a div anymore since _this will break the flexbox flow_.

So this won't work anymore:

```html
<div style="display: flex">
    <div>
        <div style="flex: 1">...</div>
    </div>
</div>
```

`react-container-dimensions` doesn't change the resulting HTML markup, so it remains:

```html
<div style="display: flex">
    <div style="flex: 1">...</div>
</div>
```

## Example

Let's say you want your SVG visualization to always fit into the container. In order for SVG to scale elements properly it is required that `width` and `height` attributes are properly set on the `svg` element. Imagine the following example

### Before (static)

It's hard to keep dimensions of the container and the SVG in sync. Especially, when you want your content to be resplonsive (or dynamic).

```jsx
export const myVis = () => (
    <div className="myStyles">
        <svg width={600} height={400}>
            {/* SVG contents */}
        </svg>  
    <div>
)
```

### After (dynamic)

This will resize and re-render the SVG each time the `div` dimensions are changed. For instance, when you change CSS for `.myStyles`.

```jsx
import ContainerDimensions from 'react-container-dimensions'

export const myVis = () => (
    <div className="myStyles">
        <ContainerDimensions>
            { ({ width, height }) => 
                <svg width={width} height={height}>
                    {/* SVG contents */}
                </svg>  
            }
        </ContainerDimensions>
    <div>
)
```

## Other similar projects:

* https://github.com/digidem/react-dimensions
* https://github.com/maslianok/react-resize-detector
* https://github.com/Xananax/react-size
* https://github.com/joeybaker/react-element-query

and a few others...
