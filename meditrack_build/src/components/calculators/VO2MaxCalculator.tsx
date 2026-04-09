'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function VO2MaxCalculator() {
  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [result, setResult] = useState<{ vo2max: number; fitness: string; color: string } | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(age);
    const rhr = parseFloat(restingHR);
    let mhr = parseFloat(maxHR);

    if (!a || !rhr) return;

    // Estimate max HR if not provided
    if (!mhr) mhr = 220 - a;

    // Uth–Sørensen–Overgaard–Pedersen estimation
    const vo2max = 15.3 * (mhr / rhr);

    let fitness = '';
    let color = '';
    if (vo2max < 30) { fitness = 'Poor'; color = 'text-red-600'; }
    else if (vo2max < 40) { fitness = 'Fair'; color = 'text-amber-600'; }
    else if (vo2max < 50) { fitness = 'Good'; color = 'text-blue-600'; }
    else if (vo2max < 60) { fitness = 'Excellent'; color = 'text-emerald-600'; }
    else { fitness = 'Superior'; color = 'text-violet-600'; }

    setResult({ vo2max: Math.round(vo2max * 10) / 10, fitness, color });
  };

  return (
    <Card>
      <h3 className="font-semibold text-slate-800 mb-4">VO2 Max Estimator</h3>
      <form onSubmit={calculate} className="space-y-3">
        <Input
          label="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g., 30"
          required
        />
        <Input
          label="Resting Heart Rate (bpm)"
          type="number"
          value={restingHR}
          onChange={(e) => setRestingHR(e.target.value)}
          placeholder="e.g., 65"
          required
        />
        <Input
          label="Max Heart Rate (optional)"
          type="number"
          value={maxHR}
          onChange={(e) => setMaxHR(e.target.value)}
          placeholder="Leave blank to estimate"
        />
        <Button type="submit" size="sm" className="w-full">
          Estimate
        </Button>
      </form>
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 text-center">
          <p className="text-3xl font-bold text-slate-800">
            {result.vo2max}
            <span className="text-sm font-normal text-slate-500 ml-1">
              ml/kg/min
            </span>
          </p>
          <p className={`text-sm font-semibold mt-1 ${result.color}`}>
            {result.fitness} Fitness Level
          </p>
        </div>
      )}
    </Card>
  );
}
