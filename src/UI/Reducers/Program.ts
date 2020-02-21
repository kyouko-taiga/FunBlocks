import { AnyAction, combineReducers } from 'redux'

import * as AST from 'FunBlocks/AST'
import { ACTION_TYPES } from 'FunBlocks/UI/Actions/IDE'

const defaultProgram: Program = {
  initialState: null,
  ruleCases: [],
  source: '',
}

const reducer = (program: Program = defaultProgram, action: AnyAction): Program => {
  switch (action.type) {
  case ACTION_TYPES.UPDATE_PROGRAM:
    // The payload should be an object that implements `Program`.
    return { ...program, ...action.payload }

  case ACTION_TYPES.UPDATE_INITIAL_STATE:
    return { ...program, initialState: action.payload }

  case ACTION_TYPES.INSERT_RULE_CASE:
    return { ...program, ruleCases: program.ruleCases.concat([ action.payload ]) }

  case ACTION_TYPES.UPDATE_RULE_CASE: {
    // Find the rule case to update.
    const cases = program.ruleCases
    const index = cases.findIndex((r) => r.id === action.payload.ruleCaseID)
    if (index < 0) {
      return program
    }

    // Apply the patch.
    const left = typeof action.payload.patch.left !== 'undefined'
      ? action.payload.patch.left
      : cases[index].left
    const right = typeof action.payload.patch.right !== 'undefined'
      ? action.payload.patch.right
      : cases[index].right

    const newRuleCase = new AST.RuleCaseDecl({ left: left, right: right })
    return {
      ...program,
      ruleCases: cases.slice(0, index).concat([newRuleCase], cases.slice(index + 1)),
    }
  }

  case ACTION_TYPES.REMOVE_RULE_CASE: {
    // Find the rule case to remove.
    const cases = program.ruleCases
    const index = cases.findIndex((r) => r.id === action.payload)
    if (index < 0) {
      return program
    }

    // Remove the rule case.
    return {
      ...program,
      ruleCases: cases.slice(0, index).concat(cases.slice(index + 1)),
    }
  }

  default:
    return program
  }
}

export const program = reducer
