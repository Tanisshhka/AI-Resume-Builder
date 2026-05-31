import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';

// Initialize Gemini API (fall back to null if no key)
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.error('Failed to initialize Google Generative AI:', error.message);
  }
}

// Helper to check token counts and increment usage
const trackUsage = async (userId) => {
  try {
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { aiTokensUsed: 1 } });
    }
  } catch (err) {
    console.error('Error tracking AI usage:', err.message);
  }
};

// HELPER: Generate using Gemini or fallback Mock
const generateAIContent = async (prompt, systemInstruction = '', isJson = false) => {
  if (genAI) {
    try {
      const modelName = 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
      });

      const fullPrompt = systemInstruction 
        ? `${systemInstruction}\n\nUser Input: ${prompt}` 
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean markdown blocks if returned
      if (isJson) {
        text = text.trim();
        if (text.startsWith('```json')) {
          text = text.substring(7);
        }
        if (text.endsWith('```')) {
          text = text.substring(0, text.length - 3);
        }
        text = text.trim();
        return JSON.parse(text);
      }
      return text;
    } catch (error) {
      console.error('Gemini API call failed, using mock data:', error.message);
      // Fall through to mock
    }
  }

  // MOCK SYSTEM FALLBACKS
  return getMockData(prompt, systemInstruction, isJson);
};

