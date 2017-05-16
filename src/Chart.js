import * as d3 from "d3";

export default class {

    constructor(data) {
        this.data = data;
        this.noteExtent = d3.extent(this.data
                                    .filter((d) => d[0].event.subtype === "noteOn")
                                    .map((d) => d[0].event.noteNumber));

        this.createPoints();
        this.initChart();
    }

    initChart() {
        var svg = d3.select("#chart").append("svg");
        console.log(svg);
        var margin = {top: 10, right: 30, bottom: 30, left: 30},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    createPoints() {
        var currentTime = 0;
        this.noteInfos = [];
        this.noteTimes = [];

        // thanks euphony
        // https://github.com/qiao/euphony/blob/master/src/coffee/NoteRain.coffee
        this.data.forEach(([event, interval]) => {
            currentTime += interval;
            var {subtype, noteNumber, channel} = event.event;

            if (subtype === 'noteOn') {
                this.noteTimes[noteNumber] = currentTime;
            }
            else if (subtype === 'noteOff') {
                var startTime = this.noteTimes[noteNumber];
                var duration = currentTime - startTime;
                this.noteInfos.push({
                    noteNumber: noteNumber,
                    startTime: startTime,
                    duration: duration
                });
            }
        });
    }
}
