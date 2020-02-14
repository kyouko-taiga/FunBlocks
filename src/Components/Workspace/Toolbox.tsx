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
            <ToolButton label="Expression" draggedData={ this.createExprDraggedData.bind(this) }>
              <Block term={ this.dummyExpr } />
            </ToolButton>
            <ToolButton label="Variable" draggedData={ this.createVarDraggedData.bind(this) }>
              <Block term={ this.dummyVar } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Rule" colspan={ 2 } draggedData={ { type: 'Rule' } }>
              <Block term={ this.dummyExpr } />
              <FontAwesomeIcon icon="arrow-right" size="lg" />
              <Block term={ this.dummyExpr } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Type" draggedData={ { type: 'Type' } } />
            <ToolButton label="Handler" draggedData={ { type: 'Handler' } } />
          </div>
        </div>
      </div>
    )
  }

  createExprDraggedData() {
    return {
      type: 'Term',
      payload: new Expression({ label: 'abc' }),
    }
  }

  createVarDraggedData() {
    return {
      type: 'Term',
      payload: new Variable({ label: 'x' }),
    }
  }

}

export default Toolbox
