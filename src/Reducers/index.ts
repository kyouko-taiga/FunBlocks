import { combineReducers } from 'redux'

import ide from './IDE'
import ruleSet from './RuleSet'

export default combineReducers({
  ide,
  ruleSet,
})
