// the real post-plan data: walk 14 to 25 Nov and count the Today cards each day
const {openp,shot,run}=require('./h.js');
run(async b=>{const pg=await openp(b,1300,{when:'2026-11-14T07:00:00'});const W=ms=>pg.waitForTimeout(ms);
  const days=['2026-11-13','2026-11-14','2026-11-15','2026-11-16','2026-11-17','2026-11-18','2026-11-19','2026-11-20','2026-11-21','2026-11-22','2026-11-23','2026-11-24','2026-11-25'];
  const T=await pg.evaluate("window.__data.tasks");const subs=Object.values(T).filter(t=>t.parent&&!t.archived);const par=Object.values(T).filter(t=>t.kind==='parent');
  console.log('tasks docs',Object.keys(T).length,'parents',par.length,'subtasks',subs.length,'estimates missing',subs.filter(s=>!s.mins).length);
  let bad=0;
  for(const d of days){
    // move the page to the day by clicking prev/next from today (14 Nov)
    const want=Math.round((Date.parse(d)-Date.parse('2026-11-14'))/864e5);
    await pg.evaluate(`window.__off=window.__off||0`);
    const off=await pg.evaluate("window.__off");const diff=want-off;
    for(let i=0;i<Math.abs(diff);i++){await pg.click(diff>0?'#nextDay':'#prevDay');await pg.clock.runFor(250);}
    await pg.evaluate(`window.__off=${want}`);await W(300);
    const info=await pg.evaluate("(()=>{const top=[...document.querySelectorAll('#cutStack .cs-card[data-id]')].map(c=>c.dataset.id);return {top:top.length,title:document.querySelector('#cutStack .cs-t')?.textContent||null,more:document.querySelector('.cs-more')?.textContent||''}})()");
    // open the full list to count every card of the day
    let n=info.top;if(info.more){await pg.click('.cs-more');await pg.clock.runFor(400);await W(500);n=await pg.evaluate("document.querySelectorAll('.cs-all > .cs-card').length");const subCards=await pg.evaluate("[...document.querySelectorAll('.cs-all > .cs-card')].filter(c=>{const t=window.__data.tasks[c.dataset.id];return t&&t.parent;}).length");if(subCards)bad++;await pg.keyboard.press('Escape');await pg.clock.runFor(400);await W(300);}
    const planned=Object.values(T).filter(t=>t.parent&&!t.archived&&t.date===d).reduce((a,t)=>a+(t.mins||0),0);
    if(n>4)bad++;
    console.log(d,'cards',n,'| steps today',Object.values(T).filter(t=>t.parent&&!t.archived&&t.date===d).length,'| planned min',planned,'| first card:',(info.title||'').slice(0,40));
  }
  console.log(bad?'FAIL some day has more than 4 cards or shows a step as its own card':'PASS every day has 4 or fewer cards and no step is a card on its own');
  console.log('errors',pg.errs.filter(e=>!e.includes('ERR_FAILED')).slice(0,4));
});
