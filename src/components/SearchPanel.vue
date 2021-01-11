<template>
  <section class="bed-search-panel" v-show="isShow">
    <div class="container">
      <div class="box-row">
        <div class="icon-btn lg" @click="close()">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div class="common-radio-group">
          <div class="radio"
            :class="[mode === 'keyword' && 'active']"
            @click="mode = 'keyword'">Keyword</div>
          <div class="radio"
            :class="[mode === 'tag' && 'active']"
            @click="mode = 'tag'">Tag</div>
        </div>
        <!-- <div class="box-select" :data-name="'search by'">
          <select class="common-select" v-model="mode">
            <option value="keyword">Keyword</option>
            <option value="tag">Tag</option>
          </select>
        </div> -->
        <span>in</span>
        <div class="box-select" :data-name="'category'">
          <select class="common-select" v-model="category">
            <option value="all">All</option>
            <option value="inbox">Inbox</option>
            <option value="current">Current</option>
            <option value="coming">Coming</option>
            <option value="anytime">Anytime</option>
            <option value="someday">Someday</option>
            <option value="tracking">Tracking</option>
            <option value="note">Note</option>
            <option value="history">History</option>
          </select>
        </div>
        <input id="search-input" class="common-input" type="text" autofocus :placeholder="searchPlaceholder" v-model="keyword" @keypress.enter="search()">
      </div>
      <div class="row-counts" v-show="hasSearched">
        Total {{ totalSearchCount }} matched
      </div>

      <!-- result list -->
      <div class="box-list">
        <div class="box-cats" v-for="(cat, index) in searchResults" :key="cat.categoryName">
          <div class="cat-title" @click="toggleCategoryCollapse(index)">
            {{ cat.categoryName }} ({{ cat.nodes.length }} matched)&nbsp;
            <span class="icon-btn lg">
              <font-awesome-icon :icon="['fas', 'caret-up']" v-show="!cat.collapsed" />
              <font-awesome-icon :icon="['fas', 'caret-down']" v-show="cat.collapsed" />
            </span>
          </div>
          <div class="box-item" v-show="!cat.collapsed" v-for="(item) in cat.nodes" :key="item.index">
            <!-- <div class="box-radio" v-show="system.tab !== 'history'" @click="handleFinish(system.tab, item.index)"></div> -->
            <div class="content">{{ item.headPiece }}<span class="matched">{{ item.searchKeyword }}</span>{{ item.tailPiece }}</div>
            <div class="labels extended">
              <span class="common-tag sm label" v-for="(label, i) in item.labels" :key="i">{{ label }}</span>
              <div class="mask">&nbsp;</div>
            </div>
            <div class="btn" @click="go(cat.categoryName)">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </div>
          </div>
        </div>
      </div>

      <div class="no-data" v-if="!hasSearched && !searchResults.length">
        Please input keyword to search
      </div>
      <div class="no-data" v-if="hasSearched && !searchResults.length">
        No matched task
      </div>
    </div>
  </section>
</template>

<script>
import eventBus from '@/eventBus'
import system from '@/models/system'
import systemCtrl from '@/ctrls/systemCtrl'
// import dataCtrl from '@/ctrls/dataCtrl'

