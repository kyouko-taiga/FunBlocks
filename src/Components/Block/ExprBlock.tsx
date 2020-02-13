import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Expression, Term, Variable } from 'FunBlocks/AST/Terms'
import { BlockContainer } from './BlockContainer'

const styles = require('./Block.module')

type ExprBlockProps = {

  term: Expression,
  data: { [key: string]: any },
  collapsible: boolean,
  isCollapsed: boolean,
  editable: boolean,
  isShaking: boolean,
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },

  onClick?(e: React.MouseEvent): void,
  onSubtermClick(term: Term, startAnimation?: (animation: string) => void): void,
  onChange?(newTerm: Term): void,
  changeHovered(value: boolean): void,
  changeCollapsed(value: boolean): void,
  updateData(data: { [key: string]: any }): void,

}

class ExprBlock extends React.PureComponent<ExprBlockProps> {

  render() {
    const className = classNames(styles.expr, 'no-text-select', {
      [styles.clickable]: !!this.props.onClick,
      [styles.shaking]: this.props.isShaking,
    })

    return (
      <div
        data-term={ this.props.term.id }
        className={ className }
        style={ this.props.colors }
        onClick={ this.props.onClick }
        onMouseOver={ this.didMouseOver.bind(this) }
        onMouseLeave={ this.didMouseLeave.bind(this) }
        onDragOver={ this.didDragOver.bind(this) }
        onDragLeave={ this.didDragLeave.bind(this) }
        onDrop={ this.didDrop.bind(this) }
        onDoubleClick={ this.didDoubleClick.bind(this) }
      >
        <div className={ styles.exprLabel }>
          { this.props.term.label }
        </div>
        { this.renderSubterms() }
      </div>
    )
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
      .map((subterm) => (
        <BlockContainer
          key={ subterm.id }
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

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the block isn't editable.
    if (!this.props.editable) { return }

    // Ignore this event if the component is collapsed.
    if (this.props.isCollapsed) { return }

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

    // Parse the data transferred along with the drag event.
    const rawEventData = e.dataTransfer.getData('text/plain')
    const eventData = JSON.parse(rawEventData)
    e.dataTransfer.clearData()

    // Modify the term and notify the parent with the updated version.
    const newSubterms = [ ...this.props.term.subterms ]
    switch (eventData?.kind) {
    case 'expression':
      newSubterms.splice(placeholderIndex, 0, new Expression({ label: 'abc' }))
      break

    case 'variable':
      newSubterms.splice(placeholderIndex, 0, new Variable({ label: 'x' }))
      break

    default:
      console.warn('ignored unexpected drop')
      return
    }

    const newTerm = new Expression({
      label: this.props.term.label,
      type: this.props.term.type,
      subterms: newSubterms
    })
    this.props.onChange(newTerm)
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

export default ExprBlock
