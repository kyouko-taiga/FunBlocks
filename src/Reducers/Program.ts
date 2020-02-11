import { AnyAction, combineReducers } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/Actions/IDE'
import { Term, Rule } from 'FunBlocks/AST/Terms'

const initialState = (state: Term = null, action: AnyAction): Term => {
  switch (action.type) {
  case ACTION_TYPES.UPDATE_INITIAL_STATE:
    return action.payload

  default:
    return state
  }
}

const rules = (state: Array<Rule> = [], action: AnyAction): Array<Rule> => {
  switch (action.type) {
  case ACTION_TYPES.INSERT_RULE:
    return state.concat([ action.payload ])

  default:
    return state
  }
}

export const program = combineReducers({ initialState, rules })

export type Program = ReturnType<typeof program>
