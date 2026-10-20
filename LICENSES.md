# FitTrack Exercise Media & Dataset Licenses

This document outlines the licensing, attribution, and usage policies for exercise media integrated into FitTrack.

## 1. Built-in Procedural Anatomical Figure Engine
- **License**: Proprietary / MIT FitTrack Application Asset
- **Description**: 100% original procedural biomechanical SVG animation engine with realistic muscular anatomical figures, dynamic red/orange muscle belly highlights, and ~46 canonical movement patterns.
- **Attribution**: "FitTrack Procedural Biomechanical Animation Engine"
- **Restrictions**: No copyrighted GIFs, no external website scraping, no external hotlinks.

## 2. Licensed Dataset & Video Demonstrations
- **Provider**: Configurable via `VITE_DEFAULT_MEDIA_PROVIDER` and `resolveExerciseMedia()`.
- **Media Format**: 720p H.264 MP4, VP9 WebM, and WebP poster frames.
- **Attribution**: "Licensed Medical & Biomechanical Anatomy Archive" (or provider specific).
- **Storage**: Served from local static directory `/media/exercises/` or authenticated private CDN. Never hotlinked to third-party domains.

## 3. Strict Taxonomy Compliance
- **Muscles (14)**: Chest, Back, Shoulders, Traps, Biceps, Triceps, Forearms, Abs, Glutes, Quads, Hamstrings, Calves, Cardio, Full Body.
- **Equipment (9)**: Barbell, Dumbbell, Kettlebell, Machine, Cable, Smith Machine, Bodyweight, Band, Other.
- **Rule**: Strongman, sled, yoke, prowler, and unknown equipment are strictly categorized as **Other**, never **Machine**.
