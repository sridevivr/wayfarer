import { useState, useEffect, useRef } from "react";

const T = {
  bg:"#12180F",bgCard:"#1C2418",bgCardHov:"#222D1D",bgDeep:"#0D120B",
  ochre:"#C9892A",ochreSoft:"#E8A94A",terra:"#B5533C",terrasoft:"#D4705A",
  sage:"#5C7A4E",sageSoft:"#7A9E6A",cream:"#F0E4C8",creamMid:"#B8A98A",creamDim:"#6E5E48",
  border:"rgba(200,170,100,0.12)",borderBright:"rgba(200,170,100,0.28)",
  glow:"rgba(201,137,42,0.18)",glowBright:"rgba(201,137,42,0.35)",
};
const serif="'Lora',Georgia,serif";
const sans="'DM Sans',system-ui,sans-serif";

const FontStyle=()=><style>{`
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:rgba(200,170,100,0.2);border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes glowPulse{0%,100%{opacity:0.5;}50%{opacity:1;}}
@keyframes markerFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
.sc-enter{animation:fadeUp 0.3s ease forwards;}
.gp{animation:glowPulse 2.8s ease-in-out infinite;}
.mf{animation:markerFloat 3s ease-in-out infinite;}
`}</style>;

const SB=()=><div style={{display:"flex",justifyContent:"space-between",padding:"10px 20px 2px",fontSize:11,fontFamily:sans,color:T.creamDim}}><span style={{fontWeight:600}}>9:41</span><span style={{fontSize:9,letterSpacing:"0.1em"}}>●●● WiFi ▌</span></div>;
const H=({children,size=20,style={}})=><div style={{fontSize:size,fontFamily:serif,fontWeight:600,color:T.cream,lineHeight:1.25,letterSpacing:"-0.01em",...style}}>{children}</div>;
const Bod=({children,size=13,color=T.creamMid,style={}})=><div style={{fontSize:size,color,fontFamily:sans,lineHeight:1.6,fontWeight:300,...style}}>{children}</div>;
const Lbl=({children,style={}})=><div style={{fontSize:10,color:T.creamDim,fontFamily:sans,letterSpacing:"0.06em",textTransform:"uppercase",...style}}>{children}</div>;
const Div=()=><div style={{height:1,background:T.border,margin:"12px 0"}}/>;
const Back=({go,dest})=><button onClick={()=>go(dest)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:T.creamDim,padding:0}}>←</button>;

const Card=({children,style={},onClick,glow})=><div onClick={onClick} style={{background:T.bgCard,border:`1px solid ${glow?T.borderBright:T.border}`,borderRadius:14,padding:16,boxShadow:glow?`0 0 20px ${T.glow}`:"none",cursor:onClick?"pointer":"default",...style}}>{children}</div>;

