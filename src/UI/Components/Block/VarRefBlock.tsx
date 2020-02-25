import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import * as AST from 'FunBlocks/AST'
import { setData, clearData } from 'FunBlocks/UI/Actions/DraggedData'

const styles = require('./Block.module')

type VarRefBlockProps = {
  /// The variable to render.
  term: AST.VarRef,
  /// The data associated with this variable's root term.
  data: Dictionary,
  /// Whether the block is faded.
  isFaded: boolean
  /// Whether the block is editable.
  editable: boolean,
  /// Whether the block is shaking (i.e. animated with the `shake` animation).
  isShaking: boolean,
  /// The colors with which the expression should be rendered.
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  /// The callback to call on click events.
  onClick?(e: React.MouseEvent): void,
  /// The callback to call when the rendered expression was modified by the user.
  onChange?(newTerm: Term): void,
  /// A callback to change the block's label.
  onChangeLabel(e: React.ChangeEvent<HTMLInputElement>): void,
  /// A callback to set whether the rendered block is faded.
  changeFaded(value: boolean): void,
  /// A callback to set whether the rendered block is hovered.
  changeHovered(value: boolean): void,
  /// An action dispatcher that sets drag data.
  setDraggedData(type: string, payload?: any, callbacks?: Dictionary<Function>): void,
  /// An action creater that clears drag data.
  clearDraggedData(): void,
}

class VarRefBlock extends React.PureComponent<VarRefBlockProps> {

  render() {
    const term = this.props.term
    const outerSideStyle = { backgroundColor: this.props.colors.borderColor }
    const innerSideStyle = { backgroundColor: this.props.colors.backgroundColor }

    const className = classNames(styles.var, 'no-text-select', {
      [styles.faded]: this.props.isFaded,
      [styles.shaking]: this.props.isShaking,
    })

    return (
      <div
        data-term={ this.props.term.id }
        className={ className }
        draggable={ this.props.editable }
        onClick={ this.props.onClick }
        onMouseOver={ this.didMouseOver.bind(this) }
        onMouseLeave={ this.didMouseLeave.bind(this) }
        onDragStart={ this.didDragStart.bind(this) }
        onDragEnd={ this.didDragEnd.bind(this) }
      >
        <div className={ styles.varInner }>
          <div
            className={ `${styles.varSide} ${styles.left}` }
            style={ outerSideStyle }
          >
            <div style={ innerSideStyle } />
          </div>
          <div
            className={ `${styles.varSide} ${styles.right}` }
            style={ outerSideStyle }
          >
            <div style={ innerSideStyle } />
          </div>
          <div className={ styles.varBack } style={ innerSideStyle } />
          <div
            className={ styles.varLabel }
            style={ { borderColor: this.props.colors.borderColor, color: this.props.colors.color } }
          >
            { this.renderLabel() }
          </div>
        </div>
      </div>
    )
  }

  renderLabel() {
    if (this.props.editable) {
      return (
        <input
          value={ this.props.term.label }
          style={ { width: `${Math.max(this.props.term.label.length, 1)}ch` } }
          onClick={ (e) => (e.target as HTMLInputElement).select() }
          onChange={ this.props.onChangeLabel }
        />
      )
    } else {
      return this.props.term.label
    }
  }

  didMouseOver(e: React.MouseEvent) {
    this.props.changeHovered(true)
    e.stopPropagation()
  }

  didMouseLeave(e: React.MouseEvent) {
    this.props.changeHovered(false)
    e.stopPropagation()
  }

  didDragStart(e: React.DragEvent<HTMLDivElement>) {
    this.props.changeFaded(true)
    this.props.setDraggedData('Term', this.props.term, { onChange: this.props.onChange })
    e.stopPropagation()
  }

  didDragEnd(e: React.DragEvent<HTMLDivElement>) {
    this.props.changeFaded(false)
    this.props.clearDraggedData()
    e.stopPropagation()
  }

}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDraggedData: (type: string, payload?: Dictionary, callbacks?: Dictionary<Function>) =>
    dispatch(setData(type, payload, callbacks)),
  clearDraggedData: () => dispatch(clearData()),
})

export default connect(null, mapDispatchToProps)(VarRefBlock)
