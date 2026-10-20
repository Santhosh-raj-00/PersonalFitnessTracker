import fs from 'fs';
import path from 'path';

// Load dataset
const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
const exercises = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log(`================================================================`);
console.log(`FitTrack Exercise Library Integrity Audit & Validation Engine`);
console.log(`Target: ${seedPath} (${exercises.length} total exercises)`);
console.log(`================================================================\n`);

// (a) Counts per primary muscle and per equipment
const countsByMuscle = {};
const countsByEquip = {};

exercises.forEach(e => {
  countsByMuscle[e.primaryMuscle] = (countsByMuscle[e.primaryMuscle] || 0) + 1;
  countsByEquip[e.equipment] = (countsByEquip[e.equipment] || 0) + 1;
});

console.log('--- (a) Exercise Counts per Primary Muscle ---');
console.table(countsByMuscle);

console.log('\n--- Exercise Counts per Equipment Taxonomy ---');
console.table(countsByEquip);

// (b) Suspicious exercise detection using precise word-boundary rules
const suspicious = [];

exercises.forEach(e => {
  const name = e.name.toLowerCase();
  const primary = (e.primaryMuscle || '').toUpperCase();
  const reasons = [];

  // 1. Curl rule: name contains "curl"
  if (/\bcurl(s|ing)?\b/i.test(name)) {
    if (/\b(leg|hamstring|ball)\s+curl/i.test(name)) {
      if (primary !== 'HAMSTRINGS') {
        reasons.push(`Contains 'leg curl' but primary is ${primary} (expected HAMSTRINGS)`);
      }
    } else if (/\bwrist\s+curl/i.test(name)) {
      if (primary !== 'FOREARMS') {
        reasons.push(`Contains 'wrist curl' but primary is ${primary} (expected FOREARMS)`);
      }
    } else {
      if (primary !== 'BICEPS' && primary !== 'FOREARMS') {
        reasons.push(`Contains 'curl' but primary is ${primary} (expected BICEPS or FOREARMS)`);
      }
    }
  }

  // 2. Tricep / pushdown / skull / french press
  if (/\b(tricep|triceps|pushdown|push-down)\b/i.test(name) || name.includes('skull crusher') || name.includes('skullcrusher') || name.includes('french press')) {
    if (primary !== 'TRICEPS') {
      reasons.push(`Contains tricep/pushdown/skull but primary is ${primary} (expected TRICEPS)`);
    }
  }

  // 3. Squat / leg press / leg extension
  if (/\bleg\s+press\b/i.test(name)) {
    if (name.includes('calf press')) {
      if (primary !== 'CALVES') reasons.push(`Calf press on leg press but primary is ${primary} (expected CALVES)`);
    } else if (primary !== 'QUADS' && primary !== 'GLUTES') {
      reasons.push(`Contains 'leg press' but primary is ${primary} (expected QUADS or GLUTES)`);
    }
  } else if (/\bsquat(s|ting)?\b/i.test(name)) {
    if (primary !== 'QUADS' && primary !== 'GLUTES') {
      reasons.push(`Contains 'squat' but primary is ${primary} (expected QUADS or GLUTES)`);
    }
  }

  if (/\bleg\s+extension(s)?\b/i.test(name)) {
    if (primary !== 'QUADS') {
      reasons.push(`Contains 'leg extension' but primary is ${primary} (expected QUADS)`);
    }
  }

  // 4. Row / pulldown / pull-up / chin-up
  if (/\b(pulldown|pull-down|pull-up|pull\s+up|chin-up|chin\s+up)\b/i.test(name)) {
    if (primary !== 'BACK') {
      reasons.push(`Contains pulldown/pull-up but primary is ${primary} (expected BACK)`);
    }
  } else if (/\brow(s|ing)?\b/i.test(name)) {
    if (name.includes('upright row')) {
      if (primary !== 'SHOULDERS' && primary !== 'TRAPS') {
        reasons.push(`Upright row but primary is ${primary} (expected SHOULDERS or TRAPS)`);
      }
    } else if (name.includes('rear delt row') || name.includes('rear-delt row')) {
      if (primary !== 'SHOULDERS' && primary !== 'BACK') {
        reasons.push(`Rear delt row but primary is ${primary} (expected SHOULDERS or BACK)`);
      }
    } else if (name.includes('rowing, stationary')) {
      // cardio
    } else if (primary !== 'BACK') {
      reasons.push(`Contains 'row' but primary is ${primary} (expected BACK)`);
    }
  }

  // 5. Bench / fly / push-up
  if (/\b(push-up|push\s+up|pushup)\b/i.test(name)) {
    if (primary !== 'CHEST' && primary !== 'TRICEPS' && primary !== 'SHOULDERS') {
      reasons.push(`Push-up but primary is ${primary} (expected CHEST, TRICEPS, or SHOULDERS)`);
    }
  } else if (name.includes('bench press')) {
    if (primary !== 'CHEST' && primary !== 'TRICEPS') {
      reasons.push(`Bench press but primary is ${primary} (expected CHEST or TRICEPS)`);
    }
  } else if (/\bfly(s|es|e)?\b/i.test(name)) {
    if (name.includes('reverse fly') || name.includes('reverse machine fly') || name.includes('rear delt fly')) {
      if (primary !== 'SHOULDERS' && primary !== 'BACK') {
        reasons.push(`Rear fly but primary is ${primary} (expected SHOULDERS or BACK)`);
      }
    } else if (primary !== 'CHEST' && primary !== 'SHOULDERS') {
      reasons.push(`Fly but primary is ${primary} (expected CHEST or SHOULDERS)`);
    }
  }

  // 6. Raise / overhead press
  if (/\b(lateral\s+raise|front\s+raise|overhead\s+press|military\s+press|shoulder\s+press)\b/i.test(name)) {
    if (primary !== 'SHOULDERS') {
      reasons.push(`Overhead press or delt raise but primary is ${primary} (expected SHOULDERS)`);
    }
  }

  // 7. Crunch / plank
  if (/\b(crunch(es)?|plank(s)?)\b/i.test(name)) {
    if (primary !== 'ABS') {
      reasons.push(`Contains crunch/plank but primary is ${primary} (expected ABS)`);
    }
  }

  // 8. Calf
  if (/\b(calf|calves)\b/i.test(name)) {
    // Exception: Calf-Machine Shoulder Shrug targets traps
    if (name.includes('shoulder shrug')) {
      // Shrug targets traps
    } else if (primary !== 'CALVES') {
      reasons.push(`Contains calf/calves but primary is ${primary} (expected CALVES)`);
    }
  }

  // 9. Equipment anomalies: Strongman / sled / rope / balls / foam rolls must NOT be Machine
  if (e.equipment === 'MACHINE') {
    if (
      name.includes('atlas stone') || name.includes('sled') || name.includes('drag') ||
      name.includes('tire') || name.includes('battling rope') || name.includes('medicine ball') ||
      name.includes('foam roll') || name.includes('chain') || name.includes('prowler') ||
      name.includes('treadmill') || name.includes('stationary bike') || name.includes('elliptical')
    ) {
      reasons.push(`Strongman/sled/rope/ball/cardio tagged as MACHINE (must be OTHER)`);
    }
  }

  if (reasons.length > 0) {
    suspicious.push({
      name: e.name,
      currentPrimary: primary,
      secondary: e.secondaryMuscles,
      equipment: e.equipment,
      reasons: reasons.join('; ')
    });
  }
});

