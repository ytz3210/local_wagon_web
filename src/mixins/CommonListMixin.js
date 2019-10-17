/**
 * data中url定义 基础url 增删改皆使用相同url
 * 查询使用getAction, 增加使用putAction, 修改使用postAction, 删除使用deleteAction
 */
import { filterObj } from '@/utils/util';
import { putAction, postAction, deleteAction, getAction, downFile } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from "@/store/mutation-types"

export const CommonListMixin = {
    data(){
        return {
            //token header
            tokenHeader: {'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)},
            /* 查询条件-请不要在queryParam中声明非字符串值的属性 */
            queryParam: {},
            /* 数据源 */
            dataSource:[],
            /* 分页参数 */
            ipagination:{
                current: 1,
                pageSize: 10,
                pageSizeOptions: ['20', '50', '100'],
                showTotal: (total, range) => {
                    return range[0] + "-" + range[1] + " 共" + total + "条"
                },
                showQuickJumper: true,
                showSizeChanger: true,
                total: 0
            },
            /* table加载状态 */
            loading:false,
            /* table选中keys*/
            selectedRowKeys: [],
            /* table选中records*/
            selectionRows: [],
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        }
    },
    created() {
        this.loadData();
    },
    methods:{
        // 加载数据 若传入参数1则加载第一页的内容
        loadData(arg) {
            if(!this.url){
                this.$message.error("请设置url.list属性!");
                return;
            }
            if (arg === 1) {
                this.ipagination.current = 1;
            }
            var params = this.getQueryParams();//查询条件
            this.loading = true;
            getAction(this.url+"s", params).then((res) => {
                if (res.code == '0') {
                    this.dataSource = res.data.data;
                    this.ipagination.total = res.data.totalCount;
                }
                this.loading = false;
            });
        },

        //获取查询条件
        getQueryParams() {
            let sqp = {};
            var param = Object.assign(sqp, this.queryParam);
            param.pageNo = this.ipagination.current;
            param.pageSize = this.ipagination.pageSize;
            return filterObj(param);
        },

        // 按照筛选条件进行查询
        searchQuery() {
            this.loadData(1);
        },

        // 重置查询按钮
        searchReset() {
            this.onClearSelected();
            this.loadData(1);
        },

        // 新增按钮
        handleAdd: function () {
            this.title = "新增";
            this.add();
        },

        // 编辑按钮
        handleEdit: function (record) {
            this.title = "编辑";
            this.edit(record);
        },

        // 新增提交表单事件处理
        handelPut: function (formData) {
            let that = this;
            putAction(this.url, formData).then((res)=>{
                if(res.code == 0){
                    that.$message.success("SUCCESS");
                    that.handleClose();
                    that.loadData();
                }else{
                    that.$message.error(res.message);
                }
            }).finally(() => {
                that.confirmLoading = false;
            });
        },

        // 修改提交表单事件处理
        handelPost: function (formData) {
            let that = this;
            postAction(this.url, formData).then((res)=>{
                if(res.code == 0){
                  that.$message.success("SUCCESS");
                  that.handleClose();
                  that.loadData();
                }else{
                  that.$message.error(res.message);
                }
            }).finally(() => {
                that.confirmLoading = false;
            });
        },

        // 删除事件处理
        handleDelete: function (id) {
            let that = this;
            deleteAction(that.url, {id: id}).then((res) => {
                if(res.code == 0){
                    that.$message.success("SUCCESS");
                    that.loadData();
                } else {
                    that.$message.error(res.message);
                }
            });
        },

        // 关闭按钮
        handleClose() {
            this.visible = false;
        },

        // 分页变化时触发
        handleTableChange(pagination) {
            this.ipagination = pagination;
            this.loadData();
        },

        // 清除勾选项
        onClearSelected() {
            this.selectedRowKeys = [];
            this.selectionRows = [];
        },

        // 勾选触发事件
        onSelectChange(selectedRowKeys, selectionRows) {
            this.selectedRowKeys = selectedRowKeys;
            this.selectionRows = selectionRows;
        },

        // 以下各类字段验证
        validatePhone(rule, value, callback){
            if(!value || new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/).test(value)){
                callback();
            }else{
                callback("请输入正确格式的手机号码!");
            };
        },
        validateName(rule, value, callback){
            if(!value || value.length<50){
                callback();
            } else{
                callback("姓名长度不能超过50！");
            };
        },
        validateWeChat(rule, value, callback){
            if(!value || value.length<255){
                callback();
            } else{
                callback("姓名长度不能超过255！");
            };
        },
        validateIdentityCard(rule, value, callback){
            if(!value ||
              new RegExp(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|[Xx])$/).test(value)){
                callback();
            }else{
                callback("请输入正确格式的身份证号!");
            };
        },
        validatePlateNo(rule, value, callback) {
            if (!value ||
              new RegExp(/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/).test(value)){
                callback()
            } else {
                callback('请输入正确格式的车牌号码！')
            }
        },
    }
}