"use strict";
const $=id=>document.getElementById(id);
const demo=[
["A",1,25.1],["B",1,31.2],["C",1,22.4],["D",1,33.1],
["A",2,26.0],["B",2,25.8],["C",2,26.3],["D",2,29.4],
["A",3,20.8],["B",3,28.1],["C",3,28.6],["D",3,31.2],
["A",4,23.2],["B",4,27.4],["C",4,25.5],["D",4,34.0],
["A",5,21.5],["B",5,24.6],["C",5,29.1],["D",5,28.7]
].map((r,i)=>({trat:r[0],bloco:r[1],produtividade:r[2],ordem:i+1}));
let allRows=[],charts={},columns=[],sourceName="CSV original";
const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function parseCSV(text,delimiter){
 const first=(text.replace(/^\uFEFF/,"").split(/\r?\n/).find(x=>x.trim())||"");
 const sep=delimiter==="auto"?[",",";","\t"].sort((a,b)=>(first.split(b).length-first.split(a).length))[0]:delimiter;
 const rows=[];let row=[],cell="",quoted=false,s=text.replace(/^\uFEFF/,"");
 for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===sep&&!quoted){row.push(cell);cell=""}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&s[i+1]==="\n")i++;row.push(cell);if(row.some(v=>v.trim()!==""))rows.push(row);row=[];cell=""}else cell+=c}
 row.push(cell);if(row.some(v=>v.trim()!==""))rows.push(row);
 if(rows.length<2)throw Error("O arquivo precisa conter cabeçalho e pelo menos uma linha.");
 const headers=rows.shift().map((h,i)=>h.trim()||"coluna_"+(i+1));
 return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]??"").trim()])));
}
function numeric(v){if(typeof v==="number")return Number.isFinite(v)?v:NaN;let s=String(v??"").trim();if(!s)return NaN;if(s.includes(",")&&!s.includes("."))s=s.replace(",",".");else s=s.replace(/,(?=\d{3}(\D|$))/g,"");return Number(s)}
function quantile(a,q){const x=[...a].sort((p,r)=>p-r),pos=(x.length-1)*q,lo=Math.floor(pos),hi=Math.ceil(pos);return x[lo]+(x[hi]-x[lo])*(pos-lo)}
function stats(a){const n=a.length;if(!n)return{n:0,mean:NaN,sd:NaN,median:NaN,cv:NaN,min:NaN,max:NaN};const mean=a.reduce((s,v)=>s+v,0)/n,sd=n>1?Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/(n-1)):NaN;return{n,mean,sd,median:quantile(a,.5),cv:mean!==0?sd/Math.abs(mean)*100:NaN,min:Math.min(...a),max:Math.max(...a)}}
function setOptions(){columns=Object.keys(allRows[0]||{});const numericCols=columns.filter(c=>allRows.some(r=>Number.isFinite(numeric(r[c]))));$("response").innerHTML=numericCols.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");$("group").innerHTML=columns.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");$("response").value=numericCols.includes("y")?"y":numericCols.includes("produtividade")?"produtividade":numericCols.find(c=>!["rep","bloco","ordem"].includes(c))||numericCols[0]||"";$("group").value=columns.includes("trat")?"trat":columns.find(c=>!numericCols.includes(c))||columns[0]||"";refreshFilters();render()}
function refreshFilters(){const g=$("group").value,prev=$("filterGroup").value,values=[...new Set(allRows.map(r=>String(r[g]??"")).filter(Boolean))];$("filterGroup").innerHTML='<option value="__all">Todos os grupos</option>'+values.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join("");if(values.includes(prev))$("filterGroup").value=prev}
function filtered(){const y=$("response").value,g=$("group").value,f=$("filterGroup").value;return allRows.filter(r=>f==="__all"||String(r[g]??"")===f).map((r,i)=>({...r,__y:numeric(r[y]),__index:i+1})).filter(r=>Number.isFinite(r.__y))}
function chart(id,type,data,extra={}){if(charts[id])charts[id].destroy();const ctx=$(id);if(!ctx||!window.Chart)return;charts[id]=new Chart(ctx,{type,data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#0b1728",titleColor:"#edf3fb",bodyColor:"#cbd9e8"}},scales:{x:{ticks:{color:"#91a6bd",maxRotation:0},grid:{color:"#22334a"}},y:{ticks:{color:"#91a6bd"},grid:{color:"#22334a"}}},...extra}})}
function render(){const data=filtered(),y=$("response").value,g=$("group").value;const vals=data.map(r=>r.__y),overall=stats(vals),groups=[...new Set(data.map(r=>String(r[g]??"(vazio)")))];$("metricN").textContent=overall.n;$("metricNSub").textContent="na seleção atual";$("metricMean").textContent=fmt(overall.mean);$("metricSd").textContent=fmt(overall.sd);$("metricCv").textContent=fmt(overall.cv)+"%";$("dataLabel").textContent=sourceName.toUpperCase().slice(0,26);$("dataStatus").textContent=allRows.length+" registros carregados · "+groups.length+" grupos na seleção · "+vals.length+" respostas válidas";
 const summaries=groups.map(k=>({name:k,...stats(data.filter(r=>String(r[g]??"(vazio)")==k).map(r=>r.__y))}));
 $("summaryBody").innerHTML=summaries.map(s=>'<tr><td><strong>'+esc(s.name)+'</strong></td><td>'+s.n+'</td><td>'+fmt(s.mean)+'</td><td>'+fmt(s.median)+'</td><td>'+fmt(s.sd)+'</td><td>'+fmt(s.cv)+'%</td><td>'+fmt(s.min)+'</td><td>'+fmt(s.max)+'</td></tr>').join("")||'<tr><td colspan="8">Nenhuma observação numérica para os filtros selecionados.</td></tr>';
 $("tableFoot").textContent="Resposta: "+y+" · Agrupamento: "+g+" · DP amostral; CV = DP / |média| × 100.";
 chart("groupChart","bar",{labels:summaries.map(s=>s.name),datasets:[{data:summaries.map(s=>s.mean),backgroundColor:"#55cdb9",borderRadius:7,maxBarThickness:48}]});
 if(vals.length){const min=Math.min(...vals),max=Math.max(...vals),bins=Math.min(10,Math.max(5,Math.ceil(Math.sqrt(vals.length)))),width=(max-min||1)/bins,counts=Array(bins).fill(0);vals.forEach(v=>counts[Math.min(bins-1,Math.floor((v-min)/width))]++);chart("histChart","bar",{labels:counts.map((_,i)=>fmt(min+i*width,1)),datasets:[{data:counts,backgroundColor:"#789fda",borderRadius:5,maxBarThickness:38}]})}else chart("histChart","bar",{labels:[],datasets:[{data:[]}]});
 chart("seriesChart","line",{labels:data.map((r,i)=>i+1),datasets:[{data:vals,borderColor:"#e8bd77",backgroundColor:"#e8bd7722",pointBackgroundColor:"#e8bd77",pointRadius:3,borderWidth:2,tension:.25,fill:true}]},{plugins:{legend:{display:false}}});
}
async function loadRepositoryCsv(path=$("sourceDataset").value){
  const label=path.split("/").pop();
  $("dataStatus").textContent="Carregando "+label+" do repositório…";
  try{
    const response=await fetch(path,{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    allRows=parseCSV(await response.text(),"auto");
    sourceName=label+" · arquivo original";
    $("csvFile").value="";
    $("delimiter").value="auto";
    setOptions();
    $("dataStatus").textContent=allRows.length+" observações carregadas de "+label+" · arquivo original do repositório";
  }catch(error){
    $("dataStatus").textContent="Falha ao carregar "+label+". Você ainda pode selecionar o CSV manualmente.";
    console.error("Falha ao carregar CSV do repositório:",error);
  }
}

$("csvFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{allRows=parseCSV(await file.text(),$("delimiter").value);sourceName=file.name;setOptions()}catch(err){alert("Não foi possível ler o CSV: "+err.message)}});
$("delimiter").addEventListener("change",async()=>{const f=$("csvFile").files[0];if(f){try{allRows=parseCSV(await f.text(),$("delimiter").value);sourceName=f.name;setOptions()}catch(e){alert("Confira o separador e a estrutura do CSV.")}}});
$("sourceDataset").addEventListener("change",()=>loadRepositoryCsv());$("response").addEventListener("change",render);$("group").addEventListener("change",()=>{refreshFilters();render()});$("filterGroup").addEventListener("change",render);$("resetData").addEventListener("click",()=>loadRepositoryCsv());
$("downloadCsv").addEventListener("click",()=>{const data=filtered(),y=$("response").value,g=$("group").value;if(!data.length){alert("Não há dados para exportar.");return}const headers=columns,lines=[headers.join(";"),...data.map(r=>headers.map(h=>'"'+String(r[h]??"").replace(/"/g,'""')+'"').join(";"))];const blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="dados_filtrados.csv";a.click();URL.revokeObjectURL(url)});
const dz=$("dropZone");["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag")}));["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag")}));dz.addEventListener("drop",async e=>{const file=e.dataTransfer.files[0];if(!file)return;try{allRows=parseCSV(await file.text(),$("delimiter").value);sourceName=file.name;setOptions()}catch(err){alert("Não foi possível ler o CSV: "+err.message)}});
loadRepositoryCsv();