const {openp,shot,run}=require('./h.js');
run(async b=>{for(const w of [390,1300]){const pg=await openp(b,w);await shot(pg,'today_'+w,true);console.log(w,pg.errs.slice(0,5));await pg.close();}});
