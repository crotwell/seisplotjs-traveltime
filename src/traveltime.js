
import RSVP from 'rsvp';

export let IRIS_HOST = "service.iris.edu";

export class TraveltimeQuery {
  constructor(host) {
    this._protocol = 'http';
    this._host = host;
    if (! host) {
      this._host = IRIS_HOST;
    }
  }
  protocol(value) {
    return arguments.length ? (this._protocol = value, this) : this._protocol;
  }
  host(value) {
    return arguments.length ? (this._host = value, this) : this._host;
  }
  evdepth(value) {
    return arguments.length ? (this._evdepth = value, this) : this._evdepth;
  }
  distdeg(value) {
    return arguments.length ? (this._distdeg = value, this) : this._distdeg;
  }
  model(value) {
    return arguments.length ? (this._model = value, this) : this._model;
  }
  phases(value) {
    return arguments.length ? (this._phases = value, this) : this._phases;
  }
  stalat(value) {
    return arguments.length ? (this._stalat = value, this) : this._stalat;
  }
  stalon(value) {
    return arguments.length ? (this._stalon = value, this) : this._stalon;
  }
  evlat(value) {
    return arguments.length ? (this._evlat = value, this) : this._evlat;
  }
  evlon(value) {
    return arguments.length ? (this._evlon = value, this) : this._evlon;
  }
  convertToArrival(ttimeline) {
    let items = ttimeline.trim().split(/\s+/);
    return {
      distdeg: parseFloat(items[0]),
      phase: items[2],
      time: parseFloat(items[3]),
      rayparam: parseFloat(items[4]),
      takeoff: parseFloat(items[5]),
      incident: parseFloat(items[6]),
      puristdist: parseFloat(items[7]),
      puristname: items[9]
    };
  }

  query() {
    let mythis = this;
    return this.queryRawText().then(function(rawText) {
        // parsing of text is temporary until IRIS 
        // traveltime ws supports json output from TauP
        let lines = rawText.match(/[^\r\n]+/g);
        let out = {
          model: mythis.model(),
          sourcedepth: mythis.evdepth(),
          receiverdepth: 0,
          phases: mythis.phases(),
          arrivals: []
        };
        for (let i=0; i<lines.length; i++) {
          out.arrivals[i] = mythis.convertToArrival(lines[i]);
        }
        return out;
    });
  }

  queryRawText() {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let client = new XMLHttpRequest();
      let url = mythis.formURL();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "text/plain");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) { resolve(this.response); }
          else { reject(this); }
        }
      }
    });
    return promise;
  }

  formURL() {
    let url = this.protocol()+"://"+this.host()+"/irisws/traveltime/1/query?";
    url = url +"noheader=true&";
    if (this._evdepth) { url = url+"evdepth="+this.evdepth()+"&"; } 
    if (this._stalat && this._stalon) {
      url = url+"staloc=["+this.stalat()+","+this.stalon()+"]&";
    }
    if (this._evlat && this._evlon) {
      url = url+"evloc=["+this.evlat()+","+this.evlon()+"]&";
    }
    if (this._distdeg) { url = url+"distdeg="+this.distdeg()+"&";}
    if (this._model) { url = url+"model="+this.model()+"&";}
    if (this._phases) { url = url+"phases="+this.phases()+"&";}
    return url.substr(0, url.length-1); // zap last & or ?
  }

  /** converts to ISO8601 but removes the trailing Z as FDSN web services 
    do not allow that. */
  toIsoWoZ(date) {
    let out = date.toISOString();
    return out.substring(0, out.length-1);
  }
}
