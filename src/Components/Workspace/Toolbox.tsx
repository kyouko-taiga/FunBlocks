import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Expression, Variable } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'
import ToolButton from './ToolButton'

const styles = require('./Workspace.module')

class Toolbox extends React.PureComponent {

  private readonly dummyExpr = new Expression({ label: 'abc' })
  private readonly dummyVar = new Variable({ label: 'x' })

  render() {
    return (
      <div className={ styles.toolbox }>
        <div className={ styles.sectionHeading }>
          Blocks
        </div>
        <div className={ styles.toolMatrix }>
          <div className={ styles.row }>
            <ToolButton label="Expression" kind="expression">
              <Block term={ this.dummyExpr } />
            </ToolButton>
            <ToolButton label="Variable" kind="variable">
              <Block term={ this.dummyVar } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Rule" colspan={ 2 } kind="rule">
              <Block term={ this.dummyExpr } />
              <FontAwesomeIcon icon="arrow-right" size="lg" />
              <Block term={ this.dummyExpr } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Type" kind="type" />
            <ToolButton label="Handler" kind="handler" />
          </div>
        </div>
      </div>
    )
  }

}

export default Toolbox
