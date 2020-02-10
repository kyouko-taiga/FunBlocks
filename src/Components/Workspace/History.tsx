import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { setHistoryIndex } from 'FunBlocks/Actions/Interpreter'
import { Term } from 'FunBlocks/AST/Terms'
import { DebuggingContext } from 'FunBlocks/Reducers/Interpreter'
import { RootState } from 'FunBlocks/Store'

const styles = require('./Workspace.module')

type HistoryProps = DebuggingContext & {
  states: Array<Term>,
  historyIndex: number,
  setHistoryIndex(index: number): void,
}

class History extends React.PureComponent<HistoryProps> {

  render() {
    const buttons = this.props.states.map((term, i) => (
      <button
        key={ term.id }
        className={ this.props.historyIndex == i ? styles.selected : '' }
        onClick={ () => this.props.setHistoryIndex(i) }
      />
    ))

    return (
      <div className={ styles.history }>
        { buttons }
      </div>
    )
  }

}

const mapStateToProps = (state: RootState) => ({
  states      : (state.interpreter.context as DebuggingContext).history,
  historyIndex: (state.interpreter.context as DebuggingContext).historyIndex,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setHistoryIndex: (index: number) => dispatch(setHistoryIndex(index)),
})

export default connect(mapStateToProps, mapDispatchToProps)(History)
