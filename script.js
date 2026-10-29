
const fdrs = [
 {id:"FDR-2024-0182",inst:"Shivam Institute of Technology",bank:"State Bank of India",amount:2500000,issue:"2024-11-15",maturity:"2026-11-10",status:"Expiring Soon",note:"Maturity approaching"},
 {id:"FDR-2025-0071",inst:"North Valley Technical College",bank:"Punjab National Bank",amount:1800000,issue:"2025-02-12",maturity:"2027-02-12",status:"Pending Review",note:"Renewal document awaited"},
 {id:"FDR-2025-0214",inst:"Ganga Institute of Engineering",bank:"Canara Bank",amount:3200000,issue:"2025-04-20",maturity:"2027-04-20",status:"Verified",note:"Verified by authorized officer"},
 {id:"FDR-2025-0338",inst:"Riverside College of Technology",bank:"Bank of Baroda",amount:1500000,issue:"2025-06-08",maturity:"2027-06-08",status:"Discrepancy",note:"Entered amount requires comparison with document"},
 {id:"FDR-2026-0026",inst:"Eastern Technical University",bank:"Union Bank of India",amount:4000000,issue:"2026-01-05",maturity:"2028-01-05",status:"Verified",note:"Record complete"},
 {id:"FDR-2026-0063",inst:"National College of Applied Engineering",bank:"HDFC Bank",amount:2750000,issue:"2026-03-18",maturity:"2028-03-18",status:"Verified",note:"Record complete"}
];
let auditEvents = [
 {time:"29 Oct 2026, 10:14",actor:"AICTE Officer",action:"Viewed record",record:"FDR-2024-0182",detail:"Opened record summary"},
 {time:"29 Oct 2026, 09:42",actor:"System (demo)",action:"Deadline alert",record:"FDR-2024-0182",detail:"Maturity reminder displayed"},
 {time:"28 Oct 2026, 16:30",actor:"AICTE Officer",action:"Scrutiny note added",record:"FDR-2025-0338",detail:"Amount discrepancy flagged"},
 {time:"28 Oct 2026, 12:06",actor:"Institution (demo)",action:"Document submitted",record:"FDR-2025-0071",detail:"Renewal record awaits review"}
];
let requests = [
 {id:"REL-2026-0031",inst:"Ganga Institute of Engineering",fdr:"FDR-2023-0022",type:"Release",date:"2026-10-25",status:"Pending Review"},
 {id:"REL-2026-0028",inst:"Riverside College of Technology",fdr:"FDR-2022-0140",type:"Refund",date:"2026-10-19",status:"More Information"},
 {id:"REL-2026-0024",inst:"Eastern Technical University",fdr:"FDR-2021-0094",type:"Release",date:"2026-10-10",status:"Approved"}
];
const institutions = [
 {id:"INST-00128",name:"Shivam Institute of Technology",state:"Uttar Pradesh",count:8,pending:2,status:"Active"},
 {id:"INST-00142",name:"North Valley Technical College",state:"Uttarakhand",count:5,pending:1,status:"Active"},
 {id:"INST-00175",name:"Ganga Institute of Engineering",state:"Uttar Pradesh",count:12,pending:0,status:"Active"},
 {id:"INST-00203",name:"Riverside College of Technology",state:"Madhya Pradesh",count:6,pending:2,status:"Active"},
 {id:"INST-00241",name:"Eastern Technical University",state:"Bihar",count:9,pending:0,status:"Active"},
 {id:"INST-00289",name:"National College of Applied Engineering",state:"Rajasthan",count:4,pending:0,status:"Active"}
];
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtMoney(n){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n)}
function fmtDate(s){if(!s)return '—';const d=new Date(s+'T00:00:00');return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function statusPill(s){const cls={'Verified':'green','Pending Review':'blue','Expiring Soon':'amber','Discrepancy':'red','Renewed':'purple','Released':'gray','Approved':'green','More Information':'amber','Active':'green'}[s]||'gray';return `<span class="pill ${cls}">${escapeHTML(s)}</span>`}
function recordRows(list,extended=false){if(!list.length)return `<tr><td colspan="${extended?7:6}" class="empty">No matching records found.</td></tr>`;return list.map(r=>`<tr><td><div class="fdr-name"><strong>${escapeHTML(r.id)}</strong><small>${escapeHTML(r.inst)}</small></div></td><td><div class="bank-cell"><strong>${escapeHTML(r.bank)}</strong><small>Institution-submitted</small></div></td><td class="amount">${fmtMoney(r.amount)}</td>${extended?`<td>${fmtDate(r.issue)}</td>`:''}<td>${fmtDate(r.maturity)}</td><td>${statusPill(r.status)}</td><td><button class="row-actions" onclick="viewRecord('${escapeHTML(r.id)}')">View ↗</button></td></tr>`).join('')}
function renderTables(){
 const q=(document.getElementById('dashboard-search')?.value||'').toLowerCase();
 const st=document.getElementById('dashboard-status')?.value||'';
 const filtered=fdrs.filter(r=>(`${r.id} ${r.inst} ${r.bank}`.toLowerCase().includes(q))&&(!st||r.status===st));
 document.getElementById('dashboard-table').innerHTML=recordRows(filtered.slice(0,5));
 const rq=(document.getElementById('records-search')?.value||'').toLowerCase();
 const rs=document.getElementById('records-status')?.value||'';
 const full=fdrs.filter(r=>(`${r.id} ${r.inst} ${r.bank}`.toLowerCase().includes(rq))&&(!rs||r.status===rs));
 document.getElementById('records-table').innerHTML=recordRows(full,true);
 const review=fdrs.filter(r=>['Pending Review','Discrepancy'].includes(r.status));
 document.getElementById('verification-table').innerHTML=review.length?review.map(r=>`<tr><td><div class="fdr-name"><strong>${escapeHTML(r.id)}</strong><small>${escapeHTML(r.inst)}</small></div></td><td>${fmtDate(r.issue)}</td><td>${r.status==='Discrepancy'?'<span class="pill red">Mismatch flagged</span>':'<span class="pill blue">Awaiting scrutiny</span>'}</td><td>${statusPill(r.status)}</td><td><button class="btn" onclick="reviewRecord('${escapeHTML(r.id)}')">Review</button></td></tr>`).join(''):'<tr><td colspan="5" class="empty">Verification queue is clear.</td></tr>';
 document.getElementById('queue-mini').innerHTML=review.slice(0,3).map(r=>`<div class="mini-row"><div><strong>${escapeHTML(r.inst)}</strong><small>${escapeHTML(r.id)}</small></div>${statusPill(r.status)}</div>`).join('')||'<div class="empty">No pending reviews.</div>';
 const upcoming=fdrs.filter(r=>r.status==='Expiring Soon'||(new Date(r.maturity)-new Date())/(1000*60*60*24)<90).slice(0,3);
 document.getElementById('maturity-mini').innerHTML=upcoming.map(r=>`<div class="mini-row"><div><strong>${escapeHTML(r.inst)}</strong><small>Maturity: ${fmtDate(r.maturity)}</small></div><span class="pill amber">${Math.max(0,Math.ceil((new Date(r.maturity)-new Date())/(1000*60*60*24)))} days</span></div>`).join('')||'<div class="empty">No upcoming maturities in sample data.</div>';
 document.getElementById('stat-total').textContent=(1284+Math.max(0,fdrs.length-6)).toLocaleString('en-IN');
 document.getElementById('stat-maturing').textContent=38+fdrs.filter(r=>r.status==='Expiring Soon').length-1;
 document.getElementById('stat-pending').textContent=17+fdrs.filter(r=>r.status==='Pending Review'||r.status==='Discrepancy').length-2;
 document.getElementById('verify-count').textContent=fdrs.filter(r=>r.status==='Pending Review').length;
 document.getElementById('discrepancy-count').textContent=fdrs.filter(r=>r.status==='Discrepancy').length;
 document.getElementById('report-total').textContent=fdrs.length;
 document.getElementById('report-pending').textContent=fdrs.filter(r=>['Pending Review','Discrepancy'].includes(r.status)).length;
 document.getElementById('audit-count').textContent=auditEvents.length;
 renderAudit();
}
function renderRequests(){const filter=document.getElementById('request-filter')?.value||'';const list=requests.filter(r=>!filter||r.status===filter);document.getElementById('requests-table').innerHTML=list.map(r=>`<tr><td><strong>${escapeHTML(r.id)}</strong></td><td>${escapeHTML(r.inst)}</td><td>${escapeHTML(r.fdr)}</td><td>${escapeHTML(r.type)}</td><td>${fmtDate(r.date)}</td><td>${statusPill(r.status)}</td><td><button class="row-actions" onclick="showToast('Request ${escapeHTML(r.id)} opened in demo view.')">View ↗</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">No requests match this filter.</td></tr>'}
function renderInstitutions(){const q=(document.getElementById('institution-search')?.value||'').toLowerCase();const list=institutions.filter(i=>`${i.id} ${i.name} ${i.state}`.toLowerCase().includes(q));document.getElementById('institutions-table').innerHTML=list.map(i=>`<tr><td>${escapeHTML(i.id)}</td><td><strong>${escapeHTML(i.name)}</strong></td><td>${escapeHTML(i.state)}</td><td>${i.count}</td><td>${i.pending?`<span class="pill amber">${i.pending} pending</span>`:'<span class="pill green">None</span>'}</td><td>${statusPill(i.status)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No institutions found.</td></tr>'}
function renderAudit(){document.getElementById('audit-table').innerHTML=auditEvents.map(e=>`<tr><td>${escapeHTML(e.time)}</td><td>${escapeHTML(e.actor)}</td><td>${escapeHTML(e.action)}</td><td>${escapeHTML(e.record)}</td><td>${escapeHTML(e.detail)}</td></tr>`).join('')}
function navigate(page){document.querySelectorAll('.page-view').forEach(p=>p.classList.remove('active'));document.getElementById('page-'+page).classList.add('active');document.querySelectorAll('.nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const label={dashboard:'Dashboard',records:'FDR Repository',verification:'Verification Queue',requests:'Release Requests',institutions:'Institutions',reports:'Reports & Audit',settings:'Settings'}[page];document.getElementById('crumb-label').textContent=label;window.scrollTo({top:0,behavior:'smooth'});if(page==='requests')renderRequests();if(page==='institutions')renderInstitutions();if(page==='reports')renderAudit()}
document.querySelectorAll('.nav button[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
function showToast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function openModal(){document.getElementById('fdr-modal').classList.add('show')}
function closeModal(){document.getElementById('fdr-modal').classList.remove('show');document.getElementById('fdr-form').reset()}
document.getElementById('fdr-modal').addEventListener('click',e=>{if(e.target.id==='fdr-modal')closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
document.getElementById('fdr-form').addEventListener('submit',e=>{
 e.preventDefault();
 const issue=document.getElementById('issue-date').value,maturity=document.getElementById('maturity-date').value;
 if(new Date(maturity)<=new Date(issue)){showToast('Maturity date must be after the issue date.');return}
 const id=document.getElementById('fdr-number').value.trim();
 if(fdrs.some(r=>r.id.toLowerCase()===id.toLowerCase())){showToast('That FDR reference already exists in the demo list.');return}
 const file=document.getElementById('document').files[0];
 const r={id,inst:document.getElementById('institution').value.trim(),bank:document.getElementById('bank').value.trim(),amount:Number(document.getElementById('amount').value),issue,maturity,status:'Pending Review',note:document.getElementById('notes').value.trim()||'Newly submitted record'};
 fdrs.unshift(r);
 auditEvents.unshift({time:new Date().toLocaleString('en-IN'),actor:'AICTE Officer (demo)',action:'Created FDR record',record:id,detail:file?'File selected: '+file.name:'Record added without a document'});
 closeModal();renderTables();showToast('FDR record added to this browser session and marked Pending Review.');navigate('records');
});
function viewRecord(id){const r=fdrs.find(x=>x.id===id);if(!r)return;showToast(`${r.id} · ${r.inst} · ${fmtMoney(r.amount)} · ${r.status}. ${r.note||''}`);auditEvents.unshift({time:new Date().toLocaleString('en-IN'),actor:'AICTE Officer (demo)',action:'Viewed record',record:id,detail:'Opened record summary'});renderAudit()}
function reviewRecord(id){const r=fdrs.find(x=>x.id===id);if(!r)return;const choice=prompt(`Review ${id}\\nInstitution: ${r.inst}\\nCurrent status: ${r.status}\\n\\nEnter V to mark reviewed/verified, or R to keep flagged for further review.\\nThis is a demo action only.`);if(!choice)return;if(choice.trim().toLowerCase()==='v'){r.status='Verified';r.note='Marked verified in prototype by user action';auditEvents.unshift({time:new Date().toLocaleString('en-IN'),actor:'AICTE Officer (demo)',action:'Marked verified',record:id,detail:'Demo status change; not a bank verification'});renderTables();showToast('Status updated in the prototype. This does not confirm FDR authenticity.')}else if(choice.trim().toLowerCase()==='r'){r.status='Discrepancy';r.note='Retained for further scrutiny';auditEvents.unshift({time:new Date().toLocaleString('en-IN'),actor:'AICTE Officer (demo)',action:'Flagged for review',record:id,detail:'Further scrutiny requested'});renderTables();showToast('Record flagged for further scrutiny.')}else showToast('No change made.')}
function exportRecords(){const headers=['FDR Reference','Institution','Bank','Amount INR','Issue Date','Maturity Date','Status','Notes'];const rows=fdrs.map(r=>[r.id,r.inst,r.bank,r.amount,r.issue,r.maturity,r.status,r.note||'']);const csv=[headers,...rows].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\\r\\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fdr-records-demo.csv';a.click();URL.revokeObjectURL(url);showToast('CSV export created from the current demo records.')}
function saveSettings(){const vals=['reminder1','reminder2','reminder3','escalation'].map(id=>Number(document.getElementById(id).value));if(vals.some(v=>!Number.isFinite(v)||v<1)){showToast('Please enter a number of at least 1 day in every field.');return}showToast('Reminder preferences saved for this demo session only.')}
renderTables();renderRequests();renderInstitutions();