// @desc    Generate AI Professional Summary
// @route   POST /api/ai/summary
// @access  Private
export const generateSummary = async (req, res) => {
  const { skills, experience, education, tone } = req.body;

  try {
    const prompt = `Skills: ${JSON.stringify(skills)}. Experience: ${JSON.stringify(experience)}. Education: ${JSON.stringify(education)}. Tone: ${tone || 'Professional'}`;
    const sys = 'Write a 3-4 sentence professional summary/profile for a resume. Focus on achievements, core skills, and career trajectory. Do not include placeholders like [Your Name].';
    
    const summary = await generateAIContent(prompt, sys, false);
    await trackUsage(req.user?._id);

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI Career Objective
// @route   POST /api/ai/objective
// @access  Private
export const generateObjective = async (req, res) => {
  const { skills, fieldOfStudy, targetRole } = req.body;

  try {
    const prompt = `Skills: ${JSON.stringify(skills)}. Field: ${fieldOfStudy}. Target Role: ${targetRole}`;
    const sys = 'Generate a compelling 2-sentence resume career objective statement targeted towards the specified role. Keep it fresh and forward-looking.';
    
    const objective = await generateAIContent(prompt, sys, false);
    await trackUsage(req.user?._id);

    res.json({ objective });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Recommend Skills
// @route   POST /api/ai/recommend-skills
// @access  Private
export const recommendSkills = async (req, res) => {
  const { skills, jobTitle } = req.body;

  try {
    const prompt = `Current Skills: ${JSON.stringify(skills)}. Job Title: ${jobTitle}`;
    const sys = 'recommend-skills: Identify and recommend 6-8 trending technical or soft skills that are missing but highly relevant for the specified job title. Return list in JSON format as an array of strings: { "recommendedSkills": ["skill1", "skill2", ...] }';
    
    const data = await generateAIContent(prompt, sys, true);
    await trackUsage(req.user?._id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze Resume Score
// @route   POST /api/ai/analyze-score
// @access  Private
export const analyzeScore = async (req, res) => {
  const { resumeData } = req.body;

  try {
    const prompt = `Resume: ${JSON.stringify(resumeData)}`;
    const sys = `analyze-score: Analyze the resume data for structure, detail, grammar, and completeness.
    Return a detailed assessment in JSON format:
    {
      "score": 85,
      "formattingScore": 90,
      "contentScore": 80,
      "strengths": ["Strong action verbs in experience", "Good summary statement"],
      "improvements": ["Add quantitative metrics", "Skills list is missing intermediate levels"],
      "suggestions": ["In the experience section at company X, add numerical details like 'increased efficiency by 20%'.", "Include link to GitHub portfolio."]
    }`;

    const data = await generateAIContent(prompt, sys, true);
    await trackUsage(req.user?._id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ATS Match & Job Description comparison
// @route   POST /api/ai/ats-check
// @access  Private
export const checkAtsCompatibility = async (req, res) => {
  const { resumeData, jobDescription } = req.body;

  try {
    const prompt = `Resume: ${JSON.stringify(resumeData)}\n\nJob Description: ${jobDescription}`;
    const sys = `Perform an ats-check: ATS parser simulation and compare the resume with the Job Description.
    Return the analysis in JSON format:
    {
      "matchPercentage": 75,
      "matchingKeywords": ["React", "TypeScript", "Node.js"],
      "missingKeywords": ["Redux Toolkit", "GraphQL", "Agile methodologies"],
      "atsFormattingAlerts": ["Avoid using double column grids if exporting to standard text scanners", "Remove tables"],
      "optimizationSuggestions": "Add references to State Management and Agile teams within your job history."
    }`;

    const data = await generateAIContent(prompt, sys, true);
    await trackUsage(req.user?._id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate resume from LinkedIn + GitHub profiles
// @route   POST /api/ai/generate-from-profiles
// @access  Private
export const generateFromProfiles = async (req, res) => {
  const { linkedinUrl, githubUrl } = req.body;

  try {
    const prompt = `LinkedIn URL: ${linkedinUrl || 'Not provided'}. GitHub URL: ${githubUrl || 'Not provided'}`;
    const sys = `generate-from-profiles: Based on the LinkedIn and GitHub profile URLs provided, generate a complete professional resume in JSON format. Extract likely skills, experience, projects, and education from what would be found on these profiles. Return:
    {
      "personalInfo": {
        "fullName": "Full Name",
        "title": "Professional Title",
        "email": "professional@email.com",
        "phone": "+1 (555) 000-0000",
        "location": "City, State",
        "website": "",
        "linkedin": "linkedin url provided",
        "github": "github url provided",
        "photo": ""
      },
      "summary": "2-3 sentence professional summary based on the profile data",
      "education": [
        { "institution": "University Name", "degree": "Degree", "fieldOfStudy": "Field", "startDate": "Year", "endDate": "Year", "current": false, "description": "" }
      ],
      "experience": [
        { "company": "Company Name", "position": "Job Title", "location": "City, State", "startDate": "Month Year", "endDate": "Month Year", "current": false, "description": "Role description", "keyAchievements": ["Achievement 1 with metrics", "Achievement 2"] }
      ],
      "skills": [
        { "name": "Skill Name", "level": 4, "category": "Category" }
      ],
      "projects": [
        { "name": "Project Name", "description": "Project description", "url": "", "githubUrl": "", "technologies": ["Tech1", "Tech2"], "role": "Role" }
      ],
      "certifications": [
        { "name": "Cert Name", "issuer": "Issuer", "date": "Year", "url": "" }
      ],
      "achievements": [
        { "title": "Achievement", "description": "Description", "date": "Year" }
      ]
    }
    Make the data realistic and detailed. Use common tech stacks found on GitHub profiles. Create at least 3 work experiences, 8+ skills, and 3+ projects.`;

    const data = await generateAIContent(prompt, sys, true);
    await trackUsage(req.user?._id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Content Improver & Grammar Checker
// @route   POST /api/ai/improve-content
// @access  Private
export const improveContent = async (req, res) => {
  const { text, section } = req.body;

  try {
    const prompt = `Text: "${text}". Section Context: "${section}"`;
    const sys = 'Act as a professional resume editor. Rewrite the provided text to correct grammar, enhance vocabulary, and use high-impact action verbs (STAR format: Situation, Task, Action, Result). Keep the output professional and concise. Return the improved version as plain text.';
    
    const improvedText = await generateAIContent(prompt, sys, false);
    await trackUsage(req.user?._id);

    res.json({ improvedText });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate LinkedIn Headlines
// @route   POST /api/ai/linkedin-headlines
// @access  Private
export const generateLinkedInHeadlines = async (req, res) => {
  const { jobTitle, skills, experienceYears } = req.body;

  try {
    const prompt = `Job Title: ${jobTitle}. Skills: ${skills.join(', ')}. Experience: ${experienceYears} years`;
    const sys = 'Generate linkedin-headlines: 5 catchy, high-impact LinkedIn headlines. Emphasize value and core strengths. Return them in JSON format: { "headlines": ["Headline 1", "Headline 2", ...] }';
    
    const data = await generateAIContent(prompt, sys, true);
    await trackUsage(req.user?._id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Cover Letter
// @route   POST /api/ai/cover-letter
// @access  Private
export const generateCoverLetter = async (req, res) => {
  const { resumeData, companyName, jobTitle, additionalDetails } = req.body;

  try {
    const prompt = `Resume Info: ${JSON.stringify(resumeData.personalInfo)}. Skills: ${JSON.stringify(resumeData.skills)}. Experience: ${JSON.stringify(resumeData.experience)}. Company Name: ${companyName}. Job Title: ${jobTitle}. Extra info: ${additionalDetails || ''}`;
    const sys = 'Write a highly tailored and persuasive cover letter for the specified company and job title based on the candidate\'s profile. Organize with standard professional address headers, opening hook, body showing value, and concluding call-to-action. Keep it between 300 to 450 words.';
    
    const coverLetter = await generateAIContent(prompt, sys, false);
    await trackUsage(req.user?._id);

    res.json({ coverLetter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Interview Questions
// @route   POST /api/ai/interview-prep
// @access  Private
export const generateInterviewQuestions = async (req, res) => {
  const { resumeData, jobTitle } = req.body;

  try {
    const prompt = `Resume: ${JSON.stringify(resumeData)}. Target Role: ${jobTitle || 'Relevant Role'}`;
    const sys = `Generate interview-prep: mock interview questions based on the resume. 
    Provide 5 technical/industry-specific questions and 5 behavioral questions.
    Return in JSON format:
    {
      "technical": [
        { "question": "Question text here?", "expectedPoints": ["Expected answer element 1", "Element 2"] }
      ],
      "behavioral": [
        { "question": "Question text here?", "expectedPoints": ["Expected answer element 1"] }
      ]
    }`;

    const data = await generateAIContent(prompt, sys, true);
    await trackUsage(req.user?._id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================== MOCK FALLBACK DATA PROVIDER ========================
function getMockData(prompt, systemInstruction, isJson) {
  console.log('Serving premium mock AI details...');

  if (isJson) {
    if (systemInstruction.includes('generate-from-profiles')) {
      return {
        personalInfo: {
          fullName: 'Alex Rivera',
          title: 'Senior Full Stack Engineer',
          email: 'alex.rivera@email.com',
          phone: '+1 (415) 555-0192',
          location: 'San Francisco, CA',
          website: 'https://alexrivera.dev',
          linkedin: 'https://linkedin.com/in/alexrivera',
          github: 'https://github.com/alexrivera',
          photo: ''
        },
        summary: 'Results-driven Full Stack Engineer with 5+ years of experience building scalable web applications using React, TypeScript, and Node.js. Passionate about clean architecture, performance optimization, and delivering exceptional user experiences. Proven track record of leading cross-functional teams and shipping products that serve millions of users.',
        education: [
          { institution: 'University of California, Berkeley', degree: 'B.S.', fieldOfStudy: 'Computer Science', startDate: '2016', endDate: '2020', current: false, description: 'Dean\'s List, GPA: 3.8/4.0' }
        ],
        experience: [
          { company: 'Stripe', position: 'Senior Software Engineer', location: 'San Francisco, CA', startDate: 'Jan 2023', endDate: 'Present', current: true, description: 'Lead frontend architecture for the payments dashboard serving 3M+ merchants.', keyAchievements: ['Reduced dashboard load time by 42% through code splitting and lazy loading', 'Built a real-time analytics component processing 10K events/second', 'Mentored 4 junior engineers and established code review standards'] },
          { company: 'Airbnb', position: 'Software Engineer', location: 'San Francisco, CA', startDate: 'Jun 2021', endDate: 'Dec 2022', current: false, description: 'Developed core booking flow features for the guest experience team.', keyAchievements: ['Increased conversion rate by 18% by redesigning the checkout flow', 'Implemented A/B testing framework used across 12 product teams', 'Migrated legacy jQuery components to React, reducing bug reports by 35%'] },
          { company: 'Startup Labs', position: 'Full Stack Developer', location: 'Remote', startDate: 'Aug 2020', endDate: 'May 2021', current: false, description: 'First engineering hire. Built the entire platform from scratch.', keyAchievements: ['Designed and built MVP in 3 months that acquired 5K users in first quarter', 'Set up CI/CD pipeline reducing deployment time from 2 hours to 15 minutes', 'Integrated Stripe payments processing $50K+ monthly recurring revenue'] }
        ],
        skills: [
          { name: 'React', level: 5, category: 'Frontend' },
          { name: 'TypeScript', level: 5, category: 'Languages' },
          { name: 'Node.js', level: 4, category: 'Backend' },
          { name: 'Python', level: 4, category: 'Languages' },
          { name: 'PostgreSQL', level: 4, category: 'Databases' },
          { name: 'AWS', level: 4, category: 'Cloud' },
          { name: 'Docker', level: 3, category: 'DevOps' },
          { name: 'GraphQL', level: 4, category: 'APIs' },
          { name: 'Redis', level: 3, category: 'Databases' },
          { name: 'Tailwind CSS', level: 5, category: 'Frontend' }
        ],
        projects: [
          { name: 'DevFlow', description: 'Open-source developer productivity tool with 2.3K GitHub stars. Real-time collaboration features using WebSockets.', url: 'https://devflow.app', githubUrl: 'https://github.com/alexrivera/devflow', technologies: ['React', 'TypeScript', 'Socket.io', 'PostgreSQL'], role: 'Creator & Lead Developer' },
          { name: 'CloudDeploy', description: 'One-click deployment platform for static sites with automatic SSL and custom domains.', url: '', githubUrl: 'https://github.com/alexrivera/clouddeploy', technologies: ['Next.js', 'AWS Lambda', 'CloudFront', 'DynamoDB'], role: 'Full Stack Developer' },
          { name: 'AI Resume Builder', description: 'AI-powered resume optimization tool using GPT-4 for content suggestions and ATS scoring.', url: 'https://airesume.dev', githubUrl: '', technologies: ['React', 'Node.js', 'OpenAI API', 'MongoDB'], role: 'Solo Developer' }
        ],
        certifications: [
          { name: 'AWS Solutions Architect - Associate', issuer: 'Amazon Web Services', date: '2023', url: '' },
          { name: 'Meta Frontend Developer Professional Certificate', issuer: 'Meta', date: '2022', url: '' }
        ],
        achievements: [
          { title: 'Tech Talk Speaker at ReactConf 2023', description: 'Presented "Scaling React Applications at Stripe" to 2,000+ attendees', date: '2023' },
          { title: 'Open Source Contributor of the Month', description: 'Recognized by the TypeScript community for contributions to DefinitelyTyped', date: '2022' }
        ]
      };
    }

    if (systemInstruction.includes('recommend-skills')) {
      const skillsPool = ['GraphQL', 'Docker', 'Kubernetes', 'Jest', 'AWS (S3/EC2)', 'Redux Toolkit', 'Next.js', 'CI/CD Pipelines', 'Tailwind CSS', 'TypeScript'];
      return {
        recommendedSkills: skillsPool.sort(() => 0.5 - Math.random()).slice(0, 6)
      };
    }

    if (systemInstruction.includes('analyze-score')) {
      return {
        score: 78,
        formattingScore: 82,
        contentScore: 75,
        strengths: [
          'Solid list of technical skills and certifications',
          'Professional summary has clear focus and outlines experience',
          'Academic achievements are properly structured'
        ],
        improvements: [
          'Add quantitative metrics in experience bullet points (e.g. %, $ values)',
          'Provide more detail for custom projects',
          'Include links to active GitHub or live application projects'
        ],
        suggestions: [
          'For your most recent position, replace general statements with impact statements (e.g., "Led team of 4 to deploy feature X, accelerating release cycles by 15%").',
          'Add key certifications URL validation references.',
          'Introduce a clear heading spacing hierarchy.'
        ]
      };
    }

    if (systemInstruction.includes('ats-check')) {
      return {
        matchPercentage: 72,
        matchingKeywords: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL'],
        missingKeywords: ['Redux Toolkit', 'System Design', 'Agile Scrum', 'CI/CD'],
        atsFormattingAlerts: [
          'Verify that text columns are in a standard read flow.',
          'Ensure there are no text characters embedded in graphic shapes.'
        ],
        optimizationSuggestions: 'Inject the keywords: "Redux Toolkit", "Agile SCRUM methodologies", and "Unit Testing" in your Experience bullet points to pass automated filters.'
      };
    }

    if (systemInstruction.includes('linkedin-headlines')) {
      return {
        headlines: [
          'Senior Software Engineer | React & Node.js Specialist | Building High-Performance SaaS Platforms',
          'TypeScript & Frontend Architect | Passionate about UX/UI and Scale | Ex-Tech Lead',
          'Full Stack Developer | Building User-First Web Applications | React • Node • Cloud Technologies',
          'Software Engineer | Specialized in Responsive Apps and Performance Tuning',
          'Full Stack Engineer | React Ecosystem Specialist | Engineering scalable web applications'
        ]
      };
    }

    if (systemInstruction.includes('interview-prep')) {
      return {
        technical: [
          { 
            question: 'How do you optimize state management in large-scale React applications?', 
            expectedPoints: ['Explain React Context performance traps', 'Detail Redux selectors and memoization', 'Compare Redux with Zustand or recoil'] 
          },
          { 
            question: 'Explain the event loop and asynchronous operation handling in Node.js.', 
            expectedPoints: ['Define Call Stack, Web APIs, Task Queue, Microtasks', 'Explain non-blocking I/O operations'] 
          },
          { 
            question: 'How do you handle database indexing and queries optimization in MongoDB?', 
            expectedPoints: ['Discuss single and compound indexes', 'Explain query analysis with explain()', 'Describe index size constraints'] 
          }
        ],
        behavioral: [
          { 
            question: 'Describe a situation where you had a disagreement with a team member. How did you resolve it?', 
            expectedPoints: ['Active listening', 'Objective facts evaluation', 'Compromise alignment with project requirements'] 
          },
          { 
            question: 'Tell me about a challenging project deadline and how you managed to deliver on time.', 
            expectedPoints: ['Prioritization (MoSCoW rule)', 'Proactive stakeholder communication', 'Agile adjustments'] 
          }
        ]
      };
    }

    return {};
  } else {
    // Plain Text Responses
    if (systemInstruction.includes('professional summary')) {
      return 'Results-driven and highly skilled Professional with extensive expertise in creating and managing web solutions. Proven track record of leveraging modern JavaScript frameworks (React, Node.js) and database structures to architect scalable, high-performance applications. Excellent collaborator with solid experience mentoring junior developers and driving agile sprint objectives.';
    }

    if (systemInstruction.includes('career objective')) {
      return 'Aspiring professional seeking a challenging role to utilize advanced engineering skills and contribute to software innovation, while continuing to grow technical expertise in full-stack ecosystems.';
    }

    if (systemInstruction.includes('cover letter')) {
      return `Dear Hiring Manager,

I am writing to express my strong interest in the open position at your company. With a solid foundation in software engineering and extensive experience developing responsive, accessible web applications, I am confident in my ability to make an immediate impact on your team.

Throughout my career, I have specialized in building robust full-stack platforms using React, TypeScript, and Node.js. In my previous roles, I have consistently optimized performance, increased core application speed, and collaborated with cross-functional product teams to design rich, premium client interfaces. I take pride in writing clean, well-tested code and implementing intuitive user experiences.

I am eager to bring my background in modern system architectures and my passion for state-of-the-art SaaS designs to your organization. Thank you for your time and consideration. I look forward to discussing how my skills align with your engineering goals.

Sincerely,
[Candidate Name]`;
    }

    if (systemInstruction.includes('improve-content') || systemInstruction.includes('editor')) {
      return 'Spearheaded development of scalable web features, improving response times by 32% and enhancing user engagement with intuitive, mobile-responsive layouts.';
    }

    return 'Successfully implemented full-stack web solutions and optimized performance.';
  }
}
