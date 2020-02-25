import { AnyAction } from 'redux'

export type EditContext = {}

export const editContext = (state: EditContext, action: AnyAction): EditContext => {
  return state
}
