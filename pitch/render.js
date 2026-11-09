const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+__dirname+'/deck.html');await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:__dirname+'/out.pdf',width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true});
// overflow check
const o=await p.evaluate(()=>[...document.querySelectorAll('.slide')].map((s,i)=>{const r=[];s.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight+2&&getComputedStyle(e).overflow!=='visible'||e.scrollWidth>e.clientWidth+2&&e.clientWidth>0&&getComputedStyle(e).display!=='inline'&&e.tagName!=='svg'&&e.tagName!=='text'){r.push(e.className||e.tagName)}});const sb=s.getBoundingClientRect();s.querySelectorAll('.card,.bar,.note').forEach(e=>{const r2=e.getBoundingClientRect();if(r2.bottom>sb.bottom-110&&!s.classList.contains('dk'))r.push('LOW:'+e.className)});return (i+1)+':'+r.join(',')}));
console.log(o.join('\n'));await b.close();})();
