const {openp,shot,run}=require('./h.js');
run(async b=>{const pg=await openp(b,1300,{when:'2026-11-14T11:00:00'});await pg.waitForTimeout(500);
await pg.locator('#warCard, .pop-card:has-text("War")').first().click();await pg.clock.runFor(500);await pg.waitForTimeout(500);
console.log(pg.errs);console.log(await pg.evaluate("document.querySelector('.ps-sheet')?.innerText.slice(0,300)"));});
