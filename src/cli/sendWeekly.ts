import { runDealFlow } from '../index'

async function main() {
    console.log('Starting weekly email workflow...');
    await runDealFlow().catch(err => {
        console.error('Error in weekly email workflow:', err);
    });
    console.log('Weekly email workflow finished.');
}