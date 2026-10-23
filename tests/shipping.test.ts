import test from 'node:test';
import assert from 'node:assert/strict';
import { boxVolume, parseDimensions } from '../src/core/shipping.ts';
test('box volume uses exact units and total identical box quantity', () => {
  assert.deepEqual(boxVolume(['24','18','12'],'in','2',12), {cuft:'6',cbm:'0.169901079552'});
  assert.equal(boxVolume(['1','1','1'],'m','1',6).cbm,'1');
  assert.equal(boxVolume(['1','1','1'],'ft','1',6).cuft,'1');
  for(const qty of ['0','-1','1.5','abc']) assert.throws(() => boxVolume(['1','1','1'],'ft',qty));
  assert.throws(() => boxVolume(['0','1','1'],'ft','1'));
});
test('paste accepts dimension delimiters and supported unit suffixes, rejects malformed input', () => {
  for(const separator of ['×','x','*',',']) assert.deepEqual(parseDimensions(`25.4 ${separator} 50.8 ${separator} 76.2 cm`),{values:['25.4','50.8','76.2'],unit:'cm'});
  assert.equal(parseDimensions('30 x 20 x 10').unit,undefined);
  for(const input of ['30 × 20','-1 x 20 x 10','0 x 20 x 10','1..2 x 3 x 4','30 x 20 x 10 yards']) assert.throws(() => parseDimensions(input));
});
