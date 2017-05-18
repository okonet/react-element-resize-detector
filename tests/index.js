/* eslint no-unused-expressions: 0 */
import React from 'react'
import { mount } from 'enzyme'
import { spy, stub } from 'sinon'
import chai, { expect } from 'chai'
import chaiEnzyme from 'chai-enzyme'
import ContainerDimensions from '../src/index'

chai.use(chaiEnzyme())
const MyComponent = ({ width, height }) => <span>{width}, {height}</span> // eslint-disable-line

describe('react-container-dimensions', () => {

  it('should throw without children', () => {
    expect(() => mount(<div><ContainerDimensions /></div>))
      .to.throw('Expected children to be one of function or React.Element')
  })

  it('calls componentDidMount', (done) => {
    spy(ContainerDimensions.prototype, 'componentDidMount')
    spy(ContainerDimensions.prototype, 'componentWillUnmount')
    const wrapper = mount(
      <div>
        <ContainerDimensions>
          <MyComponent />
        </ContainerDimensions>
      </div>
      , { attachTo: document.getElementById('root') })
    expect(wrapper.find('div').length).to.eq(1)
    expect(ContainerDimensions.prototype.componentDidMount.calledOnce).to.be.true
    ContainerDimensions.prototype.componentDidMount.restore()
    setTimeout(() => {
      wrapper.unmount()
      expect(ContainerDimensions.prototype.componentWillUnmount.calledOnce).to.be.true
      ContainerDimensions.prototype.componentWillUnmount.restore()
      done()
    }, 0)
  })

  it('calls onResize on mount', () => {
    spy(ContainerDimensions.prototype, 'onResize')
    mount(
      <div>
        <ContainerDimensions>
          <MyComponent />
        </ContainerDimensions>
      </div>
    )
    expect(ContainerDimensions.prototype.onResize.calledOnce).to.be.true
    ContainerDimensions.prototype.onResize.restore()
  })

  xit('calls onResize when parent has been resized', (done) => {
    spy(ContainerDimensions.prototype, 'onResize')
    const wrapper = mount(
      <div id="node" style={{ width: 10 }}>
        <ContainerDimensions>
          <MyComponent />
        </ContainerDimensions>
      </div>
      , { attachTo: document.getElementById('root') })
    const el = wrapper.render()
    el.css('width', 10)
    setTimeout(() => {
      el.css('width', 100) // Triggering onResize event
      expect(ContainerDimensions.prototype.onResize.calledTwice).to.be.true
      ContainerDimensions.prototype.onResize.restore()
      done()
    }, 10)
  })

  it('onResize sets state with all keys and values from getBoundingClientRect', () => {
    const styles = { top: 100, width: 200 }
    stub(ContainerDimensions, 'getDomNodeDimensions', () => ({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      ...styles
    }))
    const wrapper = mount(
      <div style={styles}>
        <ContainerDimensions>
          <MyComponent />
        </ContainerDimensions>
      </div>
      , { attachTo: document.getElementById('root') })

    wrapper.render()
    expect(wrapper.find(MyComponent).props()).to.have.keys([
      'initiated',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'height'])
    expect(wrapper.find(MyComponent)).to.have.prop('top', 100)
    expect(wrapper.find(MyComponent)).to.have.prop('width', 200)
    ContainerDimensions.getDomNodeDimensions.restore()
  })

  it('should initially render an empty placeholder', () => {
    const wrapper = mount(
      <ContainerDimensions>
        <MyComponent />
      </ContainerDimensions>
    )
    wrapper.setState({
      initiated: false
    })

    expect(wrapper.find(ContainerDimensions)).to.have.exactly(1).descendants('div')
    expect(wrapper).to.have.html('<div data-reactroot=""></div>')
    expect(wrapper.find(MyComponent).length).to.eq(0)

    wrapper.setState({
      initiated: true
    })

    expect(wrapper.find(MyComponent).length).to.eq(1)
  })

  it('should pass dimensions as props to its children', () => {
    const wrapper = mount(
      <ContainerDimensions>
        <MyComponent />
      </ContainerDimensions>
    )
    wrapper.setState({
      top: 0,
      right: 100,
      bottom: 300,
      left: 200,
      width: 100,
      height: 200
    })
    expect(wrapper.find(MyComponent)).to.have.length(1)
    expect(wrapper.find(MyComponent)).to.have.prop('top', 0)
    expect(wrapper.find(MyComponent)).to.have.prop('right', 100)
    expect(wrapper.find(MyComponent)).to.have.prop('bottom', 300)
    expect(wrapper.find(MyComponent)).to.have.prop('left', 200)
    expect(wrapper.find(MyComponent)).to.have.prop('width', 100)
    expect(wrapper.find(MyComponent)).to.have.prop('height', 200)
  })

  it('should pass dimensions as function arguments', () => {
    const wrapper = mount(
      <ContainerDimensions>
        {
          ({ left, width, height }) => // eslint-disable-line
            <MyComponent
              left={left + 10}
              width={width + 10}
              height={height + 10}
            />
        }
      </ContainerDimensions>
    )
    wrapper.setState({
      left: 20,
      width: 100,
      height: 200
    })
    expect(wrapper.find(MyComponent)).to.have.length(1)
    expect(wrapper.find(MyComponent)).to.have.prop('left', 30)
    expect(wrapper.find(MyComponent)).to.have.prop('width', 110)
    expect(wrapper.find(MyComponent)).to.have.prop('height', 210)
  })

  it('should work with SVG elements', () => {
    const wrapper = mount(
      <ContainerDimensions>
        <rect />
      </ContainerDimensions>
    )
    wrapper.setState({
      width: 100,
      height: 200
    })
    expect(wrapper.find('rect')).to.have.length(1)
    expect(wrapper.find('rect')).to.have.prop('width', 100)
    expect(wrapper.find('rect')).to.have.prop('height', 200)
  })

  it('should not create a DOM element for itself', () => {
    const wrapper = mount(
      <h1>
        <ContainerDimensions>
          <span>Test</span>
        </ContainerDimensions>
      </h1>
    )
    expect(wrapper.html()).to.contain('<h1><span width="0" height="0">Test</span>')
  })

  it('should call onResize on every frame when updateOnOffsetChange is true', () => {
    spy(window, 'requestAnimationFrame')

    const wrapper = mount(
      <ContainerDimensions updateOnOffsetChange>
        <MyComponent />
      </ContainerDimensions>
    )

    expect(window.requestAnimationFrame.called).to.be.true
    expect(window.requestAnimationFrame.args[0][0]).to.equal(wrapper.get(0).onResize)

    window.requestAnimationFrame.restore()
  })
})
