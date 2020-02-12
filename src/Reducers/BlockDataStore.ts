import { AnyAction } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/Actions/BlockData'

export type BlockDataStore = {
  [key: string]: { [key: string]: any },
}

export const blockDataStore = (state: BlockDataStore = {}, action: AnyAction): BlockDataStore => {
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
