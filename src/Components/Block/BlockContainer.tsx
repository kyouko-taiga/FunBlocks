import classNames from 'classnames'
import React from 'react'

import { Term, Expression, Variable } from 'FunBlocks/AST/Terms'
import { RootState } from 'FunBlocks/Store'
import Color from 'FunBlocks/Utils/Color'
import ExprBlock from './ExprBlock'
import VarBlock from './VarBlock'

const styles = require('./Block.module')

// ----- Block component --------------------------------------------------------------------------

export interface BlockProps {

  /** The term to represent graphically. */
  term: Term

  /**
   * A callback that is called whenever the representation is clicked.
   *
   * The second argument of the callback is a function `startAnimation()`. A handler may use this
   * function to "imperatively" trigger an animation on this block. While this approach may not fit
   * the usual "React-way" to exchange data from parent to children, it offers a simpler way to
   * implement one-shot animations without using Redux' store.
   */
  onClick?(term: Term, startAnimation?: (animation: string) => void): void

  /** A callback that is called when another block is dropped onto this one. */
  onDropSubterm?(): void,

  /** A callback that removes the hovered state on the representation of this term's parent. */
  unsetParentHoverState?(): void

}

type BlockContainerProps = BlockProps & {
  data: { [key: string]: any },
  updateData(data: { [key: string]: any }): void,
}

type BlockContainerState = {
  /** Indicates whether the component is hovered by the mouse. */
  isHovered: boolean,
  /** Indicates whether the component should be rendered with the shaking animation. */
  isShaking: boolean,
}

/**
 * Component representing the graphical representation of a single term.
 * @extends React.Component
 *
 * This component acts as a wrapper for either {ExprBlock} or {VarBlock}, depending on whether the
 * term given as props is an expression or a variable, respectively. It factorizes the logic of a
 * few UI handlers, manages animations and generates color schemes.
 */
export class BlockContainer extends React.Component<BlockContainerProps, BlockContainerState> {

  state = {
    isHovered: false,
    isShaking: false,
  }

  private animationTimeoutID: number

  render() {
    // Compute component-independent properties.
    const childProps = {
      data            : this.props.data,
      onClick         : this.props.onClick && this.didClick.bind(this),
      onDropSubterm   : this.props.onDropSubterm,
      updateData      : this.props.updateData,
      isShaking       : this.state.isShaking,
      colors          : this.colors(),
      changeHoverState: this.changeHoverState.bind(this),
    }

    // Select and render the appropriate component.
    const term = this.props.term
    if (term instanceof Expression) {
      return <ExprBlock { ...childProps } term={ term } onSubtermClick={ this.props.onClick } />
    } else if (term instanceof Variable) {
      return <VarBlock { ...childProps } term={ term } />
    } else {
      return null
    }
  }

  /// Compute the colors of the frame, text and borders.
  colors() {
    let baseColor = !!this.props.term.type
      ? this.props.term.type.baseColor
      : Color.gray
    if (this.state.isHovered) {
      baseColor = baseColor.tint.tint
    }

    return {
      backgroundColor: baseColor.css,
      borderColor: baseColor.shade.css,
      color: baseColor.l > 0.5 ? 'black' : 'white',
    }
  }

  didClick(e: React.MouseEvent) {
    let elm = e.target as Element
    while ((elm !== e.currentTarget) && !elm.getAttribute('data-term')) {
      elm = elm.parentElement
    }
    if (elm === e.currentTarget) {
      this.props.onClick(this.props.term, this.startAnimation.bind(this))
    }
  }

  startAnimation(animation: string) {
    switch (animation) {
    case 'shake':
      window.clearTimeout(this.animationTimeoutID)
      this.setState({ isShaking: true }, () => {
        this.animationTimeoutID = window.setTimeout(() => this.setState({ isShaking: false }), 500)
      })

    default:
      break
    }
  }

  changeHoverState(value: boolean) {
    this.setState({ isHovered: value })
    if (value && !!this.props.unsetParentHoverState) {
      this.props.unsetParentHoverState()
    }
  }

}
