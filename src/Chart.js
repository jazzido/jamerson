import * as d3 from "d3";

export default class {

    constructor(data, midiHeader) {
        this.data = data;

        this.msBeat = this.data
            .filter(d => d[0].event.subtype === 'setTempo')[0][0]
            .event.microsecondsPerBeat;

        const kSecondsPerQuarterNote = this.msBeat / 1000000.0;
        this.kSecondsPerTick = kSecondsPerQuarterNote / midiHeader.ticksPerBeat;

        this.noteExtent = d3.extent(this.data
                                    .filter((d) => d[0].event.subtype === "noteOn")
                                    .map((d) => d[0].event.noteNumber));

        this.velocityExtent = d3.extent(this.data
                                        .filter((d) => d[0].event.subtype === "noteOn")
                                        .map((d) => d[0].event.velocity));


        this.createPoints();
        this.initChart();
    }

    initChart() {
        this.svg = d3.select("#chart").append("svg");
        window.svg = this.svg;

        const svgSize = this.svg.node().getBoundingClientRect();

        var margin = {top: 10, right: 30, bottom: 30, left: 30};

        this.yScale = d3.scaleLinear()
            .domain(this.noteExtent)
            .range([svgSize.height - margin.bottom, margin.top]);
        this.xScale = d3.scaleLinear()
            .domain([0, this.noteInfos[this.noteInfos.length - 1].startTime])
            .range([margin.left, svgSize.width - margin.right]);

        this.svg.selectAll("circle")
            .data(this.noteInfos)
            .enter()
            .append('circle')
            .attr('r', 10)
            .attr('cx', (d) => this.xScale(d.startTime))
            .attr('cy', (d) => this.yScale(d.noteNumber));

        this.svg.selectAll('circle.currentNote')
            .data([this.noteInfos[0]])
            .enter()
            .append('circle')
            .attr('r', 10)
            .attr('cx', (d) => this.xScale(d.startTime))
            .attr('cy', (d) => this.yScale(d.noteNumber))
            .attr('class', 'currentNote');
    }

    createPoints() {
        var currentTime = 0;
        this.noteInfos = [];
        var noteTimes = [];

        // thanks euphony
        // https://github.com/qiao/euphony/blob/master/src/coffee/NoteRain.coffee
        this.data.forEach(([event, interval]) => {
            currentTime += interval;
            //currentTime += event.event.deltaTime;
            var {subtype, noteNumber, channel} = event.event;

            if (subtype === 'noteOn') {
                this.noteInfos.push({
                    noteNumber: noteNumber,
                    startTime: currentTime
                });
                //noteTimes[noteNumber] = currentTime;
            }
            // else if (subtype === 'noteOff') {
            //     var startTime = noteTimes[noteNumber];
            //     var duration = currentTime - startTime;
            //     this.noteInfos.push({
            //         noteNumber: noteNumber,
            //         startTime: startTime,
            //         duration: duration
            //     });
            // }
        });
    }

    update(data, note_idx) {
        const ticksToNext = this.noteInfos[note_idx+1].startTime - this.noteInfos[note_idx].startTime;

        const t = d3.transition();

        // console.log(ticksToNext * this.kSecondsPerTick);

        this.svg.selectAll('circle.currentNote')
            .data([this.noteInfos[note_idx+1]])
            .transition(d3.transition())
            .attr('cx', (d) => this.xScale(d.startTime))
            .attr('cy', (d) => this.yScale(d.noteNumber))
            .attr('r', 0)
            .transition(d3.transition().duration(10))
            .attr('r', 10);

        this.svg.select(`circle:not(.currentNote):nth-child(${note_idx+1})`)
            .attr('class', 'visited');

    }

}
