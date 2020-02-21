import { AnyAction, combineReducers } from 'redux'

import * as AST from 'FunBlocks/AST'
import { ACTION_TYPES } from 'FunBlocks/UI/Actions/IDE'

const initialState = (state: Term = null, action: AnyAction): Term => {
  switch (action.type) {
  case ACTION_TYPES.UPDATE_PROGRAM:
    return action.payload.initialState

  case ACTION_TYPES.UPDATE_INITIAL_STATE:
    return action.payload

  default:
    return state
  }
}

const ruleCases = (
  state: Array<AST.RuleCaseDecl> = [],
  action: AnyAction
): Array<AST.RuleCaseDecl> => {
  switch (action.type) {
  case ACTION_TYPES.UPDATE_PROGRAM:
    return action.payload.rules

  case ACTION_TYPES.INSERT_RULE_CASE:
    return state.concat([ action.payload ])

  case ACTION_TYPES.UPDATE_RULE_CASE: {
    // Find the rule case to update.
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

    const newRule = new AST.RuleCaseDecl({ left: left, right: right })
    return state.slice(0, index).concat([newRule], state.slice(index + 1))
  }

  case ACTION_TYPES.REMOVE_RULE_CASE: {
    // Find the rule case to remove.
    const index = state.findIndex((r) => r.id === action.payload)
    if (index < 0) {
      return state
    }

    // Remove the rule.
    return state.slice(0, index).concat(state.slice(index + 1))
  }

  default:
    return state
  }
}

export const program = combineReducers({ initialState, ruleCases })
