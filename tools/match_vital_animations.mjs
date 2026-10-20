import fs from 'fs';
import path from 'path';

const vitalData = JSON.parse(fs.readFileSync('VitalAnimations/VitalAnimations/Free50/50gymworkouts.json', 'utf-8'));
const seed = JSON.parse(fs.readFileSync('backend/src/main/resources/data/exercises_seed.json', 'utf-8'));

console.log('Total vital workouts:', vitalData.length);
console.log('Total seed exercises in project:', seed.length);

const seedMap = new Map();
seed.forEach(s => seedMap.set(s.name.toLowerCase().trim(), s));

console.log('--- ALL 50 VITAL WORKOUTS ---');
vitalData.forEach(v => {
  console.log(`${v.id} | ${v.name.padEnd(40)} | body: ${v.bodyPart.padEnd(12)} | eq: ${v.equipment.padEnd(12)} | target: ${v.target}`);
});