export default {
  name: 'searchPanel',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isShow: false,
      hasSearched: false,
      category: 'all',
      mode: 'keyword', // 模式，keyword - 关键字查找，tag - 标签查找
      keyword: '',
      searchResults: [
        // {
        //   categoryName: 'inbox',
        //   collapsed: false,
        //   nodes: [
        //     {
        //       ...,
        //       index: 0,
        //       searchKeyword: 'th',
        //       headPiece: 'some',
        //       tailPiece: 'ing'
        //     }
        //   ]
        // }
      ]
    }
  },
  computed: {
    totalSearchCount () {
      return this.searchResults.reduce((soFar, item) => {
        return soFar + item.nodes.length
      }, 0)
    },
    searchPlaceholder () {
      if (this.category === 'all') {
        return `${this.mode} to search in ${this.category} categories`
      } else {
        return `${this.mode} to search in ${this.category} category`
      }
    }
  },

  mounted () {
    eventBus.$on('showSearch', () => {
      this.show()
    })
  },

  beforeDestroy () {
    eventBus.$off('showSearch')
  },

  methods: {
    search () {
      if (!this.keyword) {
        window.alert('Please input keyword before searching')
        return
      }
      const rawData = JSON.parse(JSON.stringify(this.data))
      if (this.category === 'all') {
        // 从所有结果中查找
        this.searchResults = []
        const inboxResults = this.doSearch(this.mode, this.keyword, rawData.inbox)
        if (inboxResults.length) {
          this.searchResults.push({
            categoryName: 'inbox',
            collapsed: false,
            nodes: inboxResults
          })
        }
        const currentResults = this.doSearch(this.mode, this.keyword, rawData.current)
        if (currentResults.length) {
          this.searchResults.push({
            categoryName: 'current',
            collapsed: false,
            nodes: currentResults
          })
        }
        const comingResults = this.doSearch(this.mode, this.keyword, rawData.coming)
        if (comingResults.length) {
          this.searchResults.push({
            categoryName: 'coming',
            collapsed: false,
            nodes: comingResults
          })
        }
        const anytimeResults = this.doSearch(this.mode, this.keyword, rawData.anytime)
        if (anytimeResults.length) {
          this.searchResults.push({
            categoryName: 'anytime',
            collapsed: false,
            nodes: anytimeResults
          })
        }
        const somedayResults = this.doSearch(this.mode, this.keyword, rawData.someday)
        if (somedayResults.length) {
          this.searchResults.push({
            categoryName: 'someday',
            collapsed: false,
            nodes: somedayResults
          })
        }
        const trackingResults = this.doSearch(this.mode, this.keyword, rawData.tracking)
        if (trackingResults.length) {
          this.searchResults.push({
            categoryName: 'tracking',
            collapsed: false,
            nodes: trackingResults
          })
        }
        const noteResults = this.doSearch(this.mode, this.keyword, rawData.note)
        if (noteResults.length) {
          this.searchResults.push({
            categoryName: 'note',
            collapsed: false,
            nodes: noteResults
          })
        }
        const historyResults = this.doSearch(this.mode, this.keyword, rawData.history)
        if (historyResults.length) {
          this.searchResults.push({
            categoryName: 'history',
            collapsed: false,
            nodes: historyResults
          })
        }
      } else {
        // 从特定分类中查找
        this.searchResults = []
        const results = this.doSearch(this.mode, this.keyword, rawData[this.category])
        if (results.length) {
          this.searchResults.push({
            categoryName: this.category,
            collapsed: false,
            nodes: results
          })
        }
      }
      this.hasSearched = true
    },
    doSearch (mode = 'keyword', keyword, list) {
      const result = []
      if (mode === 'keyword') {
        // 搜索关键字模式
        list.forEach((item, index) => {
          const targetIndex = item.content.toLowerCase().indexOf(keyword.toLowerCase())
          if (targetIndex > -1) {
            result.push({
              content: item.content,
              cat: item.cat,
              labels: item.labels,
              group: item.group,
              createTime: item.createTime,
              updateTime: item.updateTime,
              doneTime: item.doneTime,
              index,
              searchKeyword: item.content.substr(targetIndex, keyword.length),
              headPiece: item.content.substring(0, targetIndex),
              tailPiece: item.content.substring(targetIndex + keyword.length)
            })
          }
        })
      } else if (mode === 'tag') {
        // 搜索标签模式
        list.forEach((item, index) => {
          if (item.labels.some(l => l.toLowerCase().indexOf(keyword.toLowerCase()) > -1)) {
            result.push({
              content: item.content,
              cat: item.cat,
              labels: item.labels,
              group: item.group,
              createTime: item.createTime,
              updateTime: item.updateTime,
              doneTime: item.doneTime,
              index,
              searchKeyword: '',
              headPiece: item.content,
              tailPiece: ''
            })
          }
        })
      }
      return result
    },
    go (cat) {
      if (system.tab !== cat) {
        systemCtrl.changeTab(cat)
      }
      this.close()
    },
    toggleCategoryCollapse (index) {
      this.searchResults[index].collapsed = !this.searchResults[index].collapsed
    },
    show () {
      this.hasSearched = false
      this.category = 'all'
      this.keyword = ''
      this.searchResults = []
      this.isShow = true
      system.isPanelActive = true
      setTimeout(() => {
        document.querySelector('#search-input').focus()
      }, 100)
    },
    close () {
      this.isShow = false
      system.isPanelActive = false
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/var.scss";

.bed-search-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  .container {
    height: 100%;
    background: #fff;
    // box-shadow: 1px 1px 28px 2px rgba(12, 12, 12, .4);
    transition: all $transition-time;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: rgba(#ccc, .8);
    }
    .box-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      z-index: 100;
      height: 50px;
      padding: 0 18px 0 80px;
      // border-bottom: 2px solid #ccc;
      border-bottom-right-radius: $border-radius;
      border-bottom-left-radius: $border-radius;
      background: $sheet-bgcolor;
      box-shadow: $sheet-boxshadow;
      .box-select {
        position: relative;
        height: $input-height;
      }
      .common-input {
        width: 480px;
      }
    }
    .row-counts {
      position: fixed;
      left: 0;
      top: 50px;
      right: 0;
      z-index: 100;
      height: 30px;
      line-height: 30px;
      padding: 0 16px;
      border-radius: 0 0 $border-radius $border-radius;
      background: #bfe2ff;
      box-shadow: 0px 10px 8px 1px rgba(122, 122, 122, .2);
      font-size: $sub-font-size;
      font-weight: bold;
    }
    .box-list {
      padding: 90px 18px 8px;
      .box-cats {
        .cat-title {
          display: flex;
          align-items: center;
          padding: 10px 0 12px;
          color: #666;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          user-select: none;
          &:hover {
            text-decoration: underline;
          }
        }
        .box-item {
          position: relative;
          display: flex;
          // justify-content: space-between;
          align-items: center;
          height: 40px;
          padding: 0 12px;
          border-top: 1px solid #eee;
          background: #fff;
          // font-family: 'Monaco';
          cursor: default;
          &.focused {
            background: linear-gradient(-90deg, #fff 3%, #eee 60%, #eee 100%);
          }
          &:last-child {
            border-bottom: 1px solid #eee;
          }
          .content {
            // min-width: 300px;
            width: 500px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            .matched {
              background: #f5f83b;
            }
          }
          .labels {
            position: relative;
            // display: flex;
            width: 90px;
            // height: 100%;
            // height: 40px;
            white-space: nowrap;
            overflow: hidden;
            // box-shadow: -3px 0px 8px 1px rgba(0, 0, 0, .3) inset;
            &.extended {
              width: 200px;
            }
            .label {
              margin-right: 3px;
            }
            .mask {
              position: absolute;
              top: 0;
              bottom: 0;
              right: 0;
              width: 8px;
              height: 100%;
              background-image: linear-gradient(-90deg, #FFFFFF 3%, rgba(255,255,255,0.50) 60%, rgba(255,255,255,0) 100%);
              z-index: 2;
            }
          }
          .btn {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 6px;
            width: 20px;
            height: 20px;
            padding: 4px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            transition: $transition-time;
            &:hover {
              background: #ccc;
            }
          }
        }
      }
    }
    .no-data {
      padding: 16px;
      color: #aaa;
      text-align: center;
    }
  }
}
</style>
