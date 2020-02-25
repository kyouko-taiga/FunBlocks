import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import { setData, clearData } from 'FunBlocks/UI/Actions/DraggedData'
import { DraggedData } from 'FunBlocks/UI/Reducers/DraggedData'
import { RootState } from 'FunBlocks/UI/Store'
import { BlockContainer } from './BlockContainer'

const styles = require('./Block.module')

type ExprBlockProps = {
  /// The expression to render.
  term: AST.Expr,
  /// The data associated with this expression's root term.
  data: Dictionary,
  /// Whether the block is faded.
  isFaded: boolean
  /// Whether the block is collapsible.
  collapsible: boolean,
  /// Whether the block is collapsed.
  isCollapsed: boolean,
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
  /// The data associated with drag events.
  draggedData: DraggedData,
  /// The callback to call on click events.
  onClick?(e: React.MouseEvent): void,
  /// The click callback to pass on to children.
  onSubtermClick(term: Term, startAnimation?: (animation: string) => void): void,
  /// The callback to call when the rendered expression was modified by the user.
  onChange?(newTerm: Term): void,
  /// A callback to change the block's label.
  onChangeLabel(e: React.ChangeEvent<HTMLInputElement>): void,
  /// A callback to set whether the rendered block is faded.
  changeFaded(value: boolean): void,
  /// A callback to set whether the rendered block is hovered.
  changeHovered(value: boolean): void,
  /// A callback to set whether the rendered block is collapsed.
  changeCollapsed(value: boolean): void,
  /// A callback to update the data associated with this expression's root term.
  updateData(data: Dictionary): void,
  /// An action dispatcher that sets drag data.
  setDraggedData(type: string, payload?: any, callbacks?: Dictionary<Function>): void,
  /// An action creater that clears drag data.
  clearDraggedData(): void,
}

class ExprBlock extends React.PureComponent<ExprBlockProps> {

  render() {
    const className = classNames(styles.expr, 'no-text-select', {
      [styles.faded]: this.props.isFaded,
      [styles.shaking]: this.props.isShaking,
    })

    return (
      <div
        data-term={ this.props.term.id }
        className={ className }
        style={ this.props.colors }
        draggable={ this.props.editable }
        onClick={ this.props.onClick }
        onMouseOver={ this.didMouseOver.bind(this) }
        onMouseLeave={ this.didMouseLeave.bind(this) }
        onDragStart={ this.didDragStart.bind(this) }
        onDragEnd={ this.didDragEnd.bind(this) }
        onDragOver={ this.didDragOver.bind(this) }
        onDragLeave={ this.didDragLeave.bind(this) }
        onDrop={ this.didDrop.bind(this) }
        onDoubleClick={ this.didDoubleClick.bind(this) }
      >
        <div className={ styles.exprLabel }>
          { this.renderLabel() }
        </div>
        { this.renderSubterms() }
      </div>
    )
  }

  renderLabel() {
    if (this.props.editable) {
      return (
        <input
          value={ this.props.term.label }
          size={ Math.max(this.props.term.label.length, 1) }
          onClick={ (e) => (e.target as HTMLInputElement).select() }
          onChange={ this.props.onChangeLabel }
        />
      )
    } else {
      return this.props.term.label
    }
  }

  renderSubterms() {
    if (this.props.isCollapsed) {
      return [
        <span key="ellipsis" className={ styles.ellipsis }>
          <FontAwesomeIcon icon="ellipsis-h" />
        </span>
      ]
    }

    // Generate the subterms, if any.
    const term = this.props.term
    const subterms = term.subterms
      .map((subterm, i) => (
        <BlockContainer
          key={ i }
          term={ subterm }
          editable={ this.props.editable }
          data={ this.props.data }
          onClick={ this.props.onSubtermClick }
          onChange={ this.props.onChange }
          unsetParentHovered={ () => this.props.changeHovered(false) }
          updateData={ this.props.updateData }
        />
      ))

    // Generate a drop placeholder if necessary.
    const { termID, placeholderIndex } = this.dropPlaceholderData()
    if (termID === this.props.term.id) {
      subterms.splice(placeholderIndex, 0, (
        <div key="drop-placeholder" className={ styles.dropPlaceholder } />
      ))
    }

    return subterms
  }

  dropPlaceholderData(): { termID: string, placeholderIndex: number } {
    return this.props.data?.dropPlaceholderPosition || { termID: null, placeholderIndex: -1 }
  }

  didMouseOver(e: React.MouseEvent<HTMLDivElement>) {
    this.props.changeHovered(true)
    e.stopPropagation()
  }

  didMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
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
    this.props.updateData({ dropPlaceholderPosition: null })
    e.stopPropagation()
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if this block isn't editable.
    if (!this.props.editable) { return }

    // Ignore this event if this block is collapsed.
    if (this.props.isCollapsed) { return }

    // Ignore this event if the data attached to the drag event is not a term.
    if (this.props.draggedData.type !== 'Term') { return }

    // Ignore this event if this block renders the term being dragged or one of its descendants.
    // This constraints prevents a term from being a descendant of itself.
    const draggedTerm = this.props.draggedData.payload
    let targetedTerm: Term = this.props.term
    while (targetedTerm !== null) {
      if (draggedTerm === targetedTerm) { return }
      targetedTerm = targetedTerm.parent
    }

