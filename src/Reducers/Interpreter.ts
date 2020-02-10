import { AnyAction } from 'redux'

import { PUSH_STATE, SELECT_RULE } from 'FunBlocks/Actions/Interpreter'
import { Term } from 'FunBlocks/AST/Terms'

/// An enumeration of the modes of the interpreter.
export enum InterpreterMode {
  Editing = 0,
  Debugging = 1,
  Running = 2,
}

export type EditingContext = { }

export type DebuggingContext = {
  history: Array<Term>,
  selectedRuleID: string,
}

export type RunningContext = { }

export type InterpreterContext = EditingContext | DebuggingContext | RunningContext

export type InterpreterState = {
  mode: InterpreterMode,
  context: InterpreterContext
}

const init: InterpreterState = {
  mode: InterpreterMode.Debugging,
  context: {
    history: [] as Array<Term>,
    selectedRuleID: null as string,
  },
}

const interpreter = (state: InterpreterState = init, action: AnyAction): InterpreterState => {
  switch (action.type) {
  case PUSH_STATE:
    if (state.mode == InterpreterMode.Debugging) {
      const context = state.context as DebuggingContext
      return {
        ...state,
        context: { ...context, history: context.history.concat([ action.payload ]) },
      }
    }

    throw new Error(`unexpected action '${action.type} in state '${state.mode}'`)

  case SELECT_RULE:
    if (state.mode == InterpreterMode.Debugging) {
      const context = state.context as DebuggingContext
      return {
        ...state,
        context: { ...context, selectedRuleID: action.payload },
      }
    }

    throw new Error(`unexpected action '${action.type} in state '${state.mode}'`)

  default:
    return state
  }
}

export default interpreter
