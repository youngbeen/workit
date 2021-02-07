
import { dateUtil } from '@youngbeen/angle-util'

const supportYears = ['2021']

let yearPlan = null

export const getDayType = (date) => {
  const year = new Date(date).getFullYear().toString()
  if (supportYears.includes(year)) {
    // 使用plan
    yearPlan = require(`./ChineseHolidays${year}.js`).default
    const monthDay = dateUtil.formatDateTime('MM-DD', date)
    if (yearPlan.holidays.includes(monthDay)) {
      return 'holiday'
    } else if (yearPlan.workdays.includes(monthDay)) {
      return 'workday'
    } else {
      const weekday = (new Date(date)).getDay()
      return weekday === 0 || weekday === 6 ? 'holiday' : 'workday'
    }
  } else {
    // 使用默认
    const weekday = (new Date(date)).getDay()
    return weekday === 0 || weekday === 6 ? 'holiday' : 'workday'
  }
}

export const getFollowWorkday = (date, divDays = 1) => {
  date = (new Date(date)).getTime()
  let meetsCount = 0
  while (meetsCount < divDays) {
    date += 1000 * 60 * 60 * 24
    if (getDayType(date) === 'workday') {
      meetsCount++
    }
  }
  return date
}
