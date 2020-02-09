import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Rule } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'

const styles = require('./RuleBlock.module')

type RuleBlockProps = {
  rule: Rule,
  onClick?(e: React.MouseEvent): void
}

class RuleBlock extends React.Component<RuleBlockProps> {

  render() {
    return (
      <div className={ styles.ruleBlock }>
        <div className={ styles.left }>
          <Block term={ this.props.rule.left } />
        </div>
        <FontAwesomeIcon icon="arrow-right" size="lg" />
        <div className={ styles.right }>
          <Block term={ this.props.rule.right } />
        </div>
      </div>
    )
  }

}

export default RuleBlock
