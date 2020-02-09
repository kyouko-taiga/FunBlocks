import { combineReducers } from 'redux'

import interpreterHistory from './InterpreterHistory'
import ruleSet from './RuleSet'

export default combineReducers({
  interpreterHistory,
  ruleSet,
})
