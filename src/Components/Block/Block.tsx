import classNames from 'classnames'
import React from 'react'

import { Term, Expression, Variable } from 'FunBlocks/AST/Terms'
import Color from 'FunBlocks/Utils/Color'

const styles = require('./Block.module')

// ----- Block component --------------------------------------------------------------------------

type BlockProps = {
  /** The term to represent graphically. */
  term: Term,

  /**
   * A callback that is called whenever the representation is clicked.
   *
   * The second argument of the callback is a function `startAnimation()`. A handler may use this
   * function to "imperatively" trigger an animation on this block. While this approach may not fit
   * the usual "React-way" to exchange data from parent to children, it offers a simpler way to
   * implement one-shot animations without using Redux' store.
   */
  onClick?(term: Term, startAnimation?: (animation: string) => void): void,

  /** A callback that remove the hovered state on the representation of this term's parent */
  unsetParentHoverState?(): void,
}

type BlockState = {
  /** Indicates whether the component is hovered by the mouse. */
  isHovered: boolean,

  /** Indicates whether the component should be rendered with the shaking animation. */
  isShaking: boolean,
}

/**
 * Component representing the graphical representation of a term.
 * @extends React.Component
 *
 * This component acts as a wrapper for either {ExprBlock} or {VarBlock}, depending on whether the
 * term given as props is an expression or a variable, respectively. It factorizes the logic of a
 * few UI handlers, manages animations and generates color schemes.
 */
class Block extends React.Component<BlockProps, BlockState> {

  static defaultProps = {
    meta: {},
    onClick: () => {},
  }

  state = {
    isHovered: false,
    isShaking: false,
  }

  private animationTimeoutID: number

  render() {
    // Compute the colors for the frame, text and borders.
    if (this.props.term instanceof Expression) {
      return <ExprBlock
        term={ this.props.term }
        isShaking={ this.state.isShaking }
        colors={ this.colors() }
        onClick={ this.didClick.bind(this) }
        onSubtermClick={ this.props.onClick }
        changeHoverState={ this.changeHoverState.bind(this) }
      />
    } else if (this.props.term instanceof Variable) {
      return <VarBlock
        term={ this.props.term }
        isShaking={ this.state.isShaking }
        colors={ this.colors() }
        onClick={ this.didClick.bind(this) }
        changeHoverState={ this.changeHoverState.bind(this) }
      />
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

// ----- ExprBlock component ----------------------------------------------------------------------

type ExprBlockProps = {
  term: Expression,
  isShaking: boolean,
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  onClick(e: React.MouseEvent): void,
  onSubtermClick(term: Term, startAnimation?: (animation: string) => void): void,
  changeHoverState(value: boolean): void,
}

class ExprBlock extends React.PureComponent<ExprBlockProps> {

  render() {
    // Generate the subterms, if any.
    const term = this.props.term
    const subterms = term.subterms
      .map((subterm) => (
        <Block
          key={ subterm.id }
          term={ subterm }
          onClick={ this.props.onSubtermClick }
          unsetParentHoverState={ () => this.props.changeHoverState(false) }
        />
      ))

    return (
      <div
        data-term={ true }
        className={ classNames(styles.expr, { [styles.shaking]: this.props.isShaking }) }
        style={ this.props.colors }
        onClick={ this.props.onClick }
        onMouseOver={ this.didEnter.bind(this) }
        onMouseLeave={ this.didLeave.bind(this) }
      >
        <div className={ styles.exprLabel }>{ term.label }</div>
        { subterms }
      </div>
    )
  }

  didEnter(e: React.MouseEvent) {
    this.props.changeHoverState(true)
    e.stopPropagation()
  }

  didLeave(e: React.MouseEvent) {
    this.props.changeHoverState(false)
    e.stopPropagation()
  }

}

type VarBlockProps = {
  term: Variable,
  isShaking: boolean,
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  onClick(e: React.MouseEvent): void,
  changeHoverState(value: boolean): void,
}

// ----- VarBlock component -----------------------------------------------------------------------

class VarBlock extends React.PureComponent<VarBlockProps> {

  render() {
    const term = this.props.term
    const outerSideStyle = { backgroundColor: this.props.colors.borderColor }
    const innerSideStyle = { backgroundColor: this.props.colors.backgroundColor }

    return (
      <div
        data-term={ true }
        className={ classNames(styles.var, { [styles.shaking]: this.props.isShaking }) }
        onClick={ this.props.onClick }
        onMouseOver={ this.didEnter.bind(this) }
        onMouseLeave={ this.didLeave.bind(this) }
      >
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
          { this.props.term.label }
        </div>
      </div>
    )
  }

  didEnter(e: React.MouseEvent) {
    this.props.changeHoverState(true)
    e.stopPropagation()
  }

  didLeave(e: React.MouseEvent) {
    this.props.changeHoverState(false)
    e.stopPropagation()
  }

}

export default Block
