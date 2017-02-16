

// this comes from the seisplotjs bundle
var traveltime = seisplotjs_traveltime;
var wp = seisplotjs_waveformplot;
var daysAgo = 1;

var query = new traveltime.TraveltimeQuery()
  .evdepth(50)
  .distdeg(30)
  .phases("P,S");
wp.d3.select("div.url")
    .append("p")
    .text("URL: "+query.formURL());
query.query().then(function(times) {
console.log(" times :"+times.model+" "+times.arrivals.length);
  wp.d3.select("div.traveltimes")
    .selectAll("p")
    .data(times.arrivals)
    .enter() 
    .append("p")
    .text(function(d) {
      return "       "
          +d.phase+" "
          +d.distdeg+" "
          +d.time+" "
          +d.puristdist;
    });
    
}, function(reason) {
wp.d3.select("div.traveltimes")
    .append("p")
    .text("Reject: "+reason);
});

