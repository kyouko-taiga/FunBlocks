import React from 'react'
import { connect } from 'react-redux'

import { RootState, Program } from 'FunBlocks/Store'
import BlockEditor from './BlockEditor'

const styles = require('./Workspace.module')

type Props = {
  program: Program,
}

class ProgramEditor extends React.PureComponent<Props> {

  render() {
    return (
      <div className={ styles.program }>
        <BlockEditor term={ this.props.program.initialState } />
      </div>
    )
  }

}

const mapStateToProps = (state: RootState) => ({
  program: state.program,
})

export default connect(mapStateToProps)(ProgramEditor)
