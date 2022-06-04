
import { numberUtil } from '@youngbeen/angle-util'

export default {
  getRandomColor () {
    const r = numberUtil.random(255)
    const g = numberUtil.random(255)
    const b = numberUtil.random(255)
    return `rgb(${r},${g},${b})`
  }
}
