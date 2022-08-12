import Vue from 'vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEye,
  faInbox,
  faHistory,
  faMugHot,
  faCalendarAlt,
  faCalendarCheck,
  faBook,
  faCompass,
  faTrashAlt,
  faEraser,
  faFilter,
  faEllipsisH,
  faCheck,
  faCheckDouble,
  faPaperPlane,
  faPlus,
  faSearch,
  faTag,
  faClock,
  faCaretDown,
  faCaretUp,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCaretSquareUp,
  faStopwatch,
  faChevronCircleDown,
  faTimesCircle,
  faLink,
  faUnlink,
  faSortAmountDown,
  faShoePrints,
  faArchive,
  faBullseye,
  faEject,
  faAtom,
  faEdit,
  faCookie,
  faCookieBite,
  faCog,
  faSync,
  faEnvelopeSquare,
  faInfo,
  faMinusSquare,
  faWindowClose
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faEye)
library.add(faInbox)
library.add(faHistory)
library.add(faMugHot)
library.add(faCalendarAlt)
library.add(faCalendarCheck)
library.add(faBook)
library.add(faCompass)
library.add(faTrashAlt)
library.add(faEraser)
library.add(faFilter)
library.add(faEllipsisH)
library.add(faCheck)
library.add(faCheckDouble)
library.add(faPaperPlane)
library.add(faPlus)
library.add(faSearch)
library.add(faTag)
library.add(faClock)
library.add(faCaretDown)
library.add(faCaretUp)
library.add(faChevronDown)
library.add(faChevronLeft)
library.add(faChevronRight)
library.add(faChevronUp)
library.add(faCaretSquareUp)
library.add(faStopwatch)
library.add(faChevronCircleDown)
library.add(faTimesCircle)
library.add(faLink)
library.add(faUnlink)
library.add(faSortAmountDown)
library.add(faShoePrints)
library.add(faArchive)
library.add(faBullseye)
library.add(faEject)
library.add(faAtom)
library.add(faEdit)
library.add(faCookie)
library.add(faCookieBite)
library.add(faCog)
library.add(faSync)
library.add(faEnvelopeSquare)
library.add(faInfo)
library.add(faMinusSquare)
library.add(faWindowClose)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
