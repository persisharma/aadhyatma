import {getSanatanTopics,getSanatanTopic,getSanatanReadingPages,searchSanatanMatches} from '../sanatan-parichay';
import {experiences} from '../sanatan-parichay/experience';
import {knowledgeText} from '../sanatan-parichay/knowledge';
import {lessonArtSource} from '../sanatan-parichay/lessonArt';
import {openSanatanRelated} from '@/navigation/sanatanRelated';
import {library} from '../texts';

test('all thirteen lessons have complete answers, definitions, takeaways and resolvable onward content',()=>{
 expect(Object.keys(experiences).sort()).toEqual(getSanatanTopics().map(t=>t.id).sort());
 for(const topic of getSanatanTopics()){
  const e=experiences[topic.id];expect(e.answer.every(Boolean)).toBe(true);expect(e.takeaway.every(Boolean)).toBe(true);expect(e.terms.length).toBeGreaterThan(1);
  for(const term of e.terms)expect([...term.name,...term.meaning].every(Boolean)).toBe(true);
  for(const link of e.related){const target=link.target;
   if(target.kind==='reading')expect(library.find(x=>x.id===target.id&&x.status==='active'&&!x.hidden)).toBeTruthy();
   if(target.kind==='lesson')expect(getSanatanTopic(target.id)?.pages[target.page??0]).toBeTruthy();
   if(target.kind==='gita')expect(target.verse).toBeGreaterThan(0);
  }
 }
});
test.each([['मैत्रेयी','rishis',2],['Maitreyi','rishis',2],['करण','time',0],['karana','time',0],['भाष्य','texts',0],['commentary','texts',0],['पाश','deity',0],['pasha','deity',0],['अक्षर','rishis',0],['गोपुर','temples',0]] as const)('%s opens a taught concept at an exact valid page',(q,id,page)=>{
 expect(searchSanatanMatches(q)[0]).toMatchObject({topic:{id},page});
});
test('complete diagram facts survive narration/sharing and authored source is never truncated',()=>{
 for(const topic of getSanatanTopics()){
  const full=getSanatanReadingPages(topic);expect(full).toBe(getSanatanReadingPages(topic));
  topic.pages.forEach((p,i)=>p.forEach((text,l)=>expect(full[i][l]).toContain(text)));
 }
 expect(knowledgeText('dikpal',1)![0]).toContain('ऊर्ध्व — ब्रह्मा');expect(knowledgeText('dikpal',1)![0]).toContain('अधो — विष्णु');
 expect(knowledgeText('forms',1)![1]).toContain('Jayadeva selection');expect(knowledgeText('forms',1)![1]).toContain('Buddha');
 for(const name of ['Surya','Chandra','Mangala','Budha','Brihaspati','Shukra','Shani','Rahu','Ketu'])expect(getSanatanReadingPages(getSanatanTopic('graha')!)[1][1]).toContain(name);
});
test('related reading actions use the same stack and exact verse indexes',()=>{
 const navigation={push:jest.fn()} as unknown as Parameters<typeof openSanatanRelated>[0];
 openSanatanRelated(navigation,{label:['पाठ','Reading'],target:{kind:'gita',chapter:4,verse:7}});
 expect(navigation.push).toHaveBeenLastCalledWith('GitaReader',{chapter:4,initialIndex:6});
 openSanatanRelated(navigation,{label:['पाठ','Reading'],target:{kind:'reading',id:'ganesh-stotram',chapter:2}});
 expect(navigation.push).toHaveBeenLastCalledWith('GaneshStotramReader',{chapter:2,initialIndex:0});
 openSanatanRelated(navigation,{label:['पाठ','Reading'],target:{kind:'graha',id:'venus'}});
 expect(navigation.push).toHaveBeenLastCalledWith('GrahaReference',{focusGraha:'venus'});
 openSanatanRelated(navigation,{label:['पाठ','Reading'],target:{kind:'reading',id:'tulsi-aarti'}});
 expect(navigation.push).toHaveBeenLastCalledWith('AartiReader',{aartiIndex:20,initialIndex:0});
});
test('unpublished paintings cannot trigger a request or become runtime references',()=>{
 expect(lessonArtSource('deity')).toBeNull();expect(lessonArtSource('plants')).toBeNull();expect(lessonArtSource('unknown')).toBeNull();
});
