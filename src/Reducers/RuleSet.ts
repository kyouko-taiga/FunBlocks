import { AnyAction } from 'redux'

import { INSERT_RULE } from 'FunBlocks/Actions/Program'
import { Rule } from 'FunBlocks/AST/Terms'

const ruleSet = (state: Array<Rule> = [], action: AnyAction): Array<Rule> => {
  switch (action.type) {
  case INSERT_RULE:
    return state.concat([ action.payload ])

  default:
    return state
  }
}

export default ruleSet