const Tag=({label,color="ochre"})=>{
  const m={ochre:{bg:"rgba(201,137,42,0.15)",c:T.ochreSoft,b:"rgba(201,137,42,0.3)"},terra:{bg:"rgba(181,83,60,0.15)",c:T.terrasoft,b:"rgba(181,83,60,0.3)"},sage:{bg:"rgba(92,122,78,0.15)",c:T.sageSoft,b:"rgba(92,122,78,0.3)"}};
  const s=m[color]||m.ochre;
  return <span style={{fontSize:9,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",padding:"3px 8px",borderRadius:99,background:s.bg,color:s.c,border:`1px solid ${s.b}`,fontFamily:sans}}>{label}</span>;
};

const Btn=({label,onClick,variant="primary"})=>{
  const s={primary:{background:T.ochre,color:"#0D0E0A",border:"none",fontWeight:600},secondary:{background:"transparent",color:T.creamMid,border:`1px solid ${T.border}`,fontWeight:400}};
  return <button onClick={onClick} style={{...s[variant],borderRadius:12,padding:"13px 20px",fontSize:14,fontFamily:sans,cursor:"pointer",width:"100%",letterSpacing:"0.01em"}}>{label}</button>;
};

const PT=({pct,h=4})=><div style={{background:"rgba(255,255,255,0.06)",borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${T.sage},${T.ochre})`,borderRadius:99}}/></div>;

const OB=({step,total=5})=><div style={{display:"flex",gap:4,marginBottom:24}}>{[...Array(total)].map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:99,background:i<step?T.ochre:"rgba(255,255,255,0.08)"}}/>)}</div>;

const BN=({active,go})=><div style={{display:"flex",borderTop:`1px solid ${T.border}`,background:T.bgDeep,paddingBottom:6}}>
  {[{id:"today",l:"Today",icon:"◎",s:"TODAY_ACTIVE"},{id:"journey",l:"Journey",icon:"◈",s:"JOURNEY_MAP"},{id:"explore",l:"Explore",icon:"◇",s:"EXPLORE"}].map(t=>(
    <button key={t.id} onClick={()=>go(t.s)} style={{flex:1,background:"none",border:"none",padding:"10px 0 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
      <span style={{fontSize:17,color:active===t.id?T.ochre:T.creamDim}}>{t.icon}</span>
      <span style={{fontSize:9,fontWeight:active===t.id?600:400,fontFamily:sans,letterSpacing:"0.06em",textTransform:"uppercase",color:active===t.id?T.ochre:T.creamDim}}>{t.l}</span>
    </button>
  ))}
</div>;

const MapC=({height=200,pct=34,glow=true})=>{
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d"),W=c.width,H=c.height;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(90,110,70,0.15)";ctx.lineWidth=0.8;
    for(let i=0;i<H;i+=22){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
    for(let i=0;i<W;i+=22){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
    const pts=[[20,H*0.72],[W*0.15,H*0.52],[W*0.28,H*0.62],[W*0.42,H*0.37],[W*0.55,H*0.47],[W*0.68,H*0.27],[W*0.8,H*0.34],[W-20,H*0.2]];
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.forEach(([x,y])=>ctx.lineTo(x,y));
    ctx.strokeStyle="rgba(92,122,78,0.25)";ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
    const pi=Math.floor((pts.length-1)*(pct/100)),fr=((pts.length-1)*(pct/100))%1;
    const pp=pts.slice(0,pi+1);
    if(fr>0&&pi+1<pts.length){const[ax,ay]=pts[pi],[bx,by]=pts[pi+1];pp.push([ax+(bx-ax)*fr,ay+(by-ay)*fr]);}
    if(glow){ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);pp.forEach(([x,y])=>ctx.lineTo(x,y));ctx.strokeStyle="rgba(201,137,42,0.2)";ctx.lineWidth=10;ctx.lineCap="round";ctx.stroke();}
    ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);pp.forEach(([x,y])=>ctx.lineTo(x,y));
    const gr=ctx.createLinearGradient(pts[0][0],pts[0][1],pp[pp.length-1][0],pp[pp.length-1][1]);
    gr.addColorStop(0,"#7A6030");gr.addColorStop(1,T.ochre);
    ctx.strokeStyle=gr;ctx.lineWidth=2.5;ctx.stroke();
    ctx.beginPath();ctx.arc(pts[0][0],pts[0][1],4,0,Math.PI*2);ctx.fillStyle=T.creamDim;ctx.fill();
    ctx.beginPath();ctx.arc(pts[pts.length-1][0],pts[pts.length-1][1],5,0,Math.PI*2);ctx.strokeStyle=T.ochreSoft;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=T.bgCard;ctx.fill();
    const[mx,my]=pp[pp.length-1];
    if(glow){ctx.beginPath();ctx.arc(mx,my,12,0,Math.PI*2);ctx.fillStyle="rgba(201,137,42,0.2)";ctx.fill();}
    ctx.beginPath();ctx.arc(mx,my,6,0,Math.PI*2);ctx.fillStyle=T.ochre;ctx.fill();
    ctx.beginPath();ctx.arc(mx,my,3,0,Math.PI*2);ctx.fillStyle=T.cream;ctx.fill();
  },[pct,glow,height]);
  return <canvas ref={ref} width={340} height={height} style={{width:"100%",height,display:"block",borderRadius:12}}/>;
};

// ── SCREENS ────────────────────────────────────────────────────────────────────

const Splash=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    {[...Array(12)].map((_,i)=><div key={i} className="gp" style={{position:"absolute",width:2+i%3,height:2+i%3,borderRadius:"50%",background:i%3===0?T.ochre:i%3===1?T.terra:T.sageSoft,left:`${8+i*7.5}%`,top:`${10+i*6}%`,opacity:0.25+i*0.04,animationDelay:`${i*0.2}s`}}/>)}
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,position:"relative",zIndex:1}}>
      <div style={{marginBottom:32,position:"relative"}}>
        <div style={{width:80,height:80,borderRadius:22,background:`linear-gradient(135deg,${T.bgCard},${T.bgCardHov})`,border:`1px solid ${T.borderBright}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,boxShadow:`0 0 40px ${T.glowBright}`}}>◈</div>
        <div className="gp" style={{position:"absolute",inset:-8,borderRadius:30,border:"1px solid rgba(201,137,42,0.2)"}}/>
      </div>
      <H size={38} style={{marginBottom:8}}>Wayfarer</H>
      <div style={{fontFamily:serif,fontStyle:"italic",fontSize:15,color:T.creamMid,textAlign:"center",lineHeight:1.6,marginBottom:48}}>Turn your daily steps<br/>into a personal journey</div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Begin your journey" onClick={()=>go("FITBIT_CONNECT")}/>
        <Btn label="I already have an account" variant="secondary" onClick={()=>go("TODAY_ACTIVE")}/>
      </div>
    </div>
    <svg viewBox="0 0 375 80" style={{position:"absolute",bottom:0,left:0,right:0,width:"100%"}}>
      <path d="M0,80 L0,50 Q30,30 60,45 Q90,60 120,35 Q150,15 180,30 Q210,45 240,25 Q270,10 300,28 Q330,45 360,32 L375,30 L375,80 Z" fill="rgba(30,45,20,0.6)"/>
      <path d="M0,80 L0,62 Q40,48 80,58 Q120,68 160,50 Q200,35 240,52 Q280,68 320,55 L375,48 L375,80 Z" fill="rgba(20,30,15,0.8)"/>
    </svg>
  </div>
);

