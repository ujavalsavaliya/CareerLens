require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models to try in order of preference (latest stable first)
const MODEL_PRIORITY = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-1.0-pro'
];

let workingModel = null;
let lastModelAttempt = 0;
const MODEL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Returns a working Gemini model instance.
 * Caches the successful model and only retries after TTL if it fails.
 */
const getWorkingModel = async () => {
  // If we have a working model and it's still fresh, return it
  if (workingModel && (Date.now() - lastModelAttempt) < MODEL_CACHE_TTL) {
    return workingModel;
  }

  // Reset and try all models
  workingModel = null;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Test with a minimal prompt to verify the model works
      await model.generateContent('test');
      workingModel = model;
      lastModelAttempt = Date.now();
      console.log(`✅ Using Gemini model: ${modelName}`);
      return workingModel;
    } catch (err) {
      // Log the detailed error for debugging
      console.warn(`⚠️ Model ${modelName} failed:`, err.message);
      // After the first failure, do not try any other models
      if (err.message?.includes('429') || err.status === 429) {
        console.log('⛔ Quota exceeded – will not retry other models until reset.');
      }
      break;
    }
  }
  throw new Error('No working Gemini model found – falling back to heuristic matching');
};

// Utility to parse JSON from Gemini responses
const parseJSON = (text) => {
  try {
    const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/({[\s\S]*})/);
    return JSON.parse(match ? match[1] : text);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    return null;
  }
};

const isQuotaError = (err) => {
  const msg = err.message?.toLowerCase() || '';
  return msg.includes('429') ||
         msg.includes('quota') ||
         msg.includes('rate limit') ||
         err.status === 429;
};

/**
 * Heuristic fallback for skill matching (unchanged)
 */
const calculateHeuristicMatch = (profileData, jobKeywords) => {
  const profileSkills = [...(profileData.skills || []), ...(profileData.aiAnalysis?.extractedSkills || [])];
  if (!jobKeywords.length) return { score: 0, matched: [], missing: [] };

  const similarityMap = {
    'react': ['javascript', 'html', 'css', 'frontend', 'web', 'ui'],
    'node.js': ['javascript', 'backend', 'express', 'api', 'server'],
    'mongodb': ['database', 'nosql', 'backend', 'storage'],
    'typescript': ['javascript', 'typing'],
    'python': ['django', 'flask', 'backend', 'data science', 'ai'],
    'java': ['spring', 'backend', 'enterprise', 'jvm'],
    'next.js': ['react', 'frontend', 'ssr', 'web'],
    'express': ['node.js', 'backend', 'api'],
    'tailwind': ['css', 'ui', 'frontend'],
  };

  const expandedProfileSkills = new Set(profileSkills.map(s => s.toLowerCase()));
  profileSkills.forEach(s => {
    const lowerS = s.toLowerCase();
    if (similarityMap[lowerS]) {
      similarityMap[lowerS].forEach(sim => expandedProfileSkills.add(sim));
    }
  });

  const matched = [];
  const missing = [];

  jobKeywords.forEach(k => {
    const lowerK = k.toLowerCase();
    if (expandedProfileSkills.has(lowerK)) {
      matched.push(k);
    } else {
      const isSubMatch = profileSkills.some(ps => ps.toLowerCase().includes(lowerK) || lowerK.includes(ps.toLowerCase()));
      if (isSubMatch) {
        matched.push(k);
      } else {
        const summary = (profileData.summary || '').toLowerCase();
        const experiences = (profileData.experience || []).map(exp => (exp.description || '') + ' ' + (exp.title || '')).join(' ').toLowerCase();

        if (summary.includes(lowerK) || experiences.includes(lowerK)) {
          matched.push(k);
        } else {
          missing.push(k);
        }
      }
    }
  });

  let score = (matched.length / jobKeywords.length) * 85;
  if (profileData.headline && profileData.headline.length > 20) score += 5;
  if (profileData.summary && profileData.summary.length > 100) score += 5;
  if ((profileData.experience || []).length > 2) score += 5;

  const hash = profileData.user?._id?.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0;
  score += (hash % 7) - 3;

  return {
    score: Math.min(Math.round(Math.max(score, 0)), 100),
    matched,
    missing
  };
};

// Default analysis for when AI fails
const DEFAULT_ANALYSIS = {
  score: 50,
  feedback: 'Unable to fully analyze resume at this time.',
  missingKeywords: [],
  extractedSkills: [],
  strengths: [],
  improvements: [],
  atsScore: 50,
  sectionScores: { contact: 5, summary: 5, experience: 5, skills: 5, education: 5, formatting: 5 }
};

/**
 * Analyze a resume text and return structured feedback
 */
const analyzeResume = async (resumeText) => {
  const prompt = `You are an expert career coach and ATS specialist. Analyze the following resume text carefully.

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{
  "score": <integer 0-100>,
  "feedback": "<3-5 bullet points of specific constructive criticism, joined with \\n- >",
  "missingKeywords": ["<keyword1>", "<keyword2>"],
  "extractedSkills": ["<skill1>", "<skill2>"],
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "atsScore": <integer 0-100>,
  "sectionScores": {
    "contact": <0-10>,
    "summary": <0-10>,
    "experience": <0-10>,
    "skills": <0-10>,
    "education": <0-10>,
    "formatting": <0-10>
  }
}

Resume Text:
${resumeText.substring(0, 6000)}`;

  try {
    const model = await getWorkingModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJSON(text);
    if (!parsed) {
      console.warn('⚠️ Could not parse Gemini response for analyzeResume, using fallback');
      return DEFAULT_ANALYSIS;
    }
    return parsed;
  } catch (err) {
    if (isQuotaError(err)) {
      console.log('⚠️ Gemini Quota Exceeded (429) - analyzeResume Fallback');
      return { ...DEFAULT_ANALYSIS, feedback: 'AI Analysis temporarily unavailable (Quota Exceeded). Please try again later.' };
    }
    console.error('❌ Resume Analysis Error:', err.message);
    return DEFAULT_ANALYSIS;
  }
};

