import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { setHistoryIndex } from 'FunBlocks/Actions/IDE'
import { Term } from 'FunBlocks/AST/Terms'
import { DebugContext } from 'FunBlocks/Reducers/Contexts/DebugContext'
import { RootState } from 'FunBlocks/Store'

const styles = require('./Workspace.module')

type HistoryProps = {
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

const mapStateToProps = (state: RootState) => {
  const ctx = state.context as DebugContext
  return {
    states: ctx.history,
    historyIndex: ctx.historyIndex,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setHistoryIndex: (index: number) => dispatch(setHistoryIndex(index)),
})

export default connect(mapStateToProps, mapDispatchToProps)(History)
