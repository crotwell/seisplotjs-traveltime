// @flow

import RSVP from 'rsvp';
import {hasArgs, hasNoArgs, isStringArg, isNumArg, stringify, isDef } from './util';

export let IRIS_HOST = "service.iris.edu";

export class TraveltimeQuery {
  /** @private */
  _specVersion: number;
  /** @private */
  _protocol: string;
  /** @private */
  _host: string;
  /** @private */
  _nodata: number;
  /** @private */
  _evdepth: number;
  /** @private */
  _distdeg: number;
  /** @private */
  _model: string;
  /** @private */
  _phases: string;
  /** @private */
  _stalat: number;
  /** @private */
  _stalon: number;
  /** @private */
  _evlat: number;
  /** @private */
  _evlon: number;
  constructor(host :?string) {
    this._protocol = 'http:';
    if (! host) {
      this._host = IRIS_HOST;
    } else {
      this._host = host;
    }
  }
  protocol(value?: string) :string | TraveltimeQuery {
    return hasArgs(value) ? (this._protocol = value, this) : this._protocol;
  }
  host(value?: string) :string | TraveltimeQuery {
    return hasArgs(value) ? (this._host = value, this) : this._host;
  }
  evdepth(value?: number) :number | TraveltimeQuery {
    return hasArgs(value) ? (this._evdepth = value, this) : this._evdepth;
  }
  distdeg(value?: number) :number | TraveltimeQuery {
    return hasArgs(value) ? (this._distdeg = value, this) : this._distdeg;
  }
  model(value?: string) :string | TraveltimeQuery {
    return hasArgs(value) ? (this._model = value, this) : this._model;
  }
  phases(value?: string) :string | TraveltimeQuery {
    return hasArgs(value) ? (this._phases = value, this) : this._phases;
  }
  stalat(value?: number) :number | TraveltimeQuery {
    return hasArgs(value) ? (this._stalat = value, this) : this._stalat;
  }
  stalon(value?: number) :number | TraveltimeQuery {
    return hasArgs(value) ? (this._stalon = value, this) : this._stalon;
  }
  evlat(value?: number) :number | TraveltimeQuery {
    return hasArgs(value) ? (this._evlat = value, this) : this._evlat;
  }
  evlon(value?: number) :number | TraveltimeQuery {
    return hasArgs(value) ? (this._evlon = value, this) : this._evlon;
  }
  convertToArrival(ttimeline :string) {
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

  makeParam(name :string, val :mixed) :string {
    return name+"="+encodeURIComponent(stringify(val))+"&";
  }

  formBaseURL() :string {
    let colon = ":";
    if (this._protocol.endsWith(colon)) {
      colon = "";
    }
    let url = this._protocol+colon+"//"+this._host+"/irisws/traveltime/1/";
    return url;
  }

  formURL() :string {
    let url = this.formBaseURL()+'query?';
    url = url +"noheader=true&";
    if (isDef(this._evdepth)) { url = url+this.makeParam("evdepth", this.evdepth()); }
    if (isDef(this._stalat) && isDef(this._stalon)) {
      url = url+this.makeParam("staloc", "["+stringify(this.stalat())+","+stringify(this.stalon())+"]");
    }
    if (isDef(this._evlat) && isDef(this._evlon)) {
      url = url+this.makeParam("evloc", "["+stringify(this.evlat())+","+stringify(this.evlon())+"]");
    }
    if (isDef(this._distdeg)) { url = url+this.makeParam("distdeg", this.distdeg());}
    if (isDef(this._model)) { url = url+this.makeParam("model", this.model());}
    if (isDef(this._phases)) { url = url+this.makeParam("phases", this.phases());}
    if (url.endsWith('&') || url.endsWith('?')) {
      url = url.substr(0, url.length-1); // zap last & or ?
    }
    return url;
  }


  queryTauPVersion() :string {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let client = new XMLHttpRequest();
      let url = mythis.formTauPVersionURL();
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

  formTauPVersionURL() :string {
    return this.formBaseURL()+'taupversion';
  }

  queryWADL() :Promise<string> {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let client = new XMLHttpRequest();
      let url = mythis.formWADLURL();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "application/xml");
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

  formWADLURL() :string {
    return this.formBaseURL()+'application.wadl';
  }
}
