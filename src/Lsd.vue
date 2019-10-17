<template>
  <div style="background-color: #001D34;height: 100%;width: 100%">
    <a-row style="color: white">
      <a-col :span="8"><p style="margin:25px 0 10px 20px">{{solarCalendar}}</p></a-col>
      <a-col :span="8">
        <div style="font-size: 45px;margin-left: 25%;width: 100px">{{currentTime}}</div>
      </a-col>
      <a-col :span="8" style="margin-top: 25px"><a @click="loadMonitorLSD">
        <div class="flush">
          <img id="divImg" src="assets/flush.svg" alt="刷新">
        </div>
        <div class="datashow">
          <img id="datashow" src="assets/datashow.svg" alt="监控大屏" @click="linkLSD('/line_monitor/lsd')">
        </div>
      </a></a-col>
    </a-row>
    <div>
      <a-row style="margin-right: -5px">
        <a-col :span="6">
          <div class="hour-row-div"><a @click="getWithinHours(1)" style="color: white">
              <div class="hour">一小时内到港</div>
              <div class="hourChild">{{withinAnHour}}
              </div>
            </a>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="hour-row-div"><a @click="getWithinHours(2)" style="color: white">
            <div class="hour">两小时内到港</div>
            <div class="hourChild">{{withinTwoHours}}
            </div>
          </a>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="hour-row-div"><a @click="getWithinHours(3)" style="color: white">
            <div class="hour">三小时内到港</div>
            <div class="hourChild">{{withinThreeHours}}
            </div>
          </a>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="hour-row-div"><a @click="getWithinHours(4)" style="color: white">
            <div class="hour">三小时以上今日到港</div>
            <div class="hourChild">{{overThreeHours}}
            </div>
          </a>
          </div>
        </a-col>
      </a-row>
    </div>
    <div>
      <a-row>
        <table class="table table-bordered" style="text-align: center;margin-top: 15px;width: 100%">
          <tr style="color: white;background-color: #4387BF">
            <td>序号</td>
            <td>装货地</td>
            <td>车牌号</td>
            <td>箱号</td>
            <td>里程进度</td>
            <td>剩余里程</td>
            <td>预计到达时间</td>
            <td>预计到达延误</td>
            <td>司机姓名</td>
            <td>司机联系方式</td>
          </tr>
          <tr v-for="(list,index) in items" style="color: #00DB00">
            <td>{{index+1}}</td>
            <td>{{list.loadingPlace}}</td>
            <td>{{list.plateNo}}</td>
            <td>{{list.sealNumber}}</td>
            <td>
              <vueProgressBar type="rect" options="this" :options="options"
                              :value="list.mileageProgress" v-if="list.mileageProgress!=null"></vueProgressBar>
            </td>
            <td>{{list.lastStopDistance}}</td>
            <td>{{list.lastStopETA}}</td>
            <td style="color: red;">{{list.ead}}</td>
            <td>{{list.driverName}}</td>
            <td>{{list.driverPhone}}</td>
          </tr>
        </table>
      </a-row>
    </div>

  </div>
</template>

