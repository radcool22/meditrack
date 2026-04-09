'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CalorieCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState<{ bmr: number; tdee: number } | null>(null);

  const activityMultipliers: Record<string, { label: string; value: number }> = {
    sedentary: { label: 'Sedentary (little/no exercise)', value: 1.2 },
    light: { label: 'Light (1-3 days/week)', value: 1.375 },
    moderate: { label: 'Moderate (3-5 days/week)', value: 1.55 },
    active: { label: 'Very Active (6-7 days/week)', value: 1.725 },
    extreme: { label: 'Extra Active (athletics)', value: 1.9 },
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!a || !w || !h) return;

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * activityMultipliers[activity].value;

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    });
  };

  return (
    <Card>
      <h3 className="font-semibold text-slate-800 mb-4">Calorie Estimator</h3>
      <form onSubmit={calculate} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="30"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="70"
          required
        />
        <Input
          label="Height (cm)"
          type="number"
          step="0.1"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="175"
          required
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Activity Level
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {Object.entries(activityMultipliers).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" className="w-full">
          Calculate
        </Button>
      </form>
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Base Metabolic Rate</p>
              <p className="text-2xl font-bold text-slate-800">{result.bmr}</p>
              <p className="text-xs text-slate-400">kcal/day</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Daily Calories</p>
              <p className="text-2xl font-bold text-blue-600">{result.tdee}</p>
              <p className="text-xs text-slate-400">kcal/day</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
