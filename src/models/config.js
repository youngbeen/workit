export default {
  leftnavNumbersMode: 'all', // 导航中显示的数量含义，all | main
  addNewAfterSubTaskAdded: false, // 子任务添加后是否自动继续添加新的子任务
  historyClearMode: 'manual', // 历史数据清理方式，manual | auto
  historyClearDaysFilter: 60, // 历史数据自动清理筛查完成时间超过多少天的数据
  historyWarningCount: 500 // 历史数据警示条数，仅当historyClearMode是manual时有效
}
