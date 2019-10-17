<template>
  <page-layout :title="this.$route.meta.title">
      <a-card :bordered="false">
          <!-- 查询区域 -->
          <div class="table-page-search-wrapper">
              <a-form layout="inline">
                  <a-row :gutter="16">
                      <a-col :md="5" :sm="8">
                          <a-form-item label="提单号" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                              <a-input placeholder="请输入提单号" v-model="queryParam.bookingNo"></a-input>
                          </a-form-item>
                      </a-col>
                      <a-col :md="5" :sm="8">
                          <a-form-item label="装货地" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                              <a-select showSearch allowClear :filterOption="filterOption"
                                        placeholder="请选择装货地" v-model="queryParam.site">
                                  <a-select-option v-for="item in siteList" :key="item.id">
                                    {{item.name}}
                                  </a-select-option>
                              </a-select>
                          </a-form-item>
                      </a-col>
                      <a-col :md="5" :sm="8">
                          <a-form-item label="运单状态" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
                              <a-select v-model="queryParam.status">
                                  <a-select-option value=""> 全部 </a-select-option>
                                  <a-select-option value="0">未完成</a-select-option>
                                  <a-select-option value="1">已终止</a-select-option>
                                  <a-select-option value="9">已完成</a-select-option>
                              </a-select>
                          </a-form-item>
                      </a-col>
                      <a-col :md="7" :sm="8">
                          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                              <a-button type="default" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                              <a-button type="primary" @click="handleAdd" icon="plus" style="margin-left: 8px">添加</a-button>
                              <a-button type="primary" @click="handleAppoint" icon="appstore" style="margin-left: 8px"
                                        v-if="selectedRowKeys.length > 0" >指派车队</a-button>
                          </span>
                      </a-col>
                  </a-row>
              </a-form>
          </div>

          <!-- table区域 -->
          <div>
              <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="selectedRowKeys.length > 0">
                  <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
                  <a style="margin-left: 24px" @click="onClearSelected">清空</a>
              </div>
              <a-table ref="table" rowKey="id" size="small" :columns="columns" :dataSource="dataSource" :expandedRowKeys= "expandedRowKeys"
                       :pagination="ipagination" :loading="loading" @change="handleTableChange" @expand="handleExpand">
                  <span slot="action" slot-scope="text, record">
                      <a @click="handleViewBill(record)" style="color: #1890ff"><a-icon type="eye"/>查看</a>
                      <a-divider type="vertical" v-if="record.status == '0'"/>
                      <a @click="handleEdit(record)" v-if="record.status == '0'" style="color: #1890ff"><a-icon type="edit"/>编辑</a>
                      <a-divider type="vertical" v-if="record.status == '0'"/>
                      <a @click="handleAddRoutePlan(record.id)" v-if="record.status == '0'" style="color: #1890ff"><a-icon type="plus-circle"/>新增路线</a>
                      <a-divider type="vertical" v-if="record.status == '0'"/>
                      <a-popconfirm title="确定删除吗?" @confirm="() =>handleDelete(record.id)" v-if="record.status == '0'">
                          <a style="color:#f47920"><a-icon type="delete"/>删除</a>
                      </a-popconfirm>
                  </span>
                  <a-table slot="expandedRowRender" slot-scope="text" :columns="innerColumns" :dataSource="innerData"
                    :rowSelection="rowSelection" size="small" :showHeader="showHeader" rowKey="id" :pagination="false" :loading="loading">
                      <span slot="action" slot-scope="text, innerRecord" >
                          <a @click="handleViewContainer(innerRecord)" style="color: #1890ff"><a-icon type="eye"/>查看</a>
                          <a-divider type="vertical" v-if="innerRecord.status < '2'"/>
                          <a @click="handleEditRoutePlan(innerRecord)" style="color: #1890ff"><a-icon type="edit" v-if="innerRecord.status < '2'"/>编辑路线</a>
                          <a-divider type="vertical" v-if="innerRecord.status < '2'"/>
                          <a @click="handleEditContainer(innerRecord)" style="color: #1890ff"><a-icon type="edit" v-if="innerRecord.status < '2'"/>编辑信息</a>
                          <a-divider type="vertical" v-if="innerRecord.status < '2'"/>
                          <a @click="handleBand(innerRecord)" style="color: #1890ff"><a-icon type="car" v-if="innerRecord.status < '2'"/>绑定车辆</a>
                          <a-divider type="vertical" v-if="innerRecord.status < '2'"/>
                          <a-popconfirm title="确定删除吗?" @confirm="() =>handleRoutePlanDelete(innerRecord.id)" v-if="innerRecord.status < '2'">
                              <a style="color:#f47920"><a-icon type="delete"/>删除</a>
                          </a-popconfirm>
                      </span>
                  </a-table>
              </a-table>
          </div>

          <!-- 表单域 -->
          <!-- 新增运单 -->
          <div>
              <a-spin :spinning="confirmLoading">
              <a-modal :title="title" style="top: 20px;" :width="1200" :height="300" v-model="billVisible" :confirmLoading="confirmLoading">
                  <a-form :form="form">
                      <a-tabs v-model="activeKey">
                          <a-tab-pane tab="基础信息" key="1">
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="提单号">
                                          <a-input placeholder="请输入提单号" v-decorator="['bookingNo', validatorRules.bookingNo]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="运单名称">
                                          <a-input placeholder="请输入运单名称" v-decorator="['name', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="港口代码">
                                          <a-input placeholder="请输入港口代码" v-decorator="['portCode', {}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="船公司">
                                          <a-input placeholder="请输入船公司" v-decorator="['shipCompany', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="船名">
                                          <a-input placeholder="请输入船名" v-decorator="['shipName', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="航次">
                                          <a-input placeholder="请输入航次" v-decorator="['line', {}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船船名">
                                          <a-input placeholder="请输入驳船船名" v-decorator="['bargeShipName', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船航次">
                                          <a-input placeholder="请输入驳船航次" v-decorator="['bargeLine', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船起运港">
                                          <a-input placeholder="请输入驳船起运港" v-decorator="['bargeFrom', {}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="起运港">
                                          <a-input placeholder="请输入起运港" v-decorator="['pol', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="卸货港">
                                          <a-input placeholder="请输入卸货港" v-decorator="['pod', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="交货地">
                                          <a-input placeholder="请输入交货地" v-decorator="['deliveryPlace', {}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="截关时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择截关时间" :format="dateFormat"
                                            v-decorator="[ 'portCutOffObj', {initialValue:wayBill.portCutOff?moment(moment(wayBill.portCutOff).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开航时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择开航时间" :format="dateFormat"
                                            v-decorator="[ 'etdObj', {initialValue:wayBill.etd?moment(moment(wayBill.etd).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="到港时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择到港时间" :format="dateFormat"
                                            v-decorator="[ 'etaObj', {initialValue:wayBill.eta?moment(moment(wayBill.eta).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="截港时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择截港时间" :format="dateFormat"
                                            v-decorator="[ 'cyCutOffObj', {initialValue:wayBill.cyCutOff?moment(moment(wayBill.cyCutOff).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船开航时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择驳船开航时间" :format="dateFormat"
                                            v-decorator="[ 'bargeEtdObj', {initialValue:wayBill.bargeEtd?moment(moment(wayBill.bargeEtd).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船到港时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择驳船到港时间" :format="dateFormat"
                                            v-decorator="[ 'bargeEtaObj', {initialValue:wayBill.bargeEta?moment(moment(wayBill.bargeEta).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="截单时间">
                                          <a-date-picker showTime style="width: 100%" placeholder="请选择截单时间" :format="dateFormat"
                                            v-decorator="[ 'orderCutOffObj', {initialValue:wayBill.orderCutOff?moment(moment(wayBill.orderCutOff).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户编号">
                                          <a-input placeholder="请输入客户编号" v-decorator="['customerNo', {}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户发票号">
                                          <a-input placeholder="请输入客户发票号" v-decorator="['invoiceNo', {}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="加拼提单号" help="如有多个请使用英文逗号分隔！">
                                          <a-input placeholder="请输入加拼提单号" v-decorator="['lclBookingNo', {}]" style="width: 255%"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16" v-for="(item, index) in wayBill.type_quality_list" :key="index">
                                  <a-col :lg="8">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="index?'箱型/箱量'+(index+1):'箱型/箱量1'">
                                          <a-input placeholder="请输入箱量"
                                                   v-decorator="['type_quality_list['+index+'].quality', {'initialValue':item.quality?item.quality:'1'}]">
                                              <a-select showSearch :filterOption="filterOption" slot="addonBefore" style="width: 120px"
                                                        v-decorator="['type_quality_list['+index+'].type', {'initialValue':item.type?item.type:' 20GP '}]">
                                                  <a-select-option value="20GP"> 20GP </a-select-option>
                                                  <a-select-option value="20HQ"> 20HQ </a-select-option>
                                                  <a-select-option value="20HT"> 20HT </a-select-option>
                                                  <a-select-option value="20OT"> 20OT </a-select-option>
                                                  <a-select-option value="20RF"> 20RF </a-select-option>
                                                  <a-select-option value="20RH"> 20RH </a-select-option>
                                                  <a-select-option value="20TK"> 20TK </a-select-option>
                                                  <a-select-option value="20FR"> 20FR </a-select-option>
                                                  <a-select-option value="40GP"> 40GP </a-select-option>
                                                  <a-select-option value="40HQ"> 40HQ </a-select-option>
                                                  <a-select-option value="40HT"> 40HT </a-select-option>
                                                  <a-select-option value="40OT"> 40OT </a-select-option>
                                                  <a-select-option value="40RF"> 40RF </a-select-option>
                                                  <a-select-option value="40RH"> 40RH </a-select-option>
                                                  <a-select-option value="40TK"> 40TK </a-select-option>
                                                  <a-select-option value="40FR"> 40FR </a-select-option>
                                                  <a-select-option value="45GP"> 45GP </a-select-option>
                                                  <a-select-option value="45HQ"> 45HQ </a-select-option>
                                                  <a-select-option value="45HT"> 45HT </a-select-option>
                                                  <a-select-option value="45OT"> 45OT </a-select-option>
                                                  <a-select-option value="45RF"> 45RF </a-select-option>
                                                  <a-select-option value="45RH"> 45RH </a-select-option>
                                                  <a-select-option value="45TK"> 45TK </a-select-option>
                                                  <a-select-option value="45FR"> 45FR </a-select-option>
                                              </a-select>
                                          </a-input>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="6">
                                      <a-form-item>
                                        <a-button @click="addRowTicket('type_quality_list', 'wayBill')" icon="plus"></a-button>&nbsp;
                                        <a-button @click="delRowTicket('type_quality_list', 'wayBill', index)" icon="minus"></a-button>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                          </a-tab-pane>
                          <a-tab-pane tab="路线信息" :disabled="changeDisable" key="2">
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="提箱地">
                                          <a-select showSearch allowClear :filterOption="filterOption" :disabled="routeInfoEdit"
                                            style="width: 100%" placeholder="请选择提箱地" v-decorator="['startStop', {initialValue:wayBill.startStop}]">
                                              <a-select-option v-for="item in siteList" :key="item.id">
                                                {{item.name}}
                                              </a-select-option>
                                          </a-select>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                          <a-date-picker showTime :disabled="routeInfoEdit" style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                            v-decorator="[ 'startStopBeginObj', {initialValue:wayBill.startStopBegin?moment(moment(wayBill.startStopBegin).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                          <a-date-picker showTime :disabled="routeInfoEdit" style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                            v-decorator="[ 'startStopEndObj', {initialValue:wayBill.startStopEnd?moment(moment(wayBill.startStopEnd).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16">
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="码头">
                                          <a-select showSearch allowClear :filterOption="filterOption" :disabled="routeInfoEdit"
                                            style="width: 100%" placeholder="请选择码头" v-decorator="['endStop', {initialValue:wayBill.endStop}]">
                                              <a-select-option v-for="item in siteList" :key="item.id">
                                                  {{item.name}}
                                              </a-select-option>
                                          </a-select>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                          <a-date-picker showTime :disabled="routeInfoEdit" style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                            v-decorator="[ 'endStopBeginObj', {initialValue:wayBill.endStopBegin?moment(moment(wayBill.endStopBegin).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                          <a-date-picker showTime :disabled="routeInfoEdit" style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                            v-decorator="[ 'endStopEndObj', {initialValue:wayBill.endStopEnd?moment(moment(wayBill.endStopEnd).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16" v-for="(listItem, listIndex) in wayBill.transitList" :key="listIndex">
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="listIndex?'装货地'+(listIndex+1):'装货地1'">
                                          <a-select showSearch allowClear :filterOption="filterOption" :disabled="routeInfoEdit"
                                            style="width: 100%" placeholder="请选择装货地" v-decorator="['transitList['+listIndex+'].transit', {initialValue:listItem.transit}]">
                                              <a-select-option v-for="item in siteList" :key="item.id">
                                                  {{item.name}}
                                              </a-select-option>
                                          </a-select>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                          <a-date-picker showTime :disabled="routeInfoEdit" style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                            v-decorator="[ 'transitList['+listIndex+'].transitBeginObj',
                                            {initialValue:listItem.transitBegin?moment(moment(listItem.transitBegin).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                          <a-date-picker showTime :disabled="routeInfoEdit" style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                            v-decorator="[ 'transitList['+listIndex+'].transitEndObj',
                                            {initialValue:listItem.transitEnd?moment(moment(listItem.transitEnd).format()):null}]"/>
                                      </a-form-item>
                                  </a-col>
                                  <a-col v-show="!routeInfoEdit" :lg="3">
                                      <a-form-item>
                                          <a-button @click="addRowTicket('transitList', 'wayBill')" icon="plus"></a-button>&nbsp;
                                          <a-button @click="delRowTicket('transitList', 'wayBill', listIndex)" icon="minus"></a-button>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                              <a-row class="form-row" :gutter="16" v-for="(listItem, listIndex) in wayBill.wagonTeamList" :key="'wagonTeamList-'+listIndex">
                                  <a-col :lg="7">
                                      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="listIndex?'车队'+(listIndex+1):'车队1'">
                                          <a-input placeholder="请输入分配箱量" style="width: 100%" @blur="onBlurContainer" @change="onChangeContainer" @keyup="onChangeContainer"
                                            v-decorator="['wagonTeamList['+listIndex+'].quality', {'initialValue':listItem.quality?listItem.quality : 0}]">
                                              <a-select showSearch allowClear :filterOption="filterOption" slot="addonBefore" :disabled="routeInfoEdit" style="width: 160px"
                                                placeholder="请选择车队" v-decorator="['wagonTeamList['+listIndex+'].wagonTeamId', {initialValue:listItem.wagonTeamName}]">
                                                  <a-select-option v-for="item in wagonTeamList" :key="item.id" :value="item.id">
                                                    {{item.name}}
                                                  </a-select-option>
                                              </a-select>
                                          </a-input>
                                      </a-form-item>
                                  </a-col>
                                  <a-col v-show="!routeInfoEdit" :lg="17">
                                      <a-form-item>
                                          <a-button @click="addRowTicket('wagonTeamList', 'wayBill')" icon="plus"></a-button>
                                          <a-button @click="delRowTicket('wagonTeamList', 'wayBill', listIndex)" icon="minus"></a-button>
                                      </a-form-item>
                                  </a-col>
                              </a-row>
                          </a-tab-pane>
                      </a-tabs>
                  </a-form>
                  <template slot="footer">
                      <a-button key="back" @click="handleClose">关闭</a-button>
                      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">保存</a-button>
                  </template>
              </a-modal>
              </a-spin>
          </div>

          <!-- 查看运单 -->
          <div>
              <a-spin :spinning="confirmLoading">
                  <a-modal :title="title" style="top: 20px;" :width="1200" :height="300" v-model="billViewVisible" :confirmLoading="confirmLoading">
                      <a-form :form="form">
                          <a-tabs v-model="activeKey">
                              <a-tab-pane tab="基础信息" key="1">
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="提单号">
                                              <a-input v-decorator="['bookingNo', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="运单名称">
                                              <a-input v-decorator="['name', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="港口代码">
                                              <a-input v-decorator="['portCode', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="船公司">
                                              <a-input v-decorator="['shipCompany', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="船名">
                                              <a-input v-decorator="['shipName', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="航次">
                                              <a-input v-decorator="['line', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船船名">
                                              <a-input v-decorator="['bargeShipName', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船航次">
                                              <a-input v-decorator="['bargeLine', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船起运港">
                                              <a-input v-decorator="['bargeFrom', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="起运港">
                                              <a-input v-decorator="['pol', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="卸货港">
                                              <a-input v-decorator="['pod', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="交货地">
                                              <a-input v-decorator="['deliveryPlace', {}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="截关时间">
                                              <a-input readOnly v-decorator="[ 'portCutOffObj',
                                                {initialValue:wayBill.portCutOff?moment(wayBill.portCutOff).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开航时间">
                                              <a-input readOnly v-decorator="[ 'etdObj', {initialValue:wayBill.etd?moment(wayBill.etd).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="到港时间">
                                              <a-input readOnly v-decorator="[ 'etaObj', {initialValue:wayBill.eta?moment(wayBill.eta).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="截港时间">
                                              <a-input readOnly v-decorator="[ 'cyCutOffObj',
                                                {initialValue:wayBill.cyCutOff?moment(wayBill.cyCutOff).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船开航时间">
                                              <a-input readOnly v-decorator="[ 'bargeEtdObj',
                                                {initialValue:wayBill.bargeEtd?moment(wayBill.bargeEtd).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="驳船到港时间">
                                              <a-input readOnly v-decorator="[ 'bargeEtaObj',
                                                {initialValue:wayBill.bargeEta?moment(wayBill.bargeEta).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="截单时间">
                                              <a-input readOnly v-decorator="[ 'orderCutOffObj',
                                                {initialValue:wayBill.orderCutOff?moment(wayBill.orderCutOff).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户编号">
                                              <a-input readOnly v-decorator="[ 'customerNo', {}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户发票号">
                                              <a-input readOnly v-decorator="[ 'invoiceNo',{}]"/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="加拼提单号" help="如有多个请使用英文逗号分隔！">
                                              <a-input v-decorator="['lclBookingNo', {}]" style="width: 255%" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16" v-for="(item, index) in wayBill.type_quality_list" :key="index">
                                      <a-col :lg="8">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="index?'箱型/箱量'+(index+1):'箱型/箱量1'">
                                              <a-input :addonBefore="item.type" v-decorator="['type_quality_list['+index+'].quality', {initialValue:item.quality}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                              </a-tab-pane>
                              <a-tab-pane tab="路线信息" key="2">
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="提箱地">
                                              <a-input v-decorator="[ 'startStop', {initialValue:wayBill.startStop}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                              <a-input readOnly v-decorator="[ 'startStopBeginObj',
                                                {initialValue:wayBill.startStopBegin?moment(wayBill.startStopBegin).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                              <a-input readOnly v-decorator="[ 'startStopEndObj',
                                                {initialValue:wayBill.startStopEnd?moment(wayBill.startStopEnd).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16">
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="码头">
                                              <a-input v-decorator="[ 'endStop', {initialValue:wayBill.endStop}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                              <a-input readOnly v-decorator="[ 'endStopBeginObj',
                                                {initialValue:wayBill.endStopBegin?moment(wayBill.endStopBegin).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                              <a-input readOnly v-decorator="[ 'endStopEndObj',
                                                {initialValue:wayBill.endStopEnd?moment(wayBill.endStopEnd).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16" v-for="(listItem, listIndex) in wayBill.transitList" :key="listIndex">
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="listIndex?'装货地'+(listIndex+1):'装货地1'">
                                              <a-input v-decorator="['transitList['+listIndex+'].transit', {initialValue:listItem.transit}]" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                              <a-input readOnly v-decorator="[ 'transitList['+listIndex+'].transitBeginObj',
                                                {initialValue:listItem.transitBegin?moment(listItem.transitBegin).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                              <a-input readOnly v-decorator="[ 'transitList['+listIndex+'].transitEndObj',
                                                {initialValue:listItem.transitEnd?moment(listItem.transitEnd).format(dateFormat):null}]"/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                                  <a-row class="form-row" :gutter="16" v-for="(listItem, listIndex) in wayBill.wagonTeamList" :key="'wagonTeamList-'+listIndex">
                                      <a-col :lg="7">
                                          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="listIndex?'车队'+(listIndex+1):'车队1'">
                                              <a-input :addonBefore="listItem.wagonTeamName" v-decorator="['wagonTeamList['+listIndex+'].wagonTeamName', {initialValue:listItem.quality}]" style="width: 100%" readOnly/>
                                          </a-form-item>
                                      </a-col>
                                  </a-row>
                              </a-tab-pane>
                          </a-tabs>
                      </a-form>
                      <template slot="footer">
                          <a-button key="back" @click="handleClose">关闭</a-button>
                      </template>
                  </a-modal>
              </a-spin>
          </div>

          <!-- 指派车队 -->
          <div>
              <a-spin :spinning="confirmLoading">
                  <a-modal :title="title" :width="500" :height="500" v-model="appointVisible"
                           :confirmLoading="confirmLoading" @ok="handleAppointOk" @cancel="handleAppointClose">
                      <a-form :form="form">
                          <a-form-item :labelCol="{span: 5}" :wrapperCol="wrapperCol" label="车队">
                              <a-select showSearch :filterOption="filterOption" style="width: 100%"
                                        placeholder="请选择车队" v-decorator="['wagonTeamId', validatorRules.wagonTeamId]">
                                  <a-select-option v-for="item in wagonTeamList" :key="item.id">
                                    {{item.name}}
                                  </a-select-option>
                              </a-select>
                          </a-form-item>
                      </a-form>
                  </a-modal>
              </a-spin>
          </div>

          <!-- 绑定车辆 -->
          <div>
              <a-spin :spinning="confirmLoading">
              <a-modal :title="title" :width="500" :height="500" v-model="bandVisible"
                       :confirmLoading="confirmLoading" @ok="handleBandOk" @cancel="handleBandClose">
                  <a-form :form="form">
                      <a-form-item :labelCol="{span: 5}" :wrapperCol="wrapperCol" label="车辆">
                          <a-select showSearch :filterOption="filterOption" style="width: 100%"
                                    placeholder="请选择车辆" v-decorator="['wagonId', validatorRules.wagonId]">
                              <a-select-option v-for="item in wagonList" :key="item.id">
                                {{item.plateNo}}
                              </a-select-option>
                          </a-select>
                      </a-form-item>
                  </a-form>
              </a-modal>
              </a-spin>
          </div>

          <!-- 编辑路线 -->
          <div>
              <a-spin :spinning="confirmLoading">
              <a-modal :title="title" :width="1200" :height="500" v-model="routePlanVisible"
                       :confirmLoading="confirmLoading" @ok="handleRoutePlanOk" @cancel="handleRoutePlanClose">
                  <a-form :form="form">
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="提箱地">
                                  <a-select showSearch allowClear :filterOption="filterOption" style="width: 100%"
                                            placeholder="请选择提箱地" v-decorator="['startStop', {initialValue:routePlan.startStop}]">
                                      <a-select-option v-for="item in siteList" :key="item.id">
                                        {{item.name}}
                                      </a-select-option>
                                  </a-select>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                  <a-date-picker showTime style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                    v-decorator="['startStopBeginObj', {initialValue:routePlan.startStopBegin?moment(moment(routePlan.startStopBegin).format()):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="7">
                            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                <a-date-picker showTime style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                  v-decorator="['startStopEndObj', {initialValue:routePlan.startStopEnd?moment(moment(routePlan.startStopEnd).format()):null}]"/>
                            </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="码头">
                                  <a-select showSearch allowClear :filterOption="filterOption" style="width: 100%"
                                            placeholder="请选择码头" v-decorator="['endStop', {initialValue:routePlan.endStop}]">
                                      <a-select-option v-for="item in siteList" :key="item.id">
                                        {{item.name}}
                                      </a-select-option>
                                  </a-select>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                  <a-date-picker showTime style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                    v-decorator="[ 'endStopBeginObj', {initialValue:routePlan.endStopBegin?moment(moment(routePlan.endStopBegin).format()):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                  <a-date-picker showTime style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                    v-decorator="[ 'endStopEndObj', {initialValue:routePlan.endStopEnd?moment(moment(routePlan.endStopEnd).format()):null}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16" v-for="(listItem, listIndex) in routePlan.transitList" :key="listIndex">
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="listIndex?'装货地'+(listIndex+1):'装货地1'">
                                  <a-select showSearch allowClear :filterOption="filterOption" style="width: 100%"
                                            placeholder="请选择装货地" v-decorator="['transitList['+listIndex+'].transit', {initialValue:listItem.transit}]">
                                      <a-select-option v-for="item in siteList" :key="item.id">
                                        {{item.name}}
                                      </a-select-option>
                                  </a-select>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                  <a-date-picker showTime style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                    v-decorator="[ 'transitList['+listIndex+'].transitBeginObj',
                                    {initialValue:listItem.transitBegin?moment(moment(listItem.transitBegin).format()):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="7">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                  <a-date-picker showTime style="width: 100%" placeholder="请选择计划开始时间" :format="dateFormat"
                                    v-decorator="[ 'transitList['+listIndex+'].transitEndObj',
                                    {initialValue:listItem.transitEnd?moment(moment(listItem.transitEnd).format()):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="3">
                              <a-form-item>
                                  <a-button @click="addRowTicket('transitList', 'routePlan')" icon="plus"></a-button>&nbsp;
                                  <a-button @click="delRowTicket('transitList', 'routePlan', listIndex)" icon="minus"></a-button>
                              </a-form-item>
                          </a-col>
                      </a-row>
                  </a-form>
              </a-modal>
              </a-spin>
          </div>

          <!-- 编辑箱子信息 -->
          <div>
              <a-spin :spinning="confirmLoading">
              <a-modal :title="title" :width="1200" :height="500" v-model="containerVisible"
                       :confirmLoading="confirmLoading" @ok="handleContainerOk" @cancel="handleContainerClose">
                  <a-form :form="form">
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="箱型">
                                  <a-select showSearch allowClear :filterOption="filterOption" style="width: 100%" placeholder="请选择箱型"
                                    v-decorator="['containerType', {}]">
                                      <a-select-option v-for="item in containerList" :key="item">
                                        {{item}}
                                      </a-select-option>
                                  </a-select>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="箱号">
                                  <a-input placeholder="请输入箱号" v-decorator="['containerNo', {}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="封箱号">
                                  <a-input placeholder="请输入封箱号" v-decorator="['sealNumber', {}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="箱主">
                                  <a-input placeholder="请输入箱主" v-decorator="['containerOwner', {}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="毛重">
                                  <a-input placeholder="请输入毛重" addonAfter="KGS" v-decorator="['grossWeight', {}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="皮重">
                                  <a-input placeholder="请输入皮重" addonAfter="KGS" v-decorator="['tareWeight', {}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="净重">
                                 <a-input placeholder="请输入净重" addonAfter="KGS" v-decorator="['netWeight', {}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="最大容积">
                                  <a-input placeholder="请输入最大容积" addonAfter="CU.M" v-decorator="['cubeCapacity', {}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                  </a-form>
              </a-modal>
              </a-spin>
          </div>

          <!-- 查看箱子及路线信息 -->
          <div>
              <a-spin :spinning="confirmLoading">
              <a-modal :title="title" style="top: 20px;" :width="1200" :height="300" v-model="containerViewVisible" :confirmLoading="confirmLoading">
                  <a-form :form="form">
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="箱型" >
                                  <a-input v-decorator="['containerType', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="箱号">
                                  <a-input v-decorator="['containerNo', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="封箱号">
                                  <a-input v-decorator="['sealNumber', {}]"readOnly/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="箱主">
                                  <a-input v-decorator="['containerOwner', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="毛重" readOnly>
                                  <a-input addonAfter="KGS " v-decorator="['grossWeight', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="皮重">
                                  <a-input addonAfter="KGS " v-decorator="['tareWeight', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="净重">
                                  <a-input addonAfter="KGS " v-decorator="['netWeight', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="最大容积">
                                  <a-input addonAfter="CU.M" v-decorator="['cubeCapacity', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="提箱地">
                                  <a-input v-decorator="[ 'startStopName', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                  <a-input readOnly v-decorator="[ 'startStopBeginObj',
                                    {initialValue:container.startStopBegin?moment(container.startStopBegin).format(dateFormat):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                  <a-input readOnly v-decorator="[ 'startStopEndObj',
                                    {initialValue:container.startStopEnd?moment(container.startStopEnd).format(dateFormat):null}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="码头">
                                  <a-input v-decorator="[ 'endStopName', {}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                  <a-input readOnly v-decorator="[ 'endStopBeginObj',
                                    {initialValue:container.endStopBegin?moment(routePlan.endStopBegin).format(dateFormat):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                  <a-input readOnly v-decorator="[ 'endStopEndObj',
                                    {initialValue:container.endStopEnd?moment(container.endStopEnd).format(dateFormat):null}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                      <a-row class="form-row" :gutter="16" v-for="(listItem, listIndex) in container.transitList" :key="listIndex">
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="listIndex?'装货地'+(listIndex+1):'装货地1'">
                                  <a-input v-decorator="['transitList['+listIndex+'].transitName', {initialValue:listItem.transitName}]" readOnly/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                                  <a-input readOnly v-decorator="[ 'transitList['+listIndex+'].transitBeginObj',
                                    {initialValue:listItem.transitBegin?moment(listItem.transitBegin).format(dateFormat):null}]"/>
                              </a-form-item>
                          </a-col>
                          <a-col :lg="8">
                              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                                  <a-input readOnly v-decorator="[ 'transitList['+listIndex+'].transitEndObj',
                                    {initialValue:listItem.transitEnd?moment(listItem.transitEnd).format(dateFormat):null}]"/>
                              </a-form-item>
                          </a-col>
                      </a-row>
                  </a-form>
                  <template slot="footer">
                      <a-button key="back" @click="handleContainerClose">关闭</a-button>
                  </template>
              </a-modal>
              </a-spin>
          </div>
      </a-card>
  </page-layout>
</template>

<script>
    import moment from 'moment'
    import pick from 'lodash.pick'
    import PageLayout from '@/components/page/PageLayout'
    import {CommonListMixin} from '@/mixins/CommonListMixin'
    import {putAction, postAction, getAction, deleteAction} from '@/api/manage'

    export default {
        name: 'wayBillManagement',
        mixins:[CommonListMixin],
        components: { PageLayout },
        data() {
            return {
                title:'操作',
                showHeader: false,
                bandVisible: false,
                billVisible: false,
                billViewVisible: false,
                appointVisible: false,
                routePlanVisible: false,
                containerVisible: false,
                containerViewVisible: false,
                form: this.$form.createForm(this),
                dateFormat:"YYYY-MM-DD HH:mm:ss",
                confirmLoading: false,
                siteList:[],
                wagonList:[],
                containerList:{},
                wagonTeamList:[],
                expandedRowKeys: [],
                innerData: [],
                activeKey: "1",
                routeInfoEdit: true,
                changeDisable: false,
                containerTotal: 0,
                validatorRules:{
                    bookingNo:    {rules: [{required: true, message: '请输入提单号！'}]},
                    wagonId:      {rules: [{required: true, message: '请选择车辆！'}]},
                    wagonTeamId:  {rules: [{required: true, message: '请选择车队！'}]}
                },
                wayBill: {
                    transitList: [{}],
                    wagonTeamList: [{}],
                    type_quality_list: [{}],
                },
                routePlan: {
                    type_quality_list: [{}],
                    transitList: [{}],
                },
                container:{},
                // 查询参数
                queryParam: {
                    bookingNo: "",
                    status: "0"
                },
                // 表头
                columns: [
                    {
                        title: '提单号',
                        dataIndex: 'bookingNo',
                    },
                    {
                        title: '装货地',
                        dataIndex: 'shipmentPlace',
                    },
                    {
                        title: '车队名称',
                        dataIndex: 'wagonTeamName',
                    },
                    {
                        title: '起运港',
                        dataIndex: 'pol',
                    },
                    {
                        title: '卸货港',
                        dataIndex: 'pod',
                    },
                    {
                        title: '状态',
                        dataIndex: 'status',
                        customRender: (text) => {
                            if (text == "0") {
                                return '未完成';
                            } else if (text == "1"){
                                return '已终止';
                            } else {
                                return '已完成';
                            }
                        }
                    },
                    {
                        title: '操作',
                        width: '280px',
                        dataIndex: 'action',
                        scopedSlots: { customRender: 'action'}
                    }
                ],
                // 子表表头
                innerColumns: [
                    {
                        title: '#',
                        dataIndex: '',
                        key: 'rowIndex',
                        align: "center",
                        customRender: function (t, r, index) {
                            return parseInt(index) + 1;
                        }
                    },
                    {
                        title: '提货日期',
                        dataIndex: 'shipmentEndDate',
                        width: '10%',
                        customRender: (text) => {
                            if(!text) {
                                return '-';
                            } else {
                                return moment(text).format("YYYY-MM-DD HH:mm:ss");
                            }
                        }
                    },
                    {
                        title: '箱号',
                        dataIndex: 'containerNo',
                        width: '10%',
                        customRender: (text) => { return this.setFieldLine(text)}
                    },
                    {
                        title: '车牌号',
                        align: "center",
                        width: '10%',
                        dataIndex: 'plate_no',
                        customRender: (text) => { return this.setFieldLine(text)}
                    },
                    {
                        title: '司机',
                        dataIndex: 'driverName',
                        width: '10%',
                        customRender: (text) => { return this.setFieldLine(text)}
                    },
                    {
                        title: '司机联系方式',
                        dataIndex: 'phoneNo',
                        width: '10%',
                        customRender: (text) => { return this.setFieldLine(text)}
                    },
                    {
                        title: '所属车队',
                        dataIndex: 'wagonTeamName',
                        width: '15%',
                        customRender: (text) => { return this.setFieldLine(text)}
                    },
                    {
                        title: '状态',
                        align: "center",
                        width: '10%',
                        dataIndex: 'status',
                        customRender: (text) => {
                            if (text == "0") {
                                return '未指派';
                            } else if (text == "1"){
                                return '未开始';
                            } else if (text == "2"){
                                return '未完成';
                            } else {
                                return '已完成';
                            }
                        }
                    },
                    {
                        title: '操作',
                        dataIndex: 'action',
                        width: '15%',
                        scopedSlots: { customRender: 'action'}
                    }
                ],
                url: "/api/way_bill",
                allSitesUrl: "/api/all_sites",
                allWagonsUrl: "/api/all_wagons",
                bandWagonUrl: "/api/band_wagon",
                addRoutePlanUrl: "/api/route_plan",
                allRoutePlanUrl: "/api/all_route_plans",
                appointWagonUrl: "/api/appoint_wagonteam",
                editContainerUrl: "/api/edit_container",
                allWagonTeamsUrl: "/api/all_wagon_teams",
                routePlanMouldUrl: "/api/route_plan_bill",
                updateRoutePlanUrl: "/api/route_plan",
                deleteRoutePlanUrl: "/api/route_plan",
                getContainerByBillUrl: "/api/get_container_by_bill",
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 8 }
                }
            }
        },
        mounted() {
            let that = this;
            getAction(this.allSitesUrl, "").then((res) => {
                if (res.code == '0') {
                    that.siteList = res.data;
                }
            });
        },
        methods: {
            // 新增按钮
            add () {
                this.edit({});
            },

            // 编辑按钮
            edit (record) {
                this.form.resetFields();
                this.confirmLoading = true;
                this.billVisible = true;
                this.wayBill = Object.assign({}, record);
                this.wayBill.transitList = [{}];
                this.wayBill.wagonTeamList = [{}];
                this.wayBill.type_quality_list = [{}];
                this.activeKey = "1";
                this.routeInfoEdit = false;
                this.changeDisable = true;

                if(record.id != null){
                    this.routeInfoEdit = true;
                    this.changeDisable = false;
                    this.$nextTick(() => {
                        this.wayBill.type_quality_list = JSON.parse(record.containerInfo);
                        this.wayBill.wagonTeamList = JSON.parse(record.wagonTeamJson);
                        if(record.transitInfo != "[]") {
                            this.wayBill.transitList = JSON.parse(record.transitInfo);
                        }

                        this.form.setFieldsValue(
                            pick(this.wayBill, 'name', 'bookingNo', 'shipCompany', 'bargeShipName', 'bargeLine', 'shipName', 'line',
                                'portCode', 'bargeFrom', 'pol', 'pod', 'deliveryPlace', 'lclBookingNo', 'customerNo', 'invoiceNo')

                        );
                    });
                    this.confirmLoading = false;
                } else {
                    // 新增时初始化站点和车队下拉列表
                    let that = this;
                    getAction(this.allSitesUrl, "").then((res) => {
                        if (res.code == '0') {
                            that.siteList = res.data;
                            getAction(this.allWagonTeamsUrl, "").then((res) => {
                                if (res.code == '0') {
                                    that.wagonTeamList = res.data;
                                    that.confirmLoading = false;
                                } else {
                                    that.$message.error(res.message);
                                }
                            });
                        } else {
                            that.$message.error(res.message);
                        }
                    });
                }
            },

            // 确定按钮
            handleOk() {
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        const that = this;
                        that.confirmLoading = true;
                        let formData = Object.assign(this.wayBill, values);
                        let wagonTeamBoxCnt = 0;

                        // 第一个标签页
                        if(this.activeKey == '1') {
                            formData.etd = moment(formData.etdObj).valueOf();
                            formData.eta = moment(formData.etaObj).valueOf();
                            formData.bargeEtd = moment(formData.bargeEtdObj).valueOf();
                            formData.bargeEta = moment(formData.bargeEtaObj).valueOf();
                            formData.cyCutOff = moment(formData.cyCutOffObj).valueOf();
                            formData.portCutOff = moment(formData.portCutOffObj).valueOf();
                            formData.orderCutOff = moment(formData.orderCutOffObj).valueOf();
                            formData.containerInfo = JSON.stringify(formData.type_quality_list);
                            this.containerTotal = 0;
                            formData.type_quality_list.forEach((item, index) => {
                                this.containerTotal += parseInt(item.quality);
                            })
                        } else {
                            // 第二个标签页
                            formData.startStopBegin = moment(formData.startStopBeginObj).valueOf();
                            formData.startStopEnd = moment(formData.startStopEndObj).valueOf();
                            formData.endStopBegin = moment(formData.endStopBeginObj).valueOf();
                            formData.endStopEnd = moment(formData.endStopEndObj).valueOf();

                            formData.transitList.forEach((item, index) => {
                                item.transitBegin = moment(item.transitBeginObj).valueOf();
                                item.transitEnd = moment(item.transitEndObj).valueOf();
                            })
                            formData.transitInfo = JSON.stringify(formData.transitList);
                            formData.wagonTeamList.forEach((item, index) => {
                                that.wagonTeamList.forEach((o, i) => {
                                    if(item.wagonTeamId == o.id) {
                                        formData.wagonTeamList[index].wagonTeamName = o.name;
                                    }
                                })
                                wagonTeamBoxCnt += parseInt(item.quality);
                            })
                            formData.wagonTeamJson = JSON.stringify(formData.wagonTeamList);
                        }

                        // 新增
                        if(this.wayBill.id == null) {
                            that.handelPut(that.url, formData);
                        } else {
                            // 编辑
                            if(this.activeKey == '1') {
                                that.handelPost(formData);
                            }

                            if(this.activeKey == '2' && !this.routeInfoEdit) {
                                if(this.containerTotal < wagonTeamBoxCnt) {
                                    that.$message.error("分配的箱子总量超出,请修改!");
                                    that.confirmLoading = false;
                                } else {
                                    // 确认对话框
                                    this.$confirm({
                                        title: '确定保存?',
                                        content: '保存后路线信息将无法修改，且同步至所有路线！',
                                        okText: '保存',
                                        okType: 'danger',
                                        cancelText: '取消',
                                        onOk() {
                                            that.handelPut(that.routePlanMouldUrl, formData);
                                        },
                                        onCancel() {
                                            that.confirmLoading = false;
                                        }
                                    });
                                }
                            } else {
                                that.confirmLoading = false;
                            }
                        }
                    } else {
                        this.activeKey = "1";
                    }
                });
            },

            // 新增提交表单事件处理
            handelPut: function (url, formData) {
                let that = this;
                putAction(url, formData).then((res)=>{
                    if(res.code == 0){
                        that.$message.success("SUCCESS");
                        if(that.activeKey == '1') {
                            that.wayBill.id = res.data;
                            that.changeDisable = false;
                            that.$confirm({
                                title: '设置路线信息?',
                                content: '保存成功！是否开始设置路线模板信息？',
                                okText: '进入',
                                cancelText: '关闭',
                                onOk() {
                                    that.activeKey = '2';
                                },
                                onCancel() {
                                    that.billVisible = false;
                                }
                            });
                        } else {
                            this.routeInfoEdit = true;
                        }
                        that.loadData();
                    }else{
                        that.$message.error(res.message);
                    }
                }).finally(() => {
                    this.confirmLoading = false;
                });
            },

            // 修改提交表单事件处理
            handelPost: function (formData) {
                let that = this;
                postAction(this.url, formData).then((res)=>{
                    if(res.code == 0){
                        that.$message.success("SUCCESS");
                        that.loadData();
                    }else{
                        that.$message.error(res.message);
                    }
                }).finally(() => {
                    this.confirmLoading = false;
                });
            },

            // 查看运单
            handleViewBill (record) {
                this.form.resetFields();
                this.title = "查看";
                this.billViewVisible = true;
                this.wayBill = Object.assign({}, record);
                this.wayBill.transitList = [{}];
                this.wayBill.wagonTeamList = [{}];
                this.wayBill.type_quality_list = [{}];
                this.activeKey = "1";

                this.$nextTick(() => {
                    this.wayBill.type_quality_list = JSON.parse(record.containerInfo);
                    this.wayBill.wagonTeamList = JSON.parse(record.wagonTeamJson);
                    if(record.transitInfo != "[]") {
                        this.wayBill.transitList = JSON.parse(record.transitInfo);
                    }

                    this.form.setFieldsValue(
                        pick(this.wayBill, 'name', 'bookingNo', 'shipCompany', 'bargeShipName', 'bargeLine', 'shipName', 'line',
                            'portCode', 'bargeFrom', 'pol', 'pod', 'deliveryPlace', 'lclBookingNo', 'customerNo', 'invoiceNo')
                    );
                });
            },

            // 绑定车辆窗口打开
            handleBand(record) {
                this.form.resetFields();
                this.title = "绑定车辆";
                this.confirmLoading = true;
                this.bandVisible = true;
                this.wagon = Object.assign({}, record);

                // 初始化车辆下拉列表
                let that = this;
                getAction(this.allWagonsUrl, "").then((res) => {
                    if (res.code == '0') {
                        that.wagonList = res.data;
                        that.confirmLoading = false;
                    } else {
                        that.$message.error(res.message);
                    }
                });
            },

            // 绑定车辆
            handleBandOk() {
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        this.confirmLoading = true;
                        let paramArr = values;
                        paramArr.id = this.wagon.id;

                        let that = this;
                        postAction(this.bandWagonUrl, paramArr).then((res) => {
                            if (res.code == 0) {
                                that.$message.success("SUCCESS");
                                that.loading = true;
                                that.handleExpand(true, {id : that.expandedRowKeys[0]});
                                that.handleBandClose();
                            } else {
                                that.$message.error(res.message);
                            }
                        }).finally(() => {
                            this.confirmLoading = false;
                        });
                    }
                })
            },

            // 绑定车辆窗口关闭
            handleBandClose() {
                this.bandVisible = false;
            },

            // 指派车队窗口打开
            handleAppoint(record) {
                this.form.resetFields();
                this.title = "指派车队";
                this.confirmLoading = true;
                this.appointVisible = true;

                // 初始化车队下拉列表
                let that = this;
                getAction(this.allWagonTeamsUrl, "").then((res) => {
                    if (res.code == '0') {
                        that.wagonTeamList = res.data;
                        this.confirmLoading = false;
                    } else {
                        that.$message.error(res.message);
                    }
                });
            },

            // 指派车队
            handleAppointOk() {
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        this.confirmLoading = true;
                        let formData = values;
                        formData.ids = JSON.stringify(this.selectedRowKeys);

                        let that = this;
                        postAction(this.appointWagonUrl, formData).then((res) => {
                            if (res.code == 0) {
                                that.$message.success("SUCCESS");
                                that.onClearSelected();
                                that.handleExpand(true, {id : that.expandedRowKeys[0]});
                                that.loadData();
                                that.handleAppointClose();
                            } else {
                                that.$message.error(res.message);
                            }
                        }).finally(() => {
                            this.confirmLoading = false;
                        });
                    }
                })
            },

            // 指派车队窗口关闭
            handleAppointClose() {
                this.appointVisible = false;
            },

            // 新增路线
            handleAddRoutePlan(id) {
                this.handleEditRoutePlan({wayBillId: id});
            },

            // 路线编辑窗口打开
            handleEditRoutePlan(record) {
                this.form.resetFields();
                this.confirmLoading = true;
                this.routePlanVisible = true;
                this.routePlan = Object.assign({}, record);
                this.routePlan.transitList = [{}];

                if(this.routePlan.id != null){
                    this.title = "路线编辑";
                    if(this.routePlan.transitInfo != "[]") {
                        this.routePlan.transitList = JSON.parse(this.routePlan.transitInfo);
                    }
                } else {
                    this.title = "新增路线";
                }

                // 新增时初始化站点下拉列表
                let that = this;
                getAction(this.allSitesUrl, "").then((res) => {
                    if (res.code == '0') {
                        that.siteList = res.data;
                        that.confirmLoading = false;
                    } else {
                        that.$message.error(res.message);
                    }
                });
            },

            // 保存路线
            handleRoutePlanOk() {
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        this.confirmLoading = true;
                        let that = this;
                        let formData = Object.assign(this.routePlan, values);
                        formData.routePlanId = formData.id;
                        formData.id = formData.wayBillId;
                        delete formData.wayBillId;
                        formData.startStopBegin = moment(formData.startStopBeginObj).valueOf();
                        formData.startStopEnd = moment(formData.startStopEndObj).valueOf();
                        formData.endStopBegin = moment(formData.endStopBeginObj).valueOf();
                        formData.endStopEnd = moment(formData.endStopEndObj).valueOf();

                        formData.transitList.forEach((item, index) => {
                            item.transitBegin = moment(item.transitBeginObj).valueOf();
                            item.transitEnd = moment(item.transitEndObj).valueOf();
                        })
                        formData.transitInfo = JSON.stringify(formData.transitList);

                        if(formData.routePlanId != null) {
                            postAction(this.updateRoutePlanUrl, formData).then((res) => {
                                if (res.code == 0) {
                                    that.$message.success("SUCCESS");
                                    that.loading = true;
                                    that.handleExpand(true, {id : that.expandedRowKeys[0]});
                                    that.handleRoutePlanClose();
                                } else {
                                    that.$message.error(res.message);
                                }
                            }).finally(() => {
                                this.confirmLoading = false;
                            });
                        } else {
                            putAction(this.addRoutePlanUrl, formData).then((res) => {
                                if (res.code == 0) {
                                    that.$message.success("SUCCESS");
                                    that.loading = true;
                                    that.handleExpand(true, {id : that.expandedRowKeys[0]});
                                    that.handleRoutePlanClose();
                                } else {
                                    that.$message.error(res.message);
                                }
                            }).finally(() => {
                                this.confirmLoading = false;
                            });
                        }
                    }
                })
            },

            // 路线编辑窗口关闭
            handleRoutePlanClose() {
                this.routePlanVisible = false;
                this.handleExpand(true, {id : this.expandedRowKeys[0]});
            },

            // 删除路线
            handleRoutePlanDelete(id) {
                let that = this;
                deleteAction(that.deleteRoutePlanUrl, {id: id}).then((res) => {
                    if(res.code == 0){
                        that.$message.success("SUCCESS");
                        that.handleExpand(true, {id : that.expandedRowKeys[0]});
                    } else {
                        that.$message.error(res.message);
                    }
                });
            },

            // 箱子信息编辑窗口打开
            handleEditContainer(record) {
                this.form.resetFields();
                this.title = "箱子信息编辑";
                this.confirmLoading = true;
                this.containerVisible = true;
                this.container = Object.assign({}, record);

                // 新增时初始化下拉列表
                let that = this;
                getAction(this.getContainerByBillUrl, {wayBillId : this.expandedRowKeys[0]}).then((res) => {
                    if (res.code == '0') {
                        that.containerList = res.data;
                        that.$nextTick(() => {
                            that.form.setFieldsValue(
                                pick(that.container, 'sealNumber', 'containerType', 'containerNo', 'containerOwner', 'grossWeight',
                                    'tareWeight', 'netWeight', 'cubeCapacity')
                            );
                        });
                        that.confirmLoading = false;
                    } else {
                        that.$message.error(res.message);
                    }
                });
            },

            // 保存箱子信息
            handleContainerOk() {
                // 触发表单验证
                this.form.validateFields((err, values) => {
                    if (!err) {
                        this.confirmLoading = true;
                        let that = this;
                        let formData = Object.assign(this.container, values);

                        postAction(this.editContainerUrl, formData).then((res) => {
                            if (res.code == 0) {
                                that.$message.success("SUCCESS");
                                that.handleExpand(true, {id : that.expandedRowKeys[0]});
                                that.handleContainerClose();
                            } else {
                                that.$message.error(res.message);
                            }
                        }).finally(() => {
                            this.confirmLoading = false;
                        });
                    }
                })
            },

            // 箱子信息窗口关闭
            handleContainerClose() {
                this.containerVisible = false;
                this.handleExpand(true, {id : this.expandedRowKeys[0]});
            },

            // 查看箱子信息按钮
            handleViewContainer (record) {
                this.form.resetFields();
                this.title = "查看";
                this.confirmLoading = true;
                this.containerViewVisible = true;
                this.container = Object.assign({}, record);
                this.container.transitList = [{}];
                if(this.container.transitInfo != "[]") {
                    this.container.transitList = JSON.parse(this.container.transitInfo);
                }

                this.$nextTick(() => {
                    this.form.setFieldsValue(
                        pick(this.container, 'sealNumber', 'containerType', 'containerNo', 'containerOwner', 'grossWeight',
                            'tareWeight', 'netWeight', 'cubeCapacity', 'startStopName', 'endStopName')
                    );
                });
                this.confirmLoading = false;
            },

            // 过滤下拉框
            filterOption(input, option) {
                return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
            },

            // 没有数据的内容用“-”表示
            setFieldLine(text) {
                if (!text) {
                    return '-';
                } else {
                    return text;
                }
            },

            // 加号事件
            addRowTicket (listName, objectName) {
                eval("this."+objectName+"."+listName+".push({})");
                this.$forceUpdate();
                if(listName == "wagonTeamList") {

                }
            },

            // 减号事件
            delRowTicket (listName, objectName, index) {
                // console.log(this.wagonTeamList[0].quality);
                // console.log(this.wayBill.wagonTeamList[0].quality);
                // eval("console.log(this."+objectName+"."+listName+".["+index+"].quality)");
                let listLen = eval("this."+objectName+"."+listName+".length");
                if(listLen == 1){
                    this.$message.warning("再减少就没啦！");
                } else {
                    eval("this."+objectName+"."+listName+".splice("+index+", 1)");
                    this.$forceUpdate();
                }
            },

            // 列表展开事件
            handleExpand(expanded, record){
                this.expandedRowKeys=[];
                this.innerData=[];
                this.onClearSelected();
                if(expanded===true){
                    this.loading = true;
                    this.expandedRowKeys.push(record.id);
                    getAction(this.allRoutePlanUrl, {wayBillId: record.id}).then((res) => {
                        if (res.code == '0') {
                            this.loading = false;
                            this.innerData = res.data;
                        }
                    });
                }
            },

            onChangeContainer (e) {
                if ((parseInt(this.containerTotal) - parseInt(e.target.value)) < 0 ) {
                    e.target.value = this.containerTotal;
                }
            },
            onBlurContainer () {
            },
            moment,
        },
        computed: {
            rowSelection() {
                const { selectedRowKeys } = this;
                return {
                    selectedRowKeys,
                    onChange: this.onSelectChange,
                    // 暂时注释，如果指派车队后不能重复指派，则放开即可
                    // getCheckboxProps: record => ({
                    //     props: {
                    //         disabled: record.status != '0',
                    //     }
                    // }),
                }
            }
        },
    }
</script>
