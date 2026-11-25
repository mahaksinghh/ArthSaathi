import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, generalAnswer, containsPrivateDetails } from '../public/general-answers.js';

test('calculator supports localized questions, precedence and malformed input', () => {
  for(const question of ['2+2','What is 2 + 2?','२+२ कितना है?','२+२ किती?']) assert.equal(calculate(question).value,4);
  assert.equal(calculate('-(2+3)×4÷2').value,-10);
  assert.equal(calculate('0.1+0.2').value,0.3);
  assert.equal(calculate('2+3*4').value,14);
  assert.equal(calculate('5/(2-2)').divisionByZero,true);
  for(const question of ['2+(3','3..4+1','3 2 + 1','hello','2+alert(1)']) assert.equal(calculate(question),null);
});
test('screenshot prompts get concise sourced answers and a greeting', () => {
  const answer=generalAnswer('who is PM od india','en');
  assert.match(answer.text,/^Narendra Modi is the Prime Minister of India/);
  assert.match(answer.sources[0].url,/pmindia\.gov\.in/);
  assert.match(generalAnswer('भारत के प्रधानमंत्री कौन हैं?', 'hi').text,/नरेंद्र मोदी/);
  assert.match(generalAnswer('yoo','en').text,/^Hi!/);
  assert.match(generalAnswer('What is photosynthesis?','en').text,/light energy/);
  assert.equal(generalAnswer('Who was the prime minister in 1985?','en'),null);
  assert.equal(generalAnswer('What is Mercury?','en'),null);
  assert.equal(containsPrivateDetails('my UPI ID is user@bank'),true);
  assert.equal(containsPrivateDetails('What is my OTP 123456?'),true);
});
