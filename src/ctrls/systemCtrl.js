import system from '../models/system'

export default {
  changeTab (tab) {
    system.tab = tab
    this.resetFilters()
  },
  resetFilters () {
    system.filter = {
      timeType: 'all',
      fromTime: '',
      toTime: '',
      tags: []
    }
  }
}
