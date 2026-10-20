import { fetchRemote } from '../services/itemRepository';
import { summary } from '../data/lostItems';
async function main() {
  const items = await fetchRemote('api-probe', AbortSignal.timeout(10000));
  console.log(JSON.stringify({ apiPage: 2, limit: 8, received: items.length, firstId: items[0]?.id, summary: summary(items) }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
