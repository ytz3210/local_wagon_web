<template>
  <div id="monitorScreen" style="height: 100%; width:100%;float:right;position:sticky;overflow: auto">
    <baidu-map class="map" center="北京" :scroll-wheel-zoom="true" @ready="mapReady" @load="mapLoadBegin"
               :map-click="false">
      <bm-control anchor="BMAP_ANCHOR_TOP_LEFT">
        <div style="margin-left: 15px; margin-top:10px">
          <a-auto-complete :dataSource="bookingNosFiltered" style="width: 250px;" class="global-search"
                           @select="onBookingNoSelect"
                           @search="handleBookingNoSearch"
                           allowClear
                           placeholder="请输入提单号"/>
        </div>
      </bm-control>

      <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>

      <!--添加地图点聚合-->
      <bml-marker-clusterer :averageCenter="false">
        <bm-marker v-for="wagon in wagonList" @click="toggleMarkerInfo(wagon)" :clicking="true"
                   :position="{lng: wagon.lng, lat: wagon.lat}"
                   :rotation="wagon.direction" :title="wagon.plateNo"
                   :icon="{url:wagon.online == 1 ? (wagon.velocity == '0' ? require('@/assets/truck_stop_sm.png') : require('@/assets/truck_moving_sm.png')) : require('@/assets/truck_offline_sm.png'), size: {width:28, height:28}}">

        </bm-marker>
      </bml-marker-clusterer>

      <bm-info-window :position="wagonSelected.position" :closeOnClick="false" :colse="closeMarkerInfo"
                      :title="wagonSelected.plateNo" :show="isShow" @clickclose="closeMarkerInfo">
        <table>
          <tr>
            <td class="tip_right" valign="top">所属车队：</td>
            <td class="tip_fold_line" valign="top">{{wagonSelected.teamName}}</td>
          </tr>
          <tr>
            <td class="tip_right" valign="top">下一站点：</td>
            <td class="tip_fold_line" valign="top">{{wagonSelected.nextStopName}}</td>
          </tr>
          <tr>
            <td class="tip_right" valign="top">计划到达：</td>
            <td valign="top">{{wagonSelected.nextStopPTAF}}</td>
          </tr>
          <tr>
            <td class="tip_right" valign="top">预计到达：</td>
            <td valign="top">{{wagonSelected.nextStopETAF}}</td>
          </tr>
          <tr>
            <td class="tip_right" valign="top">速&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;度：</td>
            <td valign="top">{{wagonSelected.velocity == null ? 0 : wagonSelected.velocity}} km/h</td>
          </tr>
          <tr>
            <td class="tip_right" valign="top">定位地址：</td>
            <td class="tip_fold_line" valign="top">{{wagonSelected.adr}}</td>
          </tr>
          <tr>
            <td class="tip_right" valign="top">定位时间：</td>
            <td valign="top">{{wagonSelected.posTimeUpdatedF}}</td>
          </tr>
        </table>
      </bm-info-window>

    </baidu-map>
    <a-tabs defaultActiveKey="1" class="infoTabs" size="small" type="card" id="infoTab">
      <a-tab-pane :tab="'任务车辆('+ wagonListNum+')'" key="1" class="infoPane" id="allWagonsTab">
        <a-table :columns="wagonListColumns" :dataSource="wagonList" :loading="loading"
                 :rowSelection="{columnTitle: '定位', type: 'radio',onChange: onSelectChange}"
                 :rowKey="record => record.id" :pagination="false" :rowClassName="wagonListStyle"
                 :bordered="true">

        </a-table>
      </a-tab-pane>
      <a-tab-pane :tab="'在线('+ wagonOnlineNum+')'" key="2" class="infoPane" forceRender>
        <a-table :columns="wagonListColumns" :dataSource="wagonOnlineList" :loading="loading"
                 :rowSelection="{columnTitle: '定位', type: 'radio',onChange: onSelectChange}"
                 :rowKey="record => record.id" :pagination="false" :rowClassName="wagonListStyle"
                 :bordered="true">
        </a-table>
      </a-tab-pane>
      <a-tab-pane :tab="'离线('+ wagonOfflineNum+')'" key="3" class="infoPane" forceRender>
        <a-table :columns="wagonListColumns" :dataSource="wagonOfflineList" :loading="loading"
                 :rowSelection="{columnTitle: '定位', type: 'radio',onChange: onSelectChange}"
                 :rowKey="record => record.id" :pagination="false" :rowClassName="wagonListStyle"
                 :bordered="true">
        </a-table>
      </a-tab-pane>
      <a-tab-pane :tab="'告警('+ warningEventNum+')'" key="4" class="infoPane" forceRender>
        <a-table :columns="warningEventsListColumns" :dataSource="warningEventsList" :loading="loading"
                 :rowKey="record => record.id" :pagination="false" :rowClassName="wagonListStyle"
                 :bordered="true">
              <span slot="action" slot-scope="text, record">
                  <a-popconfirm title="确定忽略吗?" @confirm="() =>handleIgnore(record.id)">
                      <a style="margin-left: 8px">忽略</a>
                  </a-popconfirm>
              </span>
        </a-table>
      </a-tab-pane>
      <a-icon slot="tabBarExtraContent" type="minus-square" v-show="!tabClosed" style="margin-right: 10px"
              @click="toggleInfoTab"></a-icon>
      <a-icon slot="tabBarExtraContent" type="plus-square" v-show="tabClosed" style="margin-right: 10px"
              @click="toggleInfoTab"></a-icon>
    </a-tabs>
  </div>
