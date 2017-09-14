import { handleActions } from 'redux-actions'

const initialState = {
  unitSystem: 'SI',
  timeFilter: null,
  experienceFilter: null
}

export default handleActions({
  'set unit system' (state, action) {
    return Object.assign({}, state, {
      unitSystem: action.payload
    })
  },
  'set time filter' (state, action) {
    return Object.assign({}, state, {
      timeFilter: action.payload,
      experienceFilter: null
    })
  },
  'set experience filter' (state, action) {
    return Object.assign({}, state, {
      timeFilter: null,
      experienceFilter: action.payload
    })
  },
  'set fsp_range filter' (state, action) {
    return Object.assign({}, state, {
      fspRangeFilter: action.payload
    })
  },
  'set fsp_choice filter' (state, action) {
    return Object.assign({}, state, {
      fspChoiceFilter: action.payload
    })
  },
  'set sort_order' (state, action) {
    return Object.assign({}, state, {
      sortOrder: action.payload
    })
  }
}, initialState)
