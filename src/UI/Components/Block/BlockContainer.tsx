import classNames from 'classnames'
import React from 'react'

import * as AST from 'FunBlocks/AST'
import { RootState } from 'FunBlocks/UI/Store'
import Color from 'FunBlocks/UI/Utils/Color'
import ExprBlock from './ExprBlock'
import VarRefBlock from './VarRefBlock'

const styles = require('./Block.module')

// ----- Block component --------------------------------------------------------------------------

export interface BlockProps {

  /** The term to represent graphically. */
  term: Term

  /** Indicates whether the block and its subterms are collapsible (default: true). */
  collapsible?: boolean,

  /**
   * Indicates whether the block and its subterms are editable (default: `false`).
   *
   * Setting this flag will make this block react to the user interactions that can trigger its
   * modification. This include drag and drop events originating from the program editor's toolbox
   * (for additions) and drag events originating from a subterm (for deletions).
   */
  editable?: boolean,

  /**
   * A callback that is called whenever the representation is clicked.
   *
   * The second argument of the callback is a function `startAnimation()`. A handler may use this
   * function to "imperatively" trigger an animation on this block. While this approach may not fit
   * the usual "React-way" to exchange data from parent to children, it offers a simpler way to
   * implement one-shot animations without using Redux' store.
   */
  onClick?(term: Term, startAnimation?: (animation: string) => void): void

  /** A callback that is called when the term has been modified. */
  onChange?(newTerm: Term): void,

  /** A callback that removes the hovered state on the representation of this term's parent. */
  unsetParentHovered?(): void

}

type BlockContainerProps = BlockProps & {
  data: Dictionary,
  updateData(data: Dictionary): void,
}

type BlockContainerState = {
  /** Indicates whether the component is faded (for drag events). */
  isFaded: boolean,
  /** Indicates whether the component is hovered by the mouse. */
  isHovered: boolean,
  /** Indicates whether the component is collapsed. */
  isCollapsed: boolean,
  /** Indicates whether the component should be rendered with the shaking animation. */
  isShaking: boolean,
}

/**
 * Component representing the graphical representation of a single term.
 * @extends React.Component
 *
 * This component acts as a wrapper for either {ExprBlock} or {VarRefBlock}, depending on whether
 * the term given as props is an expression or a variable, respectively. It factorizes the logic of
 * a few UI handlers, manages animations and generates color schemes.
 */
export class BlockContainer extends React.Component<BlockContainerProps, BlockContainerState> {

  static defaultProps = {
    collapsible: true,
    editable: false,
  }

  state = {
    isFaded: false,
    isHovered: false,
    isCollapsed: false,
    isShaking: false,
  }

  private animationTimeoutID: number

  render() {
    // Compute component-independent properties.
    const childProps = {
      data          : this.props.data,
      onClick       : this.didClick.bind(this),
      onChange      : this.props.onChange,
      updateData    : this.props.updateData,
      isFaded       : this.state.isFaded,
      editable      : this.props.editable,
      isShaking     : this.state.isShaking,
      colors        : this.colors(),
      onChangeLabel : this.didChangeLabel.bind(this),
      changeFaded   : this.changeFaded.bind(this),
      changeHovered : this.changeHovered.bind(this),
    }

    // Select and render the appropriate component.
    const term = this.props.term
    if (term instanceof AST.Expr) {
      return <ExprBlock
        { ...childProps }
        term={ term }
        collapsible={ this.props.collapsible }
        isCollapsed={ this.state.isCollapsed }
        onSubtermClick={ this.props.onClick }
        changeCollapsed={ this.changeCollapsed.bind(this) }
      />
    } else if (term instanceof AST.VarRef) {
      return <VarRefBlock { ...childProps } term={ term } />
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
      this.props.onClick?.(this.props.term, this.startAnimation.bind(this))
    }
  }

  didChangeLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    // Ignore this event if this block isn't editable.
    if (!this.props.editable) { return }

    // Modifiy the term's label.
    const newLabel = (e.target as HTMLInputElement).value
    const newRoot = this.props.term.root.substituting({
      [this.props.term.id]: this.props.term.renamed(newLabel)
    })
    this.props.onChange?.(newRoot)
  }

  changeFaded(value: boolean) {
    this.setState({ isFaded: value })
  }

  changeHovered(value: boolean) {
    this.setState({ isHovered: value })
    if (value && !!this.props.unsetParentHovered) {
      this.props.unsetParentHovered()
    }
  }

  changeCollapsed(value: boolean) {
    this.setState({ isCollapsed: value })
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

}
