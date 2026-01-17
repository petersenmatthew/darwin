#!/usr/bin/env node
import { Command } from 'commander';
import { Analyst } from '../core/analyst';

const program = new Command();

program
  .name('darwin')
  .description('DarwinUI: The Interface That Evolves Itself')
  .version('0.0.1');

program
  .command('evolve')
  .description('Trigger an evolution')
  .option('-t, --target <path>', 'Path to target app')
  .option('-p, --prompt <prompt>', 'Custom prompt to run')
  .argument('[promptKey]', 'Preset prompt key: changeButtonColor, addListItem, updateCardTitle')
  .action(async (promptKey, options) => {
    const analyst = new Analyst(options.target);

    if (options.prompt) {
      await analyst.runCustomPrompt(options.prompt);
    } else {
      await analyst.evolve(promptKey);
    }
  });

program.parse(process.argv);
