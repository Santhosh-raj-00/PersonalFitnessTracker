#!/usr/bin/env bash
# FitTrack Batch FFMPEG Transcoding Pipeline: GIF -> 720p MP4 / WebM / WebP Posters
mkdir -p ./media/exercises ./media/posters

# Exercise: Incline Dumbbell Press
ffmpeg -y -i "dataset_raw\gifs\incline_dumbbell_press.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "media\exercises\lic_incline_db_press.mp4"
ffmpeg -y -i "dataset_raw\gifs\incline_dumbbell_press.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "media\exercises\lic_incline_db_press.webm"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\incline_dumbbell_press.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" "media\exercises\lic_incline_db_press_poster.webp"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\incline_dumbbell_press.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" -q:v 3 "media\exercises\lic_incline_db_press_poster.jpg"

# Exercise: Dumbbell Bench Press
ffmpeg -y -i "dataset_raw\gifs\dumbbell_bench_press.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "media\exercises\lic_db_bench_press.mp4"
ffmpeg -y -i "dataset_raw\gifs\dumbbell_bench_press.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "media\exercises\lic_db_bench_press.webm"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\dumbbell_bench_press.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" "media\exercises\lic_db_bench_press_poster.webp"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\dumbbell_bench_press.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" -q:v 3 "media\exercises\lic_db_bench_press_poster.jpg"

# Exercise: Barbell Back Squat
ffmpeg -y -i "dataset_raw\gifs\barbell_back_squat.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "media\exercises\lic_barbell_squat.mp4"
ffmpeg -y -i "dataset_raw\gifs\barbell_back_squat.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "media\exercises\lic_barbell_squat.webm"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\barbell_back_squat.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" "media\exercises\lic_barbell_squat_poster.webp"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\barbell_back_squat.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" -q:v 3 "media\exercises\lic_barbell_squat_poster.jpg"

# Exercise: Overhead Shoulder Press
ffmpeg -y -i "dataset_raw\gifs\overhead_shoulder_press.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "media\exercises\lic_standing_ohp.mp4"
ffmpeg -y -i "dataset_raw\gifs\overhead_shoulder_press.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "media\exercises\lic_standing_ohp.webm"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\overhead_shoulder_press.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" "media\exercises\lic_standing_ohp_poster.webp"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\overhead_shoulder_press.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" -q:v 3 "media\exercises\lic_standing_ohp_poster.jpg"

# Exercise: Prowler Sled Push
ffmpeg -y -i "dataset_raw\gifs\prowler_sled_push.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "media\exercises\lic_sled_push.mp4"
ffmpeg -y -i "dataset_raw\gifs\prowler_sled_push.gif" -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "media\exercises\lic_sled_push.webm"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\prowler_sled_push.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" "media\exercises\lic_sled_push_poster.webp"
ffmpeg -y -ss 00:00:00.000 -i "dataset_raw\gifs\prowler_sled_push.gif" -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" -q:v 3 "media\exercises\lic_sled_push_poster.jpg"
