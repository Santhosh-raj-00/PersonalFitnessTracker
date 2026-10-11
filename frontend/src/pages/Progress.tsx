import React, { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import { exerciseService } from '../services/exerciseService';
import type { Exercise, ExerciseProgress, BodyMetric, ProgressPhoto, PersonalRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LineChart as ChartIcon, Trophy, Camera, Scale, Plus, Sparkles, X } from 'lucide-react';

export const Progress: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExId, setSelectedExId] = useState<number>(1);
  const [exProgress, setExProgress] = useState<ExerciseProgress | null>(null);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  const [showMetricModal, setShowMetricModal] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  // New metric form states
  const [newWeight, setNewWeight] = useState<number>(76.5);
  const [newFat, setNewFat] = useState<number>(15.5);
  const [newChest, setNewChest] = useState<number>(104);
  const [newWaist, setNewWaist] = useState<number>(82);

  // New photo form state
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400');
  const [photoTag, setPhotoTag] = useState<string>('FRONT');

  useEffect(() => {
    initProgress();
  }, []);

  useEffect(() => {
    if (selectedExId) {
      progressService.getExerciseProgress(selectedExId).then(setExProgress).catch(console.error);
    }
  }, [selectedExId]);

  const initProgress = async () => {
    try {
      const exList = await exerciseService.searchExercises();
      setExercises(exList);
      if (exList.length > 0) setSelectedExId(exList[0].id);

      const m = await progressService.getBodyMetricsHistory();
      setMetrics(m);

      const p = await progressService.getProgressPhotos();
      setPhotos(p);

      const records = await progressService.getPersonalRecords();
      setPrs(records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newM = await progressService.logBodyMetric({
        recordedDate: new Date().toISOString().split('T')[0],
        weightKg: newWeight,
        bodyFatPercentage: newFat,
        chestCm: newChest,
        waistCm: newWaist,
      });
      setMetrics((prev) => [...prev, newM]);
      setShowMetricModal(false);
    } catch (err) {
      alert('Failed to log body metric');
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newP = await progressService.logProgressPhoto({
        recordedDate: new Date().toISOString().split('T')[0],
        photoUrl,
        tag: photoTag,
      });
      setPhotos((prev) => [newP, ...prev]);
      setShowPhotoModal(false);
    } catch (err) {
      alert('Failed to log progress photo');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ChartIcon className="w-6 h-6 text-emerald-400" />
          Progress & Analytics
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Track strength progression, estimated 1RM, body metrics, and progress photos
        </p>
      </div>

      {/* 1. Exercise Strength & 1RM Progression Chart */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Strength & Estimated 1RM Progression
            </h2>
            <p className="text-xs text-gray-400">1RM = Weight × (1 + Reps/30)</p>
          </div>

          <select
            value={selectedExId}
            onChange={(e) => setSelectedExId(Number(e.target.value))}
            className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs font-bold focus:border-emerald-500 max-w-xs"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.primaryMuscle})
              </option>
            ))}
          </select>
        </div>

        <div className="h-64 w-full pt-2">
          {exProgress && exProgress.estimated1rmHistory && exProgress.estimated1rmHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exProgress.estimated1rmHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val} kg`, 'Estimated 1RM']}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs text-gray-500">No workout logs recorded for this exercise yet</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Personal Records (PR) Hall of Fame */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Personal Records (PR) Hall of Fame
          </h2>
          <span className="text-xs text-amber-400 font-bold bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
            {prs.length} Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prs.map((pr) => (
            <div key={pr.id} className="bg-gray-950 border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[140px]">{pr.exerciseName}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">
                    {pr.recordType === 'MAX_WEIGHT' ? 'Max Weight' : 'Max 1RM'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-amber-400">{pr.recordValue} kg</div>
                {pr.reps && <div className="text-[10px] text-gray-400 font-medium">{pr.reps} reps</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Body Metrics & Measurements */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Body Weight & Measurements History
            </h2>
            <p className="text-xs text-gray-400">Track weight, body fat %, chest and waist over time</p>
          </div>

          <button
            onClick={() => setShowMetricModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md btn-press"
          >
            <Plus className="w-3.5 h-3.5" /> Log Metric
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Weight (kg)</th>
                <th className="py-2 px-3">Body Fat %</th>
                <th className="py-2 px-3">Chest (cm)</th>
                <th className="py-2 px-3">Waist (cm)</th>
                <th className="py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-gray-950/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">{m.recordedDate}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{m.weightKg || '-'} kg</td>
                  <td className="py-2.5 px-3 font-medium text-gray-300">{m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : '-'}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-300">{m.chestCm ? `${m.chestCm} cm` : '-'}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-300">{m.waistCm ? `${m.waistCm} cm` : '-'}</td>
                  <td className="py-2.5 px-3 text-gray-400 italic truncate max-w-xs">{m.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Progress Photos Gallery */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Physique Progress Photos
            </h2>
            <p className="text-xs text-gray-400">Compare front, back and side transformation</p>
          </div>

          <button
            onClick={() => setShowPhotoModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-bold text-xs rounded-xl border border-gray-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add Photo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden group">
              <div className="h-40 relative">
                <img src={p.photoUrl} alt="Progress" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 text-emerald-400 backdrop-blur-md">
                  {p.tag}
                </span>
              </div>
              <div className="p-2 text-[11px] text-gray-400 font-semibold text-center">
                {p.recordedDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Metric Modal */}
      {showMetricModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-base font-bold text-white">Log Body Measurements</h3>
              <button onClick={() => setShowMetricModal(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveMetric} className="my-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Body Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFat}
                    onChange={(e) => setNewFat(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    value={newChest}
                    onChange={(e) => setNewChest(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={newWaist}
                    onChange={(e) => setNewWaist(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg mt-2 btn-press"
              >
                Save Measurement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Log Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-base font-bold text-white">Add Progress Photo</h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSavePhoto} className="my-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Photo URL / Image Link</label>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Tag / Angle</label>
                <select
                  value={photoTag}
                  onChange={(e) => setPhotoTag(e.target.value)}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs"
                >
                  <option value="FRONT">Front View</option>
                  <option value="BACK">Back View</option>
                  <option value="SIDE">Side View</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg mt-2 btn-press"
              >
                Save Photo Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
