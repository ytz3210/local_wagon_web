<template>
  <page-layout :title="this.$route.meta.title">
      <a-card :bordered="false">
          <!-- 查询区域 -->
          <div class="table-page-search-wrapper">
                <a-form layout="inline">
                    <a-row :gutter="12">
                        <a-col :md="8" :sm="24">
                            <a-form-item label="名称">
                                <a-input placeholder="请输入地点名称" v-model="queryParam.name"/>
                            </a-form-item>
                        </a-col>
                        <a-col :md="8" :sm="24">
                            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                                <a-button type="default" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                                <a-button style="margin-left: 8px" @click="handleAdd" type="primary" icon="plus">添加地点</a-button>
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
                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="地点名称">
                          <a-input placeholder="地点名称" v-decorator="['name', {}]"/>
                      </a-form-item>

                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="地址">
                          <a-input placeholder="地址" v-decorator="['address', {}]"/>
                      </a-form-item>

                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否启用">
                          <a-switch checkedChildren="启用" unCheckedChildren="不启用" :checked="site.activation" @change='onChangeSwitch'
                                    v-decorator="['activation', {initialValue:site.activation}]"/>
                      </a-form-item>

                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="围栏" ></a-form-item>
                      <e-fence-map :place-info="site" @eFenceUpdate="eFenceUpdate" ref="mapFence"/>
                  </a-form>
              </a-modal>
          </div>
      </a-card>
  </page-layout>
</template>

<script>
    import pick from 'lodash.pick'
    import EFenceMap from './EFenceMap'
    import PageLayout from '@/components/page/PageLayout'
    import {CommonListMixin} from '@/mixins/CommonListMixin'

    export default {
        name: 'PlacesManagement',
        mixins:[CommonListMixin],
        components: {EFenceMap, PageLayout},
        data() {
            return {
                title:'操作',
                visible: false,
                form: this.$form.createForm(this),
                site: {
                    activation: true,
                },
                // 查询参数
                queryParam: {
                    Name: ""
                },
                // 表头
                columns: [
                    {
                        title: '名称',
                        dataIndex: 'name'
                    },
                    {
                        title: '地址',
                        dataIndex: 'address'
                    },
                    {
                        title: '是否启用',
                        dataIndex: 'activation',
                        customRender: (text) => {
                            if (text) {
                                return '已启用';
                            } else {
                                return '未启用';
                            }
                        }
                    },
                    {
                        title: '操作',
                        width: '150px',
                        dataIndex: 'action',
                        scopedSlots: { customRender: 'action' }
                    }
                ],
                url: "/api/site",
            }
        },
        methods: {
            add () {
                this.edit({});
            },
            edit (record) {
                this.form.resetFields();
                this.site = Object.assign({}, record);
                if (record.id) {
                    this.$nextTick(() => {
                        this.form.setFieldsValue(pick(this.site, 'name',  'address', 'activation'));
                        if (this.site.mapData != null) {
                            this.eFenceUpdate(JSON.parse(this.site.mapData));
                        }
                    });
                } else {
                    this.site.activation = true;
                }
                this.visible = true;
            },
            handleOk() {
                const that = this;
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        that.confirmLoading = true;
                        let formData = Object.assign(this.site, values);
                        formData.mapData = JSON.stringify(formData.eFence);
                        if(this.site.id == null) {
                            that.handelPut(formData);
                        } else {
                            that.handelPost(formData);
                        }
                    }
                })
            },

            eFenceUpdate(path) {
                this.site.eFence = path;
            },

            onChangeSwitch(checked){
                this.site.activation = checked;
            }
        },
    }
</script>