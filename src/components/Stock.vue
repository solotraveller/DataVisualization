<template>
    <div class="com-container">
        <div class="com-chart" ref="stockRef"></div>
    </div>
</template>

<script>
export default {
    name: 'Stock',
    data() {
        return {
            chartInstance: null,
            allData: null,
            currentIndex: 0, // 当前显示数据的页数
            timer: null,
        }
    },
    mounted() {
        this.initChart()
        this.getData()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        clearInterval(this.timer)
    },
    methods: {
        initChart() {
            this.chartInstance = this.$echarts.init(
                this.$refs.stockRef,
                'chalk'
            )
            const initOption = {
                title: { text: '▎库存和销量分析', left: 20, top: 20 },
            }
            this.chartInstance.setOption(initOption)
            this.chartInstance.on('mouseover', () => {
                clearInterval(this.timer)
            })
            this.chartInstance.on('mouseout', () => {
                this.startInterval()
            })
        },
        async getData() {
            const { data: result } = await this.$http.get('stock')
            this.allData = result
            this.updataChart()
            this.startInterval()
        },
        updataChart() {
            const centerArr = [
                ['18%', '40%'],
                ['50%', '40%'],
                ['82%', '40%'],
                ['34%', '75%'],
                ['66%', '75%'],
            ]
            const colorArr = [
                ['#4FF778', '#0BA82C'],
                ['#E5DD45', '#E8B11C'],
                ['#E8821C', '#E55445'],
                ['#5052EE', '#AB6EE5'],
                ['#23E5E5', '#2E72BF'],
            ]
            const start = this.currentIndex * 5
            const end = (this.currentIndex + 1) * 5
            const showData = this.allData.slice(start, end)
            const seriesArr = showData.map((item, index) => {
                return {
                    type: 'pie',
                    radius: [110, 100],
                    center: centerArr[index],
                    labelLine: { show: false },
                    zlevel: 3,
                    label: {
                        color: colorArr[index][0],
                        position: 'center',
                        formatter: () => {
                            if (!item) {
                                return ''
                            } else {
                                return item.name + '\n' + item.sales
                            }
                        },
                    },
                    data: [
                        {
                            name: item.name + '\n' + item.sales,
                            value: item.sales,
                            itemStyle: {
                                color: new this.$echarts.graphic.LinearGradient(
                                    0,
                                    1,
                                    0,
                                    0,
                                    [
                                        {
                                            offset: 0,
                                            color: colorArr[index][0],
                                        },
                                        {
                                            offset: 1,
                                            color: colorArr[index][1],
                                        },
                                    ]
                                ),
                            },
                        },
                        {
                            value: item.stock,
                            itemStyle: {
                                color: '#333843',
                            },
                        },
                    ],
                }
            })
            const dataOption = {
                series: seriesArr,
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = (this.$refs.stockRef.offsetWidth / 100) * 3.6
            const innerRadius = titleFontSize * 2
            const outerRadius = innerRadius * 1.125
            const adapterOption = {
                title: { textStyle: { fontSize: titleFontSize / 1.5 } },
                series: [
                    {
                        radius: [outerRadius, innerRadius],
                        label: {
                            fontSize: titleFontSize / 2,
                            lineHeight: titleFontSize,
                        },
                    },
                    {
                        radius: [outerRadius, innerRadius],
                        label: {
                            fontSize: titleFontSize / 2,
                            lineHeight: titleFontSize,
                        },
                    },
                    {
                        radius: [outerRadius, innerRadius],
                        label: {
                            fontSize: titleFontSize / 2,
                            lineHeight: titleFontSize,
                        },
                    },
                    {
                        radius: [outerRadius, innerRadius],
                        label: {
                            fontSize: titleFontSize / 2,
                            lineHeight: titleFontSize,
                        },
                    },
                    {
                        radius: [outerRadius, innerRadius],
                        label: {
                            fontSize: titleFontSize / 2,
                            lineHeight: titleFontSize,
                        },
                    },
                ],
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        startInterval() {
            if (this.timer) {
                clearInterval(this.timer)
            }
            this.timer = setInterval(() => {
                this.currentIndex++
                if (this.currentIndex > 1) {
                    this.currentIndex = 0
                }
                this.updataChart()
            }, 5000)
        },
    },
}
</script>

<style>
</style>
