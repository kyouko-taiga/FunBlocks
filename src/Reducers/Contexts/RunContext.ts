import { AnyAction } from 'redux'

export type RunContext = {}

export const runContext = (state: RunContext, action: AnyAction): RunContext => {
  return state
}
