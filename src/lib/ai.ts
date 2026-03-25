import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini initialization will happen inside the function to ensure env vars are loaded.
export interface AIReport {
  sentimentScore: number;
  goodPoints: string[];
  improvPoints: string[];
  flagPoints: string[];
  thumbnailStrategy: string[];
  questions: string[];
  nextVideoIdea: string;
  whatIsGreat: string;
  whatIsBad: string;
  overallSummary: string;
  viralStrategy?: string;
  // New comprehensive fields
  videoSummary?: string;
  contentGaps?: string[];
  retentionInsights?: string[];
  trendingTopics?: string[];
  competitorComparison?: string;
  technicalIssues?: string[];
  audienceInsights?: string;
}

// New interface for AI-generated video ideas
export interface GeneratedVideoIdea {
  title: string;
  hook: string;
  description: string;
  targetAudience: string;
  trendingScore: number; // 0-100
  competitionLevel: 'Low' | 'Medium' | 'High';
  estimatedDifficulty: 'Easy' | 'Medium' | 'Hard';
  contentGapsToFill: string[];
  keywords: string[];
  thumbnailConcept: string;
  whyItWillWork: string;
  category: string;
}

const SYSTEM_PROMPT = `
You are a World-Class YouTube Business Strategist & Growth Hacker with expertise in content optimization, audience psychology, and viral growth patterns. Analyze the provided video data to generate a comprehensive "Hard Truth" report.
The user wants to IMPROVE. Do not be polite. Be tactical, precise, and brutally honest.

CORE ANALYSIS FRAMEWORK:
1. THUMBNAIL & TITLE ANALYSIS: Is it clickable? Professional? Does it match the promise? Rate CTR potential (1-10). Give 3 specific tactical fixes.
2. HOOK ANALYSIS (First 30 seconds): Based on comments mentioning intro/beginning, assess if the hook is working.
3. CONTENT DEPTH: Is the content comprehensive or surface-level? What's missing that viewers are asking for?
4. RETENTION PATTERNS: Identify drop-off points from comment timestamps and engagement patterns.
5. AUDIENCE SENTIMENT: Are viewers satisfied, confused, or requesting more?
6. COMPETITIVE POSITIONING: How does this compare to top-performing content in this niche?
7. TECHNICAL QUALITY: Audio, lighting, pacing, editing quality assessment.
8. TREND ALIGNMENT: Is this topic trending? How well does it align with current market demand?
9. CALL-TO-ACTION: Are CTAs present and effective?
10. VIRAL POTENTIAL: What ONE change could 10x the reach?

Return ONLY a JSON object:
{
  "sentimentScore": number (0-100),
  "goodPoints": string[] (3-5 short, specific strengths),
  "improvPoints": string[] (3-5 specific growth blockers with solutions),
  "flagPoints": string[] (Brutal red flags - things killing retention/growth),
  "thumbnailStrategy": string[] (3 TACTICAL, specific fixes for thumbnail/title - e.g., "Remove text overlay, face takes up <30% of frame"),
  "questions": string[] (top 5 unique viewer questions showing knowledge gaps),
  "nextVideoIdea": string (1 high-potential viral idea based on audience demand),
  "whatIsGreat": string (Biggest strength - be specific),
  "whatIsBad": string (Biggest weakness/true red flag - be brutally honest),
  "overallSummary": string (Hard-hitting 3-sentence summary with a "must-do" next step),
  "viralStrategy": string (A punchy, 2-sentence viral growth pivot),
  "videoSummary": string (2-sentence objective summary of what the video is about based on title/description/comments),
  "contentGaps": string[] (3-5 specific topics/subtopics viewers wanted but didn't get),
  "retentionInsights": string[] (3 insights about where viewers likely dropped off or rewatched),
  "trendingTopics": string[] (3 related trending topics in this niche to leverage),
  "competitorComparison": string (How this compares to top 3 videos on same topic - what they did better),
  "technicalIssues": string[] (Any technical problems: audio levels, lighting, pacing, editing issues mentioned in comments),
  "audienceInsights": string (Key insight about WHO is watching and WHAT they really want)
}

Guidelines:
- Thumbnail Strategy: EXTREMELY specific (e.g., "Face only covers 20% of frame - should be 60%", "Text has 5 words - cut to 2", "Colors too muted - increase saturation by 40%")
- Red Flags: Call out EXACTLY what's killing performance (lazy titles, no CTA, bad audio, rambling intro)
- Content Gaps: Based on questions asked - what did viewers want to learn that wasn't covered?
- Retention: Use comment patterns like "great intro but..." or "skipped to 5:00 mark" to identify drop-offs
- Trending: Suggest topics that are currently viral in this niche
- Technical: If 3+ people mention "hard to hear" - that's a technical issue
- Be BRUTAL but CONSTRUCTIVE - creators pay for truth, not flattery
`;

