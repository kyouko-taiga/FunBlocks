import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { setMode } from 'FunBlocks/Actions/IDE'
import { IDEMode } from 'FunBlocks/Reducers/IDE'
import { RootState } from 'FunBlocks/Store'
import MenuBarItem from './MenuBarItem'

const styles = require('./IDE.module')

type Props = {
  mode: IDEMode,
  setIDEMode(mode: IDEMode): void,
}

class MenuBar extends React.PureComponent<Props> {

  render() {
    const mode = this.props.mode
    return (
      <div className={ styles.menuBar }>
        <MenuBarItem
          icon="pen"
          label="Edit"
          pressed={ mode === IDEMode.Edit }
          onClick={ () => this.props.setIDEMode(IDEMode.Edit) }
        />
        <MenuBarItem
          icon="bug"
          label="Debug"
          pressed={ mode === IDEMode.Debug }
          onClick={ () => this.props.setIDEMode(IDEMode.Debug) }
        />
        <MenuBarItem
          icon="play"
          label="Run"
          pressed={ mode === IDEMode.Run }
          onClick={ () => this.props.setIDEMode(IDEMode.Run) }
        />
      </div>
    )
  }

}

const mapStateToProps = (state: RootState) => ({
  mode: state.ide.mode,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setIDEMode: (mode: IDEMode) => dispatch(setMode(mode)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MenuBar)
