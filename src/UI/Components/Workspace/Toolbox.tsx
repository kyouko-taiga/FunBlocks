import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import { changeInputMode } from 'FunBlocks/UI/Actions/IDE'
import Block from 'FunBlocks/UI/Components/Block'
import Button from 'FunBlocks/UI/Components/UILibrary/Button'
import ButtonGroup from 'FunBlocks/UI/Components/UILibrary/ButtonGroup'
import { InputMode } from 'FunBlocks/UI/Reducers'
import { RootState } from 'FunBlocks/UI/Store'
import ObjectTrash from './ObjectTrash'
import ToolButton from './ToolButton'

const styles = require('./Workspace.module')

type Props = {
  inputMode: InputMode,
  changeInputMode(mode: InputMode): void,
}

class Toolbox extends React.PureComponent<Props> {

  private readonly dummyExpr = new AST.Expr({ label: 'abc' })
  private readonly dummyVar = new AST.VarRef({ label: 'x' })

  render() {
    return (
      <div className={ styles.toolbox }>
        <div className={ styles.sectionHeading }>Input Mode</div>
        <div className={ styles.inputMode }>
          <ButtonGroup>
            <Button
              classes={ styles.btn }
              pressed={ this.props.inputMode == InputMode.Visual }
              onClick={ () => this.didChangeInputMode(InputMode.Visual) }
            >
              <FontAwesomeIcon icon="shapes" /> Blocks
            </Button>
            <Button
              classes={ styles.btn }
              pressed={ this.props.inputMode == InputMode.Textual }
              onClick={ () => this.didChangeInputMode(InputMode.Textual) }
            >
              <FontAwesomeIcon icon="terminal" /> Text
            </Button>
          </ButtonGroup>
        </div>
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

  didChangeInputMode(newInputMode: InputMode) {
    if (this.props.inputMode != newInputMode) {
      this.props.changeInputMode(newInputMode)
    }
  }

}

const mapStateToProps = (state: RootState) => ({
  inputMode: state.inputMode,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeInputMode: (mode: InputMode) => dispatch(changeInputMode(mode))
})

export default connect(mapStateToProps, mapDispatchToProps)(Toolbox)