const FitbitConnect=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"6px 18px 18px"}}>
      <OB step={1}/>
      <Lbl style={{marginBottom:8}}>Step 1 of 5</Lbl>
      <H style={{marginBottom:8}}>Connect your Fitbit</H>
      <Bod style={{marginBottom:24}}>We use your Fitbit to read your step count and stride length. Your data stays on your device.</Bod>
      <Card style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:12,background:"rgba(201,137,42,0.1)",border:"1px solid rgba(201,137,42,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>⌚</div>
        <div><div style={{fontSize:14,fontFamily:serif,fontWeight:500,color:T.cream}}>Fitbit Account</div><Bod size={11}>Secure OAuth connection</Bod></div>
      </Card>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px",marginBottom:28,border:`1px solid ${T.border}`}}>
        <Lbl style={{marginBottom:10}}>Wayfarer will access</Lbl>
        {["Daily step count","Stride length","30-day step history"].map(item=>(
          <div key={item} style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(92,122,78,0.2)",border:`1px solid ${T.sageSoft}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:T.sageSoft,flexShrink:0}}>✓</div>
            <Bod size={12}>{item}</Bod>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Connect Fitbit" onClick={()=>go("STRIDE_CONFIRM")}/>
        <Bod size={11} style={{textAlign:"center",color:T.creamDim}}>We never sell or share your health data</Bod>
      </div>
    </div>
  </div>
);

const StrideConfirm=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"6px 18px 18px"}}>
      <OB step={2}/>
      <Lbl style={{marginBottom:8}}>Step 2 of 5</Lbl>
      <H style={{marginBottom:8}}>Your stride length</H>
      <Bod style={{marginBottom:24}}>Pulled from your Fitbit profile. This makes all distances personal and accurate for you specifically.</Bod>
      <Card style={{textAlign:"center",padding:28,marginBottom:14}} glow>
        <div style={{fontSize:52,fontFamily:serif,fontWeight:700,color:T.ochreSoft,letterSpacing:"-0.04em"}}>2,246</div>
        <Bod size={13} style={{marginTop:4}}>steps per mile</Bod>
        <div style={{marginTop:10}}><Tag label="From Fitbit profile" color="sage"/></div>
      </Card>
      <Bod size={12} style={{textAlign:"center",marginBottom:24}}>All distances in Wayfarer use your personal stride — not a population average.</Bod>
      <div style={{display:"flex",gap:10}}>
        <Btn label="Looks right" onClick={()=>go("ONBOARD_HOME")}/>
        <Btn label="Adjust" variant="secondary" onClick={()=>go("ONBOARD_HOME")}/>
      </div>
    </div>
  </div>
);

const OnboardHome=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"6px 18px 18px"}}>
      <OB step={3}/>
      <Lbl style={{marginBottom:8}}>Step 3 of 5</Lbl>
      <H style={{marginBottom:8}}>Where is home?</H>
      <Bod style={{marginBottom:24}}>We'll use this to create your first personalized goal suggestion — no location permissions needed.</Bod>
      <Lbl style={{marginBottom:6}}>Your hometown</Lbl>
      <div style={{background:"rgba(255,255,255,0.04)",border:`1.5px solid ${T.ochre}55`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <span style={{color:T.creamDim,fontSize:14}}>⌕</span>
        <span style={{fontSize:13,color:T.cream,fontFamily:sans}}>Hanover, New Hampshire</span>
      </div>
      <Lbl style={{marginBottom:10}}>Suggestions</Lbl>
      {["Hanover, NH","Boston, MA","Portland, ME"].map((city,i)=>(
        <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,color:i===0?T.cream:T.creamMid,fontFamily:sans,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {city}{i===0&&<Tag label="Selected" color="ochre"/>}
        </div>
      ))}
      <div style={{marginTop:24}}><Btn label="Continue" onClick={()=>go("ONBOARD_PLACES")}/></div>
    </div>
  </div>
);

const OnboardPlaces=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"6px 18px 18px"}}>
      <OB step={4}/>
      <Lbl style={{marginBottom:8}}>Step 4 of 5</Lbl>
      <H style={{marginBottom:8}}>Places you want to reach</H>
      <Bod style={{marginBottom:22}}>Add up to 3 destinations. These become your first goal suggestions inside the app.</Bod>
      {[{v:"San Francisco, CA",tag:"ochre"},{v:"Yellowstone National Park",tag:"sage"},{v:"",tag:null}].map((f,i)=>(
        <div key={i} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <Lbl>Destination {i+1}</Lbl>{i===2&&<Bod size={10} color={T.creamDim}>Optional</Bod>}
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${f.v?T.borderBright:T.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:f.v?T.cream:T.creamDim,fontFamily:sans}}>{f.v||"Search a city or landmark..."}</span>
            {f.tag&&<Tag label="Added" color={f.tag}/>}
          </div>
        </div>
      ))}
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Let's go →" onClick={()=>go("TODAY_EMPTY")}/>
        <Btn label="Skip for now" variant="secondary" onClick={()=>go("TODAY_EMPTY")}/>
      </div>
    </div>
  </div>
);