</template>

<script>
  import { BmlMarkerClusterer } from 'vue-baidu-map'
  import moment from 'moment'
  import { getWagonOnMission, ignoreWarningEvent } from '../../api/api'

  export default {
    name: 'WagonTracker',
    data() {
      return {
        tabClosed: false,
        map: null,
        allCar: 0,
        travel: 0,
        quiet: 0,
        offLine: 0,
        other: 0,
        isShow: false,
        bookingNos: [],
        bookingNosFiltered: [],
        loading: false,
        // 运单 bookingNo => wBillObj，通过提单号快速查找
        wBillsMap: {},
        wBills: [],
        // 卡车 map，plateNo => wagonObj，通过车牌号快速查找相关信息
        wagonSelected: {
          // "id": -1,
          // "plateNo": "苏M10005",
          // "status": "0",
          // "velocity": "",
          // "direction": 20,
          // "lineNo": "",
          // "company": "常州 xx运输有限公司",
          // "position": { "lng": 116.272038, "lat": 39.939281 }
        },
        wagonsMap: {},
        wagonList: [],
        wagonOnlineList: [],
        wagonOfflineList: [],
        warningEventsList: [],
        wagonListNum: 0,
        wagonOnlineNum: 0,
        wagonOfflineNum: 0,
        warningEventNum: 0,
        bookingNoSelected:'',
        wagonListColumns: [
          {
            title: '车牌号',
            dataIndex: 'plateNo'
          },
          {
            title: '提单号',
            dataIndex: 'bookingNo'
          },
          {
            title: '车队',
            dataIndex: 'teamName'
          },
          {
            title: '司机',
            dataIndex: 'driverName'
          },
          {
            title: '状态',
            dataIndex: 'online',
            customRender: function(text) {
              if (text == true) {
                return '在线'
              } else {
                return '离线'
              }
            }
          }

        ],
        warningEventsListColumns: [
          {
            title: '车牌号',
            dataIndex: 'plateNo'
          },
          {
            title: '站点名称',
            dataIndex: 'stopName'
          },
          {
            title: '告警类型',
            dataIndex: 'type',
            customRender: function(text) {
              if (text == 1) {
                return '车辆晚点到达'
              } else if (text == 2) {
                return '晚点出发'
              } else {
                return '-'
              }
            }
          },
          {
            title: '备注',
            dataIndex: 'data'
          },
          {
            title: '操作',
            width: '150px',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' }
          }
        ],
        wagonListStyle: (record, index) => {
          return 'wagon-list-style'
        }
      }
    },
    methods: {
      toggleInfoTab() {
        this.tabClosed = !this.tabClosed
        let infoTab = document.getElementById('infoTab')
        infoTab.style.zIndex = '33'

        if (this.tabClosed) {
          infoTab.style.height = '44px'
          infoTab.style.minHeight = '0'
        } else {
          infoTab.style.height = '30%'
          infoTab.style.minHeight = '300px'
        }
      },
      mapLoadBegin() {
        let infoTab = document.getElementById('infoTab')
        infoTab.style.zIndex = '33'
      },
      mapReady({ BMap, map }) {
        this.map = map
      },
      loadWagons(bookingNo) {
        let params = { 'bookingNo': bookingNo }
        getWagonOnMission(params).then(res => {
          this.wagonList = [];
          this.wagonOnlineList = [];
          this.wagonOfflineList = [];
          this.warningEventsList = [];
          if (res != null && res.code == 0) {
            const allMonitorWagon = res.data.allMonitorWagon
            const wagonOnline = res.data.wagonOnline
            const wagonOffline = res.data.wagonOffline
            const warningEvents = res.data.warningEvents
            if (allMonitorWagon != null && allMonitorWagon.length > 0) {
              this.wagonList = allMonitorWagon
              this.wagonList.forEach(e => {
                this.wagonsMap[e.plateNo] = e;
                if(bookingNo == ''){
                  if (this.bookingNos.indexOf(e.bookingNo) == -1) {
                    this.bookingNos.push(e.bookingNo)
                  }
                }
                e.show = false
              })


              this.wagonListNum = allMonitorWagon.length
            } else {
              this.wagonListNum = 0
            }

            if (wagonOnline != null && wagonOnline.length > 0) {
              this.wagonOnlineList = wagonOnline
              this.wagonOnlineNum = wagonOnline.length
            } else {
              this.wagonOnlineNum = 0
            }

            if (wagonOffline != null && wagonOffline.length > 0) {
              this.wagonOfflineList = wagonOffline
              this.wagonOfflineNum = wagonOffline.length
            } else {
              this.wagonOfflineNum = 0
            }

            if (warningEvents != null && warningEvents.length > 0) {
              this.warningEventsList = warningEvents
              this.warningEventNum = warningEvents.length
            } else {
              this.warningEventNum = 0
            }

          }
        })
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        let data = selectedRows[0]
        this.map.setViewport([new BMap.Point(data.lng, data.lat)])
        this.toggleMarkerInfo(selectedRows[0])
      },
      handleBookingNoSearch(val) {
        let bookingNo = val;
        this.bookingNosFiltered = this.bookingNos.filter(v => {
          console.log(v.indexOf(val) !== -1)
          return v.indexOf(val) !== -1
        })
        if(bookingNo == ""){
          this.bookingNoSelected = '';
          this.loadWagons('');
        }
      },
      onBookingNoSelect(bookingNo) {
        this.bookingNoSelected = bookingNo;
        let params = {
          'bookingNo': bookingNo
        }
        this.loadWagons(bookingNo);

      },
      closeMarkerInfo() {
        this.isShow = false
      },
      toggleMarkerInfo(wagon) {
        let data = this.wagonsMap[wagon.plateNo]
        this.isShow = true
        let position = { 'lng': data.lng, 'lat': data.lat }
        console.log(wagon.lng+","+wagon.lat )
        console.log(data.lng+","+data.lat )
        data.position = position
        data.nextStopPTAF = moment(data.nextStopPTA).format("YYYY-MM-DD HH:mm");
        data.nextStopETAF = moment(data.nextStopETA).format("YYYY-MM-DD HH:mm");
        data.posTimeUpdatedF = moment(data.posTimeUpdated).format("YYYY-MM-DD HH:mm");
        this.wagonSelected = data
      },
      // 忽略事件处理
      handleIgnore: function(id) {
        let that = this;
        let params = { warningEventId: id }
        ignoreWarningEvent(params).then((res) => {
          if (res.code == 0) {
            that.$message.success('SUCCESS')
            this.loadWagons(this.bookingNoSelected)
          } else {
            that.$message.error(res.message)
          }
        })
      },
      updateLocation() {
        this.wagonList.forEach(e => {
          if (e.plateNo == '苏M10000') {
            return
          }
          e.position.lng += 1
          if (e.lng > 180) {
            e.lng -= 180
          }
        })
      }
    }
    ,
    components: {
      BmlMarkerClusterer
    },
    mounted() {
      let infoTab = document.getElementById('infoTab')
      if (this.tabClosed) {
        infoTab.style.height = '44px'
        infoTab.style.minHeight = '0'
      } else {
        infoTab.style.height = '30%'
        infoTab.style.minHeight = '300px'
      }

      // 初始化加载
      this.loadWagons(this.bookingNoSelected);

      // 定时加载
      if(this.timer){
        clearInterval(this.timer);
      }else{
        this.timer = setInterval(() =>{
          this.isShow = false;
          this.loadWagons(this.bookingNoSelected);
        },15000)
      }
    },
    created() {

    },
    destroyed() {
      clearInterval(this.timer);
    }
  }

