<template>
    <div class="com-container">
        <div class="com-chart" ref="sellerRef"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'Seller',
    data() {
        return {
            chartInstance: null,
            allData: null, // 服务器返回的全部数据
            currentPage: 1, // 当前显示页数
            totalPage: 0, // 一共显示页数
            timerId: null,
        }
    },
    created() {
        this.$socket.registerCallBack('sellerData', this.getData)
    },
    mounted() {
        this.initEchart()
        // this.getData()

        this.$socket.send({
            action: 'getData',
            socketType: 'sellerData',
            chartName: 'seller',
            value: '',
        })
        window.addEventListener('resize', this.screeAdapter)
        // 页面初次立即适配
        this.screeAdapter()
    },
    destroyed() {
        clearInterval(this.timerId)
        window.removeEventListener('resize', this.screeAdapter)
        this.$socket.unRegisterCallBack('sellerData', this.getData)
    },
    computed: {
        ...mapState(['theme']),
    },
    methods: {
        // 初始化echartsInstance对象      chalk:主题名称
        initEchart() {
            this.chartInstance = this.$echarts.init(
                this.$refs.sellerRef,
                this.theme
            )
            // 初始配置
            const initOption = {
                title: {
                    text: '| 商家销售统计 |',
                    fontSize: 40,
                    left: 20,
                    top: 20,
                },
                grid: {
                    top: '20%',
                    left: '3%',
                    right: '6%',
                    bottom: '3%',
                    containLabel: true, // 距离包含坐标轴的文字
                },
                xAxis: { type: 'value' },
                yAxis: { type: 'category' },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        z: 0,
                        lineStyle: {
                            type: 'solid',
                            width: 66,
                            color: '#203443',
                        },
                    },
                },
                series: [
                    {
                        type: 'bar',
                        barWidth: 66,
                        label: { show: true, position: 'right', color: '#fff' },
                        itemStyle: {
                            barBorderRadius: [0, 15, 15, 0],
                            color: new this.$echarts.graphic.LinearGradient(
                                0,
                                0,
                                1,
                                0,
                                [
                                    { offset: 0, color: '#5052ee' },
                                    { offset: 1, color: '#9b59b6' },
                                ]
                            ),
                        },
                    },
                ],
            }
            this.chartInstance.setOption(initOption)
            this.chartInstance.on('mouseover', () => {
                clearInterval(this.timerId)
            })
            this.chartInstance.on('mouseon', () => {
                this.startInterval()
            })
        },
        // 获取数据
        getData(result) {
            // http://127.0.0.1:3000/api/seller
            // const { data: result } = await this.$http.get('seller')
            this.allData = result
            // 数据排序
            this.allData.sort((a, b) => {
                return b.value - a.value
            })
            this.totalPage =
                this.allData.length % 5 === 0
                    ? this.allData.length / 5
                    : this.allData.length / 5 + 1
            this.updateEchart()
            this.startInterval()
        },
        // 更新数据
        updateEchart() {
            const start = (this.currentPage - 1) * 5
            const end = this.currentPage * 5
            const showDate = this.allData.slice(start, end)
            const sellerNames = showDate.map((item) => {
                return item.name
            })
            const sellerValues = showDate.map((item) => {
                return item.value
            })
            const dataOption = {
                yAxis: { data: sellerNames },
                series: [
                    {
                        data: sellerValues,
                    },
                ],
            }
            this.chartInstance.setOption(dataOption)
        },
        // 每 3s 自动切换数据
        startInterval() {
            if (this.timerId) {
                clearInterval(this.timerId)
            }
            this.timerId = setInterval(() => {
                this.currentPage++
                if (this.currentPage > this.totalPage) {
                    this.currentPage = 0
                }
                this.updateEchart()
            }, 3000)
        },
        // 浏览器窗口变化，自动适配
        screeAdapter() {
            const titleFontSize = (this.$refs.sellerRef.offsetWidth / 100) * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize,
                    },
                },
                tooltip: {
                    axisPointer: {
                        lineStyle: {
                            width: titleFontSize,
                        },
                    },
                },
                series: [
                    {
                        barWidth: titleFontSize,
                        itemStyle: {
                            barBorderRadius: [
                                0,
                                titleFontSize / 3,
                                titleFontSize / 3,
                                0,
                            ],
                        },
                    },
                ],
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  lang="less">
</style>
