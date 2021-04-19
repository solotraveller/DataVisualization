<template>
    <div class="com-container">
        <div class="com-chart" ref="hotRef"></div>
        <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
            >&#xe6eb;</span
        >
        <span class="iconfont arr-right" @click="toRight" :style="comStyle"
            >&#xe6ee;</span
        >
        <span class="cat-name" :style="comStyle">{{ catName }}</span>
    </div>
</template>

<script>
export default {
    name: 'Hot',
    data() {
        return {
            chartInstance: null,
            allData: null,
            currentIndex: 0,
            titleFontSize: 0,
        }
    },
    computed: {
        catName() {
            if (!this.allData) {
                return ''
            } else {
                return this.allData[this.currentIndex].name
            }
        },
        comStyle() {
            return { fontSize: this.titleFontSize + 'px' }
        },
    },
    mounted() {
        this.initChart()
        this.getData()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
    },
    methods: {
        initChart() {
            this.chartInstance = this.$echarts.init(this.$refs.hotRef, 'chalk')
            const initOption = {
                title: {
                    text: '▎ 热销商品的占比',
                    left: 20,
                    top: 20,
                },
                legend: {
                    top: '5%',
                    icon: 'circle',
                },
                tooltip: {
                    show: true,
                    fomatter: (arg) => {
                        const thirdCategory = arg.data.children
                        let total = 0
                        thirdCategory.forEach((item) => {
                            total += item.value
                        })
                        let retStr = ''
                        thirdCategory.forEach((item) => {
                            retStr += `${item.name}:${
                                parseInt((item.value / total) * 100) + '%'
                            }<br/>`
                        })
                        return retStr
                    },
                },
                series: [
                    {
                        type: 'pie',
                        label: { show: true, color: '#fff', fontSize: 14 },
                        emphasis: {
                            label: { show: true },
                        },
                    },
                ],
            }
            this.chartInstance.setOption(initOption)
        },
        async getData() {
            const { data: result } = await this.$http.get('hotproduct')
            this.allData = result
            this.updateChart()
        },
        updateChart() {
            const legendData = this.allData[this.currentIndex].children.map(
                (item) => {
                    return item.name
                }
            )
            const seriesData = this.allData[this.currentIndex].children.map(
                (item) => {
                    return {
                        name: item.name,
                        value: item.value,
                        children: item.children,
                    }
                }
            )
            const dataOption = {
                legend: { data: legendData },
                series: [{ data: seriesData }],
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter() {
            this.titleFontSize = (this.$refs.hotRef.offsetWidth / 100) * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: this.titleFontSize / 1.5,
                    },
                },
                legend: {
                    itemWidth: this.titleFontSize / 2,
                    itemHeight: this.titleFontSize / 2,
                    itemGap: this.titleFontSize / 2,
                    textStyle: {
                        fontSize: this.titleFontSize / 2,
                    },
                },
                series: [
                    {
                        radius: this.titleFontSize * 4.5,
                        center: ['50%', '50%'],
                    },
                ],
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        toLeft() {
            this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.allData.length - 1
            }
            this.updateChart()
        },
        toRight() {
            this.currentIndex++
            if (this.currentIndex > this.allData.length - 1) {
                this.currentIndex = 0
            }
            this.updateChart()
        },
    },
}
</script>

<style lang="less">
.arr-left {
    position: absolute;
    left: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #fff;
}
.arr-right {
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #fff;
}
.cat-name {
    position: absolute;
    left: 80%;
    bottom: 10%;
    color: #fff;
}
</style>
