import { Analyst } from './core/analyst';

const analyst = new Analyst();

// Run with: npx ts-node evolve.ts [promptKey]
// e.g., npx ts-node evolve.ts changeButtonColor
const promptArg = process.argv[2] as 'changeButtonColor' | 'addListItem' | 'updateCardTitle' | undefined;
analyst.evolve(promptArg);
