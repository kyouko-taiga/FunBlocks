import { PayloadAction } from 'FunBlocks/Actions/Types'
import { Term } from 'FunBlocks/AST/Terms'

export const PUSH_STATE = 'Interpreter.pushState'

export const pushState = (state: Term): PayloadAction<Term> => ({
  type: PUSH_STATE,
  payload: state,
})
