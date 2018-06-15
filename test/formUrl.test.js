import * as traveltime from '../src/traveltime';

test("formURL", () => {
  let query = new traveltime.TraveltimeQuery()
    .evdepth(50)
    .stalat(34).stalon(-81)
    .evlat(35).evlon(-101)
    .phases("P,S,PcP,PKiKP,PKPPKP");
  let url = query.formURL();
  expect(url).toBeDefined();
  // noheader is first, so no &
  expect(url).toContain('?noheader=');
  for(const k of ['evdepth', 'staloc', 'evloc',
   'phases', 'format']) {
     expect(url).toContain('&'+k+'=');
   }
   expect(url).toContain("http://"+traveltime.IRIS_HOST+"/irisws/traveltime/1/query?");

});
