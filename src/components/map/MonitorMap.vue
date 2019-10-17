<template>
  <iframe id="frame_full" frameborder="0" scrolling="auto"  onload="this.style.height=document.body.clientHeight-50">
    <div id="allmap"></div>
      <div style="background: #363f44;height: 40px">
        <div style="width: 40px;float: left"><div><a href="/">
          <img src="../../assets/open.svg" class="playback" alt="展开">
        </a></div></div>
          <a><div class="td-div" @click="show">全部车辆<span>{{allCar}}</span></div></a>
          <div class="td-div">行驶<span>{{travel}}</span></div>
          <div class="td-div">静止<span>{{quiet}}</span></div>
          <div class="td-div">离线<span>{{offLine}}</span></div>
          <div class="td-div">其它<span>{{other}}</span></div>
      </div>
    <MonitorTable class="monitor-table"></MonitorTable>
  </iframe>
</template>

<script>
  import BMap from 'BMap'
  import BMapLib from 'BMapLib'
  import Axios from 'axios'
  import MonitorTable from './MonitorTable'
  export default {
    name: 'MonitorMap',
    data() {
      return {
        isShow:true,
        items: [
          {
            license: '苏D38977',
            status: '23Km/h',
            position: '江苏省常州市新北区346国道(新北区约36.1米处)',
            driver: '未知',
            organization: '无锡睿德国际货运代理有限公司'
          },
          {
            license: '苏D38977',
            status: '23Km/h',
            position: '江苏省常州市新北区346国道(新北区约36.1米处)',
            driver: '未知',
            organization: '无锡睿德国际货运代理有限公司'
          },
          {
            license: '苏D38977',
            status: '23Km/h',
            position: '江苏省常州市新北区346国道(新北区约36.1米处)',
            driver: '未知',
            organization: '无锡睿德国际货运代理有限公司'
          }
        ],
        allCar:0,
        travel:0,
        quiet:0,
        offLine:0,
        other:0
      }
    },
    components: { MonitorTable },
    methods: {
      createMap() {
        // 百度地图API功能
        var map = new BMap.Map('allmap')
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 5)
        //添加左上角控件
        var top_left_control = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_TOP_LEFT })// 左上角，添加比例尺
        var top_left_navigation = new BMap.NavigationControl()  //左上角，添加默认缩放平移控件
        map.addControl(top_left_control)
        map.addControl(top_left_navigation)

        //添加点聚合
        map.enableScrollWheelZoom()
        var MAX = 10
        var markers = []
        var pt = null
        var i = 0
        for (; i < MAX; i++) {
          pt = new BMap.Point(Math.random() * 40 + 85, Math.random() * 30 + 21)
          markers.push(new BMap.Marker(pt))
        }
        //定时向后台请求车辆经纬度
        // setTimeout(function() {
        //   this.getLng()
        // },1500)
        //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
        var markerClusterer = new BMapLib.MarkerClusterer(map, { markers: markers })
      },
      show(){
        isShow = false
      },
      getLng(){
        Axios.get("url").then(response=>{

        })
      }
    },
    mounted() {
      this.createMap()
      // this.timer = setInterval(this.createMap,1000)
    }
  }
</script>
<style scoped>
  #allmap {
    position: fixed !important;
    background: #00DB00;
    height: 100% !important;
    width: 100%;
    margin: 0;
  }

  .playback {
    width: 20px;
    height: 20px;
  }

  .mapsvg {
    margin-left: 4px;
    width: 20px;
    height: 20px;
  }
tr{
  background: white;
}
  td{
    font-size: 13px;
    padding: 2px;
    text-align: center;
  }
  .td-div{
    float: left;
    color: grey;
    border-left: 1px solid gainsboro;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    text-align: center;
    padding: 0px 15px;
  }
  .show{
    display: none;
  }
  .monitor-table{

  }
</style>
