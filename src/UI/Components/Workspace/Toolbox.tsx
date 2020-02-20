import classNames from 'classnames'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import Block from 'FunBlocks/UI/Components/Block'
import ObjectTrash from './ObjectTrash'
import ToolButton from './ToolButton'

const styles = require('./Workspace.module')

class Toolbox extends React.PureComponent {

  private readonly dummyExpr = new AST.Expr({ label: 'abc' })
  private readonly dummyVar = new AST.VarRef({ label: 'x' })

  render() {
    return (
      <div className={ styles.toolbox }>
        <div className={ styles.sectionHeading }>Objects</div>
        <div className={ styles.toolMatrix }>
          <div className={ styles.row }>
            <ToolButton label="Expression" draggedData={ this.createExprData.bind(this) }>
              <Block term={ this.dummyExpr } />
            </ToolButton>
            <ToolButton label="Variable" draggedData={ this.createVarData.bind(this) }>
              <Block term={ this.dummyVar } />
            </ToolButton>
          </div>
          <div className={ styles.row }>
            <ToolButton label="Rule" colspan={ 2 } draggedData={ this.createRuleData.bind(this) }>
              <Block term={ this.dummyExpr } />
              <FontAwesomeIcon icon="arrow-right" size="lg" />
              <Block term={ this.dummyExpr } />
            </ToolButton>
          </div>
        </div>
        <div className={ styles.sectionHeading }>Trash</div>
        <ObjectTrash />
      </div>
    )
  }

  createExprData() {
    return {
      type: 'Term',
      payload: this.dummyExpr.clone,
    }
  }

  createVarData() {
    return {
      type: 'Term',
      payload: this.dummyVar.clone,
    }
  }

  createRuleData() {
    return {
      type: 'RuleCaseDecl',
      payload: new AST.RuleCaseDecl({ left: this.dummyExpr.clone, right: this.dummyExpr.clone }),
    }
  }

}

export default Toolbox
