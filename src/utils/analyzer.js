
import { dateUtil } from '@youngbeen/angle-util'
import { getFollowWorkday, getFollowNatureDay } from '@youngbeen/workday'
const diff = require('diff')

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
      matchedDueDate: matchedDays
    }
  }
  // 分析due date，以~~包裹的MM-dd，yyyy-MM-dd
  let matchedDate = content.match(/(?<=~)(\d{4}-)?\d{2}-\d{2}(?=~)/)
  if (matchedDate) {
    matchedDate = matchedDate[0]
    trimContent = trimContent.replace(`~${matchedDate}~`, '')
    let year = (new Date()).getFullYear()
    let month = ''
    let day = ''
    if (matchedDate.length > 5) {
      // 含年
      [year, month, day] = matchedDate.split('-')
    } else {
      // 不含年
      [month, day] = matchedDate.split('-')
    }
    dueDate = `${year}-${month}-${day} 18:00:00`
    return {
      content,
      trimContent,
      dueDate,
      matchedDueDate: matchedDate
    }
  }
  // 分析due date，以~~包裹的星期x
  // 支持mo/tu/we...不区分大小写
  // 支持monday/tuesday...不区分大小写
  // 支持星期一/星期二.../星期七/星期天/星期日
  // 支持星期1/星期2...
  // 支持所有 星期x 变换为 周x
  let matchedWeekday = content.match(/(?<=~)(mo|tu|we|th|fr|sa|su|monday|tuesday|wednesday|thursday|friday|saturday|sunday|(星期|周)[一二三四五六七日天1-7]{1})(?=~)/i)
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
      case '周一':
      case '周1':
        targetWeekday = 1
        break
      case 'tu':
      case 'tuesday':
      case '星期二':
      case '星期2':
      case '周二':
      case '周2':
        targetWeekday = 2
        break
      case 'we':
      case 'wednesday':
      case '星期三':
      case '星期3':
      case '周三':
      case '周3':
        targetWeekday = 3
        break
      case 'th':
      case 'thursday':
      case '星期四':
      case '星期4':
      case '周四':
      case '周4':
        targetWeekday = 4
        break
      case 'fr':
      case 'friday':
      case '星期五':
      case '星期5':
      case '周五':
      case '周5':
        targetWeekday = 5
        break
      case 'sa':
      case 'saturday':
      case '星期六':
      case '星期6':
      case '周六':
      case '周6':
        targetWeekday = 6
        break
      case 'su':
      case 'sunday':
      case '星期七':
      case '星期日':
      case '星期天':
      case '星期7':
      case '周七':
      case '周日':
      case '周天':
      case '周7':
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
      matchedDueDate: matchedWeekday
    }
  }
  return {
    content,
    trimContent,
    dueDate,
    matchedDueDate: ''
  }
}

const getDateByPostDays = (postDays = 0, type = 'workday') => {
  const now = new Date()
  let date = now
  if (postDays) {
    if (type === 'workday') {
      date = getFollowWorkday(now, postDays)
    } else if (type === 'natual') {
      date = getFollowNatureDay(now, postDays)
    }
  }
  return date
}

