<template>
  <page-layout :title="this.$route.meta.title">
      <a-card :bordered="false">
          <!-- 查询区域 -->
          <div class="table-page-search-wrapper">
              <a-form layout="inline">
                  <a-row :gutter="12">
                      <a-col :md="7" :sm="8">
                          <a-form-item label="车队名称" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                              <a-input placeholder="请输入车队名称" v-model="queryParam.name"></a-input>
                          </a-form-item>
                      </a-col>
                      <a-col :md="7" :sm="8">
                        <a-form-item label="负责人电话" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                          <a-input placeholder="请输入负责人电话" v-model="queryParam.contactPhone"></a-input>
                        </a-form-item>
                      </a-col>
                      <a-col :md="7" :sm="8">
                          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                              <a-button type="default" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                              <a-button type="primary" @click="handleAdd" icon="plus" style="margin-left: 8px">添加</a-button>
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
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车队名称">
                          <a-input placeholder="请输入车队名称或公司名称" v-decorator="['name', validatorRules.name]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="负责人姓名">
                          <a-input placeholder="请输入负责人姓名" v-decorator="['contactName', validatorRules.contactName]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="负责人手机号">
                        <a-input placeholder="请输入负责人手机号" v-decorator="['contactPhone', validatorRules.contactPhone]">
                        <a-select slot="addonBefore" v-decorator="['prefix', { initialValue: '+86' }]" style="width: 70px" >
                          <a-select-option :value="86"> +86 </a-select-option>
                          <a-select-option :value="1"> +1 </a-select-option>
                        </a-select>
                        </a-input>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="负责人身份证号">
                          <a-input placeholder="请输入负责人身份证号" v-decorator="['identityCard', validatorRules.identityCard]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车队联系地址">
                          <a-input placeholder="请输入车队联系地址" v-decorator="['address', {}]"/>
                      </a-form-item>
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车队登录用户名">
                          <a-input placeholder="输入后自动开通车队账号" v-decorator="['userName', validatorRules.userName]" :disabled="!!wagonTeam.id"/>
                      </a-form-item>
                  </a-form>
              </a-modal>
          </div>
      </a-card>
  </page-layout>
</template>

<script>
    import pick from 'lodash.pick'
    import {addUser, checkUsername} from '@/api/api'
    import PageLayout from '@/components/page/PageLayout'
    import {CommonListMixin} from '@/mixins/CommonListMixin'

    export default {
        name: 'WagonTeamManagement',
        mixins:[CommonListMixin],
        components: { PageLayout },
        data() {
            return {
                title:'操作',
                visible: false,
                form: this.$form.createForm(this),
                validatorRules:{
                    name:         {rules: [{required: true, message: '请输入车队名称！'}]},
                    contactName:  {rules: [{required: true, message: '请输入负责人姓名！'}, {validator: this.validateName}]},
                    contactPhone: {rules: [{required: true, message: '请输入负责人手机号！'}, {validator: this.validatePhone}]},
                    identityCard: {rules: [{validator: this.validateIdentityCard}]},
                    userName:     {rules: [{required: true, message: '请输入车队登录用户名！'}, {validator: this.validateUsername}]},
                },
                wagonTeam: {},
                // 查询参数
                queryParam: {
                    Name: "",
                    contactPhone: "",
                },
                // 表头
                columns: [
                    {
                        title: '车队名称',
                        dataIndex: 'name',
                    },
                    {
                        title: '负责人姓名',
                        dataIndex: 'contactName',
                    },
                    {
                        title: '负责人手机号',
                        dataIndex: 'contactPhone',
                    },
                    {
                        title: '车队联系地址',
                        dataIndex: 'address',
                    },
                    {
                        title: '操作',
                        width: '150px',
                        dataIndex: 'action',
                        scopedSlots: { customRender: 'action'}
                    }
                ],
                url: "/api/wagon_team",
            }
        },
        methods: {
            add () {
                this.edit({});
            },
            edit (record) {
                this.form.resetFields();
                this.wagonTeam = Object.assign({}, record);

                this.$nextTick(() => {
                    this.form.setFieldsValue(
                        pick(this.wagonTeam, 'name', 'contactName', 'contactPhone', 'address', 'identityCard', 'userName'));
                });

                this.visible = true;
            },
            handleOk() {
                const that = this;
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        that.confirmLoading = true;
                        let formData = Object.assign(this.wagonTeam, values);

                        if(this.wagonTeam.id == null) {
                            // 创建车队登录账户
                            let addUserDate = {"username":formData.userName, "password":"123456", "realname":formData.name};
                            addUser(addUserDate).then((res)=>{
                                if(!res.success) {
                                    that.$message.warning(res.message);
                                }
                            })
                            that.handelPut(formData);
                        } else {
                            that.handelPost(formData);
                        }
                    }
                })
            },
            validateUsername(rule, value, callback){
                var params = {id:this.wagonTeam.id, username:value};
                checkUsername(params).then((res)=>{
                    if(res.success){
                        callback();
                    }else{
                        callback("用户账号已存在！");
                    }
                });
            },
        }
    }
</script>