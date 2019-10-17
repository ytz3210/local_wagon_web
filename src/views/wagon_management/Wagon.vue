<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="12">
          <a-col :md="7" :sm="8">
            <a-form-item label="车牌号" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="请输入车牌号" v-model="queryParam.plateNo"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="司机" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="请输入司机" v-model="queryParam.driverName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="车队名称" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="请输入车队名称" v-model="queryParam.wagonTeamName"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="7" :sm="8">
                      <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                          <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                          <a-button type="default" @click="searchReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
                          <a-button type="primary" @click="handleAdd" icon="plus" style="margin-left: 8px">添加</a-button>
                         <a-button type="primary" icon="download" @click="downloadXls()" style="margin-left: 8px">下载模板</a-button>
                         <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                                   action='/jeecg-boot/api/wagons/import'
                                   @change="importExcel" style="margin-left: 8px">
                           <a-button type="primary" icon="import">导入车辆</a-button>
                         </a-upload>
                      </span>
          </a-col>
        </a-row>
      </a-form>

      <a-table ref="table" rowKey="id" size="default" :columns="columns" :dataSource="dataSource"
               :pagination="ipagination" :loading="loading" @change="handleTableChange">
              <span slot="action" slot-scope="text, record">
                  <a @click="handleEdit(record)"><a-icon type="edit"/>编辑</a>
                  <a-divider type="vertical"/>
                  <a-popconfirm title="确定删除吗?" @confirm="() =>handleDelete(record.id)">
                      <a style="margin-left: 8px">删除</a>
                  </a-popconfirm>
              </span>
      </a-table>
    </div>
    <a-modal :title="title" style="top: 20px;" :width="800" :height="1000" v-model="visible" @ok="handleOk"
             @cancel="handleClose">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车牌号码">
          <a-input placeholder="请输入车牌号码" v-decorator="['plateNo', validatorRules.plateNo]"/>
        </a-form-item>
        <a-form-item
          label="临时车辆"
          :labelCol="labelCol" :wrapperCol="wrapperCol"
          :required="false"
        >
          <a-radio-group v-model="wagon.temporary">
            <a-radio :value="0">否</a-radio>
            <a-radio :value="1">是</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="司机">
          <a-select placeholder="请选择司机" v-decorator="['driverId', validatorRules.driverId]">
            <a-select-option v-for="d in templateDrivers" :key="d.value" :value="d.value">{{d.text}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车队"
                     v-if="wagon.temporary == 0">
          <a-select placeholder="请选择车队" v-decorator="['wagonTeamId', validatorRules.wagonTeamId]">
            <a-select-option v-for="w in templateWagonTeams" :key="w.value" :value="w.value">{{w.text}}
            </a-select-option>
          </a-select>
        </a-form-item>

      </a-form>
    </a-modal>
  </a-card>
</template>

<script>

  import { queryAllDrivers, queryAllWagonTeam } from '@/api/api'
  import pick from 'lodash.pick'
  import { CommonListMixin } from '@/mixins/CommonListMixin'
  import axios from 'axios'

  export default {
    name: 'WagonManagement',
    mixins: [CommonListMixin],
    data() {
      return {
        title: '操作',
        visible: false,
        form: this.$form.createForm(this),
        validatorRules: {
          plateNo: { rules: [{ required: true, message: '请输入车牌号码！' }, { validator: this.validatePlateNo }] },
          driverId: { rules: [{ required: true, message: '请选择司机！' }] },
          wagonTeamId: { rules: [{ required: true, message: '请选择车队！' }] }
        },
        wagon: {
          temporary: 0
        },
        // 查询参数
        queryParam: {
          plateNo: '',
          driverName: '',
          wagonTeamName: ''
        },
        // 标识 0:add 1:edit
        operationFlag: 0,
        templateDrivers: [],
        templateWagonTeams: [],
        // 表头
        columns: [
          {
            title: '车牌号',
            dataIndex: 'plateNo'
          },
          {
            title: '是否临时车辆',
            dataIndex: 'temporary',
            customRender: function(text) {
              if (text == true) {
                return '是'
              } else {
                return '否'
              }
            }
          },
          {
            title: '司机',
            dataIndex: 'driverName'
          },
          {
            title: '车队',
            dataIndex: 'wagonTeamName'
          },
          {
            title: '操作',
            width: '150px',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: '/api/wagon'
      }
    },
    created() {
      this.fetchDrivers()
      this.queryAllWagonTeam('')
      this.queryParam = {}
    },
    methods: {
      fetchDrivers() {
        let params = ''
        let drivers = []
        queryAllDrivers(params).then((res) => {
          if (res != null && res.code == 0) {
            const result = res.data
            result.forEach((r) => {
              drivers.push({
                value: r.id,
                text: r.name
              })
            })
            this.templateDrivers = drivers
          }
        })
      },
      queryAllWagonTeam() {
        let wagonTeams = []
        let params = ''
        queryAllWagonTeam(params).then((res) => {
          if (res != null && res.code == 0) {
            const result = res.data
            result.forEach((r) => {
              wagonTeams.push({
                value: r.id,
                text: r.name
              })
            })
            this.templateWagonTeams = wagonTeams
          }
        })
      }, add() {
        this.form.resetFields()
        this.operationFlag = 0
        this.wagon.temporary = 0
        this.operationFlag = 0
        this.wagon.id = null
        this.visible = true
      },
      edit(record) {
        this.form.resetFields()
        this.operationFlag = 1
        this.wagonTeamId = ''
        this.wagon = Object.assign({}, record)

        if (record.id != null) {
          this.$nextTick(() => {
            this.form.setFieldsValue(
              pick(this.wagon, 'plateNo', 'temporary', 'driverId', 'wagonTeamId'))
            if (record.temporary) {
              this.wagon.temporary = 1
            } else {
              this.wagon.temporary = 0
            }

          })
        }
        this.visible = true
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            that.confirmLoading = true
            let formData = Object.assign(that.wagon, values)
            if (that.operationFlag == 0) {
              that.handelPut(formData)
            } else {
              that.handelPost(formData)
            }
          }
        })
      },
      downloadXls(){
        window.open("../file/车辆信息批量导入模板.xlsx");
      },
      /* 导入 */
      importExcel(info){

        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          if(info.fileList[0].response.code == 0){
            this.$message.success(info.file.name + ' 导入成功' );
            this.loadData();
          } else {
            this.$message.error(info.fileList[0].response.message);
          }
        } else if (info.file.status === 'error') {
          this.$message.error(info.file.name + "导入失败");
        }

      },upload (url, data, params) {
        let instance = axios.create({
          baseURL: '/',
          timeout: 90000,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
        let config = {
          params: {...params}
        }
        return new Promise((resolve, reject) => {
          instance
            .post(url, data, config)
            .then(res => {
              reject(res.data.data)
            })
            .catch(error => {
              reject(error)
            })
        })
      }
    }
  }
</script>