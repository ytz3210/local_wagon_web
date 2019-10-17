<template>
    <div class="truck">
        <baidu-map class="map" :center="centerPoint" :double-click-zoom="false"
                   :scroll-wheel-zoom="true" @ready="mapReady"
                   @click="mouseClick" @mousemove="onMouseMove" @rightclick="addPolygonEnd" :map-click="false">
            <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>

            <bm-control anchor="BMAP_ANCHOR_TOP_RIGHT">
                <span>
                    <a-button-group style="margin: 10px">
                        <a-button type="default" icon="play-circle" @click="addPolygonBegin">开始</a-button>
                        <a-button type="default" icon="check-circle" @click="addPolygonEnd">结束</a-button>
                        <a-button type="default" icon="delete"  @click="clearPolygon">清除</a-button>
                    </a-button-group>
                </span>
            </bm-control>
            <bm-polygon :editing="true" :path="polygonPath" stroke-color="blue"
                        :stroke-opacity="0.5" :stroke-weight="2" @lineupdate="updatePolygonPath" />
        </baidu-map>
    </div>
</template>

<script>
    import {BaiduMap} from 'vue-baidu-map'

    export default {
        name: 'EFenceMap',
        props: {
            placeInfo: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },

        components: {
            BaiduMap,
        },
        data:function() {
            return {
                centerPoint: "常州",
                //地理围栏的坐标
                polygonPath: [],
                drawing: false,
                mouseMoving: false,
                map: null,
                BMap: null
            }
        },
        methods: {
            clearPolygon() {
                this.polygonPath = [];
            },

            addPolygonBegin() {
                this.clearPolygon();
                this.drawing = true;
            },

            mouseClick({type, target, point, pixel, overlay}) {
                if (this.drawing) {
                    // this.polygonPath.push(point);
                    this.mouseMoving = false;
                }
            },

            onMouseMove({type, target, point, pixel, overlay}) {
                if (this.drawing) {
                    if (!this.mouseMoving) {
                        this.polygonPath.push(point);
                        this.mouseMoving = true;
                    } else {
                        this.$set(this.polygonPath, this.polygonPath.length - 1, point);
                    }
                }
            },

            addPolygonEnd() {
                if (!this.drawing) {
                    return;
                }

                if (this.polygonPath.length > 3) {
                    this.polygonPath.splice(this.polygonPath.length - 1, 1);
                }

                this.$emit('eFenceUpdate', this.polygonPath);
                this.drawing = false;
                this.mouseMoving = false;
            },

            updatePolygonPath(e) {
                this.polygonPath = e.target.getPath();
                this.$emit('eFenceUpdate', this.polygonPath);
            },

            mapReady({BMap, map}) {
                this.map = map;
                this.BMap = BMap;
                if (this.polygonPath && this.polygonPath.length > 0) {
                    map.setViewport(this.polygonPath);
                }
            }
        },
        watch: {
            placeInfo:{
                handler(val, old) {
                    let that = this;
                    that.polygonPath =[];
                    setTimeout(function () {
                        if (val.eFence != null) {
                            that.polygonPath = val.eFence;
                            if (that.polygonPath.length !== 0) {
                                that.map.setViewport(that.polygonPath);
                            }
                        } else {
                            that.map.setCenter("常州");
                        }
                    }, 300);
                },
                immediate: true,
                deep: true
            }
        },
    }
</script>

<style scoped>
    .truck {
        margin:5px;
    }

    .map {
        width: 100%;
        height:500px;
        border: 1px dashed #cccccc;
        padding: 5px;
    }
</style>