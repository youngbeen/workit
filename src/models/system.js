
export default {
  tab: '', // 当前激活的tab
  filter: {
    timeType: 'all',
    fromTime: '', // 时间戳
    toTime: '', // 时间戳
    tags: []
  }, // 筛选条件
  subTaskDisplayMode: 'full', // 子任务展示方式，'full' - 全展示，'fit' - 只展示内容主体, 'openFit' - 只展示未完成的内容主体
  isPanelActive: false // panel 弹框是否已激活
}
