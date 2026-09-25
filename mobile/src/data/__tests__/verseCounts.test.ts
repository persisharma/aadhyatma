import assert from 'node:assert/strict';
import { test } from 'node:test';

import { achyutashtakamTotal, bhavaniAshtakamTotal, dattaAshtakamTotal, gangashtakamTotal, kalikaAshtakamTotal, lingashtakamTotal, madhurashtakamTotal, mahalakshmiAshtakamTotal, narasimhaAshtakamTotal, radhashtakamTotal, rudrashtakamTotal, shaniAshtakamTotal, subrahmanyaAshtakamTotal, suryaAshtakamTotal } from '../ashtakam';
import { bajrangBaanTotal } from '../bajrang-baan';
import { durgaChalisaCounts } from '../durga-chalisa';
import { durgaStotramTotal } from '../durga-stotram';
import { ganeshChalisaCounts } from '../ganesh-chalisa';
import { ganeshStotramTotal } from '../ganesh-stotram';
import { gayatriChalisaCounts } from '../gayatri-chalisa';
import { hanumanAshtakTotal } from '../hanuman-ashtak';
import { hanumanChalisaTotal } from '../hanuman-chalisa';
import { durgaKavachTotal, ganeshaKavachamTotal, ramaRakshaStotraTotal, shivaKavachamTotal } from '../kavacham';
import { krishnaChalisaCounts } from '../krishna-chalisa';
import { krishnaStotramTotal } from '../krishna-stotram';
import { ramChalisaCounts } from '../ram-chalisa';
import { ramStutiTotal } from '../ram-stuti';
import { ramcharitmanasTotal } from '../ramcharitmanas';
import { saraswatiChalisaCounts } from '../saraswati-chalisa';
import { saraswatiStotramTotal } from '../saraswati-stotram';
import { shivChalisaCounts } from '../shiv-chalisa';
import { shivaStrotamTotal } from '../shiva-strotam';
import { durgaStutiArjunaTotal, krishnaStutiTotal, kuberaStotramTotal, navagrahaStotramTotal } from '../stuti';
import { deviSuktamTotal, narayanaSuktamTotal, purushaSuktamTotal } from '../suktam';
import { sundarkandTotal } from '../sundarkand';
import { valmikiRamayanTotal } from '../valmiki-ramayan';
import { vishnuChalisaCounts } from '../vishnu-chalisa';
import { vishnuSahasranamaTotal } from '../vishnu-sahasranama';
import * as generated from '../verseCounts';

/**
 * `texts.ts` renders every library row's verse count from `verseCounts.ts`, a
 * generated file of 46 integers, so that showing the row does not evaluate the
 * ~2 MB of scripture behind it (see `launchGraph.test.ts` for why that matters).
 *
 * That trade is only safe while the literals match the corpora. This test is
 * the thing that makes it safe: it loads every real corpus — which a test may
 * do freely, unlike the launch path — and fails if any generated number has
 * drifted. When it fails, the fix is to regenerate, never to edit by hand:
 *
 *     npx tsx scripts/gen-verse-counts.mts
 */
