// Reads optional reference messages from stdin (one JSON object per line) and prints aggregates only.
import { createInterface } from 'node:readline';
import { assessBaseline } from './baseline.mjs';
import { scenarios } from './scenarios.mjs';
import { assess } from '../public/moneyshield.js';

const detectors = {previous:assessBaseline,current:assess};
const report = {};
const counts = () => ({low:0,medium:0,high:0});
for(const [name, detector] of Object.entries(detectors)) {
  const rows = scenarios.map(([id, fraud, message])=>({id,fraud,...detector(message)}));
  const totals = {truePositive:0, trueNegative:0, falsePositive:0, falseNegative:0};
  for (const row of rows) {
    const alert = row.level!=='low';
    const key = row.fraud ? (alert?'truePositive':'falseNegative') : (alert?'falsePositive':'trueNegative');
    totals[key]++;
  }
  const {truePositive:tp,trueNegative:tn,falsePositive:fp,falseNegative:fn} = totals;
  const precision = tp/(tp+fp);
  const recall = tp/(tp+fn);
  report[name] = {
    scenarios:{...totals, precision, recall, accuracy:(tp+tn)/rows.length,
      f1:2*tp/(2*tp+fp+fn),
      highRisk:rows.filter(row=>row.level==='high').length,
      falseNegativeIds:rows.filter(row=>row.fraud&&row.level==='low').map(row=>row.id),
      falsePositiveIds:rows.filter(row=>!row.fraud&&row.level!=='low').map(row=>row.id)},
    referenceSets:{}
  };
}
if (process.argv.includes('--stdin')) {
  for await (const line of createInterface({input:process.stdin,crlfDelay:Infinity})) {
    const {set,message} = JSON.parse(line);
    const input=message.trim().slice(0,4000);
    if(!input) continue;
    for(const [name, detector] of Object.entries(detectors)) {
      const result=report[name].referenceSets[set] ??= {...counts(),skipped:0};
      try { result[detector(input).level]++; } catch { result.skipped++; }
    }
  }
}
console.log(JSON.stringify(report,null,2));
