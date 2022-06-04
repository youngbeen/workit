import system from '@/models/system'

export default {
  save (data) {
    if (data) {
      window.localStorage.setItem('workitSaveData', JSON.stringify(data))
      return true
    } else {
      return false
    }
  },
  read () {
    let data = window.localStorage.getItem('workitSaveData') || ''
    if (data) {
      const now = (new Date()).getTime()
      data = JSON.parse(data)
      // 数据处理
      data = data.map((item, index) => {
        // 原始索引值
        item.index = index
        // 修复旧数据
        item.parentId === undefined && (item.parentId = null)
        item.repeatType === undefined && (item.repeatType = '')
        // 修复错误数据
        if (item.cat === 'history' && item.status !== 1) {
          console.log('在history中的数据status错误')
          item.status = 1
        }
        if (item.cat === 'history' && !item.doneTime) {
          console.log('在history中的数据doneTime错误')
          item.doneTime = now
        }
        return item
      })
      return data
    } else {
      return null
    }
  },
  saveSnapshot (data) {
    if (data) {
      window.sessionStorage.setItem('taskSnapshot', JSON.stringify(data))
      return true
    } else {
      return false
    }
  },
  readSnapshot () {
    let data = window.sessionStorage.getItem('taskSnapshot') || ''
    if (data) {
      data = JSON.parse(data)
      return data
    } else {
      return null
    }
  },
  saveTag (newTags) {
    if (newTags && newTags.length) {
      // 最多存储10个标签
      let tags = []
      if (newTags.length >= 10) {
        tags = newTags.slice(0, 10)
      } else {
        tags = this.readTags()
        newTags.forEach(tag => {
          const index = tags.findIndex(item => item === tag)
          if (index === -1) {
            // 新标签
            if (tags.length >= 10) {
              tags.pop()
            }
            tags = [tag, ...tags]
          } else {
            // 已有标签，需要挪到首位
            tags.splice(index, 1)
            tags = [tag, ...tags]
          }
        })
      }
      // console.log(tags)
      window.localStorage.setItem('usedTags', JSON.stringify(tags))
      return true
    } else {
      return false
    }
  },
  readTags () {
    const data = window.localStorage.getItem('usedTags') || '[]'
    return JSON.parse(data)
  },
  clearTags () {
    window.localStorage.removeItem('usedTags')
  },
  saveLastUsedTag (tags) {
    window.localStorage.setItem('lastTimeUsedTags', tags.join(','))
  },
  readLastUsedTag () {
    const data = window.localStorage.getItem('lastTimeUsedTags') || ''
    return data
  },
  clearLastUsedTag () {
    window.localStorage.removeItem('lastTimeUsedTags')
  },
  saveConfig (config) {
    window.localStorage.setItem('workitConfig', JSON.stringify(config))
  },
  readConfig () {
    const data = window.localStorage.getItem('workitConfig')
    if (data) {
      return JSON.parse(data)
    } else {
      return null
    }
  },
  savePrefers () {
    window.localStorage.setItem('workitPrefers', JSON.stringify({
      subTaskDisplayMode: system.subTaskDisplayMode
    }))
  },
  resumePrefers () {
    let data = window.localStorage.getItem('workitPrefers')
    if (data) {
      data = JSON.parse(data)
      data.subTaskDisplayMode !== undefined && (system.subTaskDisplayMode = data.subTaskDisplayMode)
    } else {
      return null
    }
  },
  backup (key, data) {
    if (key && data) {
      window.localStorage.setItem(`backup${key}`, JSON.stringify(data))
      return true
    } else {
      return false
    }
  },
  readBackup (key) {
    if (key) {
      const data = window.localStorage.getItem(`backup${key}`) || ''
      if (data) {
        return JSON.parse(data)
      } else {
        return null
      }
    } else {
      return null
    }
  }
}
