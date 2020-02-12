import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Expression, Variable } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'

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
            <ToolButton label="Term">
              <Block term={ this.dummyExpr } />
            </ToolButton>
            <ToolButton label="Variable">
              <Block term={ this.dummyVar } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Rule" colspan={ 2 }>
              <Block term={ this.dummyExpr } />
              <FontAwesomeIcon icon="arrow-right" size="lg" />
              <Block term={ this.dummyExpr } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Type" />
            <ToolButton label="Handler" />
          </div>
        </div>
      </div>
    )
  }

}

class ToolButton extends React.PureComponent<{ label: string, colspan?: number }> {

  static defaultProps = {
    colspan: 1,
  }

  render() {
    const className = classNames(
      styles.btn,
      styles['colspan' + this.props.colspan],
      'no-text-select')

    return (
      <div className={ className } draggable>
        <div className={ styles.btnIcon }>
          { this.props.children }
        </div>
        <span>{ this.props.label }</span>
      </div>
    )
  }

}

export default Toolbox