test('every generated verse count still matches its corpus', () => {
  const pairs: readonly (readonly [string, unknown, unknown])[] = [
  ['achyutashtakamTotal', achyutashtakamTotal, generated.achyutashtakamTotal],
  ['bajrangBaanTotal', bajrangBaanTotal, generated.bajrangBaanTotal],
  ['bhavaniAshtakamTotal', bhavaniAshtakamTotal, generated.bhavaniAshtakamTotal],
  ['dattaAshtakamTotal', dattaAshtakamTotal, generated.dattaAshtakamTotal],
  ['deviSuktamTotal', deviSuktamTotal, generated.deviSuktamTotal],
  ['durgaChalisaCounts', durgaChalisaCounts, generated.durgaChalisaCounts],
  ['durgaKavachTotal', durgaKavachTotal, generated.durgaKavachTotal],
  ['durgaStotramTotal', durgaStotramTotal, generated.durgaStotramTotal],
  ['durgaStutiArjunaTotal', durgaStutiArjunaTotal, generated.durgaStutiArjunaTotal],
  ['ganeshChalisaCounts', ganeshChalisaCounts, generated.ganeshChalisaCounts],
  ['ganeshStotramTotal', ganeshStotramTotal, generated.ganeshStotramTotal],
  ['ganeshaKavachamTotal', ganeshaKavachamTotal, generated.ganeshaKavachamTotal],
  ['gangashtakamTotal', gangashtakamTotal, generated.gangashtakamTotal],
  ['gayatriChalisaCounts', gayatriChalisaCounts, generated.gayatriChalisaCounts],
  ['hanumanAshtakTotal', hanumanAshtakTotal, generated.hanumanAshtakTotal],
  ['hanumanChalisaTotal', hanumanChalisaTotal, generated.hanumanChalisaTotal],
  ['kalikaAshtakamTotal', kalikaAshtakamTotal, generated.kalikaAshtakamTotal],
  ['krishnaChalisaCounts', krishnaChalisaCounts, generated.krishnaChalisaCounts],
  ['krishnaStotramTotal', krishnaStotramTotal, generated.krishnaStotramTotal],
  ['krishnaStutiTotal', krishnaStutiTotal, generated.krishnaStutiTotal],
  ['kuberaStotramTotal', kuberaStotramTotal, generated.kuberaStotramTotal],
  ['lingashtakamTotal', lingashtakamTotal, generated.lingashtakamTotal],
  ['madhurashtakamTotal', madhurashtakamTotal, generated.madhurashtakamTotal],
  ['mahalakshmiAshtakamTotal', mahalakshmiAshtakamTotal, generated.mahalakshmiAshtakamTotal],
  ['narasimhaAshtakamTotal', narasimhaAshtakamTotal, generated.narasimhaAshtakamTotal],
  ['narayanaSuktamTotal', narayanaSuktamTotal, generated.narayanaSuktamTotal],
  ['navagrahaStotramTotal', navagrahaStotramTotal, generated.navagrahaStotramTotal],
  ['purushaSuktamTotal', purushaSuktamTotal, generated.purushaSuktamTotal],
  ['radhashtakamTotal', radhashtakamTotal, generated.radhashtakamTotal],
  ['ramChalisaCounts', ramChalisaCounts, generated.ramChalisaCounts],
  ['ramStutiTotal', ramStutiTotal, generated.ramStutiTotal],
  ['ramaRakshaStotraTotal', ramaRakshaStotraTotal, generated.ramaRakshaStotraTotal],
  ['ramcharitmanasTotal', ramcharitmanasTotal, generated.ramcharitmanasTotal],
  ['rudrashtakamTotal', rudrashtakamTotal, generated.rudrashtakamTotal],
  ['saraswatiChalisaCounts', saraswatiChalisaCounts, generated.saraswatiChalisaCounts],
  ['saraswatiStotramTotal', saraswatiStotramTotal, generated.saraswatiStotramTotal],
  ['shaniAshtakamTotal', shaniAshtakamTotal, generated.shaniAshtakamTotal],
  ['shivChalisaCounts', shivChalisaCounts, generated.shivChalisaCounts],
  ['shivaKavachamTotal', shivaKavachamTotal, generated.shivaKavachamTotal],
  ['shivaStrotamTotal', shivaStrotamTotal, generated.shivaStrotamTotal],
  ['subrahmanyaAshtakamTotal', subrahmanyaAshtakamTotal, generated.subrahmanyaAshtakamTotal],
  ['sundarkandTotal', sundarkandTotal, generated.sundarkandTotal],
  ['suryaAshtakamTotal', suryaAshtakamTotal, generated.suryaAshtakamTotal],
  ['valmikiRamayanTotal', valmikiRamayanTotal, generated.valmikiRamayanTotal],
  ['vishnuChalisaCounts', vishnuChalisaCounts, generated.vishnuChalisaCounts],
  ['vishnuSahasranamaTotal', vishnuSahasranamaTotal, generated.vishnuSahasranamaTotal],
  ];
  for (const [name, actual, claimed] of pairs) {
    assert.deepEqual(
      claimed,
      actual,
      `verseCounts.${name} is ${JSON.stringify(claimed)} but the corpus says ` +
        `${JSON.stringify(actual)} — regenerate with ` +
        '`npx tsx scripts/gen-verse-counts.mts`',
    );
  }
});