console.log(`\n--- (b) Suspicious Exercises Found: ${suspicious.length} ---`);
if (suspicious.length > 0) {
  console.table(suspicious);
} else {
  console.log('✓ Zero suspicious exercises found! All keyword rules pass 100%.');
}

// Export CSV
const csvRows = ['Name,CurrentPrimary,SecondaryMuscles,Equipment,Reasons'];
suspicious.forEach(s => {
  const esc = (txt) => `"${(txt || '').replace(/"/g, '""')}"`;
  csvRows.push([esc(s.name), esc(s.currentPrimary), esc(s.secondary), esc(s.equipment), esc(s.reasons)].join(','));
});

const csvPath = path.resolve('tools/suspicious_exercises.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf-8');
console.log(`\nExported suspicious list to: ${csvPath}`);

// (c) Media status report: number of exercises with no media, grouped by muscle
const mediaReport = {};
exercises.forEach(e => {
  const m = e.primaryMuscle || 'UNSPECIFIED';
  if (!mediaReport[m]) {
    mediaReport[m] = { total: 0, withMedia: 0, withoutMedia: 0 };
  }
  mediaReport[m].total++;
  const hasMedia = Boolean(e.mediaUrl && e.mediaUrl.trim() !== '' && e.mediaUrl !== 'null');
  if (hasMedia) {
    mediaReport[m].withMedia++;
  } else {
    mediaReport[m].withoutMedia++;
  }
});

console.log('\n--- (c) Media Status Report: Grouped by Muscle Group ---');
console.table(mediaReport);

const totalMissingMedia = Object.values(mediaReport).reduce((acc, curr) => acc + curr.withoutMedia, 0);
console.log(`Total exercises with NO media across library: ${totalMissingMedia}`);
