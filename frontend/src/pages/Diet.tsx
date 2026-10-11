import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  Droplet,
  Flame,
  Plus,
  RotateCcw,
  Salad,
  Fish,
  Egg,
} from 'lucide-react';

export const Diet: React.FC = () => {
  const { profile } = useAuth();
  const [waterCups, setWaterCups] = useState<number>(5);
  const targetWaterCups = 10; // 2.5L

  // Profile-based calculations or defaults
  const calories = profile?.dailyCalorieTarget || 2200;
  const protein = profile?.dailyProteinTargetGrams || 155;
  const goal = profile?.fitnessGoal || 'MAINTAIN';

  const carbs = Math.round((calories * 0.45) / 4);
  const fats = Math.round((calories * 0.25) / 9);

  return (
    <div className="space-y-5 pb-24 md:pb-8 animate-in fade-in max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="pt-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-orange-500" />
            <span>Diet Coach</span>
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-400 border border-orange-800/60">
            Phase 1 Baseline
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Nutrition planning matched to your body weight and fitness goal ({goal})
        </p>
      </div>

      {/* Daily Macro Targets Card */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Daily Calorie Target</div>
              <div className="text-xl font-black text-white">
                {calories} <span className="text-xs font-normal text-slate-400">kcal</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-800 text-orange-400 border border-slate-700">
            {goal} Strategy
          </span>
        </div>

        {/* 3 Macro Rings / Pills */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Protein</div>
            <div className="text-sm font-black text-orange-400 mt-0.5">{protein}g</div>
            <div className="text-[10px] text-slate-400">~2.0g/kg</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Carbs</div>
            <div className="text-sm font-black text-sky-400 mt-0.5">{carbs}g</div>
            <div className="text-[10px] text-slate-400">Clean Energy</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Healthy Fats</div>
            <div className="text-sm font-black text-amber-400 mt-0.5">{fats}g</div>
            <div className="text-[10px] text-slate-400">Hormonal Health</div>
          </div>
        </div>
      </div>

      {/* Quick 1-Tap Water Hydration Tracker */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Daily Hydration Log</h3>
              <p className="text-[10px] text-slate-400">
                {waterCups * 250}ml of {targetWaterCups * 250}ml target ({waterCups}/{targetWaterCups} glasses)
              </p>
            </div>
          </div>

          <button
            onClick={() => setWaterCups(0)}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1"
            title="Reset today's water"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80">
          <div
            className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (waterCups / targetWaterCups) * 100)}%` }}
          />
        </div>

        {/* 1-Tap Quick Increment Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setWaterCups((prev) => prev + 1)}
            className="flex-1 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+1 Glass (250ml)</span>
          </button>
          <button
            onClick={() => setWaterCups((prev) => prev + 2)}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+Bottle (500ml)</span>
          </button>
        </div>
      </div>

      {/* Suggested Meal Structure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Salad className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clean Fuel Meal Framework</span>
          </h2>
          <span className="text-[10px] text-slate-400">High-Protein Strategy</span>
        </div>

        <div className="space-y-2">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Egg className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Breakfast: Fuel & Recover</h3>
                <p className="text-[11px] text-slate-400">
                  Oatmeal + whey protein, berries, eggs/egg whites (~35g protein)
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Salad className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Lunch: Lean Mass Builder</h3>
                <p className="text-[11px] text-slate-400">
                  Grilled chicken or tofu bowl, brown rice, broccoli & olive oil (~45g protein)
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Dinner: Repair & Rest</h3>
                <p className="text-[11px] text-slate-400">
                  Salmon / lentils, sweet potato, asparagus, pumpkin seeds (~40g protein)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
