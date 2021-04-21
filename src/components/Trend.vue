<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span :style="titleStyle">{{ showTitle }}</span>
            <span
                :style="titleStyle"
                class="iconfont title-icon"
                @click="showChocie = !showChocie"
                >&#xe6eb;</span
            >
            <div class="select-con" v-show="showChocie">
                <div
                    class="select-item"
                    v-for="item in selectType"
                    :key="item.key"
                    @click="handleSelect(item.key)"
                >
                    <span>{{ item.text }}</span>
                </div>
            </div>
        </div>
        <div class="com-chart" ref="trendRef"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'

export default {
    name: 'Trend',
    data() {
        return {
            chartInstance: null,
            allData: null,
            showChocie: false, // 可选项显示
            choiceType: 'map', // 默认的数据显示类型
            titleFontSize: 0, // 标题字体大小
        }
    },
    created() {
        this.$socket.registerCallBack('trendData', this.getData)
    },
    mounted() {
        this.initChart()
        // this.getData()

        // websocket 获取数据
        this.$socket.send({
            action: 'getData',
            socketType: 'trendData',
            chartName: 'trend',
            value: '',
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('trendData')
    },
    computed: {
        selectType() {
            if (!this.allData) {
                return []
            } else {
                return this.allData.type.filter((item) => {
                    return item.key !== this.choiceType
                })
            }
        },
        showTitle() {
            if (!this.allData) {
                return ''
            } else {
                return this.allData[this.choiceType].title
            }
        },
        comStyle() {
            return {
                fontSize: this.titleFontSize + 'px',
                color: getThemeValue(this.theme).titleColor,
            }
        },
        titleStyle() {
            return { fontSize: this.titleFontSize + 'px' }
        },
        ...mapState(['theme']),
    },
    methods: {
        initChart() {
            this.chartInstance = this.$echarts.init(
                this.$refs.trendRef,
                this.theme
            )
            const initOption = {
                xAxis: { type: 'category' },
                yAxis: { type: 'value' },
                grid: {
                    left: '3%',
                    top: '35%',
                    right: '4%',
                    bottom: '1%',
                    containLabel: true,
                },
                tooltip: {
                    trigger: 'axis',
                },
                legend: {
                    left: 20,
                    top: '15%',
                    icon: 'circle',
                },
            }
            this.chartInstance.setOption(initOption)
        },
        getData(result) {
            // http://127.0.0.1:3000/trend
            // const { data: result } = await this.$http.get('trend')
            this.allData = result
            // console.log(this.allData);
            this.updateChart()
        },
        // 更新
        updateChart() {
            // 半透明的颜色值
            const colorArr1 = [
                'rgba(11, 168, 44, 0.5)',
                'rgba(44, 110, 255, 0.5)',
                'rgba(22, 242, 217, 0.5)',
                'rgba(254, 33, 30, 0.5)',
                'rgba(250, 105, 0, 0.5)',
            ]
            // 全透明的颜色值
            const colorArr2 = [
                'rgba(11, 168, 44, 0)',
                'rgba(44, 110, 255, 0)',
                'rgba(22, 242, 217, 0)',
                'rgba(254, 33, 30, 0)',
                'rgba(250, 105, 0, 0)',
            ]

            const timeArr = this.allData.common.month
            const valueArr = this.allData[this.choiceType].data
            const seriesArr = valueArr.map((item, index) => {
                return {
                    name: item.name,
                    type: 'line',
                    data: item.data,
                    stack: this.choiceType,
                    areaStyle: {
                        color: new this.$echarts.graphic.LinearGradient(
                            0,
                            0,
                            0,
                            1,
                            [
                                { offset: 0, color: colorArr1[index] },
                                { offset: 1, color: colorArr2[index] },
                            ]
                        ),
                    },
                }
            })
            // 图例
            const legendArr = valueArr.map((item) => {
                return item.name
            })
            const dataOption = {
                xAxis: { data: timeArr },
                series: seriesArr,
                legend: { data: legendArr },
            }
            this.chartInstance.setOption(dataOption)
        },
        // 适配
        screenAdapter() {
            this.titleFontSize = (this.$refs.trendRef.offsetWidth / 100) * 3.6
            const adapterOption = {
                legend: {
                    itemWidth: this.titleFontSize,
                    itemHeight: this.titleFontSize,
                    itemGap: this.titleFontSize,
                    textStyle: { fontSize: this.titleStyle * 1.25 },
                },
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        handleSelect(currentType) {
            this.choiceType = currentType
            this.updateChart()
            this.showChocie = false
        },
    },
}
</script>

<style lang="less" scoped>
.title {
    color: #fff;
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;
    .title-icon {
        margin-left: 10px;
        cursor: pointer;
    }
    .select-item {
        display: block;
        background-color: rgba(0, 0, 0, 0.75);
        cursor: pointer;
        padding: 5px;
    }
    .select-item:hover {
        background-color: rgba(59, 59, 59, 0.9);
    }
}
</style>
