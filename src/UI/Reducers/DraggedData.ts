import { AnyAction } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/UI/Actions/DraggedData'

export type DraggedData = {
  type: string,
  payload?: any,
  callbacks?: Dictionary<Function>,
}

const initialState: DraggedData = { type: null }
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
