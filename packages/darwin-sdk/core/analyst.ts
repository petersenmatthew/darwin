import { runClaude } from '../helpers/claude-helper';
import * as path from 'path';
import { GoogleGenAI } from "@google/genai"
import { AnalyticsSnapshot, AnalysisResult } from '../helpers/analytic-types'
import { ThoughtEntry } from './browser-agent';
import { log } from 'console';

export class Analyst {
  private targetAppPath: string;
  private analyst: GoogleGenAI;

  constructor(targetAppPath?: string) {
    this.targetAppPath = targetAppPath || path.resolve(__dirname, '../../demo-app');
    this.analyst = new GoogleGenAI({});
  }

  async analyze(analytics: AnalyticsSnapshot, logic: ThoughtEntry[]): Promise<AnalysisResult> {
    const model = "gemini-3-flash-preview";
    const systemPrompt = `
    You are a senior product analyst and growth engineer.

    Your task:
    - Analyze product analytics and user thoughts
    - Identify the MOST impactful user experience problems (i.e. components)
    - Base conclusions ONLY on provided data
    - Output STRICT JSON matching the schema
    - Be concise, evidence-driven, and actionable
    `;

      const userPrompt = `
    Analytics snapshot:
    ${JSON.stringify(analytics, null, 2)}

    User thought process snapshot:
    ${JSON.stringify(logic, null, 2)}

    JSON schema:
    {
      "summary": string,
      "mainProblems": [
        {
          "id": string,
          "severity": "low" | "medium" | "high" | "critical",
          "evidence": string[],
          "hypothesis": string,
          "recommendedAction": string,
          "affectedArea": string
        }
      ],
      "confidence": number
    }
    `;

    const result = await this.analyst.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const rawText = result.text;

    if (!rawText) {
      return {
        summary: "No result returned",
        mainProblems: [],
        confidence: 0
      };
    }

    return JSON.parse(rawText);
  }

  buildUXAgentPrompt(analysis: AnalysisResult): string {
    return `
  You are an autonomous UX/UI improvement agent.

  ROLE:
  - You specialize in improving user experience and interface clarity
  - You make minimal, high-impact code changes
  - You prioritize accessibility, visual hierarchy, and usability
  - You only change code when justified by evidence

  CONTEXT:
  The following UX issues were identified from real product analytics:

  ${analysis.mainProblems
    .map(
      (p, i) => `
  Issue ${i + 1}:
  - ID: ${p.id}
  - Severity: ${p.severity}
  - Affected Area: ${p.affectedArea}
  - Hypothesis: ${p.hypothesis}
  - Evidence:
  ${p.evidence.map(e => `  - ${e}`).join('\n')}
  - Recommended Action:
    ${p.recommendedAction}
  `
    )
    .join('\n')}

  TASK:
  - Improve the product UX/UI to address the issues above
  - Modify ONLY the relevant files
  - Keep changes minimal and focused
  - Do NOT refactor unrelated code

  OUTPUT RULES:
  - Make the changes directly in the codebase
  - Do not ask questions
  - Do not explain theory
  - If no change is needed, make no changes
  `.trim();
  }


  async evolve(analysis: AnalysisResult) {
    const prompt = this.buildUXAgentPrompt(analysis);

    console.log('🧬 Running evolution...');
    console.log('📁 Target:', this.targetAppPath);
    console.log('📝 Prompt:', prompt);
    console.log('---');

    const result = await runClaude(prompt, this.targetAppPath) as {
      stdout: string;
      stderr: string;
    };

    console.log('✅ Done!');
    console.log(result.stdout);
    return result;
  }
}