const TodayEmpty=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <H size={22} style={{marginBottom:4}}>Good morning.</H>
      <Bod style={{marginBottom:20}}>Where do you want to walk to?</Bod>
      <div style={{background:"rgba(255,255,255,0.04)",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
        <span style={{color:T.creamDim,fontSize:14}}>⌕</span><span style={{fontSize:13,color:T.creamDim,fontFamily:sans}}>Search any destination...</span>
      </div>
      <Lbl style={{marginBottom:10}}>Suggested for you</Lbl>
      {[{name:"Walk home to Hanover, NH",sub:"130 mi · ~291k steps · ~43 days",tl:"Home",tc:"terra"},{name:"San Francisco, CA",sub:"3,095 mi · ~6.9M steps · ~1,020 days",tl:"Bucket list",tc:"ochre"},{name:"Yellowstone National Park",sub:"2,200 mi · ~4.9M steps · ~725 days",tl:"Bucket list",tc:"ochre"}].map((s,i)=>(
        <Card key={i} onClick={()=>go("DEST_SEARCH")} style={{marginBottom:10,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{fontSize:13,fontFamily:serif,fontWeight:500,color:T.cream,lineHeight:1.4}}>{s.name}</div><Tag label={s.tl} color={s.tc}/>
          </div>
          <Bod size={11} style={{marginTop:6}}>{s.sub}</Bod>
        </Card>
      ))}
      <Div/>
      <Lbl style={{marginBottom:10}}>Curated routes</Lbl>
      {["Pacific Coast Highway","Blue Ridge Parkway"].map((r,i)=>(
        <Card key={i} onClick={()=>go("DEST_SEARCH")} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
          <div style={{width:38,height:38,borderRadius:10,background:"rgba(92,122,78,0.12)",border:"1px solid rgba(92,122,78,0.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>◇</div>
          <div><div style={{fontSize:13,fontFamily:serif,fontWeight:500,color:T.cream}}>{r}</div><Bod size={11}>Scenic · Editors' pick</Bod></div>
        </Card>
      ))}
    </div>
    <BN active="today" go={go}/>
  </div>
);

const TodayActive=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <div style={{marginBottom:16,padding:"16px 18px",background:`linear-gradient(135deg,${T.bgCard},rgba(30,45,20,0.9))`,borderRadius:16,border:`1px solid ${T.borderBright}`,boxShadow:`0 0 30px ${T.glow}`}}>
        <Lbl style={{marginBottom:6}}>You are currently in</Lbl>
        <H size={22} style={{marginBottom:4}}>Columbus, Ohio</H>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.ochre}} className="gp"/>
          <Bod size={12}>On your way to San Francisco · 53 days to go</Bod>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <Card style={{flex:1,padding:14}}><Lbl style={{marginBottom:6}}>Today</Lbl><div style={{fontSize:24,fontFamily:serif,fontWeight:600,color:T.ochreSoft,letterSpacing:"-0.02em"}}>4,821</div><Bod size={10} style={{marginBottom:6}}>steps</Bod><PT pct={71}/></Card>
        <Card style={{flex:1,padding:14}}><Lbl style={{marginBottom:6}}>Journey</Lbl><div style={{fontSize:24,fontFamily:serif,fontWeight:600,color:T.sageSoft,letterSpacing:"-0.02em"}}>34%</div><Bod size={10} style={{marginBottom:6}}>complete</Bod><PT pct={34}/></Card>
      </div>
      <Lbl style={{marginBottom:8}}>Your route</Lbl>
      <Card onClick={()=>go("JOURNEY_MAP")} style={{marginBottom:14,padding:10,cursor:"pointer"}} glow>
        <MapC height={100} pct={34} glow={false}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,padding:"0 4px"}}>
          <Bod size={11}>Somerville → San Francisco</Bod>
          <div style={{fontSize:11,color:T.ochre,fontFamily:sans,fontWeight:500}}>Open map →</div>
        </div>
      </Card>
      <Lbl style={{marginBottom:8}}>Story waiting</Lbl>
      <Card onClick={()=>go("STORY_CARD")} style={{marginBottom:14,borderLeft:`2px solid ${T.ochre}`,cursor:"pointer"}} glow>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:13,fontFamily:serif,fontWeight:500,color:T.cream,marginBottom:4}}>You've crossed into Ohio</div><Bod size={11}>A story is waiting for you</Bod></div>
          <span style={{fontSize:20,color:T.ochre}} className="gp">◈</span>
        </div>
      </Card>
      <Div/>
      <div style={{fontSize:12,color:T.creamDim,fontFamily:serif,fontStyle:"italic",textAlign:"center",lineHeight:1.7}}>This month you've walked <span style={{color:T.cream}}>47 miles</span> — that's Boston to Providence.</div>
    </div>
    <BN active="today" go={go}/>
  </div>
);

