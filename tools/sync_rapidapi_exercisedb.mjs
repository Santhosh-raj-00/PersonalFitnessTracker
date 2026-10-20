import fs from 'fs';
import path from 'path';

/**
 * FitTrack RapidAPI ExerciseDB Video & Image Sync Engine
 * 
 * Uses your active RapidAPI subscription ("EDB WITH VIDEOS AND IMAGES BY ASCENDAPI")
 * to download real MP4 demonstration videos and poster images, match them to your database,
 * and configure them into FitTrack's media provider layer.
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '01a51722b9mshb430057975d4d96p1d3362jsn62f3ba168268';
const RAPIDAPI_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';

const HEADERS = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
};

const VIDEOS_DIR = path.resolve('frontend/public/media/exercises');
const POSTERS_DIR = path.resolve('frontend/public/media/posters');

fs.mkdirSync(VIDEOS_DIR, { recursive: true });
fs.mkdirSync(POSTERS_DIR, { recursive: true });

function normalizeNameForMatch(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(dumbbell|dumbbells|db)\b/g, 'db')
    .replace(/\b(barbell|barbells|bb)\b/g, 'bb')
    .replace(/\b(kettlebell|kettlebells|kb)\b/g, 'kb')
    .replace(/\b(cables?)\b/g, 'cable')
    .replace(/\b(presses|pressing)\b/g, 'press')
    .replace(/\b(curls|curling)\b/g, 'curl')
    .replace(/\b(rows|rowing)\b/g, 'row')
    .replace(/\b(raises|raising)\b/g, 'raise')
    .replace(/\b(squats|squatting)\b/g, 'squat')
    .replace(/\b(extensions|extending)\b/g, 'extension')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeSimilarity(a, b) {
  const normA = normalizeNameForMatch(a);
  const normB = normalizeNameForMatch(b);
  if (normA === normB) return 1.0;

  const tokensA = new Set(normA.split(' '));
  const tokensB = new Set(normB.split(' '));
  let common = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) common++;
  }
  return (2 * common) / (tokensA.size + tokensB.size);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buf);
    return true;
  } catch (err) {
    console.warn(`[Download Error] ${url}:`, err.message);
    return false;
  }
}

export async function syncRapidApiExercises(maxExercisesToSync = 20) {
  console.log('================================================================');
  console.log('FitTrack RapidAPI ExerciseDB Video & Image Synchronizer');
  console.log(`Connecting to: ${RAPIDAPI_HOST}`);
  console.log('================================================================\n');

  // Load existing FitTrack seed exercises
  const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
  const dbExercises = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log(`Loaded ${dbExercises.length} local exercises from FitTrack seed.`);

  // 1. Fetch pages of exercises from RapidAPI using after cursor
  console.log(`\nFetching exercises list from RapidAPI (target limit: ${maxExercisesToSync})...`);
  const items = [];
  let cursor = null;
  let page = 1;

  while (items.length < maxExercisesToSync) {
    const pageLimit = Math.min(25, maxExercisesToSync - items.length);
    const listUrl = `https://${RAPIDAPI_HOST}/api/v1/exercises?limit=${pageLimit}${cursor ? `&after=${cursor}` : ''}`;
    const listRes = await fetch(listUrl, { headers: HEADERS });
    const listData = await listRes.json();

    if (!listData.success || !listData.data || listData.data.length === 0) {
      break;
    }

    items.push(...listData.data);
    console.log(`  Page ${page}: fetched ${listData.data.length} items (total: ${items.length})`);

    if (!listData.meta?.hasNextPage || !listData.meta?.nextCursor || listData.meta.nextCursor === cursor) {
      break;
    }
    cursor = listData.meta.nextCursor;
    page++;
    await sleep(200);
  }

  console.log(`Retrieved total ${items.length} exercises from RapidAPI.`);

  const syncResults = [];
  const sqlUpdates = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i + 1}/${items.length}] Processing "${item.name}" (${item.exerciseId})...`);

    // Fetch full details including videoUrl
    await sleep(250); // Be respectful of rate limits
    const detailUrl = `https://${RAPIDAPI_HOST}/api/v1/exercises/${item.exerciseId}`;
    const detailRes = await fetch(detailUrl, { headers: HEADERS });
    const detailData = await detailRes.json();

    if (!detailData.success || !detailData.data) {
      console.warn(`Could not fetch details for ${item.exerciseId}`);
      continue;
    }

    const exDetail = detailData.data;
    if (!exDetail.videoUrl) {
      console.log(`  -> No video URL for "${item.name}". Skipping.`);
      continue;
    }

    // Match with local database
    let bestMatch = null;
    let bestScore = 0;
    for (const localEx of dbExercises) {
      const score = computeSimilarity(item.name, localEx.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = localEx;
      }
    }

    const safeFileBase = item.name.toLowerCase().replace(/[^\w]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
    const videoFileName = `${safeFileBase}.mp4`;
    const posterFileName = `${safeFileBase}.jpg`;
    const videoDest = path.join(VIDEOS_DIR, videoFileName);
    const posterDest = path.join(POSTERS_DIR, posterFileName);

    // Download Video and Poster locally
    console.log(`  -> Downloading MP4: ${exDetail.videoUrl.slice(0, 70)}...`);
    const vidOk = await downloadFile(exDetail.videoUrl, videoDest);
    console.log(`  -> Downloading Poster: ${exDetail.imageUrl.slice(0, 70)}...`);
    const imgOk = await downloadFile(exDetail.imageUrl, posterDest);

    if (vidOk) {
      const mediaUrl = `/media/exercises/${videoFileName}`;
      const posterUrl = imgOk ? `/media/posters/${posterFileName}` : undefined;

      if (bestScore >= 0.75 && bestMatch) {
        console.log(`  ✓ Matched with local "${bestMatch.name}" (Confidence: ${(bestScore * 100).toFixed(0)}%)`);
        bestMatch.mediaProvider = 'licensed';
        bestMatch.mediaType = 'video';
        bestMatch.mediaUrl = mediaUrl;
        bestMatch.posterUrl = posterUrl;
        bestMatch.attribution = 'ExerciseDB via AscendAPI (Licensed)';

        const escName = bestMatch.name.replace(/'/g, "''");
        sqlUpdates.push(
          `UPDATE exercises SET media_provider = 'licensed', media_type = 'video', media_url = '${mediaUrl}', poster_url = '${posterUrl || ''}', attribution = 'ExerciseDB via AscendAPI (Licensed)' WHERE LOWER(name) = LOWER('${escName}');`
        );

        syncResults.push({
          apiName: item.name,
          matchedLocalName: bestMatch.name,
          confidence: `${(bestScore * 100).toFixed(0)}%`,
          videoUrl: mediaUrl,
          status: 'Integrated'
        });
      } else {
        console.log(`  + Unmatched in existing DB. Added as new exercise "${item.name}".`);
        const newLocal = {
          id: safeFileBase,
          name: item.name.trim(),
          primaryMuscle: (item.bodyParts?.[0] || 'CHEST').toUpperCase(),
          primaryMuscles: [(item.bodyParts?.[0] || 'CHEST').toUpperCase()],
          secondaryMuscles: (item.secondaryMuscles || []).slice(0, 3).join(','),
          secondaryMusclesList: (item.secondaryMuscles || []).slice(0, 3).map(s => s.toUpperCase()),
          equipment: (item.equipments?.[0] || 'BODYWEIGHT').toUpperCase(),
          difficulty: 'INTERMEDIATE',
          movementType: 'COMPOUND',
          mediaProvider: 'licensed',
          mediaType: 'video',
          mediaUrl: mediaUrl,
          posterUrl: posterUrl,
          attribution: 'ExerciseDB via AscendAPI (Licensed)',
          steps: exDetail.instructions || ["Execute with controlled cadence."],
          mistakes: ["Maintain proper spinal alignment."],
          defaultSets: 3,
          defaultReps: "8-12",
          animationPattern: "back_squat"
        };
        dbExercises.push(newLocal);
        syncResults.push({
          apiName: item.name,
          matchedLocalName: '(New Exercise)',
          confidence: 'N/A',
          videoUrl: mediaUrl,
          status: 'Created New'
        });
      }
    }
  }

  // Save updated exercises_seed.json
  fs.writeFileSync(seedPath, JSON.stringify(dbExercises, null, 2), 'utf-8');
  console.log(`\nUpdated ${seedPath} with licensed video configurations.`);

  // Write SQL migration script for backend DB
  if (sqlUpdates.length > 0) {
    const sqlPath = path.resolve('tools/apply_rapidapi_updates.sql');
    fs.writeFileSync(sqlPath, sqlUpdates.join('\n'), 'utf-8');
    console.log(`Generated database SQL updates at ${sqlPath}.`);
  }

  console.log('\n================================================================');
  console.log('--- RapidAPI ExerciseDB Sync Report ---');
  console.log('================================================================');
  console.table(syncResults);
  console.log(`\nSuccessfully downloaded and integrated ${syncResults.length} real MP4 exercise demonstration videos!`);
}

const countArg = parseInt(process.argv[2], 10) || 10;
syncRapidApiExercises(countArg).catch(console.error);