    // Allow data to be dropped onto this block.
    e.preventDefault()

    // Compute the index of the subterm before which the mouse is moving.
    let i = 0
    for (let child of e.currentTarget.childNodes) {
      // Ignore non-term child nodes.
      if ((child instanceof HTMLElement) && child.getAttribute('data-term')) {
        if (e.clientX < child.getBoundingClientRect().x) { break }
        i += 1
      }
    }

    // Give up if either the ith or the (i-1)th subterm is the block being dragged.
    const subterms = this.props.term.subterms
    if ((i < subterms.length) && (draggedTerm.id === subterms[i].id)) { return }
    if ((i > 0) && (draggedTerm.id === subterms[i-1].id)) { return }

    // Update the block data to show the drop placeholder.
    const { termID, placeholderIndex } = this.dropPlaceholderData()
    if ((termID !== this.props.term.id) || placeholderIndex != i) {
      this.props.updateData({
        dropPlaceholderPosition: { termID: this.props.term.id, placeholderIndex: i }
      })
    }
    e.stopPropagation()
  }

  didDragLeave(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the block isn't editable.
    if (!this.props.editable) { return }

    // Ignore this event if the component is collapsed.
    if (this.props.isCollapsed) { return }

    // Ignore this event unless this block is root, and a drop placeholder is being rendered in
    // either this block or one of its children.
    if (!this.props.data || !this.props.data.dropPlaceholderPosition) { return }
    if (this.props.term.id !== this.props.term.root.id) { return }

    // Check if the drag event is getting out of this block's bounding box.
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (y < box.top || y >= box.bottom || x < box.left || x >= box.right) {
      this.props.updateData({ dropPlaceholderPosition: null })
    }
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the block isn't editable.
    if (!this.props.editable) { return }

    // Ignore this event if the component is collapsed.
    if (this.props.isCollapsed) { return }

    // Ignore this event if this block is not the direct target of the drop.
    const { termID, placeholderIndex } = this.dropPlaceholderData()
    if (this.props.term.id !== termID) { return }

    // Remove the drop placeholder.
    this.props.updateData({ dropPlaceholderPosition: null })

    // Make sure the dragged object is a term.
    if (this.props.draggedData.type !== 'Term') {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Remove the dragged term from its current parent to insert it as a new child in this term.
    const draggedTerm = this.props.draggedData.payload
    const newSubterms: Array<Term> = [ ...this.props.term.subterms ]

    if (draggedTerm.parent?.id === this.props.term.id) {
      // If the dragged term is a direct child of this term, then we have to check its position
      // relative to the placeholder index and possibly offset it. If it should be moved to the
      // right (i.e. its current index in the array of subterms precedes the placeholder index),
      // then the placeholder index should be decremented to account for the subterm's removal.
      const i = this.props.term.subterms.findIndex((subterm) => subterm.id === draggedTerm.id)
      newSubterms.splice(i, 1)
      if (placeholderIndex <= i) {
        newSubterms.splice(placeholderIndex, 0, draggedTerm)
      } else {
        newSubterms.splice(placeholderIndex - 1, 0, draggedTerm)
      }
    } else if (this.props.term.isAncestor(draggedTerm)) {
      // If the dragged term is a descendant of one of this term's subterms, then we should remove
      // it from the later before we insert it as a direct child.
      for (let i = 0; i < newSubterms.length; ++i) {
        if (newSubterms[i].isAncestor(draggedTerm)) {
          newSubterms[i] = newSubterms[i].substituting({ [draggedTerm.id]: null })
          break
        }
      }
      newSubterms.splice(placeholderIndex, 0, draggedTerm)
    } else {
      // If the dragged term is a sibling of this term or not related at all, then we should remove
      // it from its current parent using the `onChange` callback.
      const draggedParent = draggedTerm.root.substituting({ [draggedTerm.id]: null })
      this.props.draggedData.callbacks?.onChange?.(draggedParent)
      newSubterms.splice(placeholderIndex, 0, draggedTerm)
    }

    const newRoot = this.props.term.root.substituting({
      [this.props.term.id]: new AST.Expr({
        label: this.props.term.label,
        type: this.props.term.type,
        subterms: newSubterms,
      })
    })
    this.props.onChange?.(newRoot)
  }

  didDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
    // Ignore this event if this term isn't collapsible.
    if (!this.props.collapsible) { return }

    // Ignore this event if this term doesn't have any subterm.
    if (this.props.term.subterms.length == 0) { return }

    // Ignore this event if it originates from a subterm.
    let elm = e.target as Element
    while ((elm !== e.currentTarget) && !elm.getAttribute('data-term')) {
      elm = elm.parentElement
    }
    if (elm !== e.currentTarget) { return }

    // Toggle the collapsed change.
    this.props.changeCollapsed(!this.props.isCollapsed)
  }

}

const mapStateToProps = (state: RootState) => ({ draggedData: state.draggedData })

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDraggedData: (type: string, payload?: Dictionary, callbacks?: Dictionary<Function>) =>
    dispatch(setData(type, payload, callbacks)),
  clearDraggedData: () => dispatch(clearData()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ExprBlock)
