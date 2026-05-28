const PHISHING_KEYWORDS = [
    'login', 'secure', 'verify', 'account', 'banking', 'paypal', 'signin',
    'password', 'update', 'confirm', 'wallet', 'support', 'security', 'urgent'
];

const SHORTENER_HOSTS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];

function analyzeIndicator(indicator) {
    const raw = (indicator || '').trim().toLowerCase();
    const reasons = [];
    let score = 15;

    if (!raw) {
        return {
            verdict: 'Invalid Input',
            suggestedRiskScore: 0,
            suggestedLevel: 'Low',
            reasons: ['Please enter a URL, domain, or IP address.'],
            disclaimer:
                'Preliminary rule-based check only — not a live VirusTotal scan. Submit a full report for admin verification.'
        };
    }

    const hasPhishingKeyword = PHISHING_KEYWORDS.some((k) => raw.includes(k));
    if (hasPhishingKeyword) {
        reasons.push('Contains common phishing-related keywords (e.g. login, verify, secure).');
        score += 40;
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(raw)) {
        reasons.push('Input is an IP address — verify reputation before trusting.');
        score += 20;
    }

    if (raw.startsWith('http://') && !raw.startsWith('https://')) {
        reasons.push('Uses HTTP instead of HTTPS.');
        score += 15;
    }

    if (SHORTENER_HOSTS.some((h) => raw.includes(h))) {
        reasons.push('URL shortener detected — destination is hidden.');
        score += 25;
    }

    if (/\.(xyz|top|click|loan|work|gq|cf|tk)$/i.test(raw)) {
        reasons.push('High-risk TLD pattern detected.');
        score += 20;
    }

    if (raw.includes('@') && raw.includes('.')) {
        reasons.push('Looks like an email or impersonation pattern.');
        score += 25;
    }

    score = Math.min(Math.max(score, 0), 95);

    let verdict = 'Likely Safe / Unknown';
    if (score >= 75) verdict = 'High Risk — Treat as Potentially Malicious';
    else if (score >= 45) verdict = 'Suspicious — Possible Phishing or Fraud';

    let suggestedLevel = 'Low';
    if (score >= 90) suggestedLevel = 'Critical';
    else if (score >= 71) suggestedLevel = 'High';
    else if (score >= 31) suggestedLevel = 'Medium';

    if (reasons.length === 0) {
        reasons.push('No strong phishing indicators found by rule-based scan.');
    }

    return {
        verdict,
        suggestedRiskScore: score,
        suggestedLevel,
        reasons,
        disclaimer:
            'Preliminary check only — submit a full threat report for admin verification before taking action.'
    };
}

module.exports = { analyzeIndicator };
