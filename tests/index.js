/* eslint no-unused-expressions: 0 */
import React from 'react'
import { mount } from 'enzyme'
import { spy } from 'sinon'
import chai, { expect } from 'chai'
import ContainerDimensions from '../src/index'

chai.use(require('chai-enzyme')())
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
        , { attachTo: document.body })
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

    it('calls onResize when parent has been resized', (done) => {
        spy(ContainerDimensions.prototype, 'onResize')
        const wrapper = mount(
            <div ref="node" id="node" style={{ width: 10 }}>
                <ContainerDimensions>
                    <MyComponent />
                </ContainerDimensions>
            </div>
        , { attachTo: document.body })
        const el = wrapper.render()
        el.css('width', 10)
        setTimeout(() => {
            el.css('width', 100)
            expect(ContainerDimensions.prototype.onResize.calledTwice).to.be.true
            ContainerDimensions.prototype.onResize.restore()
            done()
        }, 0)
    })

    it('should initially render an empty placeholder by default', () => {
        const wrapper = mount(
            <ContainerDimensions>
                <MyComponent />
            </ContainerDimensions>
        )
        wrapper.setState({
            initiated: false
        })

        expect(wrapper.find(ContainerDimensions)).to.have.exactly(1).descendants('div')
        expect(wrapper).to.have.html('<div></div>')
        expect(wrapper.find(MyComponent).length).to.eq(0)

        wrapper.setState({
            initiated: true
        })

        expect(wrapper.find(MyComponent).length).to.eq(1)
    })

    it('should initially render the children when renderChildBeforeInit toggle is on', () => {
        const wrapper = mount(
            <ContainerDimensions renderChildBeforeInit={true}>
                <MyComponent />
            </ContainerDimensions>
        )
        wrapper.setState({
            initiated: false
        })

        expect(wrapper.find(MyComponent)).to.have.length(1)
        expect(wrapper.find(MyComponent)).to.have.prop('initiated', false)
    })

    it('should pass width and height as props to its children', () => {
        const wrapper = mount(
            <ContainerDimensions>
                <MyComponent />
            </ContainerDimensions>
        )
        wrapper.setState({
            width: 100,
            height: 200
        })
        expect(wrapper.find(MyComponent)).to.have.length(1)
        expect(wrapper.find(MyComponent)).to.have.prop('width', 100)
        expect(wrapper.find(MyComponent)).to.have.prop('height', 200)
    })

    it('should pass width and height as function arguments', () => {
        const wrapper = mount(
            <ContainerDimensions>
                {
                    ({ width, height }) => <MyComponent width={width + 10} height={height + 10} /> // eslint-disable-line
                }
            </ContainerDimensions>
        )
        wrapper.setState({
            width: 100,
            height: 200
        })
        expect(wrapper.find(MyComponent)).to.have.length(1)
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
        expect(wrapper).to.have.html('<h1><span width="0" height="0">Test</span><div' +
            ' class="erd_scroll_detection_container' +
            ' erd_scroll_detection_container_animation_active" style="visibility: hidden;' +
            ' display: inline; width: 0px; height: 0px; z-index: -1; overflow:' +
            ' hidden; margin: 0px; padding: 0px;"></div></h1>')
    })
})
