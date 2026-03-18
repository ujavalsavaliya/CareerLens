import { Link } from 'react-router-dom';
import { Zap, CheckCircle, Star } from 'lucide-react';

const plans = [
    {
        name: 'Free', price: '$0', period: '/forever', color: '#6b7280',
        features: ['5 job applications/month', 'Basic AI resume score', 'Job search & matching', 'Standard profile'],
        cta: 'Current Plan', disabled: true
    },
    {
        name: 'Pro', price: '$9', period: '/month', color: '#6366f1', popular: true,
        features: ['Unlimited applications', 'Full AI resume analysis', 'Personalized job recommendations', 'Priority in HR searches', 'Certificate upload', 'Who viewed your profile'],
        cta: 'Upgrade to Pro'
    },
    {
        name: 'Enterprise', price: '$29', period: '/month', color: '#f59e0b',
        features: ['Everything in Pro', 'Unlimited AI analyses', 'AI interview preparation', 'Career coaching sessions', 'Dedicated support', 'Resume rewriting service'],
        cta: 'Get Enterprise'
    }
];

export default function PremiumPage() {
    return (
        <div className="page-container animate-fade-in" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#fcd34d', marginBottom: 16 }}>
                    <Star size={12} /> Premium Plans
                </span>
                <h1 style={{ fontSize: 40, fontFamily: 'var(--font-display)', marginBottom: 12 }}>
                    Supercharge Your <span className="gradient-text-amber">Career Growth</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>Unlock the full power of AI-driven career tools.</p>
            </div>

            <div className="grid-3">
                {plans.map(plan => (
                    <div key={plan.name} className="glass-card" style={{ padding: 28, position: 'relative', border: plan.popular ? `1px solid ${plan.color}40` : undefined }}>
                        {plan.popular && (
                            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-1)', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
                                Most Popular
                            </div>
                        )}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: plan.color, marginBottom: 8 }}>{plan.name}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-display)', color: plan.color }}>{plan.price}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{plan.period}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                            {plan.features.map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={15} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }} /> {f}
                                </div>
                            ))}
                        </div>
                        <button className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-ghost'}`} disabled={plan.disabled}
                            style={plan.popular ? { background: 'var(--gradient-1)' } : {}}>
                            <Zap size={15} /> {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