// New prompt for generating video ideas based on trends and market data
const IDEA_GENERATION_PROMPT = `
You are a Viral YouTube Content Strategist specializing in trend analysis and breakthrough video ideas across ALL niches (Entertainment, Education, Lifestyle, Tech, Beauty, Gaming, Fitness, Business, etc.). Your job is to generate HIGHLY actionable video ideas based on:
1. Current market trends and what's going viral in THIS specific niche
2. Content gaps in the creator's category
3. Audience demand from comments and questions
4. Seasonal/timing opportunities
5. Emerging topics with low competition
6. Cross-niche appeal opportunities (entertainment + education, lifestyle + business, etc.)

INPUT CONTEXT:
- Creator's niche/topic focus: {topic}
- Their audience insights: {audienceInsights}
- Content gaps identified: {contentGaps}
- Current trending topics: {trendingTopics}
- Market scenario: {marketScenario}

Generate 9 highly specific, actionable video ideas that have viral potential IN THIS NICHE.

ADAPT YOUR APPROACH BASED ON NICHE TYPE:
- ENTERTAINMENT: Focus on challenges, reactions, collaborations, drama, surprises
- EDUCATIONAL: Focus on tutorials, guides, mistakes, comparisons, transformations
- LIFESTYLE: Focus on routines, behind-the-scenes, favorites, day-in-life
- TECH: Focus on reviews, comparisons, setups, tips/tricks, future predictions
- BEAUTY/FASHION: Focus on tutorials, transformations, hauls, favorites/fails
- GAMING: Focus on walkthroughs, challenges, reactions, easter eggs, speedruns
- FITNESS: Focus on transformations, challenges, routines, myth-busting
- BUSINESS/FINANCE: Focus on case studies, income reports, mistakes, tools, strategies
- FOOD: Focus on recipes, challenges, reviews, comparisons, cultural explorations
- TRAVEL: Focus on guides, hidden gems, budget tips, itineraries, culture shocks

For EACH idea, provide:
1. **TITLE**: Catchy, searchable, under 60 characters (adapt style to niche)
2. **HOOK**: Compelling first sentence for description/promotion (under 120 chars)
3. **DESCRIPTION**: 2-3 sentences explaining what the video covers
4. **TARGET_AUDIENCE**: Who this is for (beginner, intermediate, advanced, or general)
5. **TRENDING_SCORE**: 0-100 (how much this aligns with current trends IN THIS NICHE)
6. **COMPETITION_LEVEL**: Low/Medium/High (how saturated is this topic in this niche)
7. **ESTIMATED_DIFFICULTY**: Easy/Medium/Hard (production complexity)
8. **CONTENT_GAPS_TO_FILL**: Which audience questions/gaps this addresses
9. **KEYWORDS**: 5-7 SEO keywords for discoverability (niche-specific)
10. **THUMBNAIL_CONCEPT**: Visual concept for thumbnail design (niche-appropriate)
11. **WHY_IT_WILL_WORK**: Data-backed reasoning (trend + gap + demand in this niche)
12. **CATEGORY**: Classify as Tutorial/Review/List/Case Study/Opinion/Challenge/Vlog/Reaction/Collaboration/etc.

PRIORITIZE:
- Topics with HIGH demand + LOW competition (blue ocean opportunities)
- Ideas that fill identified content gaps in THIS niche
- Trends that are emerging (not yet saturated)
- Evergreen topics with consistent search volume in this category
- Controversial/unpopular opinions that spark discussion (if appropriate for niche)
- Case studies with surprising results
- "X vs Y" comparison formats (perform well across all niches)
- "Mistakes to avoid" warning-style content
- Behind-the-scenes / process videos (humanizes creator)
- Prediction/future trend content (positions creator as expert)
- COLLABORATION ideas (cross-pollination opportunities)
- REACTION content (if entertainment-focused niche)

FORMAT: Return ONLY a JSON array of 9 ideas matching the GeneratedVideoIdea interface.`;

