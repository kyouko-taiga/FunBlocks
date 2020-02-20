import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { clearBlockData, updateBlockData } from 'FunBlocks/UI/Actions/BlockData'
import { RootState } from 'FunBlocks/UI/Store'
import { BlockContainer, BlockProps } from './BlockContainer'

const mapStateToProps = (state: RootState, ownProps: BlockProps) => ({
  data: state.blockData[ownProps.term.id] || null,
})

const mapDispatchToProps = (dispatch: Dispatch, ownProps: BlockProps) => {
  const key = ownProps.term.id
  return {
    clearData: () => dispatch(clearBlockData(key)),
    updateData: (data: Dictionary) => (
      dispatch(updateBlockData(key, data))),
  }
}

type RootBlockProps = BlockProps
  & ReturnType<typeof mapStateToProps>
  & ReturnType<typeof mapDispatchToProps>

class RootBlock extends React.PureComponent<RootBlockProps> {

  render() {
    return <BlockContainer { ...this.props } />
  }

  componentWillUnmount() {
    // Clear the linked block data.
    if (this.props.data !== null) {
      this.props.clearData()
    }
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(RootBlock)