const JourneyMap=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <H size={18}>Your Journey</H>
        <button onClick={()=>go("JOURNEY_STATS")} style={{fontSize:12,color:T.ochreSoft,background:"none",border:"none",cursor:"pointer",fontFamily:sans}}>Stats →</button>
      </div>
      <Card style={{padding:10,marginBottom:14}} glow>
        <MapC height={210} pct={34} glow/>
        <div style={{padding:"10px 4px 2px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><Lbl style={{marginBottom:2}}>Currently in</Lbl><div style={{fontSize:14,fontFamily:serif,fontWeight:600,color:T.cream}}>Columbus, Ohio</div></div>
          <Tag label="34% complete" color="ochre"/>
        </div>
      </Card>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <Bod size={10} style={{whiteSpace:"nowrap"}}>Somerville</Bod>
        <div style={{flex:1}}><PT pct={34} h={6}/></div>
        <Bod size={10} style={{whiteSpace:"nowrap"}}>San Francisco</Bod>
      </div>
      <Card onClick={()=>go("STORY_CARD")} style={{marginBottom:12,borderLeft:`2px solid ${T.ochre}`,cursor:"pointer"}}>
        <div style={{fontSize:12,fontFamily:serif,fontWeight:500,color:T.cream}}>◈ Story waiting — You've crossed into Ohio</div>
        <Bod size={11} style={{marginTop:2}}>Tap to read</Bod>
      </Card>
      <Lbl style={{marginBottom:10}}>Ahead on your route</Lbl>
      {[{name:"Rock and Roll Hall of Fame",dist:"38 mi · ~85k steps"},{name:"Indiana border",dist:"112 mi · ~251k steps"},{name:"Chicago, Illinois",dist:"190 mi · ~426k steps"}].map((p,i)=>(
        <Card key={i} style={{marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(201,137,42,0.08)",border:"1px solid rgba(201,137,42,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>★</div>
          <div><div style={{fontSize:12,fontFamily:serif,fontWeight:500,color:T.cream}}>{p.name}</div><Bod size={11} style={{marginTop:2}}>{p.dist} away</Bod></div>
        </Card>
      ))}
    </div>
    <BN active="journey" go={go}/>
  </div>
);

const StoryCard=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 20px"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}><Back go={go} dest="JOURNEY_MAP"/><Tag label="Story · Day 34" color="ochre"/></div>
      <div style={{height:150,borderRadius:14,background:`linear-gradient(160deg,rgba(30,55,20,0.9),rgba(15,25,12,1))`,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <svg viewBox="0 0 340 150" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
          {[...Array(20)].map((_,i)=><circle key={i} cx={20+i*16} cy={40+Math.sin(i)*28} r={1.5+i%3} fill={i%3===0?T.ochre:i%3===1?T.sageSoft:T.terra} opacity={0.25+i*0.025}/>)}
          <path d="M0,150 Q60,115 120,125 Q180,135 240,105 Q290,85 340,100 L340,150Z" fill="rgba(20,35,15,0.8)"/>
        </svg>
        <div style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{fontSize:26,marginBottom:4}} className="mf">◈</div>
          <Bod size={11} style={{letterSpacing:"0.1em",textTransform:"uppercase"}}>Columbus, Ohio</Bod>
        </div>
      </div>
      <Tag label="State milestone" color="sage"/>
      <H size={20} style={{margin:"10px 0 14px"}}>Welcome to the Buckeye State</H>
      <Bod style={{marginBottom:12}}>You've been walking for 34 days and have just crossed the Pennsylvania-Ohio border. Ahead lies the broad, flat expanse of the Midwest — a landscape that rewards the long walker with a real sense of distance conquered.</Bod>
      <Bod style={{marginBottom:20}}>Columbus sits at the heart of Ohio. Known for its university energy and quietly excellent food scene, it's a city that rewards the curious traveler.</Bod>
      <Div/>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[{v:"34",l:"days"},{v:"1,053",l:"miles"},{v:"2,042",l:"to go"}].map((s,i)=>(
          <div key={i} style={{flex:1,textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 6px",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:18,fontFamily:serif,fontWeight:600,color:T.ochreSoft}}>{s.v}</div>
            <Bod size={9} style={{marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.l}</Bod>
          </div>
        ))}
      </div>
      <Btn label="Keep walking →" onClick={()=>go("JOURNEY_MAP")}/>
    </div>
  </div>
);

const JourneyStats=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><Back go={go} dest="JOURNEY_MAP"/><H size={18}>Journey Stats</H></div>
      <Card style={{padding:"18px 16px",marginBottom:14}} glow>
        <Bod size={11} style={{marginBottom:8}}>Somerville → San Francisco · Most Picturesque</Bod>
        <PT pct={34} h={6}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <Bod size={10}>0 mi</Bod>
          <div style={{fontSize:11,fontFamily:serif,color:T.ochreSoft}}>34% — 1,053 mi</div>
          <Bod size={10}>3,480 mi</Bod>
        </div>
      </Card>
      {[{l:"Total steps taken",v:"2,364,126"},{l:"Steps remaining",v:"4,549,074"},{l:"Days active",v:"34 of 87"},{l:"Daily average (30 days)",v:"6,832 steps"},{l:"Projected completion",v:"June 12, 2026"},{l:"Personal stride length",v:"2,246 steps/mi"}].map((s,i)=>(
        <div key={i}><div style={{display:"flex",justifyContent:"space-between",padding:"10px 0"}}><Bod size={12}>{s.l}</Bod><div style={{fontSize:12,fontFamily:serif,fontWeight:500,color:T.cream}}>{s.v}</div></div>{i<5&&<Div/>}</div>
      ))}
      <Lbl style={{marginTop:12,marginBottom:10}}>Stories unlocked</Lbl>
      {["Crossed into New York","In the Alleghenies","Crossed into Ohio"].map((s,i)=>(
        <Card key={i} style={{marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
          <span style={{color:T.ochre,fontSize:16}}>◈</span>
          <div style={{fontSize:12,fontFamily:serif,color:T.cream}}>{s}</div>
        </Card>
      ))}
    </div>
    <BN active="journey" go={go}/>
  </div>
);

const DestSearch=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><Back go={go} dest="TODAY_EMPTY"/><H size={18}>Set a destination</H></div>
      <div style={{background:"rgba(255,255,255,0.04)",border:`1.5px solid ${T.ochre}66`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <span style={{color:T.creamDim,fontSize:14}}>⌕</span><span style={{fontSize:13,color:T.cream,fontFamily:sans}}>San Francisco, CA</span>
      </div>
      <Lbl style={{marginBottom:6}}>Starting from</Lbl>
      <Card style={{marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:14,color:T.ochre}}>◎</span>
        <div><div style={{fontSize:13,fontFamily:serif,fontWeight:500,color:T.cream}}>Current location</div><Bod size={11}>Somerville, MA</Bod></div>
      </Card>
      <Lbl style={{marginBottom:8}}>Destination preview</Lbl>
      <Card style={{marginBottom:24}} glow>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div><H size={15}>San Francisco, CA</H><Bod size={11} style={{marginTop:4}}>3,095 miles from Somerville, MA</Bod></div>
        </div>
        <Div/>
        <div style={{display:"flex",gap:20,marginTop:10}}>
          <div><div style={{fontSize:22,fontFamily:serif,fontWeight:600,color:T.ochreSoft,letterSpacing:"-0.02em"}}>6.9M</div><Bod size={10}>steps (your stride)</Bod></div>
          <div><div style={{fontSize:22,fontFamily:serif,fontWeight:600,color:T.ochreSoft,letterSpacing:"-0.02em"}}>~1,020</div><Bod size={10}>days at your pace</Bod></div>
        </div>
        <Bod size={10} style={{marginTop:10}}>Based on your 30-day avg of 6,800 steps/day</Bod>
      </Card>
      <Btn label="Choose a route →" onClick={()=>go("ROUTE_SELECT")}/>
    </div>
  </div>
);

const RouteSelect=({go})=>{
  const [sel,setSel]=useState(1);
  const routes=[{name:"Most Direct",dist:"3,095 mi",steps:"6.9M steps",days:"~1,020 days",tag:"Fastest",tc:"sage"},{name:"Most Picturesque",dist:"3,480 mi",steps:"7.8M steps",days:"~1,147 days",tag:"Scenic",tc:"ochre"},{name:"Avoid Highways",dist:"3,210 mi",steps:"7.2M steps",days:"~1,059 days",tag:"Backroads",tc:"terra"}];
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><Back go={go} dest="DEST_SEARCH"/><H size={18}>Choose your route</H></div>
        <Card style={{padding:10,marginBottom:16}}><MapC height={140} pct={0} glow={false}/></Card>
        {routes.map((r,i)=>(
          <Card key={i} onClick={()=>setSel(i)} style={{marginBottom:10,cursor:"pointer",border:`1px solid ${sel===i?T.ochre+"55":T.border}`,background:sel===i?"rgba(201,137,42,0.05)":T.bgCard}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div style={{fontSize:14,fontFamily:serif,fontWeight:sel===i?600:400,color:sel===i?T.cream:T.creamMid,marginBottom:4}}>{r.name}</div><Bod size={11}>{r.dist} · {r.steps} · {r.days}</Bod></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Tag label={r.tag} color={r.tc}/>
                <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${sel===i?T.ochre:T.creamDim}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {sel===i&&<div style={{width:8,height:8,borderRadius:"50%",background:T.ochre}}/>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        <div style={{marginTop:8}}><Btn label="Confirm route →" onClick={()=>go("GOAL_CONFIRM")}/></div>
      </div>
    </div>
  );
};

const GoalConfirm=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><Back go={go} dest="ROUTE_SELECT"/><H size={18}>Confirm your goal</H></div>
      <Card style={{padding:10,marginBottom:14}}><MapC height={100} pct={0} glow={false}/></Card>
      <Card style={{marginBottom:14}} glow>
        {[{l:"From",v:"Somerville, MA"},{l:"To",v:"San Francisco, CA"},{l:"Route",v:"Most Picturesque"},{l:"Distance",v:"3,480 miles"},{l:"Your steps",v:"~7.8 million"},{l:"Est. completion",v:"~1,147 days at your pace"}].map((r,i)=>(
          <div key={i}><div style={{display:"flex",justifyContent:"space-between",padding:"9px 0"}}><Bod size={12}>{r.l}</Bod><div style={{fontSize:12,fontFamily:serif,fontWeight:500,color:T.cream}}>{r.v}</div></div>{i<5&&<Div/>}</div>
        ))}
      </Card>
      <Bod size={12} style={{textAlign:"center",marginBottom:20,fontStyle:"italic",fontFamily:serif}}>Stories every 3 days, with bonus moments at state borders and landmarks.</Bod>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Start my journey →" onClick={()=>go("TODAY_ACTIVE")}/>
        <Btn label="Change route" variant="secondary" onClick={()=>go("ROUTE_SELECT")}/>
      </div>
    </div>
  </div>
);

const Celebration=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,position:"relative",overflow:"hidden",background:T.bgDeep}}>
    {[...Array(16)].map((_,i)=><div key={i} className="gp" style={{position:"absolute",width:2+i%4,height:2+i%4,borderRadius:"50%",background:i%3===0?T.ochre:i%3===1?T.terra:T.sageSoft,left:`${5+i*5.8}%`,top:`${8+Math.sin(i)*25+i*3}%`,opacity:0.2+i*0.04,animationDelay:`${i*0.15}s`}}/>)}
    <div style={{position:"relative",zIndex:1,width:"100%",textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:20}} className="mf">◈</div>
      <div style={{fontFamily:serif,fontStyle:"italic",fontSize:13,color:T.creamDim,marginBottom:8}}>Somerville, MA → San Francisco, CA</div>
      <H size={30} style={{marginBottom:32,textAlign:"center"}}>You made it.</H>
      <div style={{display:"flex",justifyContent:"center",gap:28,marginBottom:40}}>
        {[{v:"3,480",l:"miles"},{v:"7.8M",l:"steps"},{v:"1,147",l:"days"}].map((s,i)=>(
          <div key={i} style={{textAlign:"center"}}>
            <div style={{fontSize:22,fontFamily:serif,fontWeight:600,color:T.ochreSoft}}>{s.v}</div>
            <Bod size={10} style={{textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{s.l}</Bod>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Add a photo to mark this" onClick={()=>go("PHOTO_UPLOAD")}/>
        <Btn label="Just share the moment" variant="secondary" onClick={()=>go("SHARE_CARD")}/>
      </div>
    </div>
  </div>
);

const PhotoUpload=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 18px 18px"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}><Back go={go} dest="CELEBRATION"/><H size={18}>Mark the moment</H></div>
      <Bod style={{marginBottom:20}}>Add a photo to carry this achievement with you.</Bod>
      <div onClick={()=>go("SHARE_CARD")} style={{background:"rgba(255,255,255,0.02)",border:`2px dashed ${T.border}`,borderRadius:16,height:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:20,cursor:"pointer"}}>
        <div style={{fontSize:32,color:T.creamDim,marginBottom:8}}>+</div>
        <Bod size={13}>Tap to add a photo</Bod>
        <Bod size={11} style={{marginTop:4}}>From your library or camera</Bod>
      </div>
      <Card style={{marginBottom:24}}><Bod size={12}>Your photo appears on your share card only. It is never stored on our servers.</Bod></Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Continue to share card →" onClick={()=>go("SHARE_CARD")}/>
        <Btn label="Skip" variant="secondary" onClick={()=>go("SHARE_CARD")}/>
      </div>
    </div>
  </div>
);

const ShareCard=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 18px 18px"}}>
      <H style={{marginBottom:16}}>Your share card</H>
      <Card style={{marginBottom:20,overflow:"hidden",padding:0}} glow>
        <div style={{background:`linear-gradient(135deg,${T.bgDeep},#1C2A14)`,padding:20}}>
          <Lbl style={{marginBottom:6}}>Wayfarer</Lbl>
          <H size={20} style={{marginBottom:4}}>I walked there.</H>
          <Bod size={12}>Somerville, MA → San Francisco, CA</Bod>
        </div>
        <div style={{height:110,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${T.border}`}}><Bod size={12}>Your photo</Bod></div>
        <div style={{padding:16,display:"flex",gap:20}}>
          {[{v:"3,480",l:"miles"},{v:"7.8M",l:"steps"},{v:"1,147",l:"days"}].map((s,i)=>(
            <div key={i}><div style={{fontSize:16,fontFamily:serif,fontWeight:600,color:T.ochreSoft}}>{s.v}</div><Bod size={10}>{s.l}</Bod></div>
          ))}
        </div>
      </Card>
      <Bod size={11} style={{textAlign:"center",marginBottom:16,fontStyle:"italic"}}>Opens your iOS share sheet</Bod>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn label="Share ↗" onClick={()=>go("TODAY_EMPTY")}/>
        <Btn label="Save to photos" variant="secondary" onClick={()=>go("TODAY_EMPTY")}/>
      </div>
    </div>
  </div>
);

const Explore=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <H style={{marginBottom:4}}>Explore</H>
      <Bod style={{marginBottom:20}}>Curious how far something is in steps?</Bod>
      <Lbl style={{marginBottom:6}}>From</Lbl>
      <div style={{marginBottom:10}}><div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{color:T.creamDim,fontSize:14}}>◎</span><span style={{fontSize:13,color:T.cream,fontFamily:sans}}>Somerville, MA</span></div></div>
      <Lbl style={{marginBottom:6}}>To</Lbl>
      <div style={{marginBottom:16}}><div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{color:T.creamDim,fontSize:14}}>⌕</span><span style={{fontSize:13,color:T.creamDim,fontFamily:sans}}>Search any destination...</span></div></div>
      <Btn label="Calculate steps" onClick={()=>{}}/>
      <Div/>
      <Lbl style={{marginBottom:10}}>Recent lookups</Lbl>
      {[{to:"Hanover, NH",dist:"130 mi",steps:"291,980 steps"},{to:"New York, NY",dist:"215 mi",steps:"482,690 steps"}].map((r,i)=>(
        <Card key={i} style={{marginBottom:8}}>
          <Bod size={11} style={{marginBottom:4}}>Somerville, MA → {r.to}</Bod>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:14,fontFamily:serif,fontWeight:500,color:T.ochreSoft}}>{r.steps}</div><Tag label={r.dist} color="sage"/></div>
        </Card>
      ))}
      <Div/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <Lbl>April summary</Lbl>
        <button onClick={()=>go("MONTHLY_SUMMARY")} style={{fontSize:11,color:T.ochre,background:"none",border:"none",cursor:"pointer",fontFamily:sans}}>View all →</button>
      </div>
      <Card><div style={{fontSize:13,fontFamily:serif,fontStyle:"italic",color:T.creamMid,lineHeight:1.8}}>This month you walked <span style={{color:T.cream,fontWeight:600}}>47 miles</span> — that's Boston to Providence!</div></Card>
    </div>
    <BN active="explore" go={go}/>
  </div>
);

const MonthlySummary=({go})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <SB/><div style={{flex:1,overflowY:"auto",padding:"8px 16px 16px"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><Back go={go} dest="EXPLORE"/><H size={18}>April 2026</H></div>
      <Card style={{background:`linear-gradient(135deg,${T.bgCard},rgba(30,45,20,0.9))`,border:`1px solid ${T.borderBright}`,marginBottom:16,textAlign:"center",padding:28}} glow>
        <Lbl style={{marginBottom:10,textAlign:"center"}}>This month you walked</Lbl>
        <div style={{fontSize:44,fontFamily:serif,fontWeight:700,color:T.ochreSoft,letterSpacing:"-0.04em"}}>47 mi</div>
        <Bod size={13} style={{marginTop:4}}>105,502 steps</Bod>
        <Div/>
        <div style={{fontFamily:serif,fontStyle:"italic",fontSize:14,color:T.creamMid,marginTop:12,lineHeight:1.6}}>That's Boston to Providence!</div>
      </Card>
      <Lbl style={{marginBottom:10}}>Month by month</Lbl>
      {[{month:"April 2026",val:"47 mi",comp:"Boston → Providence"},{month:"March 2026",val:"61 mi",comp:"NYC → Philadelphia"},{month:"February 2026",val:"38 mi",comp:"DC → Baltimore"}].map((r,i)=>(
        <Card key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:12,fontFamily:serif,fontWeight:500,color:T.cream}}>{r.month}</div><Bod size={11} style={{marginTop:2}}>{r.comp}</Bod></div>
            <div style={{fontSize:18,fontFamily:serif,fontWeight:600,color:T.ochreSoft}}>{r.val}</div>
          </div>
        </Card>
      ))}
    </div>
    <BN active="explore" go={go}/>
  </div>
);

// ── REGISTRY ──────────────────────────────────────────────────────────────────
const SCREENS={SPLASH:Splash,FITBIT_CONNECT:FitbitConnect,STRIDE_CONFIRM:StrideConfirm,ONBOARD_HOME:OnboardHome,ONBOARD_PLACES:OnboardPlaces,TODAY_EMPTY:TodayEmpty,TODAY_ACTIVE:TodayActive,JOURNEY_MAP:JourneyMap,STORY_CARD:StoryCard,JOURNEY_STATS:JourneyStats,DEST_SEARCH:DestSearch,ROUTE_SELECT:RouteSelect,GOAL_CONFIRM:GoalConfirm,CELEBRATION:Celebration,PHOTO_UPLOAD:PhotoUpload,SHARE_CARD:ShareCard,EXPLORE:Explore,MONTHLY_SUMMARY:MonthlySummary};
const LABELS={SPLASH:"1. Splash",FITBIT_CONNECT:"2. Fitbit Connect",STRIDE_CONFIRM:"3. Stride Confirmation",ONBOARD_HOME:"4. Where is Home?",ONBOARD_PLACES:"5. Places to Reach",TODAY_EMPTY:"6. Today (empty)",TODAY_ACTIVE:"7. Today (active goal)",JOURNEY_MAP:"8. Progress Map",STORY_CARD:"9. Story Card",JOURNEY_STATS:"10. Journey Stats",DEST_SEARCH:"11. Destination Search",ROUTE_SELECT:"12. Route Selection",GOAL_CONFIRM:"13. Goal Confirmation",CELEBRATION:"14. Celebration",PHOTO_UPLOAD:"15. Photo Upload",SHARE_CARD:"16. Share Card",EXPLORE:"17. Explore",MONTHLY_SUMMARY:"18. Monthly Summary"};
const FLOWS=[{label:"Onboarding",s:["SPLASH","FITBIT_CONNECT","STRIDE_CONFIRM","ONBOARD_HOME","ONBOARD_PLACES"]},{label:"Today Tab",s:["TODAY_EMPTY","TODAY_ACTIVE"]},{label:"Journey Tab",s:["JOURNEY_MAP","STORY_CARD","JOURNEY_STATS"]},{label:"Goal Setup",s:["DEST_SEARCH","ROUTE_SELECT","GOAL_CONFIRM"]},{label:"Completion",s:["CELEBRATION","PHOTO_UPLOAD","SHARE_CARD"]},{label:"Explore Tab",s:["EXPLORE","MONTHLY_SUMMARY"]}];

export default function App(){
  const [cur,setCur]=useState("SPLASH");
  const [nav,setNav]=useState(true);
  const Screen=SCREENS[cur];
  return(
    <div style={{display:"flex",height:"100vh",background:"#0A0D08",overflow:"hidden"}}>
      <FontStyle/>
      {nav&&(
        <div style={{width:200,background:"#0D100B",borderRight:"1px solid rgba(200,170,100,0.08)",overflowY:"auto",flexShrink:0,padding:"20px 0"}}>
          <div style={{padding:"0 16px 16px",borderBottom:"1px solid rgba(200,170,100,0.08)"}}>
            <div style={{fontFamily:serif,fontSize:16,fontWeight:600,color:T.cream,marginBottom:2}}>Wayfarer</div>
            <div style={{fontSize:9,color:T.creamDim,fontFamily:sans,letterSpacing:"0.08em",textTransform:"uppercase"}}>Visual Design · v1.0</div>
          </div>
          {FLOWS.map(flow=>(
            <div key={flow.label} style={{padding:"10px 0"}}>
              <div style={{fontSize:8,fontWeight:600,color:T.creamDim,textTransform:"uppercase",letterSpacing:"0.1em",padding:"0 16px 6px",fontFamily:sans}}>{flow.label}</div>
              {flow.s.map(s=>(
                <button key={s} onClick={()=>setCur(s)} style={{display:"block",width:"100%",textAlign:"left",padding:"6px 16px",background:cur===s?"rgba(201,137,42,0.1)":"none",border:"none",cursor:"pointer",borderLeft:cur===s?`2px solid ${T.ochre}`:"2px solid transparent",fontSize:11,color:cur===s?T.ochreSoft:T.creamDim,fontFamily:sans,lineHeight:1.4}}>
                  {LABELS[s]}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:24,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,width:"100%",maxWidth:375}}>
          <button onClick={()=>setNav(v=>!v)} style={{background:"rgba(200,170,100,0.08)",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:sans,color:T.creamDim}}>{nav?"◂ Hide":"▸ Show"} screens</button>
          <div style={{flex:1,textAlign:"center",fontSize:11,color:T.creamDim,fontFamily:sans,letterSpacing:"0.04em"}}>{LABELS[cur]}</div>
        </div>
        <div className="sc-enter" key={cur} style={{width:375,height:680,background:T.bg,borderRadius:44,boxShadow:`0 40px 100px rgba(0,0,0,0.6),0 0 0 10px #0A0D08,0 0 0 12px #1A1E17,0 0 60px rgba(201,137,42,0.08)`,overflow:"hidden",display:"flex",flexDirection:"column",flexShrink:0}}>
          <Screen go={setCur}/>
        </div>
        <div style={{fontSize:10,color:T.creamDim,fontFamily:sans,textAlign:"center",letterSpacing:"0.04em",textTransform:"uppercase"}}>Tap inside the phone to navigate</div>
      </div>
    </div>
  );
}