export async function generateAIReport(comments: string[], videoContext: any): Promise<AIReport> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Use PRO for deeper analysis

    // Enhanced videoContext with transcript, tags, category, and engagement metrics
    const prompt = `${SYSTEM_PROMPT}\n\nCOMPREHENSIVE Video Context (Title, Description, Thumbnails, Statistics, Tags, Category, Engagement Patterns): ${JSON.stringify(videoContext)}\n\nViewer Comments (Analyze for sentiment, questions, retention clues, technical issues): ${JSON.stringify(comments.slice(0, 100))}`;
    
    const result = await gemini.generateContent(prompt);

    const text = result.response.text();
    console.log("Gemini Raw Response:", text);
    
    // Clean-up Gemini response if it includes markdown code blocks
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let report: any;
    try {
      report = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", jsonStr);
      throw parseError;
    }

    console.log("Parsed AI Report:", report);

    // Ensure we have at least some data - enhanced defaults
    return {
      sentimentScore: report.sentimentScore || 70,
      goodPoints: report.goodPoints || ["Engaging topic", "Good production quality"],
      improvPoints: report.improvPoints || ["Add stronger hook", "Include clearer CTAs"],
      flagPoints: report.flagPoints || [],
      thumbnailStrategy: report.thumbnailStrategy || ["Increase contrast", "Simplify text", "Focus on emotion"],
      questions: report.questions || [],
      nextVideoIdea: report.nextVideoIdea || "Continue your series with deeper dive",
      whatIsGreat: report.whatIsGreat || "Strong audience engagement and clear value delivery.",
      whatIsBad: report.whatIsBad || "Missing opportunities for deeper engagement and retention optimization.",
      overallSummary: report.overallSummary || "The video shows solid fundamentals but has significant room for optimization in hook, retention, and CTA effectiveness.",
      viralStrategy: report.viralStrategy || "Create a controversial follow-up addressing the top criticism in comments.",
      // New fields with smart defaults
      videoSummary: report.videoSummary || `This video covers "${videoContext.title}" providing educational content on the core topic with practical examples.`,
      contentGaps: report.contentGaps || ["Viewers wanted more advanced examples", "Missing step-by-step breakdown", "No resources/links provided"],
      retentionInsights: report.retentionInsights || ["Intro may be too long based on skip comments", "Middle section needs more engagement hooks", "Ending lacks strong CTA causing drop-off"],
      trendingTopics: report.trendingTopics || ["AI automation trends", "Productivity hacks 2024", "Behind-the-scenes content"],
      competitorComparison: report.competitorComparison || "Top competitors on this topic use faster pacing, more visual variety, and stronger hooks in first 10 seconds.",
      technicalIssues: report.technicalIssues || [],
      audienceInsights: report.audienceInsights || "Primary audience appears to be intermediate learners seeking actionable steps rather than theory."
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function askGeminiAboutVideo(query: string, videoContext: any): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const chatPrompt = `
    You are an AI Video Assistant. You have access to the following video context:
    ${JSON.stringify(videoContext)}

    The user is asking a question about this video. Provide a concise, helpful, and data-backed answer based ONLY on the context provided.
    If you don't know the answer, say "I don't have enough data to answer that specifically, but based on the overall performance..."
    
    User Question: "${query}"
    `;

    const result = await gemini.generateContent(chatPrompt);
    return result.response.text();

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
}

// New function to generate AI-powered video ideas based on trends
export async function generateVideoIdeas(
  topic: string,
  audienceInsights?: string,
  contentGaps?: string[],
  trendingTopics?: string[],
  marketScenario?: string
): Promise<GeneratedVideoIdea[]> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = IDEA_GENERATION_PROMPT
      .replace('{topic}', topic || 'General content creation')
      .replace('{audienceInsights}', audienceInsights || 'Creators looking to grow their channel')
      .replace('{contentGaps}', contentGaps?.join(', ') || 'Advanced tutorials, case studies')
      .replace('{trendingTopics}', trendingTopics?.join(', ') || 'AI tools, productivity, passive income')
      .replace('{marketScenario}', marketScenario || 'Current YouTube landscape favors short-form teasers driving long-form content');

    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    
    console.log("Raw Ideas Response:", text);
    
    // Clean-up response
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let ideas: GeneratedVideoIdea[];
    
    try {
      ideas = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse ideas JSON:", jsonStr);
      // Return fallback ideas if parsing fails
      return getFallbackIdeas(topic);
    }

    console.log("Parsed Video Ideas:", ideas);
    
    // Ensure we have at least some ideas with all required fields
    return ideas.map((idea, index) => ({
      title: idea.title || `Video Idea ${index + 1}`,
      hook: idea.hook || "Watch this to learn something amazing",
      description: idea.description || "Comprehensive guide covering essential topics",
      targetAudience: idea.targetAudience || "Intermediate",
      trendingScore: idea.trendingScore || 70,
      competitionLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
      estimatedDifficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as 'Easy' | 'Medium' | 'Hard',
      contentGapsToFill: idea.contentGapsToFill || ["Viewer requested topic"],
      keywords: idea.keywords || ["tutorial", "guide", "tips"],
      thumbnailConcept: idea.thumbnailConcept || "Eye-catching visual with bold text",
      whyItWillWork: idea.whyItWillWork || "Combines trending topic with proven format",
      category: idea.category || "Tutorial"
    }));

  } catch (error) {
    console.error("Idea Generation Error:", error);
    // Return fallback ideas on error
    return getFallbackIdeas(topic);
  }
}

