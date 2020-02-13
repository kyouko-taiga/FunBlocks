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
            <ToolButton label="Term" kind="term">
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

class ToolButton extends React.PureComponent<{ label: string, kind: string, colspan?: number }> {

  static defaultProps = {
    colspan: 1,
  }

  render() {
    const className = classNames(
      styles.btn,
      styles['colspan' + this.props.colspan],
      'no-text-select')

    return (
      <div className={ className }>
        <div className={ styles.btnIcon } draggable onDragStart={ this.didDragStart.bind(this) }>
          { this.props.children }
        </div>
        <span>{ this.props.label }</span>
      </div>
    )
  }

  didDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('text/plain', `{ "kind": "${this.props.kind}" }`)
  }

}

export default Toolbox
