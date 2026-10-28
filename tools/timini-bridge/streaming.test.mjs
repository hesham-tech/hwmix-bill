import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { preparePrinter, upgradeLegacyP2Streaming, DEFAULT_MODEL } from './desktop-config.mjs';

async function fixture(t) {
 const directory=await mkdtemp(join(tmpdir(),'hwnix-stream-'));
 t.after(async()=>{assert.equal(dirname(resolve(directory)),resolve(tmpdir()));assert.ok(basename(directory).startsWith('hwnix-stream-'));await rm(directory,{recursive:true,force:true})});
 return directory;
}
const profile=stream=>({profile_overrides:{stream,dev_dpi:203,default_image_pipeline:{formats:['bw1']},paper_presets:[{key:'tag_384r',render_width_px:384}]}});
test('P2 export uses verified 96/20 tuning; other models preserve their upstream stream recipe',async t=>{
 const directory=await fixture(t);const execute=async(_cli,args)=>writeFile(args[2],JSON.stringify(profile({chunk_size:180,delay_ms:10})));
 const first=await preparePrinter('fixture.exe',directory,{modelKey:DEFAULT_MODEL,bluetooth:'11:22:33:44:55:66'},execute);
 assert.deepEqual(JSON.parse(await readFile(first.printerConfigPath,'utf8')).profile_overrides.stream,{chunk_size:96,delay_ms:20});
 const other=await preparePrinter('fixture.exe',directory,{modelKey:'other-model',bluetooth:'22:33:44:55:66:77'},execute);
 assert.deepEqual(JSON.parse(await readFile(other.printerConfigPath,'utf8')).profile_overrides.stream,{chunk_size:180,delay_ms:10});
});
test('legacy migration updates only owned P2 96/30 profiles, deduplicates paths, and preserves custom tuning',async t=>{
 const directory=await fixture(t);const legacy=join(directory,'printer-1234-abcd.json');const other=join(directory,'printer-5678-abcd.json');const custom=join(directory,'printer-9999-abcd.json');
 await writeFile(legacy,JSON.stringify(profile({chunk_size:96,delay_ms:30})));await writeFile(other,JSON.stringify(profile({chunk_size:96,delay_ms:30})));await writeFile(custom,JSON.stringify(profile({chunk_size:96,delay_ms:25})));
 const config={modelKey:DEFAULT_MODEL,printerConfigPath:legacy,token:'do-not-change',printers:[{modelKey:DEFAULT_MODEL,printerConfigPath:legacy},{modelKey:'other',printerConfigPath:other},{modelKey:DEFAULT_MODEL,printerConfigPath:custom}]};const before=JSON.stringify(config);
 assert.deepEqual(await upgradeLegacyP2Streaming(config,directory),[legacy]);assert.equal(JSON.stringify(config),before);
 assert.deepEqual(JSON.parse(await readFile(legacy,'utf8')).profile_overrides.stream,{chunk_size:96,delay_ms:20});
 assert.equal(JSON.parse(await readFile(other,'utf8')).profile_overrides.stream.delay_ms,30);assert.equal(JSON.parse(await readFile(custom,'utf8')).profile_overrides.stream.delay_ms,25);
 assert.deepEqual(await upgradeLegacyP2Streaming(config,directory),[]);
});
test('migration leaves custom filenames, files outside the private directory and missing profiles alone',async t=>{
 const directory=await fixture(t);await mkdir(join(directory,'external'));const external=join(directory,'external','printer-1234-abcd.json');const custom=join(directory,'custom.json');
 for(const path of [external,custom])await writeFile(path,JSON.stringify(profile({chunk_size:96,delay_ms:30})));
 assert.deepEqual(await upgradeLegacyP2Streaming({printers:[external,custom,join(directory,'printer-dead.json')].map(printerConfigPath=>({modelKey:DEFAULT_MODEL,printerConfigPath}))},directory),[]);
 for(const path of [external,custom])assert.equal(JSON.parse(await readFile(path,'utf8')).profile_overrides.stream.delay_ms,30);
});
