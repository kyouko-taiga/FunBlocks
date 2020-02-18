import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Rule } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'
import BlockPlaceholder from './BlockPlaceholder'

const styles = require('./RuleBlock.module')

export interface RuleBlockProps {

  /// The rule to represent graphically.
  rule: Rule

  /// Indicates whether this rule block should be rendered selected.
  selected?: boolean

  /// Indicates whether the blocks of this rules are editable (default: `false`).
  ///
  /// Setting this flag will make this block react to the user interactions that can trigger its
  /// modification. This include drag and drop events originating from the program editor's toolbox
  /// (for additions) and drag events originating from a subterm (for deletions).
  editable?: boolean,

  /// A callback that is called whenever the rule block is clicked.
  onClick?(rule: Rule): void

  /// A callback that is called when the rule has been updated (i.e. its terms changed).
  onUpdate?(patch: { left?: Term, right?: Term }): void,

}

class RuleBlock extends React.Component<RuleBlockProps> {

  static defaultProps = {
    selected: false,
    editable: false,
    onClick: () => {},
  }

  render() {
    const className = classNames(styles.ruleBlock, {
      [styles.selected]: this.props.selected,
    })

    const left = this.block(this.props.rule.left, this.didChangeLeft.bind(this), false)
    const right = this.block(this.props.rule.right, this.didChangeRight.bind(this), true)
    return (
      <div className={ className } onClick={ () => this.props.onClick(this.props.rule) }>
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

}

export default RuleBlock
