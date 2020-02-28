import classNames from 'classnames'
import React from 'react'
import { compose } from 'redux'

import { Term, Expr, VarRef } from 'FunBlocks/AST/TermNodes'
import { Color } from 'FunBlocks/UI/Utils/Color'
import { TermViewContainerProps } from './Types'
import { ExprView } from './ExprView'

/// Component representing the graphical representation of a single term.
export class TermViewContainer extends React.Component<TermViewContainerProps> {

  // private animationTimeoutID: number
  private observer: () => void

  public constructor(props: TermViewContainerProps) {
    super(props)
    this.observer = () => this.forceUpdate()
  }

  public componentDidMount() {
    this.props.term.subscribe(this.observer)
  }

  public componentDidUpdate(prevProps: TermViewContainerProps) {
    if (prevProps.term !== this.props.term) {
      prevProps.term.unsubscribe(this.observer)
      this.props.term.subscribe(this.observer)
    }
  }

  public componentWillUnmount() {
    this.props.term.unsubscribe(this.observer)
  }

  private didViewClick(e: React.MouseEvent<HTMLDivElement>) {
    // Ignore the event unless `this.props.onClick` is defined.
    if (!this.props.onClick) {
      return
    }

    // Identify the most nested subview for which the click event has been triggered.
    let elm = e.target as Element
    while ((elm !== e.currentTarget) && !elm.getAttribute('data-term')) {
      elm = elm.parentElement
    }

    // Ignore the event if the click occured on a subview.
    if (elm === e.currentTarget) {
      this.props.onClick?.(this.props.term)
    }
  }

  private didMouseOver(e: React.MouseEvent<HTMLDivElement>) {
    if ((this.props.hoveredTerm == null) || this.props.hoveredTerm.isAncestor(this.props.term)) {
      this.props.updateHoveredTerm(this.props.term)
    }
  }

  private didMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.hoveredTerm === this.props.term) {
      this.props.updateHoveredTerm(null)
    }
  }

  private didLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.term.label = e.target.value
  }

  /// Compute the view's color scheme.
  private get colorScheme() {
    let baseColor = Color.gray
    if (this.props.hoveredTerm === this.props.term) {
      baseColor = baseColor.tint.tint
    }

    return {
      backgroundColor: baseColor.css,
      borderColor: baseColor.shade.css,
      color: baseColor.l > 0.5 ? 'black' : 'white',
    }
  }

  render() {
    // // Compute component-independent properties.
    // const childProps = {
    //   onClick       : this.didClick.bind(this),
    //   isFaded       : this.state.isFaded,
    //   editable      : this.props.editable,
    //   isShaking     : this.state.isShaking,
    //   colors        : this.colors(),
    //   changeFaded   : this.changeFaded.bind(this),
    //   changeHovered : this.changeHovered.bind(this),
    // }

    // // Create the appropriate sub-view.
    // const term = this.props.term
    // if (term instanceof AST.Expr) {
    //   return <ExprBlock
    //     { ...childProps }
    //     term={ term }
    //     collapsible={ this.props.collapsible }
    //     isCollapsed={ this.state.isCollapsed }
    //     onSubtermClick={ this.props.onClick }
    //     changeCollapsed={ this.changeCollapsed.bind(this) }
    //   />
    // } else if (term instanceof AST.VarRef) {
    //   return <VarRefBlock { ...childProps } term={ term } />
    // } else {
    //   return null
    // }

    // Separate props that should be forwarded to subviews (in case this view reprensents an
    // expression) from those that are specific to this component.
    const { term, ...forwardedProps } = this.props

    // Render the view.
    let view: Optional<React.ReactElement> = null
    if (term instanceof Expr) {
      view = React.createElement(ExprView, {
        /// Keep all forwarded props.
        ...forwardedProps,

        /// Props that are specific to an ExprView.
        label: term.label,
        subterms: term.subterms,
        colorScheme: this.colorScheme,
        onViewClick: this.didViewClick.bind(this),
        onMouseOver: this.didMouseOver.bind(this),
        onMouseLeave: this.didMouseLeave.bind(this),
        onLabelChange: this.didLabelChange.bind(this),
      })
    } else if (this.props.term instanceof VarRef) {
    }

    return view
  }

  // didClick(e: React.MouseEvent) {
  //   let elm = e.target as Element
  //   while ((elm !== e.currentTarget) && !elm.getAttribute('data-term')) {
  //     elm = elm.parentElement
  //   }
  //   if (elm === e.currentTarget) {
  //     this.props.onClick?.(this.props.term, this.startAnimation.bind(this))
  //   }
  // }

  // didChangeLabel(e: React.KeyboardEvent<HTMLInputElement>) {
  //   // Ignore this event if this block isn't editable.
  //   if (!this.props.editable) { return }
  //
  //   // Modifiy the term's label.
  //   const newLabel = (e.target as HTMLInputElement).value
  //   const newRoot = this.props.term.root.substituting(
  //     this.props.term,
  //     this.props.term.renamed(newLabel))
  //   this.props.onChange?.(newRoot)
  // }

  // changeFaded(value: boolean) {
  //   this.setState({ isFaded: value })
  // }

  // changeHovered(value: boolean) {
  //   this.setState({ isHovered: value })
  //   if (value && !!this.props.unsetParentHovered) {
  //     this.props.unsetParentHovered()
  //   }
  // }

  // changeCollapsed(value: boolean) {
  //   this.setState({ isCollapsed: value })
  // }

  // startAnimation(animation: string) {
  //   switch (animation) {
  //   case 'shake':
  //     window.clearTimeout(this.animationTimeoutID)
  //     this.setState({ isShaking: true }, () => {
  //       this.animationTimeoutID = window.setTimeout(() => this.setState({ isShaking: false }), 500)
  //     })
  //
  //   default:
  //     break
  //   }
  // }

}
