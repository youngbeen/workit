
import { dateUtil } from '@youngbeen/angle-util'
import { getFollowWorkday, getFollowDay } from './holiday/HolidayUtil'

const analyseLabels = (content) => {
  // 分析标签，以##包裹
  let matchedLabel = content.match(/(?<=#).+(?=#)/)
  let trimContent = content
  let labels = []
  if (matchedLabel) {
    // 存在输入标签
    matchedLabel = matchedLabel[0]
    labels = matchedLabel.split(',')
    trimContent = trimContent.replace(`#${matchedLabel}#`, '')
  }
  return {
    content,
    trimContent,
    labels,
    matchedLabel
  }
}

const analyseDueDate = (content) => {
  let trimContent = content
  let dueDate = ''
  // 分析due date，以~~包裹的数字
  let matchedDays = content.match(/(?<=~)[0-9]+(?=~)/)
  if (matchedDays) {
    matchedDays = matchedDays[0]
    trimContent = trimContent.replace(`~${matchedDays}~`, '')
    const postDays = parseInt(matchedDays)
    const date = getDateByPostDays(postDays)
    dueDate = (dateUtil.formatDateTime('YYYY-MM-DD', date) + ' 18:00:00')
    return {
      content,
      trimContent,
      dueDate,
      matchedDays
    }
  }
  // 分析due date，以~~包裹的星期x
  // 支持mo/tu/we...不区分大小写
  // 支持monday/tuesday...不区分大小写
  // 支持星期一/星期二.../星期七/星期天/星期日
  // 支持星期1/星期2...
  let matchedWeekday = content.match(/(?<=~)(mo|tu|we|th|fr|sa|su|monday|tuesday|wednesday|thursday|friday|saturday|sunday|星期[一二三四五六七日天1-7]{1})(?=~)/i)
  if (matchedWeekday) {
    matchedWeekday = matchedWeekday[0]
    trimContent = trimContent.replace(`~${matchedWeekday}~`, '')
    const todayWeekday = new Date().getDay()
    let targetWeekday
    let postDays = 0
    switch (matchedWeekday.toLowerCase()) {
      case 'mo':
      case 'monday':
      case '星期一':
      case '星期1':
        targetWeekday = 1
        break
      case 'tu':
      case 'tuesday':
      case '星期二':
      case '星期2':
        targetWeekday = 2
        break
      case 'we':
      case 'wednesday':
      case '星期三':
      case '星期3':
        targetWeekday = 3
        break
      case 'th':
      case 'thursday':
      case '星期四':
      case '星期4':
        targetWeekday = 4
        break
      case 'fr':
      case 'friday':
      case '星期五':
      case '星期5':
        targetWeekday = 5
        break
      case 'sa':
      case 'saturday':
      case '星期六':
      case '星期6':
        targetWeekday = 6
        break
      case 'su':
      case 'sunday':
      case '星期七':
      case '星期日':
      case '星期天':
      case '星期7':
        targetWeekday = 0
        break
    }
    postDays = targetWeekday - todayWeekday
    postDays < 0 && (postDays += 7)
    const date = getDateByPostDays(postDays, 'natual')
    dueDate = (dateUtil.formatDateTime('YYYY-MM-DD', date) + ' 18:00:00')
    return {
      content,
      trimContent,
      dueDate,
      matchedWeekday
    }
  }
  return {
    content,
    trimContent,
    dueDate
  }
}

const getDateByPostDays = (postDays = 0, type = 'workday') => {
  const now = new Date()
  let date = now
  if (postDays) {
    if (type === 'workday') {
      date = getFollowWorkday(now, postDays)
    } else if (type === 'natual') {
      date = getFollowDay(now, postDays)
    }
  }
  return date
}

export const analyse = (content) => {
  let { trimContent, labels, matchedLabel } = analyseLabels(content)
  const contentAfterDueDate = analyseDueDate(trimContent)
  const { dueDate, matchedDays } = contentAfterDueDate
  trimContent = contentAfterDueDate.trimContent
  return {
    content,
    trimContent,
    labels,
    matchedLabel,
    dueDate,
    matchedDays
  }
}
