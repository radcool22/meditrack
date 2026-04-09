import { Activity, Shield, Brain, Users, Volume2, FileText } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

const features = [
  { icon: Brain, title: 'AI Analysis', desc: 'GPT-4o powered insights' },
  { icon: Shield, title: 'Secure', desc: 'End-to-end protection' },
  { icon: Users, title: 'Family Profiles', desc: 'Track everyone\'s health' },
  { icon: Volume2, title: 'Multi-language TTS', desc: 'Listen in Hindi & more' },
  { icon: FileText, title: 'OCR', desc: 'Extract from any report' },
  { icon: Activity, title: 'Health Tools', desc: 'BMI, VO2 Max & more' },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MediTrack</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            AI-Powered Medical Report Analysis
          </p>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Understand your health reports in seconds
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">
            Upload any medical report — blood tests, X-rays, prescriptions — and get instant, easy-to-understand insights powered by AI.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <f.icon className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-blue-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-300 text-xs">
            &copy; {new Date().getFullYear()} MediTrack. Your health data is encrypted and secure.
          </p>
        </div>
      </div>

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Medi<span className="text-blue-600">Track</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Sign in with your phone number to continue
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your medical data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}
