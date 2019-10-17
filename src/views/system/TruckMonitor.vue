<template>
  <div class="truck">

    <baidu-map class="map" id="maptable" center="北京" scroll-wheel-zoom="true" @ready="handler">
      <!--添加地图放大控件-->
      <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
      <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-map-type>
      <!--添加地图点聚合-->
      <bml-marker-clusterer :averageCenter="false">
        <bm-marker v-for="marker in markers" :position="{lng: marker.lng, lat: marker.lat}"></bm-marker>
      </bml-marker-clusterer>
      <!-- 添加地理围栏-->
      <bm-polygon :path="polygonPath" stroke-color="blue" :stroke-opacity="0.5" :stroke-weight="2"/>
    </baidu-map>


    <div class="table-div">
      <div style="background: #363f44;height: 40px">
        <div style="width: 40px;float: left">
          <div><a href="">
            <img src="../../assets/open.svg" class="playback" alt="展开">
          </a></div>
        </div>
        <a>
          <div class="td-div" @click="show">全部车辆<span style="color: green;font-size: 24px">{{allCar}}</span></div>

          <div class="td-div" @click="show">行驶<span style="color: red;font-size: 24px">{{travel}}</span></div>
          <div class="td-div" @click="show">静止<span style="color: blue;font-size: 24px">{{quiet}}</span></div>
          <div class="td-div" @click="show">离线<span style="color: orange;font-size: 24px">{{offLine}}</span></div>
          <div class="td-div" @click="show">其他<span style="color: purple;font-size: 24px">{{other}}</span></div>
        </a>
        <div style="float: right">
          <a>
            <img src="../../assets/max.svg" v-show="isShow" @click="show" class="maxSvg" alt="最大化">
          </a>
          <a>
            <img src="../../assets/min.svg" v-show="!isShow" @click="hidden" class="maxSvg" alt="最大化">
          </a>
        </div>
      </div>
      <MonitorTable id="monitorTable" v-show="!isShow"></MonitorTable>
    </div>
    <div>

    </div>
  </div>

</template>

<script>
  import MonitorTable from '../../components/map/MonitorTable'
  import Axios from 'axios'
  import { BmlMarkerClusterer } from 'vue-baidu-map'

  export default {
    name: 'TruckMonitor',
    data() {
      // 插入 10 个随机点
      return {
        allCar: 0,
        travel: 0,
        quiet: 0,
        offLine: 0,
        other: 0,
        isShow: true,
        markers: [],
        //地理围栏的坐标
        polygonPath: [
          { lng: 116.272038, lat: 39.939281 },
          { lng: 116.259965, lat: 39.855141 },
          { lng: 116.368049, lat: 39.833424 },
          { lng: 116.504304, lat: 39.879508 },
          { lng: 116.419791, lat: 39.991926 }
        ],
        icon: {
          url: 'http://lbsyun.baidu.com/jsdemo/img/fox.gif',
          size: { width: 52, height: 26 },
          opts: { anchor: { width: 27, height: 13 } }
        },
        map: '',
        lat:39.909
      }
    },
    methods: {
      show() {
        document.getElementById('maptable').style.height = '800px'
        document.getElementById('monitorTable').style.display = ''
        this.isShow = false
      },
      hidden() {
        document.getElementById('maptable').style.height = '900px'
        document.getElementById('monitorTable').style.display = 'none'
        this.isShow = true
      },
      updateMarker() {
        // Axios.get("url").then(response=>{
        //
        // })
        for (let i = 0; i < 10; i++) {
          var marker = {
            lng: 116.408293 + i / 100,
            lat: 39.90608 + i / 100
          }
          this.markers.push(marker)
          console.log(this.markers)
        }
      },
      handler({ BMap, map }) {
        // var point = new BMap.Point(116.405419, 39.914935)
        // map.centerAndZoom(point, 12)
        // 创建地址解析器实例
        var myGeo = new BMap.Geocoder()
        //创建小狐狸(车的位置)
        // var lat =
        var pt = new BMap.Point(116.417, this.lat)
        let myIcon = new BMap.Icon('http://lbsyun.baidu.com/jsdemo/img/fox.gif', new BMap.Size(300, 157))
        let marker1 = new BMap.Marker(pt, { icon: myIcon })  // 创建标注
        let marker2 = new BMap.Marker(pt, { icon: myIcon })  // 创建标注
        console.log(this.lat)
        var that = this
        window.setInterval(function() {
          console.info(that.lat)
          map.addOverlay(marker1)
          that.lat += 0.01
          console.log(this)
          // map.removeOverlay()
          // lat = lat+0.01
          // 将地址解析结果显示在地图上,并调整地图视野
          // myGeo.getPoint('北京市海淀区上地10街', function(point) {
          //   if (point) {
          //     map.centerAndZoom(point, 16)
          //
          //   } else {
          //     alert('您选择地址没有解析到结果!')
          //   }
          // }, '北京市')
        }, 1000)

      }
    }
    ,
    components: {
      MonitorTable,
      BmlMarkerClusterer
    }
    ,
    mounted() {
      // this.test()
      // this.init()
      // this.hidden
      this.updateMarker()
    }
  }

</script>

<style scoped>
  .truck {
    margin: -10px -30px 0 -10px;
  }

  .layout-content {
    margin: 0 0 0;
  }

  .map {
    width: 100%;
    height: 900px;
  }

  .td-div {
    float: left;
    color: grey;
    border-left: 1px solid gainsboro;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    text-align: center;
    padding: 0px 15px;
  }

  .playback {
    width: 40px;
    height: 40px;
  }

  .table-div {
    width: 100%;
  }

  .monitor-table {
    /*position: absolute;*/
    width: 100%;
    display: none;
  }

  .maxSvg {
    height: 20px;
    margin-right: 14px;
    margin-top: 6px;
  }
</style>