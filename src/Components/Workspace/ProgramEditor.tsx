import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { updateInitialState } from 'FunBlocks/Actions/IDE'
import { Term } from 'FunBlocks/AST/Terms'
import { RootState, Program } from 'FunBlocks/Store'
import Block from 'FunBlocks/Components/Block'

const styles = require('./Workspace.module')

type Props = {
  program: Program,
  updateInitialState(newState: Term): void,
}

class ProgramEditor extends React.PureComponent<Props> {

  render() {
    return (
      <div className={ styles.program }>
        <div className={ styles.sectionHeading }>
          Initial State
        </div>
        <Block
          editable
          term={ this.props.program.initialState }
          onChange={ this.didInitialStateChange.bind(this) }
        />
      </div>
    )
  }

  didInitialStateChange(newInitialState: Term) {
    this.props.updateInitialState(newInitialState)
  }

}

const mapStateToProps = (state: RootState) => ({
  program: state.program,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateInitialState: (newState: Term) => dispatch(updateInitialState(newState)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProgramEditor)
