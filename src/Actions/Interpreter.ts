import { PayloadAction } from 'FunBlocks/Actions/Types'
import { Term } from 'FunBlocks/AST/Terms'

export const PUSH_STATE = 'Interpreter.pushState'
export const SELECT_RULE = 'Interpreter.selectRule'

export const pushState = (state: Term): PayloadAction<Term> => ({
  type: PUSH_STATE,
  payload: state,
})

export const selectRule = (ruleID: string): PayloadAction<string> => ({
  type: SELECT_RULE,
  payload: ruleID,
})
