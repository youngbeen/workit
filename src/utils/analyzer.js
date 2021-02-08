
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
  // 分析due date，以~~包裹的数字
  let matched = content.match(/(?<=~)[0-9]+(?=~)/)
  let trimContent = content
  let postDays = -1
  if (matched) {
    // 存在输入标签
    matched = matched[0]
    postDays = parseInt(matched)
    trimContent = trimContent.replace(`~${matched}~`, '')
  }
  return {
    content,
    trimContent,
    postDays,
    matchedPostDays: matched
  }
}

export const analyse = (content) => {
  let { trimContent, labels, matchedLabel } = analyseLabels(content)
  const contentAfterDueDate = analyseDueDate(trimContent)
  const { postDays, matchedPostDays } = contentAfterDueDate
  trimContent = contentAfterDueDate.trimContent
  return {
    content,
    trimContent,
    labels,
    matchedLabel,
    postDays,
    matchedPostDays
  }
}