test('verseCounts exports exactly what texts.ts needs, and nothing stale', () => {
  const exported = Object.keys(generated).sort();
  const expected = [
  ['achyutashtakamTotal', achyutashtakamTotal, generated.achyutashtakamTotal],
  ['bajrangBaanTotal', bajrangBaanTotal, generated.bajrangBaanTotal],
  ['bhavaniAshtakamTotal', bhavaniAshtakamTotal, generated.bhavaniAshtakamTotal],
  ['dattaAshtakamTotal', dattaAshtakamTotal, generated.dattaAshtakamTotal],
  ['deviSuktamTotal', deviSuktamTotal, generated.deviSuktamTotal],
  ['durgaChalisaCounts', durgaChalisaCounts, generated.durgaChalisaCounts],
  ['durgaKavachTotal', durgaKavachTotal, generated.durgaKavachTotal],
  ['durgaStotramTotal', durgaStotramTotal, generated.durgaStotramTotal],
  ['durgaStutiArjunaTotal', durgaStutiArjunaTotal, generated.durgaStutiArjunaTotal],
  ['ganeshChalisaCounts', ganeshChalisaCounts, generated.ganeshChalisaCounts],
  ['ganeshStotramTotal', ganeshStotramTotal, generated.ganeshStotramTotal],
  ['ganeshaKavachamTotal', ganeshaKavachamTotal, generated.ganeshaKavachamTotal],
  ['gangashtakamTotal', gangashtakamTotal, generated.gangashtakamTotal],
  ['gayatriChalisaCounts', gayatriChalisaCounts, generated.gayatriChalisaCounts],
  ['hanumanAshtakTotal', hanumanAshtakTotal, generated.hanumanAshtakTotal],
  ['hanumanChalisaTotal', hanumanChalisaTotal, generated.hanumanChalisaTotal],
  ['kalikaAshtakamTotal', kalikaAshtakamTotal, generated.kalikaAshtakamTotal],
  ['krishnaChalisaCounts', krishnaChalisaCounts, generated.krishnaChalisaCounts],
  ['krishnaStotramTotal', krishnaStotramTotal, generated.krishnaStotramTotal],
  ['krishnaStutiTotal', krishnaStutiTotal, generated.krishnaStutiTotal],
  ['kuberaStotramTotal', kuberaStotramTotal, generated.kuberaStotramTotal],
  ['lingashtakamTotal', lingashtakamTotal, generated.lingashtakamTotal],
  ['madhurashtakamTotal', madhurashtakamTotal, generated.madhurashtakamTotal],
  ['mahalakshmiAshtakamTotal', mahalakshmiAshtakamTotal, generated.mahalakshmiAshtakamTotal],
  ['narasimhaAshtakamTotal', narasimhaAshtakamTotal, generated.narasimhaAshtakamTotal],
  ['narayanaSuktamTotal', narayanaSuktamTotal, generated.narayanaSuktamTotal],
  ['navagrahaStotramTotal', navagrahaStotramTotal, generated.navagrahaStotramTotal],
  ['purushaSuktamTotal', purushaSuktamTotal, generated.purushaSuktamTotal],
  ['radhashtakamTotal', radhashtakamTotal, generated.radhashtakamTotal],
  ['ramChalisaCounts', ramChalisaCounts, generated.ramChalisaCounts],
  ['ramStutiTotal', ramStutiTotal, generated.ramStutiTotal],
  ['ramaRakshaStotraTotal', ramaRakshaStotraTotal, generated.ramaRakshaStotraTotal],
  ['ramcharitmanasTotal', ramcharitmanasTotal, generated.ramcharitmanasTotal],
  ['rudrashtakamTotal', rudrashtakamTotal, generated.rudrashtakamTotal],
  ['saraswatiChalisaCounts', saraswatiChalisaCounts, generated.saraswatiChalisaCounts],
  ['saraswatiStotramTotal', saraswatiStotramTotal, generated.saraswatiStotramTotal],
  ['shaniAshtakamTotal', shaniAshtakamTotal, generated.shaniAshtakamTotal],
  ['shivChalisaCounts', shivChalisaCounts, generated.shivChalisaCounts],
  ['shivaKavachamTotal', shivaKavachamTotal, generated.shivaKavachamTotal],
  ['shivaStrotamTotal', shivaStrotamTotal, generated.shivaStrotamTotal],
  ['subrahmanyaAshtakamTotal', subrahmanyaAshtakamTotal, generated.subrahmanyaAshtakamTotal],
  ['sundarkandTotal', sundarkandTotal, generated.sundarkandTotal],
  ['suryaAshtakamTotal', suryaAshtakamTotal, generated.suryaAshtakamTotal],
  ['valmikiRamayanTotal', valmikiRamayanTotal, generated.valmikiRamayanTotal],
  ['vishnuChalisaCounts', vishnuChalisaCounts, generated.vishnuChalisaCounts],
  ['vishnuSahasranamaTotal', vishnuSahasranamaTotal, generated.vishnuSahasranamaTotal],
  ].map(([name]) => name as string).sort();
  assert.deepEqual(exported, expected, 'verseCounts.ts has drifted from its generator');
});