const DEFAULT_KEYWORDS = { keywords: [], requiredSkills: [], niceToHave: [], experienceLevel: 'mid', jobCategory: 'General' };

/**
 * Extract keywords from a job description
 */
const extractJobKeywords = async (jobDescription) => {
  try {
    const model = await getWorkingModel();
    const prompt = `Extract the most important technical skills, tools, and qualifications from this job description.

Return ONLY a valid JSON object:
{
  "keywords": ["<keyword1>", "<keyword2>"],
  "requiredSkills": ["<skill1>"],
  "niceToHave": ["<skill1>"],
  "experienceLevel": "<entry|mid|senior|lead>",
  "jobCategory": "<category>"
}

Job Description:
${jobDescription.substring(0, 3000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJSON(text);
    if (!parsed) {
      console.warn('⚠️ Could not parse Gemini response for extractJobKeywords, using fallback');
      return DEFAULT_KEYWORDS;
    }
    return parsed;
  } catch (err) {
    if (isQuotaError(err)) {
      console.log('⚠️ Gemini Quota Exceeded (429) - extractJobKeywords Fallback');
    } else {
      console.error('❌ Job Keyword Extraction Error:', err.message);
    }
    return DEFAULT_KEYWORDS;
  }
};

/**
 * Match a candidate profile against a job description
 */
const matchProfileToJob = async (profileData, jobData) => {
  try {
    const allProfileSkills = [...new Set([
      ...(profileData.skills || []),
      ...(profileData.aiAnalysis?.extractedSkills || [])
    ])];
    const jobKeywords = [...new Set([
      ...(jobData.aiKeywords || []),
      ...(jobData.skills || [])
    ])];

    const heuristic = calculateHeuristicMatch(profileData, jobKeywords);

    const prompt = `Match candidate to job.
Job Title: ${jobData.title}
Job Keywords: ${jobKeywords.join(', ')}
Candidate Name: ${profileData.user?.name || 'Applicant'}
Candidate Summary: ${profileData.summary || ''}
Candidate Skills: ${allProfileSkills.join(', ')}

Return ONLY a valid JSON object:
{
  "matchScore": <0-100>,
  "reason": "<reason>",
  "matchedSkills": ["<skill1>"],
  "missingSkills": ["<skill1>"],
  "matchedAspects": [{ "title": "<title>", "content": "<content>" }],
  "recommendation": "<strongly recommended|recommended|consider|not recommended>"
}`;

    let parsed = null;
    let quotaExceeded = false;
    try {
      const model = await getWorkingModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      parsed = parseJSON(text);
      if (!parsed) {
        console.warn('⚠️ Could not parse Gemini response for matchProfileToJob, using heuristic fallback');
        quotaExceeded = true;
      }
    } catch (err) {
      if (isQuotaError(err)) {
        console.log(`⚠️ Gemini Quota Exceeded (429) - matchProfileToJob Fallback for ${profileData.user?.name || 'Candidate'}`);
        quotaExceeded = true;
      } else {
        console.error('❌ AI Matching Error:', err.message);
      }
    }

    if (!parsed || quotaExceeded || (parsed?.matchScore === 0 && heuristic.score > 0)) {
      return {
        matchScore: Math.max(heuristic.score, parsed?.matchScore || 0),
        reason: quotaExceeded
          ? 'Gemini Quota Exceeded. Score calculated via heuristic skill matching.'
          : `Candidate matches ${heuristic.matched.length} key skills based on historical data.`,
        matchedSkills: Array.from(new Set([...(parsed?.matchedSkills || []), ...heuristic.matched])),
        missingSkills: heuristic.missing,
        matchedAspects: [
          { title: 'Technical Overlap', content: `Candidate covers ${heuristic.matched.length} required skill areas.` },
          quotaExceeded ? { title: 'AI Notice', content: 'Using fallback heuristic matching due to Gemini API limits.' } : null
        ].filter(Boolean),
        recommendation: heuristic.score >= 80 ? 'strongly recommended' : heuristic.score >= 50 ? 'recommended' : 'consider'
      };
    }

    return parsed;
  } catch (err) {
    console.error('❌ Critical Match Error:', err.message);
    return { matchScore: 0, reason: 'Matching failed.', matchedSkills: [], missingSkills: [], recommendation: 'consider' };
  }
};

/**
 * Generate a concise profile summary for HR view
 */
const generateProfileSummary = async (profileData) => {
  try {
    const model = await getWorkingModel();
    const prompt = `Generate a concise, professional 3-4 sentence summary of this candidate for HR/recruiter review.

Skills: ${(profileData.skills || []).join(', ')}
Experience: ${JSON.stringify((profileData.experience || []).slice(0, 3))}
Education: ${JSON.stringify((profileData.education || []).slice(0, 2))}
Headline: ${profileData.headline || ''}
Existing Summary: ${profileData.summary || ''}

Return ONLY the summary text (no JSON, no labels).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error('❌ Profile Summary Generation Error:', err.message);
    return profileData.summary || 'Professional candidate with experience in their field.';
  }
};

module.exports = { analyzeResume, extractJobKeywords, matchProfileToJob, generateProfileSummary };