import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Rule, Term } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'

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

    const left = this.props.rule.left && (
      <Block
        term={ this.props.rule.left }
        editable={ this.props.editable }
        onChange={ this.didChangeLeft.bind(this) }
      />
    ) || <div className={ styles.placeholder } />

    const right = this.props.rule.right && (
      <Block
        term={ this.props.rule.right }
        editable={ this.props.editable }
        onChange={ this.didChangeRight.bind(this) }
      />
    ) || <div className={ styles.placeholder } />

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

  didChangeLeft(newTerm: Term) {
    this.props.onUpdate?.({ left: newTerm })
  }

  didChangeRight(newTerm: Term) {
    this.props.onUpdate?.({ right: newTerm })
  }

}

export default RuleBlock
