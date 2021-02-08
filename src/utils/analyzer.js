
import { dateUtil } from '@youngbeen/angle-util'
import { getFollowWorkday } from './holiday/HolidayUtil'

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
    // 存在输入标签
    matchedDays = matchedDays[0]
    trimContent = trimContent.replace(`~${matchedDays}~`, '')
    const postDays = parseInt(matchedDays)
    const date = getDateByPostDays(postDays)
    dueDate = (dateUtil.formatDateTime('YYYY-MM-DD', date) + ' 18:00:00')
  }
  return {
    content,
    trimContent,
    dueDate,
    matchedDays
  }
}

const getDateByPostDays = (postDays = 0) => {
  const now = new Date()
  let date = now
  if (postDays) {
    date = getFollowWorkday(now, postDays)
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
