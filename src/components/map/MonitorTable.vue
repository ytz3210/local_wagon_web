<template>
  <table class="table table-bordered table-hover">
    <thead>
    <tr>
      <td>序号</td>
      <td>操作</td>
      <td>车牌号</td>
      <td>状态</td>
      <td>当前位置</td>
      <td>打卡司机</td>
      <td>所属机构</td>
    </tr>
    </thead>
    <tbody :class="{show:isShow}">
    <tr v-for="(list,index) in items">
      <td>{{index+1}}</td>
      <td><a href="/">
        <img src="../../assets/playback.svg" class="playback" alt="回放">
        <img src="../../assets/map.svg" class="mapsvg" alt="定位">
      </a></td>
      <td>{{list.license}}</td>
      <td>{{list.status}}</td>
      <td>{{list.position}}</td>
      <td>{{list.driver}}</td>
      <td>{{list.organization}}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
  import Axios from 'axios'

  export default {
    name: 'MonitorTable',
    data() {
      return {
        isShow: true,
        newCar: {
          license: '',
          status: '',
          position: '',
          driver: '',
          organization: ''
        },
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
        ]
      }
    },
    methods: {
      addCar() {
        Axios.get('url').then(response => {
          for (let i = 0; i < response.data.length(); i++) {
            var newCar = {
              license: response.data.license,
              driver: response.data.driver,
              position: response.data.position,
              status: response.data.status,
              organization: response.data.organization
            }
            this.items.push(newCar)
          }
        })
      },
      updateCar() {
        var arr = new Array()
        for (let i = 0; i < this.items.length; i++) {
          arr[i] = this.items[i].license
        }
        Axios.get('url', {
          params: {
            licenses: arr
          }
        }).then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.items[i].status = response.data[i].status
            this.items[i].position = response.data[i].position
          }
        })
      },
      car() {
        this.addCar()
        this.updateCar()
      }
    },
    mounted() {
      // this.timer = setInterval(this.car,5000)
    }
  }
</script>

<style scoped>
  .playback {
    width: 20px;
    height: 20px;
  }

  .mapsvg {
    margin-left: 4px;
    width: 20px;
    height: 20px;
  }

  tr {
    background: white;
  }

  td {
    font-size: 13px;
    padding: 2px;
    text-align: center;
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
</style>