<script>
  import { getMonitorLSD } from './api/api'
  import vueProgressBar from 'svg-progress-bar'
  import { getAction } from '@/api/manage'
  import $ from 'jquery'
  import ARow from 'ant-design-vue/es/grid/Row'

  export default {
    name: 'Lsd',
    components: {
      ARow,
      vueProgressBar
    },
    data() {
      return {
        isRotate: false,
        timer: '',
        currentTime: '',
        solarCalendar: '',
        lunarCalendar: '',
        withinAnHour: '0',
        withinTwoHours: '0',
        withinThreeHours: '0',
        overThreeHours: '0',
        newRoute: {
          loadingPlace: '',
          pateNo: '',
          sealNumber: '',
          mileageProgress: '',
          lastStopDistance: '',
          lastStopETA: '',
          ead: '',
          driverName: '',
          driverPhone: ''
        },
        items: [],
        socket: '',
        deg: 0
      }
    },
    mounted() {
      this.loadMonitorLSD()
    },
    computed: {
      options: function() {
        return {
          rectHeight: 15,
          rectWidth: 100,
          pathColors: ['#EEE', 'orange'],
          text: function(value) {
            return this.htmlifyNumber('') + '<span style="font-size: 0.6em;">' + value + '%' + '</span>'
          }
        }
      }
    },
    methods: {
      loadMonitorLSD() {
        let that = this
        getMonitorLSD('').then(res => {
          if (res != null || res.code == '0') {
            this.withinAnHour = 0
            this.withinTwoHours = 0
            this.withinThreeHours = 0
            this.overThreeHours = 0
            for (let i = 0; i < res.data.length; i++) {
              let mseta = new Date(res.data[i].lastStopETA).getTime()
              let mseconds = mseta - res.data[i].pta
              let hours = Math.ceil(mseconds % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
              console.log('----' + res.data[i].lastStopETA)
              res.data[i].lastStopETA = res.data[i].lastStopETA.substr(0, res.data[i].lastStopETA.length - 3)
              console.log(res.data[i].lastStopETA + '++++++')
              let count = 0
              if (hours <= 24) {
                if (hours <= 1) {
                  count = 1
                } else if (hours <= 2) {
                  count = 2
                } else if (hours <= 3) {
                  count = 3
                } else {
                  count = 4
                }
                switch (count) {
                  case 1:
                    this.withinAnHour++
                  case 2:
                    this.withinTwoHours++
                  case 3:
                    this.withinThreeHours++
                  case 4:
                    this.overThreeHours++
                    break
                }
              }
            }
            that.items = []
            that.items = res.data
            console.log(that.items)
          }
        })
        this.start()
      },
      getWithinHours(param) {
        const getByHours = (params) => getAction('/api/monitor/mission_lsd/' + param, params)
        getByHours('').then(res => {
          if (this.LSDtimer) {
            clearInterval(this.LSDtimer)
          }
          this.items = []
          let that = this
          if (res != null || res.code == '0') {
            if (param == 0) {
              this.withinAnHour = 0
              this.withinTwoHours = 0
              this.withinThreeHours = 0
              this.overThreeHours = 0
            }
            console.log('时间戳' + new Date(res.data[0].lastStopETA).getTime() / 1000)
            for (let i = 0; i < res.data.length; i++) {
              let mseta = new Date(res.data[i].lastStopETA).getTime()
              let mseconds = mseta - res.data[i].pta
              let hours = Math.ceil(mseconds % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
              console.log('---' + hours)
              res.data[i].etlastStopETA = res.data[i].lastStopETA.substr(0, res.data[i].lastStopETA.length - 3)
              if (param == 0) {
                let count = 0
                if (hours <= 24) {
                  if (hours <= 1) {
                    count = 1
                  } else if (hours <= 2) {
                    count = 2
                  } else if (hours <= 3) {
                    count = 3
                  } else {
                    count = 4
                  }
                  switch (count) {
                    case 1:
                      this.withinAnHour++
                    case 2:
                      this.withinTwoHours++
                    case 3:
                      this.withinThreeHours++
                    case 4:
                      this.overThreeHours++
                      break
                  }
                }
              }
            }
            that.items = res.data
            console.log(that.items)
          }
        })
      },
      start() {
        let that = this
        that.deg = that.deg + 360
        $('#divImg').click(function() {
          $(this).css('transform', 'rotate(' + that.deg + 'deg)')
          $(this).css('-o-transform', 'rotate(' + that.deg + 'deg)')
          $(this).css('-webkit-transform', 'rotate(' + that.deg + 'deg)')
        })
      },
      getCurrentTime() {
        let _this = this
        //时分秒
        this.timer = setInterval(function() {
          let date = new Date()
          _this.currentTime =
            appendZero(date.getHours()) + ':' +
            appendZero(date.getMinutes()) + ':' +
            appendZero(date.getSeconds())
        }, 1000)
        // 定时加载
        if (this.LSDtimer) {
          clearInterval(this.LSDtimer)
        } else {
          this.LSDtimer = setInterval(() => {
            this.isShow = false
            this.loadMonitorLSD()
          }, 15000)
        }

        function appendZero(obj) {
          if (obj < 10) {
            return '0' + obj
          } else {
            return obj
          }
        }
      },
      appendZero(obj) {
        if (obj < 10) {
          return '0' + obj
        } else {
          return obj
        }
      },
      linkLSD(url){
        window.open(url,'_blank')
      }
    },
    created() {
      //阳历
      let calendar = new Date()
      this.currentTime =
        this.appendZero(calendar.getHours()) + ':' +
        this.appendZero(calendar.getMinutes()) + ':' +
        this.appendZero(calendar.getSeconds())
      this.solarCalendar =
        calendar.getFullYear() + '年' +
        (calendar.getMonth() + 1) + '月' +
        calendar.getDate() + '日' + '  ' +
        '星期' + '日一二三四五六'.charAt(calendar.getDay())
      this.getCurrentTime()
    },
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      if (this.LSDtimer) {
        clearInterval(this.LSDtimer)
      }
    }
  }
</script>

<style scoped>
  .row {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px
  }

  .row2 {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    margin-right: 0px;
    margin-left: -40px
  }
tr{
  height: 50px;
}
  .table-bordered th,
  .table-bordered td {
    border: 1px solid #2eabff;
  }
  .table-bordered thead th,
  .table-bordered thead td {
    border-bottom-width: 2px;
  }

  ul {
    list-style: none;
    height: 50px;
    margin: 0;
    padding: 0;
  }

  ul li {
    width: 24%;
    height: 100%;
    display: inline-block;
    margin: 10px 0 10px 10px;
  }

  .hour-row-div {
    background-color: #4387BF;
    margin: 1%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: white;
  }

  .hour {
    float: left;
    margin-left: 30%;
  }

  .hourChild {
    font-size: 35px;
    float: left;
    margin-left: 2.5%;
  }

  .flush {
    background-color: #4387BF;
    width: 30px;
    height: 30px;
    margin-left: 50%;
    float: left;
  }

  .datashow {
    background-color: #4387BF;
    width: 30px;
    height: 30px;
    margin-left: 3%;
    float: left;
    position: relative;
  }

  img {
    transition: transform 0.8s linear 0s;
    -o-transition: -o-transform 0.8s linear 0s;
    -webkit-transition: -webkit-transform 0.8s linear 0s;

  }
</style>