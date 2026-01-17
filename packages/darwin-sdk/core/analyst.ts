import { runClaude } from '../helpers/claude-helper';
import * as path from 'path';
import { GoogleGenAI } from "@google/genai"
import { AnalyticsSnapshot, AnalysisResult } from '../helpers/analytic-types'

export class Analyst {
  private targetAppPath: string;
  private analyst: GoogleGenAI;

  constructor(targetAppPath?: string) {
    this.targetAppPath = targetAppPath || path.resolve(__dirname, '../../demo-app');
    this.analyst = new GoogleGenAI({});
  }

  async analyze(analytics: AnalyticsSnapshot): Promise<AnalysisResult> {
    const model = "gemini-3-flash-preview";
    const systemPrompt = `
    You are a senior product analyst and growth engineer.

    Your task:
    - Analyze product analytics
    - Identify the MOST impactful user experience problems
    - Base conclusions ONLY on provided data
    - Output STRICT JSON matching the schema
    - Be concise, evidence-driven, and actionable
    `;

      const userPrompt = `
    Analytics snapshot:
    ${JSON.stringify(analytics, null, 2)}

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

  async evolve(prompt: string) {
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
