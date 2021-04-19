<template>
    <div class="com-container">
        <div class="com-chart" ref="rankRef"></div>
    </div>
</template>

<script>
export default {
    name: 'Rank',
    data() {
        return {
            chartInstance: null,
            allData: null,
            startValue: 0, // 区域缩放起点
            endValue: 9, // 区域缩放起点
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
            this.chartInstance = this.$echarts.init(this.$refs.rankRef, 'chalk')
            const initOption = {
                title: {
                    text: '▎地区销售排行',
                    left: 20,
                    top: 20,
                },
                grid: {
                    top: '40%',
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    containLabel: true,
                },
                tooltip: {
                    show: true,
                },
                xAxis: { type: 'category' },
                yAxis: { type: 'value' },
                series: [{ type: 'bar' }],
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
            const { data: result } = await this.$http.get('rank')
            this.allData = result
            this.allData.sort((a, b) => {
                return a.value - b.value
            })
            this.updateChart()
            this.startInterval()
        },
        updateChart() {
            const colorArr = [
                ['#0BA82C', '#4FF778'],
                ['#2E72BF', '#23E5E5'],
                ['#5052EE', '#AB6EE5'],
            ]
            const provinceArr = this.allData.map((item) => {
                return item.name
            })
            const valueArr = this.allData.map((item) => {
                return item.value
            })
            const dataOption = {
                xAxis: { data: provinceArr },
                dataZoom: {
                    show: false,
                    startValue: this.startValue,
                    endValue: this.endValue,
                },
                series: [
                    {
                        data: valueArr,
                        itemStyle: {
                            color: (arg) => {
                                let targetColor = null
                                if (arg.value > 300) {
                                    targetColor = colorArr[0]
                                } else if (arg.value > 150) {
                                    targetColor = colorArr[1]
                                } else {
                                    targetColor = colorArr[2]
                                }
                                return new this.$echarts.graphic.LinearGradient(
                                    0,
                                    0,
                                    0,
                                    1,
                                    [
                                        { offset: 0, color: targetColor[0] },
                                        { offset: 1, color: targetColor[1] },
                                    ]
                                )
                            },
                        },
                    },
                ],
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = (this.$refs.rankRef.offsetWidth / 100) * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize,
                    },
                },
                series: [
                    {
                        barWidth: titleFontSize,
                        itemStyle: {
                            borderRadius: [
                                titleFontSize / 5,
                                titleFontSize / 5,
                                0,
                                0,
                            ],
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
                this.startValue++
                this.endValue++
                if (this.endValue > this.allData.length - 1) {
                    this.startValue = 0
                    this.endValue = 9
                }
                this.updateChart()
            }, 1000)
        },
    },
}
</script>

<style>
</style>
