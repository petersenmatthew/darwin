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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required");
    }
    this.analyst = new GoogleGenAI({ apiKey });
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

    // Strip markdown code blocks if present
    let jsonText = rawText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    return JSON.parse(jsonText);
  }

  buildUXAgentPrompt(analysis: AnalysisResult): string {
    // Only address the highest priority issue (first one)
    const primaryIssue = analysis.mainProblems[0];
    
    if (!primaryIssue) {
      return `No issues found to address.`;
    }

    return `
  You are an autonomous UX/UI improvement agent.

  ROLE:
  - You specialize in improving user experience and interface clarity
  - You make minimal, high-impact code changes
  - You prioritize accessibility, visual hierarchy, and usability
  - You only change code when justified by evidence

  CRITICAL INSTRUCTION:
  - You MUST address ONLY ONE issue in this task
  - Make ONLY ONE change to fix the single issue below
  - Do NOT attempt to fix multiple issues or make multiple changes
  - Focus entirely on the single issue provided

  CONTEXT:
  The following UX issue was identified from real product analytics:

  Issue:
  - ID: ${primaryIssue.id}
  - Severity: ${primaryIssue.severity}
  - Affected Area: ${primaryIssue.affectedArea}
  - Hypothesis: ${primaryIssue.hypothesis}
  - Evidence:
  ${primaryIssue.evidence.map(e => `  - ${e}`).join('\n')}
  - Recommended Action:
    ${primaryIssue.recommendedAction}

  TASK:
  - Address ONLY this single issue above
  - Make ONLY ONE code change to fix this issue
  - Modify ONLY the relevant file(s) needed for this single fix
  - Keep changes minimal and focused
  - Do NOT refactor unrelated code
  - Do NOT address any other issues

  OUTPUT RULES:
  - Make the change directly in the codebase
  - Do not ask questions
  - Do not explain theory
  - If no change is needed, make no changes
  - Remember: ONE issue, ONE change only

  IMPORTANT - OUTPUT FORMAT:
  After making your changes, you MUST output a JSON object describing what you changed.
  The JSON must be in this exact format and appear at the end of your output:
  
  \`\`\`json
  {
    "changes": [
      {
        "id": "unique-id",
        "component": "ComponentName",
        "description": "Brief description of what was changed",
        "type": "added" | "modified" | "removed",
        "file": "path/to/file.tsx",
        "explanation": "Detailed explanation of how this change addresses the analytics data and user behavior patterns identified"
      }
    ]
  }
  \`\`\`
  
  - Include ALL files you modified, added, or removed
  - The "component" field should be the React component name or feature name
  - The "description" should clearly explain what was changed and why
  - The "type" must be one of: "added", "modified", or "removed"
  - The "file" should be the relative path from the project root
  - The "explanation" must explain how this change directly addresses the analytics data, user behavior patterns, and the specific issue identified. Reference the evidence from the analytics (e.g., "This addresses the low click-through rate on the CTA button by...")
  `.trim();
  }


  async evolve(analysis: AnalysisResult, onStream?: (data: string, type: 'stdout' | 'stderr') => void) {
    const prompt = this.buildUXAgentPrompt(analysis);

    console.log('🧬 Running evolution...');
    console.log('📁 Target:', this.targetAppPath);
    console.log('📝 Prompt:', prompt);
    console.log('---');

    const result = await runClaude(prompt, this.targetAppPath, {
      onStdout: (data) => {
        if (onStream) {
          onStream(data, 'stdout');
        }
        // Also output to console for debugging
        process.stdout.write(data);
      },
      onStderr: (data) => {
        if (onStream) {
          onStream(data, 'stderr');
        }
        // Also output to console for debugging
        process.stderr.write(data);
      },
    }) as {
      stdout: string;
      stderr: string;
    };

    console.log('✅ Done!');
    console.log(result.stdout);
    
    // Parse changes from output
    const changes = this.parseChangesFromOutput(result.stdout);
    
    return {
      ...result,
      changes,
    };
  }

  private parseChangesFromOutput(output: string): any[] {
    try {
      // Look for JSON block in the output
      const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.changes && Array.isArray(parsed.changes)) {
          return parsed.changes;
        }
      }
      
      // Also try to find JSON without code block markers
      const jsonMatch2 = output.match(/\{[\s\S]*"changes"[\s\S]*\}/);
      if (jsonMatch2) {
        const parsed = JSON.parse(jsonMatch2[0]);
        if (parsed.changes && Array.isArray(parsed.changes)) {
          return parsed.changes;
        }
      }
      
      // Try to find JSON at the end of output
      const lines = output.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.includes('"changes"')) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.changes && Array.isArray(parsed.changes)) {
              return parsed.changes;
            }
          } catch (e) {
            // Try to find complete JSON object
            const jsonStart = output.lastIndexOf('{');
            if (jsonStart !== -1) {
              const jsonStr = output.substring(jsonStart);
              const parsed = JSON.parse(jsonStr);
              if (parsed.changes && Array.isArray(parsed.changes)) {
                return parsed.changes;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse changes from output:', error);
    }
    
    return [];
  }
}
