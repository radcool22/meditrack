'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (!w || !h) return;

    const bmi = w / (h * h);
    let category = '';
    let color = '';

    if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-600'; }
    else if (bmi < 25) { category = 'Normal'; color = 'text-emerald-600'; }
    else if (bmi < 30) { category = 'Overweight'; color = 'text-amber-600'; }
    else { category = 'Obese'; color = 'text-red-600'; }

    setResult({ bmi: Math.round(bmi * 10) / 10, category, color });
  };

  return (
    <Card>
      <h3 className="font-semibold text-slate-800 mb-4">BMI Calculator</h3>
      <form onSubmit={calculate} className="space-y-3">
        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="e.g., 70"
          required
        />
        <Input
          label="Height (cm)"
          type="number"
          step="0.1"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="e.g., 175"
          required
        />
        <Button type="submit" size="sm" className="w-full">
          Calculate
        </Button>
      </form>
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 text-center">
          <p className="text-3xl font-bold text-slate-800">{result.bmi}</p>
          <p className={`text-sm font-semibold mt-1 ${result.color}`}>
            {result.category}
          </p>
        </div>
      )}
    </Card>
  );
}
