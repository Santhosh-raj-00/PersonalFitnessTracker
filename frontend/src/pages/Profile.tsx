import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { FitnessGoal, ExperienceLevel } from '../types';
import { User as UserIcon, Settings, Flame, Shield, Check, Save } from 'lucide-react';

const EQUIPMENT_OPTIONS = [
  { id: 'BARBELL', label: 'Barbell & Plates' },
  { id: 'DUMBBELL', label: 'Dumbbells' },
  { id: 'CABLE', label: 'Cable Machine' },
  { id: 'MACHINE', label: 'Gym Machines' },
  { id: 'BODYWEIGHT', label: 'Bodyweight / Pull-up Bar' },
  { id: 'SMITH_MACHINE', label: 'Smith Machine' },
  { id: 'KETTLEBELL', label: 'Kettlebells' },
  { id: 'EZ_BAR', label: 'EZ Curl Bar' },
];

export const Profile: React.FC = () => {
  const { user, profile, updateProfile, logout } = useAuth();

  const [age, setAge] = useState<number>(profile?.age || 26);
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile?.weightKg || 76.5);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile?.fitnessGoal || 'BULK');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile?.experienceLevel || 'INTERMEDIATE');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(
    profile?.availableEquipment ? profile.availableEquipment.split(',') : ['BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT']
  );

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleEquipment = (eqId: string) => {
    if (availableEquipment.includes(eqId)) {
      setAvailableEquipment(availableEquipment.filter((e) => e !== eqId));
    } else {
      setAvailableEquipment([...availableEquipment, eqId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        age,
        heightCm,
        weightKg,
        fitnessGoal,
        experienceLevel,
        availableEquipment: availableEquipment.join(','),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-emerald-400" />
            {user?.fullName ? `${user.fullName}'s Profile` : 'Profile & Fitness Goal'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your physical stats, gym equipment, and fitness targets
          </p>
        </div>

        <button
          onClick={logout}
          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl"
        >
          Sign Out
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            Physical Characteristics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 170)}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Fitness Goal & Experience */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            Primary Goal & Experience Level
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs font-bold"
              >
                <option value="CUT">Weight Loss / Cut</option>
                <option value="BULK">Muscle Gain / Hypertrophy Bulk</option>
                <option value="MAINTAIN">Maintain Weight & Recomp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs font-bold"
              >
                <option value="BEGINNER">Beginner (0 - 1 year)</option>
                <option value="INTERMEDIATE">Intermediate (1 - 3 years)</option>
                <option value="ADVANCED">Advanced (3+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Equipment */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            Available Gym Equipment
          </h2>
          <p className="text-xs text-gray-400">
            Workouts & exercise swaps adapt automatically to equipment in your gym.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {EQUIPMENT_OPTIONS.map((eq) => {
              const isChecked = availableEquipment.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquipment(eq.id)}
                  className={`p-3 rounded-2xl border text-left transition-all text-xs font-bold flex flex-col justify-between ${
                    isChecked
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-md'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="mb-2">{eq.label}</span>
                  <span className="text-[10px] font-bold">
                    {isChecked ? '✓ Available' : '+ Select'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 btn-press"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Preferences</span>
        </button>
      </form>
    </div>
  );
};
