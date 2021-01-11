import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import elementResizeDetectorMaker from 'element-resize-detector'
import invariant from 'invariant'
import lodash from 'lodash'

export default class ContainerDimensions extends Component {

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
    debounceTime: PropTypes.number
  }

  static getDomNodeDimensions(node) {
    const { top, right, bottom, left, width, height } = node.getBoundingClientRect()
    return { top, right, bottom, left, width, height }
  }

  constructor(props) {
    super(props)
    this.state = {
      initiated: false
    }
    this.onResize = this.onResize.bind(this)
    if (props.debounceTime !== undefined) {
      this.onResizeDebounced = lodash.debounce(this.onResize, props.debounceTime)
    }
  }

  componentDidMount() {
    this.parentNode = ReactDOM.findDOMNode(this).parentNode
    this.elementResizeDetector = elementResizeDetectorMaker({
      strategy: 'scroll',
      callOnAdd: false
    })
    if (this.props.debounceTime !== undefined) {
      this.elementResizeDetector.listenTo(this.parentNode, this.onResizeDebounced)
    } else {
      this.elementResizeDetector.listenTo(this.parentNode, this.onResize)
    }
    this.componentIsMounted = true
    this.onResize()
  }

  componentWillUnmount() {
    this.componentIsMounted = false
    this.elementResizeDetector.uninstall(this.parentNode)
  }

  onResize() {
    const clientRect = ContainerDimensions.getDomNodeDimensions(this.parentNode)
    if (this.componentIsMounted) {
      this.setState({
        initiated: true,
        ...clientRect
      })
    }
  }

  render() {
    invariant(this.props.children, 'Expected children to be one of function or React.Element')

    if (!this.state.initiated) {
      return <div />
    }
    if (typeof this.props.children === 'function') {
      const renderedChildren = this.props.children(this.state)
      return renderedChildren && Children.only(renderedChildren)
    }
    return Children.only(React.cloneElement(this.props.children, this.state))
  }
}
