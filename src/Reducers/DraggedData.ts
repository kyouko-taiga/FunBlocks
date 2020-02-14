import { AnyAction } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/Actions/DraggedData'

export type DraggedData = {
  type: string,
  payload?: any,
}

const initialState: DraggedData = { type: null, payload: null }
export const draggedData = (state: DraggedData = initialState, action: AnyAction): DraggedData => {
  switch (action.type) {
  case ACTION_TYPES.CLEAR_DATA:
    return initialState

  case ACTION_TYPES.SET_DATA:
    return action.payload

  default:
    return state
  }
}
