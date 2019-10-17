<template>
  <page-layout :title="this.$route.meta.title">
      <a-card :bordered="false">
          <!-- 查询区域 -->
          <div class="table-page-search-wrapper">
              <a-form layout="inline">
                  <a-row :gutter="12">
                      <a-col :md="7" :sm="8">
                          <a-form-item label="司机名称" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                              <a-input placeholder="请输入司机名称" v-model="queryParam.name"></a-input>
                          </a-form-item>
                      </a-col>
                      <a-col :md="7" :sm="8">
                          <a-form-item label="司机电话" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                              <a-input placeholder="请输入司机电话" v-model="queryParam.phoneNo"></a-input>
                          </a-form-item>
                      </a-col>
                      <a-col :md="7" :sm="8">
                          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                              <a-button type="default" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                              <a-button type="primary" @click="handleAdd" icon="plus" style="margin-left: 8px">添加</a-button>
                              <a-button type="primary" icon="download" @click="downloadXls()" style="margin-left: 8px">下载模板</a-button>
                               <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                                         action='/jeecg-boot/api/drivers/import'
                                         @change="importExcel" style="margin-left: 8px">
                                 <a-button type="primary" icon="import">导入司机</a-button>
                               </a-upload>
                          </span>
                      </a-col>
                  </a-row>
              </a-form>
          </div>

          <!-- table区域 -->
          <div>
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

          <!-- 表单域 -->
          <div>
              <a-modal :title="title" style="top: 20px;" :width="800" :height="1000" v-model="visible" @ok="handleOk" @cancel="handleClose">
                  <a-form :form="form">
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="司机名称">
                          <a-input placeholder="请输入司机名称" v-decorator="['name', validatorRules.name]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="微信号码">
                          <a-input placeholder="请输入微信号码" v-decorator="['weChatNumber', validatorRules.weChatNumber]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="手机号码">
                        <a-input placeholder="请输入手机号码" v-decorator="['phoneNo', validatorRules.phoneNo]">
                        <a-select slot="addonBefore" v-decorator="['prefix', { initialValue: '+86' }]" style="width: 70px" >
                          <a-select-option :value="86"> +86 </a-select-option>
                          <a-select-option :value="1"> +1 </a-select-option>
                        </a-select>
                        </a-input>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="性别">
                          <a-select placeholder="请选择性别" v-decorator="['sex', {}]">
                            <a-select-option value="1">男</a-select-option>
                            <a-select-option value="2">女</a-select-option>
                          </a-select>
                      </a-form-item>

                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="出生年月" >
                        <a-date-picker style="width: 100%" placeholder="请选择出生年月"
                                       v-decorator="['birthday', {initialValue:driver.dateBirth?moment(driver.dateBirth,dateFormat):null}]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="身份证号">
                          <a-input placeholder="请输入身份证号" v-decorator="['identityCard', validatorRules.identityCard]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="联系地址">
                          <a-input placeholder="请输入联系地址" v-decorator="['address', {}]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否临时司机">
                          <a-select v-decorator="['temporary', validatorRules.temporary]" placeholder="请选择是否临时司机">
                              <a-select-option value="false">否</a-select-option>
                              <a-select-option value="true">是</a-select-option>
                          </a-select>
                      </a-form-item>
                  </a-form>
              </a-modal>
          </div>
      </a-card>
  </page-layout>
</template>

<script>
  import moment from 'moment'
  import pick from 'lodash.pick'
  import PageLayout from '@/components/page/PageLayout'
  import { CommonListMixin } from '@/mixins/CommonListMixin'

  export default {
        name: 'DriverManagement',
        mixins:[CommonListMixin],
        components: { PageLayout },
        data() {
            return {
                title:'操作',
                visible: false,
                form: this.$form.createForm(this),
                validatorRules:{
                    name:         {rules: [{required: true, message: '请输入司机姓名！'}, {validator: this.validateName}]},
                    weChatNumber: {rules: [{required: true, message: '请输入微信号码！'}, {validator: this.validateWeChat}]},
                    phoneNo:      {rules: [{required: true, message: '请输入手机号！'}, {validator: this.validatePhone}]},
                    identityCard: {rules: [{required: true, message: '请输入身份证！'}, {validator: this.validateIdentityCard}]},
                    temporary:    {rules: [{required: true, message: '请选择是否临时司机！'}]},
                },
                dateFormat:"YYYY-MM-DD",
                driver: {},
                // 查询参数
                queryParam: {
                    Name: "",
                    phoneNo: "",
                },
                // 表头
                columns: [
                    {
                        title: '姓名',
                        dataIndex: 'name',
                    },
                    {
                        title: '微信号',
                        dataIndex: 'weChatNumber',
                    },
                    {
                        title: '电话',
                        dataIndex: 'phoneNo',
                    },
                    {
                        title: '地址',
                        dataIndex: 'address',
                    },
                    {
                        title: '操作',
                        width: '150px',
                        dataIndex: 'action',
                        scopedSlots: { customRender: 'action'}
                    }
                ],
                url: "/api/driver",
            }
        },
        methods: {
            add () {
                this.edit({});
            },
            edit (record) {
                this.form.resetFields();
                this.driver = Object.assign({}, record);

                if(record.id != null){
                    this.$nextTick(() => {
                        this.driver.temporary = "" + this.driver.temporary;
                        this.form.setFieldsValue(
                            pick(this.driver, 'name', 'weChatNumber', 'phoneNo', 'sex', 'identityCard', 'address', 'temporary'));
                    });
                }
                this.visible = true;
            },
            handleOk() {
                const that = this;
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        that.confirmLoading = true;
                        let formData = Object.assign(this.driver, values);
                        //时间格式化
                        formData.dateBirth = formData.birthday?formData.birthday.format(this.dateFormat):null;
                        if(this.driver.id == null) {
                            that.handelPut(formData);
                        } else {
                            that.handelPost(formData);
                        }
                    }
                })
            },
          downloadXls(){
            window.open("../file/司机信息批量导入模板.xlsx");
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

          },
            moment,
        }
    }
</script>