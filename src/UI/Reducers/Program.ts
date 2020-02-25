import { AnyAction, combineReducers } from 'redux'

import * as AST from 'FunBlocks/AST'
import { parse, ParseIssue } from 'FunBlocks/Parser/Parser'
import { unparse } from 'FunBlocks/Parser/Unparser'
import { ACTION_TYPES } from 'FunBlocks/UI/Actions/IDE'
import { InputMode } from './.'

type ReducerType = Program & {
  source: string,
  parseIssues: Array<ParseIssue>,
}

const defaultProgram: ReducerType = {
  initialState: null,
  ruleCases: [],
  source: '',
  parseIssues: [],
}

/// Parse a program from the given input string.
const parseProgram = (source: string): ReducerType => {
  // Parse the sources
  const { decls, issues } = parse(source)

  // Create a new program instance from the parsed top-level declarations.
  const program: Dictionary = {
    initialState: null,
    ruleCases: [] as Array<AST.RuleCaseDecl>,
    source: source,
    parseIssues: issues,
  }

  for (const decl of decls) {
    if ((decl instanceof AST.InitStateDecl) && (program.initialState === null)) {
      program.initialState = decl.state
    } else if (decl instanceof AST.RuleCaseDecl) {
      program.ruleCases.push(decl)
    }
  }

  return program as ReducerType
}

const reducer = (program: ReducerType = defaultProgram, action: AnyAction): ReducerType => {
  switch (action.type) {
  case ACTION_TYPES.CHANGE_INPUT_MODE:

    // Implementation note:
    // This reducer assumes that all actions of type CHANGE_INPUT_MODE it receives **actually**
    // change the input mode. In other words, it assumes that if the action requests the IDE to
    // move to the visual (resp. textual) mode, then the IDE is currently in textual (resp. visual)
    // mode. This assumption should be enforced by a reducer that has access to the current input
    // value of the IDE's input mode.

    if (action.payload == InputMode.Textual) {
      // (re)build the program's textual form from its current AST.
      return { ...program, source: unparse(program), parseIssues: [] }
    } else {
      // (re)build the program's visual form from its current source.
      return parseProgram(program.source)
    }

  case ACTION_TYPES.UPDATE_PROGRAM:
    // The payload should be an object that implements `Program`.
    return { ...program, ...action.payload }

  case ACTION_TYPES.UPDATE_PROGRAM_SOURCE:
    return { ...program, source: action.payload }

  case ACTION_TYPES.REBUILD_AST: {
    return parseProgram(program.source)
  }

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
