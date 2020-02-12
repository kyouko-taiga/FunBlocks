import classNames from 'classnames'
import React from 'react'

import { Expression, Term } from 'FunBlocks/AST/Terms'
import { BlockContainer } from './BlockContainer'

const styles = require('./Block.module')

type ExprBlockProps = {
  term: Expression,
  data: { [key: string]: any },
  isShaking: boolean,
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  onClick?(e: React.MouseEvent): void,
  onSubtermClick(term: Term, startAnimation?: (animation: string) => void): void,
  onDropSubterm?(): void,
  changeHoverState(value: boolean): void,
  updateData(data: { [key: string]: any }): void,
}

class ExprBlock extends React.PureComponent<ExprBlockProps> {

  render() {
    // Generate the subterms, if any.
    const term = this.props.term
    const subterms = term.subterms
      .map((subterm) => (
        <BlockContainer
          key={ subterm.id }
          term={ subterm }
          data={ this.props.data }
          onClick={ this.props.onSubtermClick }
          onDropSubterm={ this.props.onDropSubterm }
          unsetParentHoverState={ () => this.props.changeHoverState(false) }
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

    const className = classNames(styles.expr, 'no-text-select', {
      [styles.clickable]: !!this.props.onClick,
      [styles.shaking]: this.props.isShaking,
    })

    return (
      <div
        data-term
        className={ className }
        style={ this.props.colors }
        onClick={ this.props.onClick }
        onMouseOver={ this.didMouseOver.bind(this) }
        onMouseLeave={ this.didMouseLeave.bind(this) }
        onDragOver={ this.didDragOver.bind(this) }
        onDragLeave={ this.didDragLeave.bind(this) }
        onDrop={ this.didDrop.bind(this) }
      >
        <div className={ styles.exprLabel }>{ term.label }</div>
        { subterms }
      </div>
    )
  }

  dropPlaceholderData(): { termID: string, placeholderIndex: number } {
    if (!!this.props.data && !!this.props.data.dropPlaceholderPosition) {
      return this.props.data.dropPlaceholderPosition
    } else {
      return { termID: null, placeholderIndex: -1 }
    }
  }

  didMouseOver(e: React.MouseEvent) {
    this.props.changeHoverState(true)
    e.stopPropagation()
  }

  didMouseLeave(e: React.MouseEvent) {
    this.props.changeHoverState(false)
    e.stopPropagation()
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event id there's the component didn't recieve any drop handler.
    if (!this.props.onDropSubterm) { return }

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
    // Ignore this event id there's the component didn't recieve any drop handler.
    if (!this.props.onDropSubterm) { return }

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
    // Ignore this event id there's the component didn't recieve any drop handler.
    if (!this.props.onDropSubterm) { return }

    this.props.updateData({ dropPlaceholderPosition: null })
    this.props.onDropSubterm()
  }

}

export default ExprBlock
