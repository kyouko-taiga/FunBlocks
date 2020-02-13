import { AnyAction } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/Actions/DragData'

export type DragData = {
  type: string,
  payload: StringDictionary,
}

const initialState: DragData = { type: null, payload: null }
export const dragData = (state: DragData = initialState, action: AnyAction): DragData => {
  switch (action.type) {
  case ACTION_TYPES.CLEAR_DATA:
    return initialState

  case ACTION_TYPES.SET_DATA:
    return action.payload

  default:
    return state
  }
}
