import { useEffect, useState } from "react";
import { getAIFeedbackAPI } from "../../api/axiosClient";
import {
  Brain,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  Activity,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function ScoreBar({ label, value, max = 10, color = "bg-primary" }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-2.5">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
          {label}
        </span>
        <span
          className={`text-xs font-black font-display ${color.replace("bg-", "text-")} tracking-tighter`}
        >
          {value} / {max}
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color} shadow-[0_0_12px_rgba(255,255,255,0.1)]`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function AIFeedbackPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIFeedbackAPI()
      .then((r) => setAnalysis(r.data))
      .catch(() => setAnalysis(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-bg-dark p-6 lg:p-10 flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Brain
            size={40}
            className="absolute inset-0 m-auto text-primary animate-pulse"
          />
        </div>
      </div>
    );

  if (!analysis)
    return (
      <div className="min-h-screen bg-bg-dark p-6 lg:p-10 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-bg-card/40 backdrop-blur-xl border border-white/5 p-12 rounded-[48px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-text-muted/20 mx-auto mb-8 border border-dashed border-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <Brain size={56} />
            </div>
            <h3 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter mb-4">
              Neural Data Missing
            </h3>
            <p className="text-text-muted mb-10 font-medium leading-relaxed italic">
              Upload your core professional matrix to initiate deep-layer AI
              analysis and performance scoring.
            </p>
            <Link
              to="/profile"
              className="px-10 py-5 bg-linear-to-r from-primary to-primary-dark text-white font-black rounded-[24px] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              Initialize Upload <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );

  const scoreColor =
    analysis.score >= 80
      ? "text-emerald-400"
      : analysis.score >= 60
        ? "text-amber-400"
        : "text-red-400";
  const scoreBg =
    analysis.score >= 80
      ? "bg-emerald-400"
      : analysis.score >= 60
        ? "bg-amber-400"
        : "bg-red-400";
  const atsColor =
    (analysis.atsScore || 0) >= 80
      ? "text-emerald-400"
      : (analysis.atsScore || 0) >= 60
        ? "text-amber-400"
        : "text-red-400";
  const atsBg =
    (analysis.atsScore || 0) >= 80
      ? "bg-emerald-400"
      : (analysis.atsScore || 0) >= 60
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest mb-4">
              <Activity size={12} className="animate-pulse" /> Neural
              Performance Monitoring
            </div>
            <h1 className="text-3xl lg:text-5xl font-display font-black text-text-primary uppercase tracking-tighter leading-none">
              AI Resume{" "}
              <span className="text-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                Synergy
              </span>
            </h1>
            <p className="text-text-muted text-lg mt-4 font-medium opacity-80 italic">
              Last synchronization:{" "}
              {new Date(analysis.lastAnalyzed).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Overall Score */}
          <div className="lg:col-span-5 bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 lg:p-10 text-center shadow-2xl group relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary via-secondary to-primary" />

            <div className="relative z-10">
              <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.3em] mb-12">
                Composite Talent Index
              </h3>
              <div
                className={`text-[120px] lg:text-[140px] font-display font-black leading-none tracking-tighter ${scoreColor} mb-2 transition-transform duration-700 group-hover:scale-105`}
              >
                {analysis.score}
                <span className="text-4xl text-text-muted/20">%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] mb-8">
                <div
                  className={`h-full rounded-full transition-all duration-2000 ease-out ${scoreBg} shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
                <Sparkles
                  size={18}
                  className="text-primary-light animate-pulse"
                />
                <span className="text-xs font-black text-text-primary uppercase tracking-widest italic leading-relaxed">
                  {analysis.score >= 80
                    ? "Exemplary. Professional matrix reflects elite caliber traits."
                    : analysis.score >= 60
                      ? "Standard. Core competencies detected with optimization potential."
                      : "Critical. Professional matrix requires fundamental reconfiguration."}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column Stats */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ATS Score */}
            <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 flex flex-col justify-between shadow-xl group hover:border-primary/20 transition-all">
              <div>
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" /> Gateway
                  Compatibility
                </h3>
                <div
                  className={`text-6xl font-display font-black ${atsColor} mb-2`}
                >
                  {analysis.atsScore || 0}%
                </div>
                <p className="text-[11px] font-medium text-text-muted italic leading-relaxed">
                  Neural score of compatibility with Automated Talent
                  Synchronization gateways.
                </p>
              </div>
              <div className="mt-8 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${atsBg} transition-all duration-1500`}
                  style={{ width: `${analysis.atsScore || 0}%` }}
                />
              </div>
            </div>

            {/* Quick Pulse Cards */}
            <div className="space-y-8">
              <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 flex items-center gap-6 shadow-xl group hover:bg-white/[0.04] transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary-light border border-primary/20 shrink-0 group-hover:rotate-12 transition-transform">
                  <Target size={24} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">
                    Keywords Identified
                  </div>
                  <div className="text-2xl font-display font-black text-text-primary">
                    {(analysis.extractedSkills?.length || 0) +
                      (analysis.missingKeywords?.length || 0)}
                  </div>
                </div>
              </div>
              <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 flex items-center gap-6 shadow-xl group hover:bg-white/[0.04] transition-all">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary-light border border-secondary/20 shrink-0 group-hover:-rotate-12 transition-transform">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">
                    Impact Velocity
                  </div>
                  <div className="text-2xl font-display font-black text-text-primary tracking-tighter italic">
                    {analysis.score >= 80
                      ? "HIGH"
                      : analysis.score >= 60
                        ? "MED"
                        : "LOW"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Section Breakdown */}
          <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-10 lg:p-12 shadow-2xl">
            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-tighter mb-10 flex items-center gap-3">
              <TrendingUp size={24} className="text-primary" /> Sector
              Decomposition
            </h3>
            {analysis.sectionScores && (
              <div className="space-y-2">
                <ScoreBar
                  label="Contact Clarity"
                  value={analysis.sectionScores.contact || 0}
                  color="bg-indigo-500"
                />
                <ScoreBar
                  label="Pro Synthesis"
                  value={analysis.sectionScores.summary || 0}
                  color="bg-cyan-500"
                />
                <ScoreBar
                  label="Mission History"
                  value={analysis.sectionScores.experience || 0}
                  color="bg-emerald-500"
                />
                <ScoreBar
                  label="Skill Cluster"
                  value={analysis.sectionScores.skills || 0}
                  color="bg-amber-500"
                />
                <ScoreBar
                  label="Academic Base"
                  value={analysis.sectionScores.education || 0}
                  color="bg-violet-500"
                />
                <ScoreBar
                  label="Visual Logic"
                  value={analysis.sectionScores.formatting || 0}
                  color="bg-rose-500"
                />
              </div>
            )}
          </div>

          {/* AI Feedback */}
          <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-white/[0.02] -rotate-12">
              <Zap size={160} />
            </div>
            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-tighter mb-10 flex items-center gap-3 relative z-10">
              <Zap size={24} className="text-amber-400" /> Neural Intelligence
            </h3>
            <div className="space-y-6 relative z-10">
              {(analysis.feedback || "")
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <div key={i} className="flex gap-4 group/line items-start">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/line:bg-primary transition-colors shrink-0" />
                    <p className="text-sm font-medium text-text-muted leading-relaxed group-hover/line:text-text-primary transition-colors italic">
                      {line.replace(/^[-•]\s*/, "")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Keywords */}
          <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 lg:p-10 shadow-2xl">
            <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tighter mb-8 flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" /> Detected
              Sub-Matrix
            </h3>
            <div className="flex flex-wrap gap-3">
              {(analysis.extractedSkills || []).map((s) => (
                <span
                  key={s}
                  className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all cursor-default shadow-sm shadow-emerald-500/10"
                >
                  #{s}
                </span>
              ))}
              {(!analysis.extractedSkills ||
                analysis.extractedSkills.length === 0) && (
                <p className="text-sm text-text-muted/40 font-medium italic italic">
                  No skills quantified.
                </p>
              )}
            </div>
          </div>

          <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 lg:p-10 shadow-2xl">
            <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tighter mb-8 flex items-center gap-3 text-amber-400">
              <AlertCircle size={20} /> Missing Elements
            </h3>
            <div className="flex flex-wrap gap-3">
              {(analysis.missingKeywords || []).map((k) => (
                <span
                  key={k}
                  className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/20 transition-all cursor-default shadow-sm shadow-amber-500/10"
                >
                  {k}
                </span>
              ))}
              {(!analysis.missingKeywords ||
                analysis.missingKeywords.length === 0) && (
                <p className="text-sm text-text-muted/40 font-medium italic">
                  Professional matrix fully saturated.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Improvements */}
        {analysis.improvements && analysis.improvements.length > 0 && (
          <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 lg:p-10 shadow-2xl mb-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-tighter mb-10 flex items-center gap-3 relative z-10">
              <Target size={24} className="text-primary" /> Tactical
              Optimizations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {analysis.improvements.map((imp, i) => (
                <div
                  key={i}
                  className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-primary/30 hover:bg-white/[0.08] transition-all group/item shadow-lg"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary-light mb-6 group-hover/item:bg-primary group-hover/item:text-white transition-all transform group-hover/item:scale-110">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-text-muted leading-relaxed group-hover/item:text-text-primary transition-colors opacity-80">
                    {imp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/profile"
            className="inline-flex items-center gap-4 px-12 py-6 bg-linear-to-r from-primary to-primary-dark text-white font-display font-black text-sm uppercase tracking-[0.4em] rounded-[24px] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all group"
          >
            <Brain
              size={24}
              className="group-hover:rotate-12 transition-transform"
            />
            Initiate Fresh Synchronization
          </Link>
          <p className="mt-8 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50 italic">
            Neural reprocessing requires valid professional documentation in
            PDF/DOCX format.
          </p>
        </div>
      </div>
    </div>
  );
}
