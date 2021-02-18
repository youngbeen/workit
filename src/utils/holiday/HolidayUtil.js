
import { dateUtil } from '@youngbeen/angle-util'

const supportYears = ['2021']

let yearPlan = null

// 判断日期是工作日/假日
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

// 获取日期的下N个工作日
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

// 获取日期的下一个自然日
export const getFollowDay = (date, divDays = 1) => {
  let targetDate = (new Date(date)).getTime()
  targetDate += 1000 * 60 * 60 * 24 * divDays
  return targetDate
}

// 获取日期之后的下一个对应weekday
// 0 - Sunday, 1~6 - Monday~Saturday
export const getFollowWeekday = (date, weekday = 0) => {
  date = new Date(date)
  const dateWeekday = date.getDay()
  let div = weekday - dateWeekday
  div <= 0 && (div += 7)
  return getFollowDay(date, div)
}
