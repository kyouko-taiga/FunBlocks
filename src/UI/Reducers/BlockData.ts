import { AnyAction } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/UI/Actions/BlockData'

export type BlockData = Dictionary<Dictionary>

export const blockData = (state: BlockData = {}, action: AnyAction): BlockData => {
  switch (action.type) {
  case ACTION_TYPES.CLEAR_BLOCKDATA: {
    const newState = { ...state }
    delete newState[action.payload]
    return newState
  }

  case ACTION_TYPES.UPDATE_BLOCKDATA: {
    const data = state[action.payload.key] || {}
    return {
      ...state,
      [action.payload.key]: { ...data, ...action.payload.data },
    }
  }

  default:
    return state
  }
}
