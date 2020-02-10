import classNames from 'classnames'
import React from 'react'

import { Term, Expression, Variable } from 'FunBlocks/AST/Terms'
import Color from 'FunBlocks/Utils/Color'

const styles = require('./Block.module')

type BlockProps = {
  term: Term,
  meta?: { [key: string]: any },
  onClick?(term: Term): void,
  unsetParentHoverState?(): void,
}

type BlockState = {
  hovered: boolean,
}

class Block extends React.Component<BlockProps, BlockState> {

  static defaultProps = {
    meta: {},
    onClick: () => {},
  }

  state = {
    hovered: false,
  }

  render() {
    // Compute the colors for the frame, text and borders.
    if (this.props.term instanceof Expression) {
      return <ExprBlock
        term={ this.props.term }
        meta={ this.props.meta }
        colors={ this.colors() }
        onClick={ this.props.onClick }
        changeHoverState={ this.changeHoverState.bind(this) }
      />
    } else if (this.props.term instanceof Variable) {
      return <VarBlock
        term={ this.props.term }
        meta={ this.props.meta }
        colors={ this.colors() }
        onClick={ this.props.onClick }
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
    if (this.state.hovered) {
      baseColor = baseColor.tint.tint
    }

    return {
      backgroundColor: baseColor.css,
      borderColor: baseColor.shade.css,
      color: baseColor.l > 0.5 ? 'black' : 'white',
    }
  }

  changeHoverState(value: boolean) {
    this.setState({ hovered: value })
    if (value && !!this.props.unsetParentHoverState) {
      this.props.unsetParentHoverState()
    }
  }

}

type ExprBlockProps = {
  term: Expression,
  meta?: { [key: string]: any },
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  onClick(term: Term): void,
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
          meta={ this.props.meta }
          onClick={ this.props.onClick }
          unsetParentHoverState={ () => this.props.changeHoverState(false) }
        />
      ))

    // Query the meta-properties.
    const { invalid } = (this.props.meta[this.props.term.id] || {})

    return (
      <div
        data-term={ true }
        className={ classNames(styles.expr, { [styles.invalid]: invalid }) }
        style={ this.props.colors }
        onClick={ this.didClick.bind(this) }
        onMouseOver={ this.didEnter.bind(this) }
        onMouseLeave={ this.didLeave.bind(this) }
      >
        <div className={ styles.exprLabel }>{ term.label }</div>
        { subterms }
      </div>
    )
  }

  didClick(e: React.MouseEvent) {
    let elm = e.target as Element
    while ((elm !== e.currentTarget) && !elm.getAttribute('data-term')) {
      elm = elm.parentElement
    }
    if (elm === e.currentTarget) {
      this.props.onClick(this.props.term)
    }
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
  meta?: { [key: string]: any },
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  onClick(term: Term): void,
  changeHoverState(value: boolean): void,
}

class VarBlock extends React.PureComponent<VarBlockProps> {

  render() {
    const term = this.props.term
    const outerSideStyle = { backgroundColor: this.props.colors.borderColor }
    const innerSideStyle = { backgroundColor: this.props.colors.backgroundColor }

    // Query the meta-properties.
    const { invalid } = (this.props.meta[this.props.term.id] || {})

    return (
      <div
        data-term={ true }
        className={ classNames(styles.var, { [styles.invalid]: invalid }) }
        onClick={ this.didClick.bind(this) }
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

  didClick(e: React.MouseEvent) {
    let elm = e.target as Element
    while ((elm !== e.currentTarget) && !elm.getAttribute('data-term')) {
      elm = elm.parentElement
    }
    if (elm === e.currentTarget) {
      this.props.onClick(this.props.term)
    }
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
