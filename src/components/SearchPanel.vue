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
            <option v-for="c in catOptions"
              :key="c.value"
              :value="c.value">{{ c.label }}</option>
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
            <div class="icon-btn" @click="handleDetail(item)" title="Detail">
              <font-awesome-icon :icon="['fas', 'info']" />
            </div>
            <div class="icon-btn lg" @click="go(cat.category, item)" title="Navigate">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </div>
          </div>
        </div>
      </div>

      <div class="no-data" v-if="!hasSearched && !searchResults.length">
        <img src="@/assets/books.png" alt="Input keywords to search">
      </div>
      <div class="no-data" v-if="hasSearched && !searchResults.length">
        No tasks matched
      </div>
    </div>
  </section>
</template>

<script>
import { sleep } from '@youngbeen/sleep'
import eventBus from '@/eventBus'
import { cats } from '@/models/DictMap'
import system from '@/models/system'
import systemCtrl from '@/ctrls/systemCtrl'
// import dataCtrl from '@/ctrls/dataCtrl'

export default {
  name: 'searchPanel',
  props: {
    list: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      isShow: false,
      hasSearched: false,
      category: 'all',
      catOptions: [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'All Open' },
        ...cats
      ],
      mode: 'keyword', // 模式，keyword - 关键字查找，tag - 标签查找
      keyword: '',
      searchResults: [
        // {
        //   category: 'inbox',
        //   categoryName: 'Inbox',
        //   collapsed: false,
        //   nodes: [
        //     {
        //       ...,
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
      } else if (this.category === 'open') {
        return `${this.mode} to search in all open tasks`
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
        window.alert('Please input something to search')
        return
      }
      const rawData = JSON.parse(JSON.stringify(this.list))
      if (this.category === 'all') {
        // 从所有结果中查找
        this.searchResults = []
        cats.forEach(c => {
          const result = this.doSearch(this.mode, this.keyword, rawData, c.value)
          if (result.length) {
            this.searchResults.push({
              category: c.value,
              categoryName: c.label,
              collapsed: false,
              nodes: result
            })
          }
        })
      } else if (this.category === 'open') {
        // 从所有未关闭结果中查找
        this.searchResults = []
        cats.forEach(c => {
          if (c.value !== 'history') {
            let result = this.doSearch(this.mode, this.keyword, rawData, c.value)
            if (result.length) {
              result = result.filter(r => r.status === 0)
              this.searchResults.push({
                category: c.value,
                categoryName: c.label,
                collapsed: false,
                nodes: result
              })
            }
          }
        })
      } else {
        // 从特定分类中查找
        this.searchResults = []
        const result = this.doSearch(this.mode, this.keyword, rawData, this.category)
        if (result.length) {
          this.searchResults.push({
            category: this.category,
            categoryName: this.catOptions.find(c => c.value === this.category).label,
            collapsed: false,
            nodes: result
          })
        }
      }
      this.hasSearched = true
    },
    doSearch (mode = 'keyword', keyword, allList, cat) {
      const list = allList.filter(item => item.cat === cat)
      const result = []
      if (mode === 'keyword') {
        // 搜索关键字模式
        list.forEach((item) => {
          const targetIndex = item.content.toLowerCase().indexOf(keyword.toLowerCase())
          if (targetIndex > -1) {
            result.push({
              content: item.content,
              cat: item.cat,
              status: item.status,
              labels: item.labels,
              group: item.group,
              createTime: item.createTime,
              updateTime: item.updateTime,
              doneTime: item.doneTime,
              searchKeyword: item.content.substr(targetIndex, keyword.length),
              headPiece: item.content.substring(0, targetIndex),
              tailPiece: item.content.substring(targetIndex + keyword.length)
            })
          }
        })
      } else if (mode === 'tag') {
        // 搜索标签模式
        list.forEach((item) => {
          if (item.labels.some(l => l.toLowerCase().indexOf(keyword.toLowerCase()) > -1)) {
            result.push({
              content: item.content,
              cat: item.cat,
              status: item.status,
              labels: item.labels,
              group: item.group,
              createTime: item.createTime,
              updateTime: item.updateTime,
              doneTime: item.doneTime,
              searchKeyword: '',
              headPiece: item.content,
              tailPiece: ''
            })
          }
        })
      }
      return result
    },
    handleDetail (item) {
      eventBus.$emit('showItemDetail', {
        list: [item],
        index: 0
      })
    },
    go (cat, item) {
      if (system.tab !== cat) {
        systemCtrl.changeTab(cat)
      }
      this.close()
      setTimeout(() => {
        document.querySelector(`#task-${item.createTime}`).scrollIntoView({
          behavior: 'smooth'
        })
      }, 300)
    },
    toggleCategoryCollapse (index) {
      this.searchResults[index].collapsed = !this.searchResults[index].collapsed
    },
    show () {
      this.hasSearched = false
      this.keyword = ''
      this.searchResults = []
      this.isShow = true
      system.isPanelActive = true
      sleep(100).then(() => {
        document.querySelector('#search-input').focus()
      })
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
    background: $primary-bgcolor;
    // box-shadow: 1px 1px 28px 2px rgba(12, 12, 12, .4);
    transition: all $transition-time;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: $scrollbar-thumb-color;
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
        width: 850px;
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
            width: 860px;
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
              width: 300px;
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
          // .btn {
          //   display: flex;
          //   justify-content: center;
          //   align-items: center;
          //   margin-left: 6px;
          //   width: 20px;
          //   height: 20px;
          //   padding: 4px;
          //   border-radius: 50%;
          //   font-size: 16px;
          //   cursor: pointer;
          //   transition: $transition-time;
          //   &:hover {
          //     background: #ccc;
          //   }
          // }
        }
      }
    }
    .no-data {
      padding: 16px;
      color: #aaa;
      text-align: center;
      img {
        width: 240px;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  .bed-search-panel {
    .container {
      background: $primary-bgcolor-dark;
      &::-webkit-scrollbar-thumb {
        background: $scrollbar-thumb-color-dark;
      }
      .box-row {
        background: $sheet-bgcolor-dark;
        box-shadow: none;
      }
      .row-counts {
        background: #01569c;
        box-shadow: none;
      }
      .box-list {
        .box-cats {
          .cat-title {
            color: $secondary-font-color-dark;
          }
          .box-item {
            border-top: 1px solid $border-color-dark;
            background: transparent;
            &:last-child {
              border-bottom: 1px solid $border-color-dark;
            }
            .content {
              .matched {
                background: #646601;
              }
            }
            .labels {
              .mask {
                background-image: linear-gradient(-90deg, $dark-0 3%, rgba($dark-0, .5) 60%, rgba($dark-0, 0) 100%);
              }
            }
          }
        }
      }
    }
  }
}
</style>
