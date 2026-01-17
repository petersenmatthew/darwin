import { runClaude } from '../helpers/claude-helper';
import * as path from 'path';

// Hardcoded prompts for testing
const PROMPTS = {
  changeButtonColor: `
Change the Primary button color from blue to purple in src/app/page.tsx.
Just change bg-blue-500 to bg-purple-500.
  `.trim(),

  addListItem: `
Add a fourth item "Item four" to the list in src/app/page.tsx.
  `.trim(),

  updateCardTitle: `
Change the card title from "Card Title" to "Welcome Card" in src/app/page.tsx.
  `.trim(),
};

export class Analyst {
  private targetAppPath: string;

  constructor(targetAppPath?: string) {
    this.targetAppPath = targetAppPath || path.resolve(__dirname, '../../demo-app');
  }

  async evolve(promptKey?: keyof typeof PROMPTS) {
    const prompt = promptKey ? PROMPTS[promptKey] : PROMPTS.changeButtonColor;

    console.log('🧬 Running evolution...');
    console.log('📁 Target:', this.targetAppPath);
    console.log('📝 Prompt:', prompt);
    console.log('---');

    try {
      const result = await runClaude(prompt, this.targetAppPath) as { stdout: string; stderr: string };
      console.log('✅ Done!');
      console.log(result.stdout);
      return result;
    } catch (error) {
      console.error('❌ Failed:', error);
      throw error;
    }
  }

  async runCustomPrompt(prompt: string) {
    console.log('🧬 Running custom prompt...');
    console.log('📁 Target:', this.targetAppPath);

    const result = await runClaude(prompt, this.targetAppPath) as { stdout: string; stderr: string };
    console.log('✅ Done!');
    return result;
  }
}