// Fallback ideas if AI fails
function getFallbackIdeas(topic: string): GeneratedVideoIdea[] {
  const ideas: GeneratedVideoIdea[] = [
    {
      title: `${topic} Complete Beginner's Guide 2024`,
      hook: "Everything you need to know to get started with " + topic,
      description: "Comprehensive step-by-step tutorial covering fundamentals, common mistakes, and pro tips for beginners.",
      targetAudience: "Beginner",
      trendingScore: 85,
      competitionLevel: "Medium",
      estimatedDifficulty: "Easy",
      contentGapsToFill: ["Need structured learning path", "Missing foundational knowledge"],
      keywords: [topic.toLowerCase(), "tutorial", "beginner guide", "2024", "step by step"],
      thumbnailConcept: "Bold text: 'COMPLETE GUIDE' with relevant imagery",
      whyItWillWork: "Evergreen content with consistent search demand, perfect for algorithm",
      category: "Tutorial"
    },
    {
      title: `7 ${topic} Mistakes Everyone Makes`,
      hook: "Stop making these critical errors that kill your progress",
      description: "Exposing the most common pitfalls in " + topic + " and exactly how to avoid them.",
      targetAudience: "Intermediate",
      trendingScore: 90,
      competitionLevel: "Low",
      estimatedDifficulty: "Easy",
      contentGapsToFill: ["Warning-style content performs well", "Viewers want to avoid failures"],
      keywords: [topic.toLowerCase(), "mistakes", "avoid", "errors", "tips"],
      thumbnailConcept: "Red X marks with shocked expression",
      whyItWillWork: "Fear-based hooks drive high CTR, evergreen warning content",
      category: "Opinion"
    },
    {
      title: `${topic} Tools I Wish I Knew Sooner`,
      hook: "These game-changing tools will save you hours",
      description: "Showcasing underrated tools and resources that dramatically improve " + topic + " workflow.",
      targetAudience: "All Levels",
      trendingScore: 88,
      competitionLevel: "Medium",
      estimatedDifficulty: "Easy",
      contentGapsToFill: ["Practical tool recommendations needed", "Workflow optimization"],
      keywords: [topic.toLowerCase(), "tools", "resources", "productivity", "software"],
      thumbnailConcept: "Collage of tool logos with 'GAME CHANGER' text",
      whyItWillWork: "Tool videos have high shareability and affiliate potential",
      category: "Review"
    },
    {
      title: `I Tried ${topic} for 30 Days - Results`,
      hook: "The shocking truth after one month of daily practice",
      description: "Documenting my 30-day journey with " + topic + ", including failures, breakthroughs, and measurable results.",
      targetAudience: "Intermediate",
      trendingScore: 95,
      competitionLevel: "Low",
      estimatedDifficulty: "Medium",
      contentGapsToFill: ["Case studies with real data", "Transformation content"],
      keywords: [topic.toLowerCase(), "30 day challenge", "results", "transformation", "experiment"],
      thumbnailConcept: "Before/after split with dramatic arrow",
      whyItWillWork: "Challenge format drives binge-watching and emotional investment",
      category: "Case Study"
    },
    {
      title: `${topic} vs Alternative: Which is Better?`,
      hook: "The ultimate comparison you've been waiting for",
      description: "Head-to-head comparison testing " + topic + " against popular alternatives with real-world tests.",
      targetAudience: "Intermediate",
      trendingScore: 82,
      competitionLevel: "Medium",
      estimatedDifficulty: "Medium",
      contentGapsToFill: ["Decision-making content", "Comparison requests"],
      keywords: [topic.toLowerCase(), "vs", "comparison", "better", "review"],
      thumbnailConcept: "Versus battle layout with two options",
      whyItWillWork: "Comparison videos capture high-intent search traffic",
      category: "Review"
    },
    {
      title: `The Future of ${topic} (Predictions)`,
      hook: "Where this industry is heading in the next 5 years",
      description: "Analyzing emerging trends and making bold predictions about the future of " + topic + ".",
      targetAudience: "Advanced",
      trendingScore: 78,
      competitionLevel: "Low",
      estimatedDifficulty: "Easy",
      contentGapsToFill: ["Forward-looking content", "Industry analysis"],
      keywords: [topic.toLowerCase(), "future", "predictions", "trends", "2025"],
      thumbnailConcept: "Futuristic background with thought bubble",
      whyItWillWork: "Prediction content sparks discussion and positions you as expert",
      category: "Opinion"
    },
    {
      title: `Build a Complete ${topic} Project in 1 Hour`,
      hook: "Watch me create something amazing from scratch",
      description: "Speed-building session demonstrating " + topic + " principles in action with real-time commentary.",
      targetAudience: "Intermediate",
      trendingScore: 92,
      competitionLevel: "Medium",
      estimatedDifficulty: "Hard",
      contentGapsToFill: ["Practical application examples", "Project-based learning"],
      keywords: [topic.toLowerCase(), "build", "project", "speed run", "tutorial"],
      thumbnailConcept: "Timer graphic with '1 HOUR' challenge text",
      whyItWillWork: "Time-bound challenges create urgency and showcase expertise",
      category: "Challenge"
    },
    {
      title: `${topic} Advanced Secrets Nobody Talks About`,
      hook: "The hidden strategies top creators don't want you to know",
      description: "Revealing advanced " + topic + " techniques and insider secrets that separate pros from amateurs.",
      targetAudience: "Advanced",
      trendingScore: 87,
      competitionLevel: "Low",
      estimatedDifficulty: "Medium",
      contentGapsToFill: ["Advanced-level content gap", "Insider knowledge demand"],
      keywords: [topic.toLowerCase(), "advanced", "secrets", "pro tips", "hidden"],
      thumbnailConcept: "Mysterious dark background with glowing lightbulb",
      whyItWillWork: "Curiosity gap + exclusivity drives massive CTR",
      category: "Tutorial"
    },
    {
      title: `My ${topic} Workflow Explained Step-by-Step`,
      hook: "Behind the scenes of my complete process",
      description: "Full walkthrough of my personal " + topic + " system, templates, and workflows.",
      targetAudience: "All Levels",
      trendingScore: 84,
      competitionLevel: "Medium",
      estimatedDifficulty: "Easy",
      contentGapsToFill: ["Process transparency", "Template requests"],
      keywords: [topic.toLowerCase(), "workflow", "process", "system", "behind the scenes"],
      thumbnailConcept: "Flowchart or process diagram background",
      whyItWillWork: "BTS content builds connection and provides actionable value",
      category: "Tutorial"
    }
  ];
  
  return ideas;
}