</script>

<style>
  .map {
    width: 100%;
    height: 100%;
    float: left;
  }

  .wagon-list-style > td {
    padding: 5px 10px 5px 10px !important;
    font-size: 12px;
    font-weight: 500;
  }

  .ant-table-thead > tr > th {
    padding: 5px 10px 5px 10px !important;
    fong-size: 12px;
  }

  .infoPane {
    height: calc(100% - 44px);
    overflow-y: auto;
    position: absolute;
    top: 43px;
    float: right;
    padding-left: 3px;
  }

  .infoTabs {
    background-color: white;
    width: 100%;
    transition: all 0.2s;
    position: absolute;
    bottom: 0px
  }

  .BMap_bubble_title {
    color: white;
    font-size: 13px;
    font-weight: bold;
    text-align: left;
    padding-left: 5px;
    padding-top: 5px;
    border-bottom: 1px solid gray;
    background-color: #001529;
  }

  /* 消息内容 */
  .BMap_bubble_content {
    background-color: white;
    padding: 10px 5px 10px 5px;
  }

  .BMap_pop div:nth-child(5) {
    display: none;
  }

  /* 内容 */
  .BMap_pop div:nth-child(9) {
    top: 35px !important;
    border-radius: 3px;
  }

  /* 左上角删除按键 */
  .BMap_pop img {
    top: 43px !important;
    left: 215px !important;
  }

  .BMap_top {
    display: none;
  }

  .BMap_bottom {
    display: none;
  }

  .BMap_center {
    display: none;
  }

  /* 隐藏边角 */
  .BMap_pop div:nth-child(1) div {
    display: none;
  }

  .BMap_pop div:nth-child(3) {
    display: none;
  }

  .BMap_pop div:nth-child(7) {
    display: none;
  }

  .tip_right {
    text-align: right;
  }

  .tip_fold_line {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

</style>
