import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import { setData, clearData } from 'FunBlocks/UI/Actions/DraggedData'
import Block from 'FunBlocks/UI/Components/Block'
import BlockPlaceholder from './BlockPlaceholder'

const styles = require('./RuleBlock.module')

export interface RuleBlockProps {

  /// The rule case to represent graphically.
  rule: AST.RuleCaseDecl

  /// Indicates whether the blocks of this rules are editable (default: `false`).
  ///
  /// Setting this flag will make this block react to the user interactions that can trigger its
  /// modification. This include drag and drop events originating from the program editor's toolbox
  /// (for additions) and drag events originating from a subterm (for deletions).
  editable?: boolean

  /// A callback that is called when the rule block is clicked.
  onClick?(e: React.MouseEvent | React.TouchEvent): void

  /// A callback that is called when the rule has been updated (i.e. its terms changed).
  onUpdate?(patch: { left?: Term, right?: Term }): void

  /// A callback that is called when the rule has been removed.
  onRemove?(): void

  /// An action dispatcher that sets drag data.
  setDraggedData(type: string, payload?: any, callbacks?: Dictionary<Function>): void

  /// An action creater that clears drag data.
  clearDraggedData(): void

}

class RuleBlock extends React.Component<RuleBlockProps> {

  static defaultProps = {
    editable: false,
  }

  render() {
    const left = this.block(this.props.rule.left, this.didChangeLeft.bind(this), false)
    const right = this.block(this.props.rule.right, this.didChangeRight.bind(this), true)
    return (
      <div
        className={ styles.ruleBlock }
        draggable={ this.props.editable }
        onClick={ this.props.onClick }
        onDragStart={ this.didDragStart.bind(this) }
      >
        <div className={ styles.left }>
          { left }
        </div>
        <FontAwesomeIcon icon="arrow-right" size="lg" />
        <div className={ styles.right }>
          { right }
        </div>
      </div>
    )
  }

  block(term: Term, onChange: (newTerm: Term) => void, allowsVariables: boolean): React.ReactNode {
    return term && (
      <Block term={ term } editable={ this.props.editable } onChange={ onChange } />
    ) || this.props.editable && (
      <BlockPlaceholder onDrop={ onChange } allowsVariables={ allowsVariables } />
    ) || <FontAwesomeIcon icon="ban" size="lg" />
  }

  didChangeLeft(newTerm: Term) {
    this.props.onUpdate?.({ left: newTerm })
  }

  didChangeRight(newTerm: Term) {
    this.props.onUpdate?.({ right: newTerm })
  }

  didDragStart(e: React.DragEvent<HTMLDivElement>) {
    this.props.setDraggedData('RuleCaseDecl', this.props.rule, { onRemove: this.props.onRemove })
    e.stopPropagation()
  }

  didDragEnd(e: React.DragEvent<HTMLDivElement>) {
    this.props.clearDraggedData()
    e.stopPropagation()
  }

}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDraggedData: (type: string, payload?: Dictionary, callbacks?: Dictionary<Function>) =>
    dispatch(setData(type, payload, callbacks)),
  clearDraggedData: () => dispatch(clearData()),
})

export default connect(null, mapDispatchToProps)(RuleBlock)
