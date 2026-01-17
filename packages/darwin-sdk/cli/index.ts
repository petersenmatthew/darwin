#!/usr/bin/env node
import { Command } from 'commander';
import { startDarwin } from '../core/main';

const program = new Command();

program
    .name('darwin')
    .description('DarwinUI: The Interface That Evolves Itself')
    .version('0.0.1');

program
    .command('start')
    .description('Start the Darwin Orchestrator')
    .action(() => {
        console.log('Starting Darwin Orchestrator...');
        startDarwin();
    });

program.parse(process.argv);
