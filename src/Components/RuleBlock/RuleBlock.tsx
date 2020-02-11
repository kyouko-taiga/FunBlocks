import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Rule } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'

const styles = require('./RuleBlock.module')

type RuleBlockProps = {
  rule: Rule,
  selected?: boolean,
  onClick?(rule: Rule): void
}

class RuleBlock extends React.Component<RuleBlockProps> {

  static defaultProps = {
    selected: false,
    onClick: () => {},
  }

  render() {
    const className = classNames(styles.ruleBlock, {
      [styles.selected]: this.props.selected,
    })

    return (
      <button className={ className } onClick={ () => this.props.onClick(this.props.rule) }>
        <div className={ styles.left }>
          <Block term={ this.props.rule.left } />
        </div>
        <FontAwesomeIcon icon="arrow-right" size="lg" />
        <div className={ styles.right }>
          <Block term={ this.props.rule.right } />
        </div>
      </button>
    )
  }

}

export default RuleBlock
