import React from 'react'

import { Term, Expression, Variable } from 'FunBlocks/AST/Terms'
import Color from 'FunBlocks/Utils/Color'

const styles = require('./Block.module')

type BlockProps = {
  term: Term,
  onClick?(term: Term): void,
  unsetParentHoverState?(): void,
}

class Block extends React.Component<BlockProps, { hovered: boolean }> {

  static defaultProps = {
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
        colors={ this.colors() }
        onClick={ this.props.onClick }
        changeHoverState={ this.changeHoverState.bind(this) }
      />
    } else if (this.props.term instanceof Variable) {
      return <VarBlock
        term={ this.props.term }
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
          onClick={ this.props.onClick }
          unsetParentHoverState={ () => this.props.changeHoverState(false) }
        />
      ))

    return (
      <div
        data-term={ true }
        className={ styles['expr'] }
        style={ this.props.colors }
        onClick={ this.didClick.bind(this) }
        onMouseOver={ this.didEnter.bind(this) }
        onMouseLeave={ this.didLeave.bind(this) }
      >
        <div className={ styles['expr-label'] }>{ term.label }</div>
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

    return (
      <div
        data-term={ true }
        className={ styles['var'] }
        onClick={ this.didClick.bind(this) }
        onMouseOver={ this.didEnter.bind(this) }
        onMouseLeave={ this.didLeave.bind(this) }
      >
        <div
          className={ `${styles['var-side']} ${styles['left']}` }
          style={ outerSideStyle }
        >
          <div style={ innerSideStyle } />
        </div>
        <div
          className={ `${styles['var-side']} ${styles['right']}` }
          style={ outerSideStyle }
        >
          <div style={ innerSideStyle } />
        </div>
        <div className={ styles['var-back'] } style={ innerSideStyle } />
        <div
          className={ styles['var-label'] }
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
