import { AnyAction } from 'redux'

import { PUSH_STATE } from 'FunBlocks/Actions/Interpreter'
import { Term } from 'FunBlocks/AST/Terms'

const interpreterHistory = (state: Array<Term> = [], action: AnyAction): Array<Term> => {
  switch (action.type) {
  case PUSH_STATE:
    return state.concat([ action.payload ])

  default:
    return state
  }
}

export default interpreterHistory
