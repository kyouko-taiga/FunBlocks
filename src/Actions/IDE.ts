import { PayloadAction } from 'FunBlocks/Actions/Types'
import { Term } from 'FunBlocks/AST/Terms'
import { IDEMode } from 'FunBlocks/Reducers/IDE'

export const PUSH_STATE = 'IDE.pushState'
export const SELECT_RULE = 'IDE.selectRule'
export const SET_HISTORY_INDEX = 'IDE.setHistoryIndex'
export const SET_MODE = 'IDE.setMode'

export const pushState = (state: Term): PayloadAction<Term> => ({
  type: PUSH_STATE,
  payload: state,
})

export const selectRule = (ruleID: string): PayloadAction<string> => ({
  type: SELECT_RULE,
  payload: ruleID,
})

export const setHistoryIndex = (index: number): PayloadAction<number> => ({
  type: SET_HISTORY_INDEX,
  payload: index,
})

export const setMode = (mode: IDEMode): PayloadAction<IDEMode> => ({
  type: SET_MODE,
  payload: mode,
})