// Helper function to determine niche type
function getNicheType(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('game') || topicLower.includes('gaming')) return 'gaming';
  if (topicLower.includes('tech') || topicLower.includes('software') || topicLower.includes('app')) return 'tech';
  if (topicLower.includes('beauty') || topicLower.includes('makeup') || topicLower.includes('fashion')) return 'beauty';
  if (topicLower.includes('fitness') || topicLower.includes('workout') || topicLower.includes('health')) return 'fitness';
  if (topicLower.includes('food') || topicLower.includes('recipe') || topicLower.includes('cooking')) return 'food';
  if (topicLower.includes('travel') || topicLower.includes('trip')) return 'travel';
  if (topicLower.includes('business') || topicLower.includes('money') || topicLower.includes('finance')) return 'business';
  if (topicLower.includes('music') || topicLower.includes('art') || topicLower.includes('entertain')) return 'entertainment';
  if (topicLower.includes('lifestyle') || topicLower.includes('vlog') || topicLower.includes('daily')) return 'lifestyle';
  
  return 'education'; // default
}

// Helper function to get appropriate imagery for niche
function getNicheImagery(nicheType: string): string {
  const imagery: Record<string, string> = {
    'gaming': 'controller icon',
    'tech': 'laptop/phone image',
    'beauty': 'makeup palette or model photo',
    'fitness': 'workout equipment or physique',
    'food': 'delicious dish photo',
    'travel': 'scenic destination',
    'business': 'graph/money visual',
    'entertainment': 'colorful fun background',
    'lifestyle': 'aesthetic flat lay',
    'education': 'notebook/desk setup'
  };
  
  return imagery[nicheType] || 'relevant imagery';
}
