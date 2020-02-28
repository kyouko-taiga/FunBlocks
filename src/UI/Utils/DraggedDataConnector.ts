import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { setData, clearData } from 'FunBlocks/UI/Actions/DraggedData'
import { DraggedData } from 'FunBlocks/UI/Reducers/DraggedData'
import { RootState } from 'FunBlocks/UI/Store'

const mapStateToProps = (state: RootState) => ({
  draggedData: state.draggedData,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDraggedData: (type: string, payload?: Dictionary, callbacks?: Dictionary<Function>) =>
    dispatch(setData(type, payload, callbacks)),
  clearDraggedData: () => dispatch(clearData())
})

export interface DraggedDataProps {

  readonly draggedData: DraggedData

  setDraggedData(type: string, payload?: Dictionary, callbacks?: Dictionary<Function>): void

  clearDraggedData(): void

}

export const connectDraggedData = connect(mapStateToProps, mapDispatchToProps)
