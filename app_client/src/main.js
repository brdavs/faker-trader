import Component from 'inferno-component'
import { prices } from './resources'

export class MainContent extends Component {
	constructor(props) {
        super(props)
        this.state = {
            data: [],
            by: 60, // This would be time in seconds
            ws: props.ws
        }
    }

    componentWillMount() {
        let ws = this.state.ws
        ws.push(this.convertFeed(this))
        this.setState({ws})
    }

    convertFeed(self) {
        return (data) => {
            let [name, ts, value] = data.split(';')
            if(name!='COIN') return
    
            value = parseFloat(value)
            data = self.state.data
            let tsround = self.roundDate(ts, self.state.by)
            // If we are creating a new entry, we do this
            if(!data.length || data[data.length-1].date.getTime() != tsround.getTime()) {
                data.push({
                    date: tsround,
                    open: value,
                    high: value,
                    low: value,
                    close: value,
                    volume: 0
                })
    
            // and we update last entry
            } else {
                data[data.length-1].high = value > data[data.length-1].high ? value : data[data.length-1].high
                data[data.length-1].low = value < data[data.length-1].low ? value : data[data.length-1].low
                data[data.length-1].close = value
            }
            if(data.length > 200) data.shift()
            self.setState({data})
        }
    }

    // convertFeed(data) {
    //     let [name, ts, value] = data.split(';')
    //     if(name!='COIN') return

    //     value = parseFloat(value)
    //     data = this.state.data
    //     let tsround = this.roundDate(ts, this.state.by)
    //     // If we are creating a new entry, we do this
    //     if(!data.length || data[data.length-1].date.getTime() != tsround.getTime()) {
    //         data.push({
    //             date: tsround,
    //             open: value,
    //             high: value,
    //             low: value,
    //             close: value,
    //             volume: 0
    //         })

    //     // and we update last entry
    //     } else {
    //         data[data.length-1].high = value > data[data.length-1].high ? value : data[data.length-1].high
    //         data[data.length-1].low = value < data[data.length-1].low ? value : data[data.length-1].low
    //         data[data.length-1].close = value
    //     }
    //     this.setState({data})
    // }

    roundDate(ts, sec) {
        // This would round to median !!!!!!!!!!!!!
        // let ms = 1000 * sec
        // return new Date(Math.round(
        //     (parseInt(ts) / ms) - 0.5
        // ) * ms);
        
        // This rounds to the minute / hour
        return new Date(Math.round(
            ((parseInt(ts) / 1000) - sec / 2) / sec
        ) * 1000 * sec);
    }


    componentDidMount() {
        self = this
        let el = document.getElementById('f_chart')
        let btn = document.getElementById('f_update')

        // START TechanJS Thingie
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom
        
        var parseDate = d3.timeParse("%d-%b-%y")
        
        var x = techan.scale.financetime()
            .range([0, width])
        
        var y = d3.scaleLinear()
            .range([height, 0])
        
        var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y)
        
        var xAxis = d3.axisBottom()
            .scale(x)
        
        var yAxis = d3.axisLeft()
            .scale(y)
        
        var svg = d3.select(el).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        d3.csv('/assets/fake.json', function (error, data) {
            var accessor = candlestick.accessor()

            data = data.slice(0, 200).map(function (d) {
                return {
                    date: parseDate(d.Date),
                    open: +d.Open,
                    high: +d.High,
                    low: +d.Low,
                    close: +d.Close,
                    volume: +d.Volume
                }
            }).sort(function (a, b) { return d3.ascending(accessor.d(a), accessor.d(b)) })

            svg.append("g")
                .attr("class", "candlestick")

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")

            svg.append("g")
                .attr("class", "y axis")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)")

            // Data to display initially
            // draw(data.slice(0, data.length - 20))
            // Only want this button to be active if the data has loaded
            // d3.select(btn).on("click", function () { draw(data) }).style("display", "inline")

            function draw(data) {
                x.domain(data.map(candlestick.accessor().d))
                y.domain(techan.scale.plot.ohlc(data, candlestick.accessor()).domain())
            
                svg.selectAll("g.candlestick").datum(data).call(candlestick)
                svg.selectAll("g.x.axis").call(xAxis)
                svg.selectAll("g.y.axis").call(yAxis)
            }
            d3.select(btn).on("click", function () { draw(self.state.data) }).style("display", "inline")


            // Draw to chart method
            function drawToChart(self, draw, candlestick) {
                return (data) => {
                    draw(self.state.data)
                }
            }
            // Get historic data
            prices(self.state.by).get()
                .then(data => {
                    data = data.map(d => {
                        d.date = new Date(d.date)
                        return d
                    })
                    self.setState({data})
                    draw(self.state.data)
                })
                .then(r => {
                    // Update it afterwards on every tick
                    self.state.ws.push(drawToChart(self, draw, candlestick))
                    self.setState({ws: self.state.ws})
                })
        })
    }

    render() {
        return (
            <div class="f-main-content">
                <div id="f_chart"></div>
                {/* <button id="f_update" class="pure-button pure-button-primary sucess">Update</button> */}
                <p>This is a nasty implementation of charts.</p>
                <p>In order to implement this I would (at least) need to:</p>
                <ul>
                <li>Generate some fake data at start time.</li>
                <li>Design the chart to show different timeframes (they are already prepared, but I only use a 60s timeframe)</li>
                <li>Design the chart to look better</li>
                <li>Fix the fake data algorithm to make it more realistic.</li>
                </ul>
            </div>
        )
    }

}

export default MainContent
