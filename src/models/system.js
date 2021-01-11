
export default {
  tab: '', // 当前激活的tab
  filter: {
    timeType: 'all',
    fromTime: '', // 时间戳
    toTime: '', // 时间戳
    tags: []
  }, // 筛选条件
  isPanelActive: false, // panel 弹框是否已激活
  lastOperation: null // 最后一次执行的操作细节，用于撤销，具体信息参考README
}
