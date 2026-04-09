import{t as e}from"./ordinal-CF10J2bn.js";import{n as t,r as n}from"./chunk-AGHRB4JF-56mPf01Y.js";import{n as r}from"./path-yo4Xej8w.js";import{m as i}from"./dist-X0Z87NCt.js";import{t as a}from"./arc-CmQAOCy_.js";import{t as o}from"./array-BK6zH9fO.js";import{f as s,r as c}from"./chunk-5PVQY5BW-9xCwPoP0.js";import{B as l,C as u,V as d,W as f,_ as p,a as m,b as h,c as g,d as _,v}from"./chunk-ICPOFSXX-DRuLxJw5.js";import{t as y}from"./chunk-426QAEUC-BZlaJhbR.js";import{t as b}from"./chunk-4BX2VUAB-BotjgsoJ.js";import{t as x}from"./mermaid-parser.core-Dspq5N3o.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,a=r(0),s=r(i),c=r(0);function l(r){var l,u=(r=o(r)).length,d,f,p=0,m=Array(u),h=Array(u),g=+a.apply(this,arguments),_=Math.min(i,Math.max(-i,s.apply(this,arguments)-g)),v,y=Math.min(Math.abs(_)/u,c.apply(this,arguments)),b=y*(_<0?-1:1),x;for(l=0;l<u;++l)(x=h[m[l]=l]=+e(r[l],l,r))>0&&(p+=x);for(t==null?n!=null&&m.sort(function(e,t){return n(r[e],r[t])}):m.sort(function(e,n){return t(h[e],h[n])}),l=0,f=p?(_-u*b)/p:0;l<u;++l,g=v)d=m[l],x=h[d],v=g+(x>0?x*f:0)+b,h[d]={data:r[d],index:l,value:x,startAngle:g,endAngle:v,padAngle:y};return h}return l.value=function(t){return arguments.length?(e=typeof t==`function`?t:r(+t),l):e},l.sortValues=function(e){return arguments.length?(t=e,n=null,l):t},l.sort=function(e){return arguments.length?(n=e,t=null,l):n},l.startAngle=function(e){return arguments.length?(a=typeof e==`function`?e:r(+e),l):a},l.endAngle=function(e){return arguments.length?(s=typeof e==`function`?e:r(+e),l):s},l.padAngle=function(e){return arguments.length?(c=typeof e==`function`?e:r(+e),l):c},l}var T=_.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:t(()=>structuredClone(k),`getConfig`),clear:t(()=>{D=new Map,O=E.showData,m()},`clear`),setDiagramTitle:f,getDiagramTitle:u,setAccTitle:d,getAccTitle:v,setAccDescription:l,getAccDescription:p,addSection:t(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),n.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:t(()=>D,`getSections`),setShowData:t(e=>{O=e},`setShowData`),getShowData:t(()=>O,`getShowData`)},j=t((e,t)=>{b(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:t(async e=>{let t=await x(`pie`,e);n.debug(t),j(t,A)},`parse`)},N=t(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=t(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:t((t,r,i,o)=>{n.debug(`rendering pie chart
`+t);let l=o.db,u=h(),d=c(l.getConfig(),u.pie),f=y(r),p=f.append(`g`);p.attr(`transform`,`translate(225,225)`);let{themeVariables:m}=u,[_]=s(m.pieOuterStrokeWidth);_??=2;let v=d.textPosition,b=a().innerRadius(0).outerRadius(185),x=a().innerRadius(185*v).outerRadius(185*v);p.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+_/2).attr(`class`,`pieOuterCircle`);let S=l.getSections(),C=P(S),w=[m.pie1,m.pie2,m.pie3,m.pie4,m.pie5,m.pie6,m.pie7,m.pie8,m.pie9,m.pie10,m.pie11,m.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=e(w).domain([...S.keys()]);p.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,b).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),p.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+x.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let O=p.append(`text`).text(l.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`),k=[...S.entries()].map(([e,t])=>({label:e,value:t})),A=p.selectAll(`.legend`).data(k).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*k.length/2;return`translate(216,`+(t*22-n)+`)`});A.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),A.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>l.getShowData()?`${e.label} [${e.value}]`:e.label);let j=512+Math.max(...A.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),M=O.node()?.getBoundingClientRect().width??0,N=450/2-M/2,F=450/2+M/2,I=Math.min(0,N),L=Math.max(j,F)-I;f.attr(`viewBox`,`${I} 0 ${L} 450`),g(f,450,L,d.useMaxWidth)},`draw`)},styles:N};export{F as diagram};