import { AnyAction, combineReducers } from 'redux'

import { ACTION_TYPES } from 'FunBlocks/Actions/IDE'
import { Rule } from 'FunBlocks/AST/Terms'

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

  case ACTION_TYPES.UPDATE_RULE: {
    // Find the rule to update.
    const index = state.findIndex((r) => r.id === action.payload.ruleID)
    if (index < 0) {
      return state
    }

    // Apply the patch.
    const left = typeof action.payload.patch.left !== 'undefined'
      ? action.payload.patch.left
      : state[index].left
    const right = typeof action.payload.patch.right !== 'undefined'
      ? action.payload.patch.right
      : state[index].right

    const newRule = new Rule({ left: left, right: right })
    return state.slice(0, index).concat([newRule], state.slice(index + 1))
  }

  default:
    return state
  }
}

export const program = combineReducers({ initialState, rules })