const analyseRepeatType = (content) => {
  let trimContent = content
  let repeatType = null
  // 分析重复类型，以^^包裹的内容
  // 支持 once/工作日/每个工作日/ew/everyworkday 不区分大小写
  // 支持 周一/每周一/每个周一 （二三四五六七天日1-7）
  // 支持 星期一/每星期一/每个星期一 （二三四五六七天日1-7）
  // 支持 mo/tu... monday/tuesday... everymo/everytu/... everymonday/everytuesday... 不区分大小写
  let matched = content.match(/(?<=\^)(once|mo|tu|we|th|fr|sa|su|monday|tuesday|wednesday|thursday|friday|saturday|sunday|everymo|everytu|everywe|everyth|everyfr|everysa|everysu|everymonday|everytuesday|everywednesday|everythursday|everyfriday|everysaturday|everysunday|ew|everyworkday|工作日|每个工作日|(每|每个)?(星期|周)[一二三四五六七日天1-7]{1})(?=\^)/i)
  if (matched) {
    matched = matched[0]
    trimContent = trimContent.replace(`^${matched}^`, '')
    switch (matched.toLowerCase()) {
      case 'once':
        repeatType = ''
        break
      case 'ew':
      case 'everyworkday':
      case '工作日':
      case '每个工作日':
        repeatType = 'everyWorkday'
        break
      case 'mo':
      case 'monday':
      case 'everymo':
      case 'everymonday':
      case '星期一':
      case '星期1':
      case '每星期一':
      case '每星期1':
      case '每个星期一':
      case '每个星期1':
      case '周一':
      case '周1':
      case '每周一':
      case '每周1':
      case '每个周一':
      case '每个周1':
        repeatType = 'everyMonday'
        break
      case 'tu':
      case 'tuesday':
      case 'everytu':
      case 'everytuesday':
      case '星期二':
      case '星期2':
      case '每星期二':
      case '每星期2':
      case '每个星期二':
      case '每个星期2':
      case '周二':
      case '周2':
      case '每周二':
      case '每周2':
      case '每个周二':
      case '每个周2':
        repeatType = 'everyTuesday'
        break
      case 'we':
      case 'wednesday':
      case 'everywe':
      case 'everywednesday':
      case '星期三':
      case '星期3':
      case '每星期三':
      case '每星期3':
      case '每个星期三':
      case '每个星期3':
      case '周三':
      case '周3':
      case '每周三':
      case '每周3':
      case '每个周三':
      case '每个周3':
        repeatType = 'everyWednesday'
        break
      case 'th':
      case 'thursday':
      case 'everyth':
      case 'everythursday':
      case '星期四':
      case '星期4':
      case '每星期四':
      case '每星期4':
      case '每个星期四':
      case '每个星期4':
      case '周四':
      case '周4':
      case '每周四':
      case '每周4':
      case '每个周四':
      case '每个周4':
        repeatType = 'everyThursday'
        break
      case 'fr':
      case 'friday':
      case 'everyfr':
      case 'everyfriday':
      case '星期五':
      case '星期5':
      case '每星期五':
      case '每星期5':
      case '每个星期五':
      case '每个星期5':
      case '周五':
      case '周5':
      case '每周五':
      case '每周5':
      case '每个周五':
      case '每个周5':
        repeatType = 'everyFriday'
        break
      case 'sa':
      case 'saturday':
      case 'everysa':
      case 'everysaturday':
      case '星期六':
      case '星期6':
      case '每星期六':
      case '每星期6':
      case '每个星期六':
      case '每个星期6':
      case '周六':
      case '周6':
      case '每周六':
      case '每周6':
      case '每个周六':
      case '每个周6':
        repeatType = 'everySaturday'
        break
      case 'su':
      case 'sunday':
      case 'everysu':
      case 'everysunday':
      case '星期七':
      case '星期日':
      case '星期天':
      case '星期7':
      case '每星期七':
      case '每星期日':
      case '每星期天':
      case '每星期7':
      case '每个星期七':
      case '每个星期日':
      case '每个星期天':
      case '每个星期7':
      case '周七':
      case '周日':
      case '周天':
      case '周7':
      case '每周七':
      case '每周日':
      case '每周天':
      case '每周7':
      case '每个周七':
      case '每个周日':
      case '每个周天':
      case '每个周7':
        repeatType = 'everySunday'
        break
    }
    return {
      content,
      trimContent,
      repeatType,
      matchedRepeatType: matched
    }
  }
  return {
    content,
    trimContent,
    repeatType,
    matchedRepeatType: ''
  }
}

export const analyse = (content) => {
  // 1 分析标签处理
  let { trimContent, labels, matchedLabel } = analyseLabels(content)
  // 2 分析due time处理
  const contentAfterDueDate = analyseDueDate(trimContent)
  const { dueDate, matchedDueDate } = contentAfterDueDate
  trimContent = contentAfterDueDate.trimContent
  // 3 分析重复类型处理
  const contentAfterRepeatType = analyseRepeatType(trimContent)
  const { repeatType, matchedRepeatType } = contentAfterRepeatType
  trimContent = contentAfterRepeatType.trimContent
  return {
    content,
    trimContent,
    labels,
    matchedLabel,
    dueDate,
    matchedDueDate,
    repeatType,
    matchedRepeatType
  }
}

export const analysePossibleDuplicate = (content, source = []) => {
  // console.log(content, source)
  // 原始长度<6不重复，6<=长度<=16须超过70%重复率，长度>16时须超过90%重复率
  if (!content || !source.length || content.length < 6) {
    return {
      result: false,
      content,
      target: '',
      change: []
    }
  }
  if (content.length <= 16) {
    for (let index = 0; index < source.length; index++) {
      const t = source[index]
      const change = diff.diffChars(content, t, {
        ignoreCase: true
      })
      const sameLength = change.reduce((same, item) => {
        if (!item.added && !item.removed) {
          same += item.value.length
        }
        return same
      }, 0)
      if (sameLength / t.length >= 0.7) {
        return {
          result: true,
          content,
          target: t,
          change
        }
      }
    }
    return {
      result: false,
      content,
      target: '',
      change: []
    }
  } else {
    for (let index = 0; index < source.length; index++) {
      const t = source[index]
      const change = diff.diffChars(content, t, {
        ignoreCase: true
      })
      const sameLength = change.reduce((same, item) => {
        if (!item.added && !item.removed) {
          same += item.value.length
        }
        return same
      }, 0)
      if (sameLength / t.length >= 0.9) {
        return {
          result: true,
          content,
          target: t,
          change
        }
      }
    }
    return {
      result: false,
      content,
      target: '',
      change: []
    }
  }
}
