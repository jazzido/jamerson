import * as d3 from "d3";

import Chart from "./Chart";

MIDI.Player.removeListener(); // removes current listener.

MIDI.loadPlugin({
    soundfontUrl: "http://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
    instrument: "marimba",
    callback: function () {
        var channel = 0, // MIDI allows for 16 channels, 0-15
            // the xylophone is represented as instrument 13 in General MIDI.
            instrument = 13,
            // middle C (C4) according to General MIDI
            note = 60,
            velocity = 127, // how hard the note hits, from 0-127
            delay = 0.5; // how long to hold the note, in seconds
        // play the note
        MIDI.programChange(0, instrument); // Load xylophone into Channel 0
        MIDI.noteOn(0, note, velocity); // Play middle C on Channel 0
        MIDI.noteOff(0, note, delay); // Release the middle C after 0.5 seconds
    }
});


const NOTE_ON = 144;


var note_idx = 0;

function play() {
    var chart = new Chart(MIDI.Player.data, MidiFile(MIDI.Player.currentData).header);
    
  MIDI.Player.clearAnimation(); // clears current animation.

  /*MIDI.Player.setAnimation(function(data) {
    // var now = data.now; // where we are now
    // var end = data.end; // time when song ends
    // var events = data.events; // all the notes currently being processed
    //console.log('animation', data);
    //    console.log(data);
    if (data.event.message === NOTE_ON) {
      chart.scrollLeft(data.now);
    }
  });*/


    MIDI.Player.addListener(function(data) { // set it to your own function!
        var now = data.now; // where we are now
        var end = data.end; // time when song ends
        var channel = data.channel; // channel note is playing on
        var message = data.message; // 128 is noteOff, 144 is noteOn
        var note = data.note; // the note
        var velocity = data.velocity; // the velocity of the note
        // then do whatever you want with the information!
        //console.log(now, end, channel, message, note, velocity);
        if (data.message === NOTE_ON) {
            chart.update(data, note_idx++);
        }
    });

    
  MIDI.Player.start();
  chart.startScroll();
}
MIDI.Player.BPM = null;
MIDI.Player.loadFile('/static/midi/Textures2-Bass.mid', play, () => {}, (e) => console.log('error', e));
