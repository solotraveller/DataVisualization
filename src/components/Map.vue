<template>
    <div class="com-container" @dblclick="revertMap">
        <div class="com-chart" ref="mapRef"></div>
    </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import { getProvinceMapInfo } from '@/utils/map_utils'
export default {
    name: 'Map',
    data() {
        return {
            chartInstance: null,
            allData: null,
            titleFontSize: 0,
            mapData: {}, // 缓存已查询的省级地图
        }
    },
    computed: {
        ...mapState(['theme']),
    },
    created() {
        this.$socket.registerCallBack('mapData', this.getData)
    },
    mounted() {
        this.initChart()
        // this.getData()
        this.$socket.send({
            action: 'getData',
            socketType: 'mapData',
            chartName: 'map',
            value: '',
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('mapData')
    },
    methods: {
        async initChart() {
            this.chartInstance = this.$echarts.init(
                this.$refs.mapRef,
                this.theme
            )
            // 获取中国地图矢量数据
            const result = await axios.get(
                'http://localhost:8082/map/china.json'
            )
            this.$echarts.registerMap('china', result.data)
            const initOption = {
                title: { text: ' ▎商家分布 ', left: 20, top: 20 },
                geo: {
                    type: 'map',
                    map: 'china',
                    top: '5%',
                    bottom: '5%',
                    itemStyle: {
                        areaColor: '#7f8c8d',
                        borderColor: '#333',
                    },
                },
                legend: {
                    left: '5%',
                    bottom: '5%',
                    orient: 'vertical',
                },
            }
            this.chartInstance.setOption(initOption)
            // 单击进入省级地图
            this.chartInstance.on('click', async (arg) => {
                const provinceInfo = getProvinceMapInfo(arg.name)
                console.log(provinceInfo)
                // 先查缓存，没有再请求
                if (!this.mapData[provinceInfo.key]) {
                    const res = await axios.get(
                        'http://localhost:8082' + provinceInfo.path
                    )
                    this.mapData[provinceInfo.key] = res.data
                    this.$echarts.registerMap(provinceInfo.key, res.data)
                }
                const changOption = {
                    geo: { map: provinceInfo.key },
                }
                this.chartInstance.setOption(changOption)
            })
        },
        getData(result) {
            // http://127.0.0.1:3000/map
            // const { data: result } = await this.$http.get('map')
            this.allData = result
            this.updataChart()
        },
        updataChart() {
            const legendArr = this.allData.map((item) => {
                return item.name
            })
            const seriesArr = this.allData.map((item) => {
                return {
                    type: 'effectScatter',
                    rippleEffect: {
                        scale: 5,
                        brushType: 'stroke',
                    },
                    name: item.name,
                    data: item.children,
                    coordinateSystem: 'geo',
                }
            })
            const dataOption = {
                legend: { data: legendArr },
                series: seriesArr,
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = (this.$refs.mapRef.offsetWidth / 100) * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize,
                    },
                },
                legend: {
                    itemWidth: titleFontSize * 0.5,
                    itemHeight: titleFontSize * 0.5,
                    itemGap: titleFontSize * 0.5,
                    textStyle: {
                        fontSize: titleFontSize * 0.5,
                    },
                },
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        // 返回上一级地图
        revertMap() {
            const reverOption = { geo: { map: 'china' } }
            this.chartInstance.setOption(reverOption)
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
</style>
