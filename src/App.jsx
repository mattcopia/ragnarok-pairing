import { useState, useEffect } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const RAGNAROK = [
  { name: 'Jacob', faction: 'Orks (GT)', id: 0 },
  { name: 'Matt',  faction: 'Custodes',  id: 1 },
  { name: 'Alex',  faction: 'Space Wolves', id: 2 },
  { name: 'Ollie', faction: 'Necrons',   id: 3 },
  { name: 'Paul',  faction: 'Sisters',   id: 4 },
];

const FACTIONS = [
  'Daemons','CK','WE','DG','EC','TS','CSM','Tau','Orks','Necrons',
  'GSC','Drukhari','Eldar','Nids','Votan','Sisters','Custodes',
  'Ad Mech','Guard','IK','Grey Knights','BA','Wolves','DA',
  'Black Temp','Deathwatch','Gladius','Victrix spam','Other Marines'
];

const MATRIX = {
  Jacob: {Daemons:'A',CK:'R',WE:'PS',DG:'R',EC:'A-',TS:'N',CSM:'A',Tau:'G',Orks:'PS',Necrons:'A+',GSC:'G',Drukhari:'A',Eldar:'G',Nids:'A',Votan:'A',Sisters:'G',Custodes:'A','Ad Mech':'A',Guard:'R',IK:'PS','Grey Knights':'G',BA:'A',Wolves:'A',DA:'A','Black Temp':'A',Deathwatch:'R',Gladius:'A-','Victrix spam':'R','Other Marines':'A'},
  Matt:  {Daemons:'A',CK:'A+',WE:'A',DG:'G',EC:'N',TS:'N',CSM:'A',Tau:'R',Orks:'A',Necrons:'R',GSC:'A',Drukhari:'PS',Eldar:'A',Nids:'G',Votan:'G',Sisters:'R',Custodes:'PS','Ad Mech':'R',Guard:'A-',IK:'G','Grey Knights':'G',BA:'R',Wolves:'PS',DA:'R','Black Temp':'A+',Deathwatch:'N',Gladius:'A','Victrix spam':'R','Other Marines':'A'},
  Alex:  {Daemons:'A',CK:'R',WE:'PS',DG:'A',EC:'N',TS:'N',CSM:'A',Tau:'A',Orks:'A',Necrons:'R',GSC:'A',Drukhari:'G',Eldar:'G',Nids:'G',Votan:'A',Sisters:'A',Custodes:'PS','Ad Mech':'N',Guard:'A-',IK:'R','Grey Knights':'G',BA:'A-',Wolves:'PS',DA:'A','Black Temp':'G',Deathwatch:'R',Gladius:'A','Victrix spam':'R','Other Marines':'G'},
  Ollie: {Daemons:'N',CK:'G',WE:'R',DG:'G',EC:'A',TS:'G',CSM:'A',Tau:'G',Orks:'PS',Necrons:'PS',GSC:'G',Drukhari:'A',Eldar:'A',Nids:'PS',Votan:'A',Sisters:'PS',Custodes:'G','Ad Mech':'A',Guard:'R',IK:'G','Grey Knights':'A',BA:'R',Wolves:'PS',DA:'G','Black Temp':'A',Deathwatch:'R',Gladius:'PS','Victrix spam':'G','Other Marines':'A'},
  Paul:  {Daemons:'A',CK:'R',WE:'G',DG:'A',EC:'N',TS:'A',CSM:'PS',Tau:'R',Orks:'A',Necrons:'PS',GSC:'PS',Drukhari:'G',Eldar:'A',Nids:'G',Votan:'R',Sisters:'A',Custodes:'G','Ad Mech':'N',Guard:'A',IK:'R','Grey Knights':'G',BA:'PS',Wolves:'G',DA:'A','Black Temp':'G',Deathwatch:'N',Gladius:'A','Victrix spam':'N','Other Marines':'G'},
};

const SCORE  = { G:3, 'A+':2.5, A:2, 'A-':1.5, PS:1, N:1, R:0 };
const BG_COL = { G:'#0a350a', 'A+':'#123c12', A:'#0e1e3a', 'A-':'#2e2210', PS:'#280e0e', N:'#141414', R:'#380808' };
const FG_COL = { G:'#4adc4a', 'A+':'#30c830', A:'#5a90e0', 'A-':'#b08428', PS:'#c06060', N:'#686868', R:'#e84040' };
const LABELS = { G:'Should Win', 'A+':'Favourable', A:'Balanced', 'A-':'Slight Dis.', PS:'Skill Dep.', N:'Unknown', R:'Danger' };

const gr  = (p, f)  => MATRIX[p]?.[f] ?? 'N';
const gs  = (p, f)  => SCORE[gr(p,f)] ?? 1;
const avg = (p, fs) => fs.length ? fs.reduce((s,f)=>s+gs(p,f),0)/fs.length : 0;

// ─── THEME ────────────────────────────────────────────────────────────────────

const C = {
  bg:'#07080b', surf:'#0b0d13', bord:'#18202e',
  gold:'#c8a848', goldD:'#6a5820', goldB:'#e0c060',
  text:'#b8b0a0', dim:'#4e4c46', white:'#e8e0d0',
  blue:'#5a8ad0', red:'#c05050', green:'#4aac4a',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Crimson Text', Georgia, serif; min-height: 100vh; }
  input, select, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.bord}; }
  select option { background: #0e1018; }

  /* Responsive layout */
  .pair-layout { display: flex; gap: 16px; }
  .pair-sidebar { width: 150px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
  .def-row-badges { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }

  @media (max-width: 640px) {
    .pair-layout { flex-direction: column-reverse; }
    .pair-sidebar { width: 100%; flex-direction: row; gap: 12px; }
    .pair-sidebar > div { flex: 1; }
    .pair-sidebar .pool-list { display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; }
    .def-row-badges { max-width: 120px; }
    .home-header h1 { font-size: 28px !important; }
  }
`;

// ─── ATOMS ────────────────────────────────────────────────────────────────────

function Badge({ r }) {
  const label = r === 'R' ? '💀' : r === 'G' ? '🏆' : (r ?? '?');
  return (
    <span style={{ display:'inline-block', padding:'2px 8px', background:BG_COL[r]??'#141414',
      color:FG_COL[r]??'#686868', fontSize: (r === 'R' || r === 'G') ? 13 : 11, fontWeight:700, fontFamily:'monospace',
      minWidth:32, textAlign:'center', letterSpacing:0.5 }}>
      {label}
    </span>
  );
}

function ScoreColor(s) { return s >= 2 ? C.green : s >= 1.5 ? C.gold : s >= 1 ? '#c08030' : C.red; }

function Tag({ children, color = C.goldD, block, mb = 0, center }) {
  return (
    <span style={{ fontFamily:'Cinzel, serif', fontSize:8, letterSpacing:3, color,
      textTransform:'uppercase', display:block?'block':'inline', marginBottom:mb,
      textAlign:center?'center':undefined }}>
      {children}
    </span>
  );
}

function Cine({ children, size = 14, color = C.white, weight = 600, mb = 0 }) {
  return <div style={{ fontFamily:'Cinzel, serif', fontSize:size, fontWeight:weight, color, marginBottom:mb }}>{children}</div>;
}

function Btn({ children, onClick, disabled, gold, ghost, sm, full, style: s = {} }) {
  const bg = gold ? C.gold : 'transparent';
  const col = gold ? '#1a0e00' : C.gold;
  const brd = ghost ? C.bord : C.gold;
  return (
    <button onClick={!disabled ? onClick : undefined} style={{
      border:`1px solid ${brd}`, color:col, background:bg,
      padding:sm ? '5px 12px' : '10px 22px',
      fontSize:sm ? 8 : 10, letterSpacing:2.5,
      fontFamily:'Cinzel, serif', textTransform:'uppercase',
      cursor:disabled ? 'not-allowed' : 'pointer',
      opacity:disabled ? 0.3 : 1, width:full ? '100%' : undefined, ...s
    }}>
      {children}
    </button>
  );
}

function Back({ onClick }) {
  return (
    <button onClick={onClick} style={{ background:'transparent', border:'none', color:C.dim,
      fontFamily:'Cinzel, serif', fontSize:9, letterSpacing:2, cursor:'pointer', marginBottom:20, padding:0 }}>
      ← Back
    </button>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
      <div style={{ flex:1, height:1, background:C.bord }} />
      {label && <Tag>{label}</Tag>}
      <div style={{ flex:1, height:1, background:C.bord }} />
    </div>
  );
}

function RatingRow({ player, factions }) {
  const a = avg(player.name, factions);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:`1px solid ${C.bord}` }}>
      <div style={{ minWidth:90 }}>
        <Cine size={12}>{player.name}</Cine>
        <div style={{ fontSize:10, color:C.dim, fontStyle:'italic' }}>{player.faction}</div>
      </div>
      <div style={{ display:'flex', gap:5, flex:1, flexWrap:'wrap' }}>
        {factions.map((f, i) => <Badge key={i} r={gr(player.name, f)} />)}
      </div>
      <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:ScoreColor(a), minWidth:26, textAlign:'right' }}>{a.toFixed(1)}</span>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function Home({ teams, onSelect, onAdd, onEdit }) {
  return (
    <div style={{ maxWidth:840, margin:'0 auto', padding:'40px 20px' }}>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ width:1, height:40, background:C.gold, margin:'0 auto 24px' }} />
        <Tag color={C.goldD} block mb={14}>Warhammer 40,000 — Team Ragnarok</Tag>
        <div style={{ fontFamily:'Cinzel, serif', fontSize:38, fontWeight:900, color:C.white, lineHeight:1.1 }}>
          Pairing<br /><span style={{ color:C.gold }}>Tactical Console</span>
        </div>
        <p style={{ color:C.dim, fontSize:15, fontStyle:'italic', marginTop:14 }}>
          Select your round opponent to view matchups and begin pairing
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:12 }}>
        {teams.map(t => (
          <div key={t.id} onClick={() => onSelect(t)} style={{ border:`1px solid ${C.bord}`, padding:'16px 18px', cursor:'pointer', position:'relative', transition:'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
            <Tag color={C.dim} block mb={8}>Opponent</Tag>
            <Cine size={15} weight={700} mb={12}>{t.name}</Cine>
            {t.players.map((p, i) => (
              <div key={i} style={{ fontSize:11, color:C.text, fontStyle:'italic', marginBottom:3 }}>{p.faction}</div>
            ))}
            <button onClick={e => { e.stopPropagation(); onEdit(t); }} style={{
              position:'absolute', top:10, right:10, background:'transparent',
              border:`1px solid ${C.bord}`, color:C.dim, padding:'2px 8px',
              fontSize:8, fontFamily:'Cinzel, serif', cursor:'pointer', letterSpacing:1
            }}>Edit</button>
          </div>
        ))}
        <div onClick={onAdd} style={{ border:`1px dashed ${C.bord}`, padding:'16px 18px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, minHeight:150,
          transition:'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
          <div style={{ fontSize:28, color:C.dim }}>+</div>
          <Tag color={C.dim}>Add Opponent</Tag>
        </div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────

function Setup({ team, onSave, onBack }) {
  const blank = Array(5).fill(null).map(() => ({ faction:'' }));
  const [name, setName] = useState(team?.name ?? '');
  const [players, setPlayers] = useState(team?.players ?? blank);
  const set = (i, k, v) => { const p = [...players]; p[i] = { ...p[i], [k]: v }; setPlayers(p); };
  const ok = name && players.every(p => p.faction);

  return (
    <div style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>{team ? 'Edit Opponent' : 'New Opponent'}</Tag>
      <Cine size={24} weight={900} mb={28}>{team ? 'Edit Team' : 'Add Opponent Team'}</Cine>

      <Tag block mb={8}>Team Name</Tag>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sons of Sanguinius…"
        style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
          padding:'10px 14px', fontSize:16, fontFamily:'Cinzel, serif', fontWeight:600,
          marginBottom:24, outline:'none' }} />

      <Tag block mb={12}>Factions (5 players)</Tag>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
        {players.map((p, i) => (
          <div key={i}>
            <select value={p.faction} onChange={e => set(i, 'faction', e.target.value)}
              style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:p.faction ? C.text : C.dim, padding:'8px 10px', fontSize:13, outline:'none' }}>
              <option value="">— Player {i+1} Faction —</option>
              {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        ))}
      </div>
      <Btn gold full disabled={!ok} onClick={() => onSave({ ...team, id:team?.id ?? Date.now().toString(), name, players })}>
        Save Team
      </Btn>
    </div>
  );
}

// ─── MATCHUP VIEW ─────────────────────────────────────────────────────────────

function Matchup({ team, onStart, onBack }) {
  const theirFacs = team.players.map(p => p.faction);

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 18px' }}>
      <Back onClick={onBack} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <Tag color={C.dim} block mb={6}>Round Opponent</Tag>
          <Cine size={28} weight={900}>{team.name}</Cine>
        </div>
        <Btn gold onClick={onStart}>Begin Pairing →</Btn>
      </div>

      <div style={{ overflowX:'auto', marginBottom:24 }}>
        <table style={{ borderCollapse:'collapse', width:'100%', minWidth:600 }}>
          <thead>
            <tr>
              <th style={{ padding:'8px 14px', textAlign:'left', borderBottom:`1px solid ${C.bord}` }}>
                <Tag color={C.dim}>Ragnarok</Tag>
              </th>
              {team.players.map((p, i) => (
                <th key={i} style={{ padding:'8px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}`, minWidth:90 }}>
                  <Cine size={11} weight={700}>{p.faction}</Cine>
                </th>
              ))}
              <th style={{ padding:'8px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}`, minWidth:54 }}>
                <Tag color={C.dim}>Avg</Tag>
              </th>
            </tr>
          </thead>
          <tbody>
            {RAGNAROK.map(r => {
              const a = avg(r.name, theirFacs);
              return (
                <tr key={r.id}>
                  <td style={{ padding:'10px 14px', borderBottom:`1px solid ${C.bord}` }}>
                    <Cine size={12}>{r.name}</Cine>
                    <div style={{ fontSize:11, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                  </td>
                  {team.players.map((p, i) => {
                    const rat = gr(r.name, p.faction);
                    return (
                      <td key={i} style={{ padding:'10px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}`, background:BG_COL[rat]+'30' }}>
                        <Badge r={rat} />
                      </td>
                    );
                  })}
                  <td style={{ padding:'10px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}` }}>
                    <span style={{ fontFamily:'monospace', fontSize:14, fontWeight:700, color:ScoreColor(a) }}>{a.toFixed(1)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        {Object.entries(LABELS).map(([k, v]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Badge r={k} /><span style={{ fontSize:10, color:C.dim }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAIRING ──────────────────────────────────────────────────────────────────

const PHASES = ['our_def','their_def','our_atk','their_atk','resolve','cycle_done'];

function Pairing({ team, onBack }) {
  const [ourPool,  setOurPool]  = useState([0,1,2,3,4]);
  const [theirPool, setTheirPool] = useState([0,1,2,3,4]);
  const [pairings, setPairings] = useState([]);
  const [phase, setPhase] = useState('our_def');
  const [ourDef, setOurDef] = useState(null);
  const [theirDef, setTheirDef] = useState(null);
  const [ourAtk, setOurAtk] = useState([]);
  const [theirAtk, setTheirAtk] = useState([]);
  const [acceptedTheirAtk, setAcceptedTheirAtk] = useState(null);
  const [chosenOurAtk, setChosenOurAtk] = useState(null);
  const [cycleRes, setCycleRes] = useState(null);
  const [allDone, setAllDone] = useState(false);

  const theirRemFacs = theirPool.map(i => team.players[i].faction);
  const theirDefFac  = theirDef !== null ? team.players[theirDef]?.faction : null;

  const defRecs = [...ourPool].sort((a, b) =>
    avg(RAGNAROK[b].name, theirRemFacs) - avg(RAGNAROK[a].name, theirRemFacs)
  );

  const maxOurAtk  = Math.min(2, ourPool.filter(i => i !== ourDef).length);
  const maxTheirAtk = Math.min(2, theirPool.filter(i => i !== theirDef).length);

  const toggleOurAtk   = i => setOurAtk(p  => p.includes(i) ? p.filter(x=>x!==i) : p.length < maxOurAtk  ? [...p,i] : p);
  const toggleTheirAtk = i => setTheirAtk(p => p.includes(i) ? p.filter(x=>x!==i) : p.length < maxTheirAtk ? [...p,i] : p);

  function confirmChoices() {
    const p1 = { us: RAGNAROK[ourDef], them: team.players[acceptedTheirAtk] };
    const p2 = { us: RAGNAROK[chosenOurAtk], them: team.players[theirDef] };
    const refusedTheirIdx = theirAtk.find(x => x !== acceptedTheirAtk);
    const refusedOurIdx   = ourAtk.find(x => x !== chosenOurAtk);

    let newPairings  = [...pairings, p1, p2];
    let newOurPool   = ourPool.filter(i => i !== ourDef && i !== chosenOurAtk);
    let newTheirPool = theirPool.filter(i => i !== acceptedTheirAtk && i !== theirDef);

    let done = false;
    if (newOurPool.length === 1 && newTheirPool.length === 1) {
      newPairings = [...newPairings, { us: RAGNAROK[newOurPool[0]], them: team.players[newTheirPool[0]] }];
      newOurPool = []; newTheirPool = []; done = true;
    }
    if (newOurPool.length === 0) done = true;

    setCycleRes({
      p1, p2,
      refusedTheir: refusedTheirIdx !== undefined ? team.players[refusedTheirIdx] : null,
      refusedOur:   refusedOurIdx   !== undefined ? RAGNAROK[refusedOurIdx]       : null,
    });
    setPairings(newPairings);
    setOurPool(newOurPool);
    setTheirPool(newTheirPool);
    if (done) setAllDone(true);
    setPhase('cycle_done');
  }

  function nextCycle() {
    setOurDef(null); setTheirDef(null);
    setOurAtk([]); setTheirAtk([]);
    setAcceptedTheirAtk(null); setChosenOurAtk(null);
    setCycleRes(null);
    setPhase('our_def');
  }

  // Sidebar
  function poolStatus(side, idx) {
    if (side === 'our') {
      if (pairings.some(p => p.us.id === idx)) return 'paired';
      if (ourDef === idx) return 'defender';
      if (ourAtk.includes(idx)) return 'attacker';
      if (chosenOurAtk === idx) return 'attacker';
      if (!ourPool.includes(idx)) return 'paired';
    } else {
      if (pairings.some(p => p.them === team.players[idx])) return 'paired';
      if (theirDef === idx) return 'defender';
      if (theirAtk.includes(idx)) return 'attacker';
      if (acceptedTheirAtk === idx) return 'attacker';
      if (!theirPool.includes(idx)) return 'paired';
    }
    return 'pool';
  }

  const sideColor = { paired:C.dim, defender:C.blue, attacker:C.gold, pool:C.text };
  const sideBorder = { paired:C.bord, defender:'#1e3a5a', attacker:'#5a4010', pool:C.bord };

  const sidebar = (
    <div className="pair-sidebar">
      <div>
        <Tag block mb={8} color={C.blue}>Our Pool</Tag>
        <div className="pool-list" style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {RAGNAROK.map(r => {
            const st = poolStatus('our', r.id);
            return (
              <div key={r.id} style={{ padding:'5px 8px', border:`1px solid ${sideBorder[st]}`, opacity:st==='paired'?0.28:1 }}>
                <div style={{ fontFamily:'Cinzel, serif', fontSize:10, fontWeight:600, color:sideColor[st] }}>{r.name}</div>
                <div style={{ fontSize:9, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Tag block mb={8} color={C.red}>Their Pool</Tag>
        <div className="pool-list" style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {team.players.map((p, i) => {
            const st = poolStatus('their', i);
            return (
              <div key={i} style={{ padding:'5px 8px', border:`1px solid ${sideBorder[st]}`, opacity:st==='paired'?0.28:1 }}>
                <div style={{ fontFamily:'Cinzel, serif', fontSize:10, fontWeight:600, color:st==='defender'?C.red:sideColor[st] }}>{p.faction}</div>
                <div style={{ fontSize:9, visibility:'hidden' }}>–</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Phase: pick our defender
  function PhaseOurDef() {
    return (
      <>
        <Tag block mb={8}>Step 1 · Choose Defender</Tag>
        <Cine size={20} weight={900} mb={6}>Select Your Defender</Cine>
        <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:20 }}>
          Ranked by average matchup score vs their remaining players. Pick secretly.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {defRecs.map((i, rank) => {
            const r = RAGNAROK[i];
            const a = avg(r.name, theirRemFacs);
            const sel = ourDef === i;
            return (
              <div key={i} onClick={() => setOurDef(sel ? null : i)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                border:`1px solid ${sel ? C.gold : C.bord}`, background:sel ? 'rgba(200,168,72,0.06)' : 'transparent',
                transition:'border-color 0.12s'
              }}>
                <span style={{ fontFamily:'Cinzel, serif', fontSize:9, color:C.dim, minWidth:16 }}>#{rank+1}</span>
                <div style={{ flex:1 }}>
                  <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                  <div style={{ fontSize:10, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                </div>
                <div className="def-row-badges">
                  {theirRemFacs.map((f, fi) => <Badge key={fi} r={gr(r.name, f)} />)}
                </div>
                <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:ScoreColor(a), minWidth:24, textAlign:'right' }}>{a.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
        <Btn gold full disabled={ourDef === null} onClick={() => setPhase('their_def')}>Confirm Defender →</Btn>
      </>
    );
  }

  // Phase: enter their defender
  function PhaseTheirDef() {
    return (
      <>
        <Tag block mb={8}>Step 1 · Reveal</Tag>
        <Cine size={20} weight={900} mb={6}>Defenders Revealed</Cine>
        <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:18 }}>
          Both teams reveal defenders simultaneously. Select who {team.name} put forward.
        </p>
        <div style={{ padding:'10px 14px', border:`1px solid #1e3a5a`, background:'rgba(30,58,90,0.12)', marginBottom:18 }}>
          <Tag color={C.blue} block mb={5}>Your Defender</Tag>
          <Cine size={13}>{RAGNAROK[ourDef].name}</Cine>
          <div style={{ fontSize:11, color:C.dim, fontStyle:'italic' }}>{RAGNAROK[ourDef].faction}</div>
        </div>
        <Tag block mb={10} color={C.dim}>Their defender is…</Tag>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {theirPool.map(i => {
            const p = team.players[i];
            const rat = gr(RAGNAROK[ourDef].name, p.faction);
            const sel = theirDef === i;
            return (
              <div key={i} onClick={() => setTheirDef(sel ? null : i)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                border:`1px solid ${sel ? C.red : C.bord}`, background:sel ? 'rgba(192,80,80,0.06)' : 'transparent'
              }}>
                <div style={{ flex:1 }}>
                  <Cine size={12} color={sel ? '#e08080' : C.white}>{p.faction}</Cine>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:9, color:C.dim }}>we rate this</span>
                  <Badge r={rat} />
                </div>
              </div>
            );
          })}
        </div>
        <Btn gold full disabled={theirDef === null} onClick={() => setPhase('our_atk')}>Proceed →</Btn>
      </>
    );
  }

  // Phase: select our attackers
  function PhaseOurAtk() {
    const atkRecs = [...ourPool].filter(i => i !== ourDef)
      .sort((a, b) => gs(RAGNAROK[b].name, theirDefFac||'') - gs(RAGNAROK[a].name, theirDefFac||''));
    return (
      <>
        <Tag block mb={8}>Step 2 · Attackers</Tag>
        <Cine size={20} weight={900} mb={6}>Select Your Attackers</Cine>
        <div style={{ padding:'10px 14px', border:`1px solid #4a2020`, background:'rgba(74,32,32,0.12)', marginBottom:18 }}>
          <Tag color={C.red} block mb={5}>Their Defender</Tag>
          <Cine size={13}>{team.players[theirDef].name}</Cine>
          <div style={{ fontSize:10, color:C.dim, fontStyle:'italic' }}>{team.players[theirDef].faction}</div>
        </div>
        <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:14 }}>
          Pick {maxOurAtk} to attack their defender. Ranked by matchup vs their faction.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
          {atkRecs.map((i, rank) => {
            const r = RAGNAROK[i];
            const rat = gr(r.name, theirDefFac||'');
            const sel = ourAtk.includes(i);
            return (
              <div key={i} onClick={() => toggleOurAtk(i)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                border:`1px solid ${sel ? C.gold : C.bord}`, background:sel ? 'rgba(200,168,72,0.06)' : 'transparent'
              }}>
                {rank === 0 && !sel && <span style={{ position:'absolute', fontFamily:'Cinzel, serif', fontSize:7, color:C.green, letterSpacing:1 }}>★</span>}
                <span style={{ fontFamily:'Cinzel, serif', fontSize:9, color:C.dim, minWidth:16 }}>#{rank+1}</span>
                <div style={{ flex:1 }}>
                  <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                  <div style={{ fontSize:10, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                </div>
                <Badge r={rat} />
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontFamily:'Cinzel, serif', fontSize:8, color:C.dim, letterSpacing:2, marginBottom:14 }}>
          {ourAtk.length} / {maxOurAtk} selected
        </div>
        <Btn gold full disabled={ourAtk.length !== maxOurAtk} onClick={() => setPhase('their_atk')}>Lock In →</Btn>
      </>
    );
  }

  // Phase: enter their attackers
  function PhaseTheirAtk() {
    return (
      <>
        <Tag block mb={8}>Step 2 · Reveal</Tag>
        <Cine size={20} weight={900} mb={6}>Enter Their Attackers</Cine>
        <div style={{ padding:'10px 14px', border:`1px solid #1e3a5a`, background:'rgba(30,58,90,0.10)', marginBottom:18 }}>
          <Tag color={C.blue} block mb={5}>Your Defender Faces</Tag>
          <Cine size={13}>{RAGNAROK[ourDef].name} — select who they're sending</Cine>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
          {theirPool.filter(i => i !== theirDef).map(i => {
            const p = team.players[i];
            const rat = gr(RAGNAROK[ourDef].name, p.faction);
            const sel = theirAtk.includes(i);
            return (
              <div key={i} onClick={() => toggleTheirAtk(i)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                border:`1px solid ${sel ? C.red : C.bord}`, background:sel ? 'rgba(192,80,80,0.06)' : 'transparent'
              }}>
                <div style={{ flex:1 }}>
                  <Cine size={12} color={sel ? '#e08080' : C.white}>{p.faction}</Cine>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:9, color:C.dim }}>our matchup</span>
                  <Badge r={rat} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontFamily:'Cinzel, serif', fontSize:8, color:C.dim, letterSpacing:2, marginBottom:14 }}>
          {theirAtk.length} / {maxTheirAtk} selected
        </div>
        <Btn gold full disabled={theirAtk.length !== maxTheirAtk} onClick={() => { setAcceptedTheirAtk(null); setChosenOurAtk(null); setPhase('resolve'); }}>Proceed to Resolution →</Btn>
      </>
    );
  }

  // Phase: resolve choices
  function PhaseResolve() {
    const ourDefP = RAGNAROK[ourDef];
    const theirDefP = team.players[theirDef];
    const bestTheirAtk = theirAtk.reduce((best, j) =>
      gs(ourDefP.name, team.players[j].faction) > gs(ourDefP.name, team.players[best].faction) ? j : best, theirAtk[0]);
    const bestOurAtk = ourAtk.reduce((best, j) =>
      gs(RAGNAROK[j].name, theirDefP.faction) > gs(RAGNAROK[best].name, theirDefP.faction) ? j : best, ourAtk[0]);

    return (
      <>
        <Tag block mb={8}>Step 3 · Resolve</Tag>
        <Cine size={20} weight={900} mb={18}>Defenders Choose</Cine>

        {/* Our defender picks */}
        <div style={{ border:`1px solid ${C.bord}`, padding:'16px 18px', marginBottom:16 }}>
          <Tag color={C.blue} block mb={10}>Your Defender Picks Their Opponent</Tag>
          <div style={{ fontSize:12, color:C.dim, marginBottom:12 }}>
            <span style={{ fontFamily:'Cinzel, serif', color:C.white }}>{ourDefP.name}</span> — which attacker do you want to face?
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {theirAtk.map(i => {
              const p = team.players[i];
              const rat = gr(ourDefP.name, p.faction);
              const isRec = i === bestTheirAtk;
              const sel = acceptedTheirAtk === i;
              return (
                <div key={i} onClick={() => setAcceptedTheirAtk(sel ? null : i)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer',
                  border:`1px solid ${sel ? C.gold : C.bord}`, background:sel ? 'rgba(200,168,72,0.06)' : 'transparent',
                  position:'relative'
                }}>
                  {isRec && <span style={{ position:'absolute', top:5, right:8, fontFamily:'Cinzel, serif', fontSize:7, color:C.green, letterSpacing:1 }}>RECOMMENDED</span>}
                  <div style={{ flex:1 }}>
                    <Cine size={12} color={sel ? C.gold : C.white}>{p.faction}</Cine>
                  </div>
                  <Badge r={rat} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Our attacker vs their defender */}
        <div style={{ border:`1px solid ${C.bord}`, padding:'16px 18px', marginBottom:18 }}>
          <Tag color={C.gold} block mb={10}>Our Attacker vs Their Defender</Tag>
          <div style={{ fontSize:12, color:C.dim, marginBottom:12 }}>
            Their defender: <span style={{ fontFamily:'Cinzel, serif', color:C.white }}>{theirDefP.name}</span>
            <span style={{ color:C.dim, fontStyle:'italic' }}> ({theirDefP.faction})</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {ourAtk.map(i => {
              const r = RAGNAROK[i];
              const rat = gr(r.name, theirDefP.faction);
              const isRec = i === bestOurAtk;
              const sel = chosenOurAtk === i;
              return (
                <div key={i} onClick={() => setChosenOurAtk(sel ? null : i)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer',
                  border:`1px solid ${sel ? C.gold : C.bord}`, background:sel ? 'rgba(200,168,72,0.06)' : 'transparent',
                  position:'relative'
                }}>
                  {isRec && <span style={{ position:'absolute', top:5, right:8, fontFamily:'Cinzel, serif', fontSize:7, color:C.green, letterSpacing:1 }}>RECOMMENDED</span>}
                  <div style={{ flex:1 }}>
                    <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                    <div style={{ fontSize:10, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                  </div>
                  <Badge r={rat} />
                </div>
              );
            })}
          </div>
        </div>

        <Btn gold full disabled={acceptedTheirAtk === null || chosenOurAtk === null} onClick={confirmChoices}>
          Confirm Pairings →
        </Btn>
      </>
    );
  }

  // Phase: cycle done
  function PhaseCycleDone() {
    if (allDone) {
      return (
        <>
          <Tag center block mb={18} style={{ fontSize:10, letterSpacing:5 }}>◆ All Pairings Complete ◆</Tag>
          <Cine size={22} weight={900} mb={28} color={C.gold}>Final Draw</Cine>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:32 }}>
            {pairings.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'12px 16px', border:`1px solid ${C.gold}`, background:'rgba(200,168,72,0.03)' }}>
                <span style={{ fontFamily:'Cinzel, serif', fontSize:8, color:C.goldD, minWidth:64, letterSpacing:1 }}>TABLE {i+1}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:11, color:C.dim, fontStyle:'italic', marginLeft:6 }}>{p.us.faction}</span>
                </div>
                <span style={{ color:C.goldD, margin:'0 10px' }}>⚔</span>
                <div style={{ flex:1, textAlign:'right' }}>
                  <span style={{ fontSize:11, color:C.dim, fontStyle:'italic', marginRight:6 }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.red }}>{p.them.faction}</span>
                </div>
              </div>
            ))}
          </div>
          <Btn gold onClick={onBack} full>← Back to Teams</Btn>
        </>
      );
    }

    return (
      <>
        <Tag block mb={18} style={{ fontSize:10, letterSpacing:4 }}>◆ Cycle Complete</Tag>
        <Cine size={20} weight={900} mb={18}>Pairings Confirmed</Cine>
        {cycleRes && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
            {[cycleRes.p1, cycleRes.p2].map((p, i) => (
              <div key={i} style={{ padding:'12px 16px', border:'1px solid #1a381a', background:'rgba(20,56,20,0.08)' }}>
                <Tag color={C.green} block mb={6}>Confirmed</Tag>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:11, color:C.dim, fontStyle:'italic' }}>{p.us.faction}</span>
                  <span style={{ color:C.goldD }}>⚔</span>
                  <span style={{ fontSize:11, color:C.dim, fontStyle:'italic' }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.red }}>{p.them.faction}</span>
                </div>
              </div>
            ))}
            {(cycleRes.refusedTheir || cycleRes.refusedOur) && (
              <div style={{ padding:'10px 14px', border:`1px solid ${C.bord}` }}>
                <Tag color={C.dim} block mb={6}>Returned to Pool</Tag>
                {cycleRes.refusedTheir && (
                  <div style={{ fontSize:13, color:C.dim, marginBottom:2 }}>
                    ↩ <span style={{ color:C.red }}>{cycleRes.refusedTheir.faction}</span> back to {team.name}
                  </div>
                )}
                {cycleRes.refusedOur && (
                  <div style={{ fontSize:13, color:C.dim }}>
                    ↩ <span style={{ color:C.blue }}>{cycleRes.refusedOur.name}</span> ({cycleRes.refusedOur.faction}) back to Ragnarok
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <Btn gold full onClick={nextCycle}>Begin Next Cycle →</Btn>
      </>
    );
  }

  const panels = {
    our_def:    <PhaseOurDef />,
    their_def:  <PhaseTheirDef />,
    our_atk:    <PhaseOurAtk />,
    their_atk:  <PhaseTheirAtk />,
    resolve:    <PhaseResolve />,
    cycle_done: <PhaseCycleDone />,
  };

  // Step bar
  const steps = ['Defenders','Reveal','Attackers','Reveal','Resolve'];
  const stepPhase = { our_def:0, their_def:1, our_atk:2, their_atk:3, resolve:4, cycle_done:4 };
  const curStep = stepPhase[phase] ?? 0;

  return (
    <div style={{ maxWidth:940, margin:'0 auto', padding:'28px 16px' }}>
      <Back onClick={onBack} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <Tag color={C.dim} block mb={4}>Round Pairing vs</Tag>
          <Cine size={24} weight={900}>{team.name}</Cine>
        </div>
        <div style={{ textAlign:'right' }}>
          <Tag color={C.dim} block mb={4}>Pairings</Tag>
          <span style={{ fontFamily:'Cinzel, serif', fontSize:26, fontWeight:900, color:C.gold }}>{pairings.length}<span style={{ color:C.dim, fontSize:13 }}> / 5</span></span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height:2, background:C.bord, marginBottom:14 }}>
        <div style={{ height:'100%', background:C.gold, width:`${(pairings.length/5)*100}%`, transition:'width 0.5s' }} />
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', gap:0, marginBottom:22 }}>
        {steps.map((s, i) => {
          const done = i < curStep, active = i === curStep;
          return (
            <div key={i} style={{ flex:1, borderTop:`2px solid ${done||active ? C.gold : C.bord}`, paddingTop:7, opacity:done||active ? 1 : 0.3 }}>
              <div style={{ fontFamily:'Cinzel, serif', fontSize:7, letterSpacing:1.5, color:active ? C.gold : done ? C.goldD : C.dim }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div className="pair-layout">
        <div style={{ flex:1, border:`1px solid ${C.bord}`, padding:'22px 20px', minWidth:0 }}>
          {panels[phase]}
        </div>
        {sidebar}
      </div>

      {pairings.length > 0 && (
        <div style={{ marginTop:22 }}>
          <Divider label="Confirmed Pairings" />
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {pairings.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'9px 14px', border:'1px solid #1a361a', background:'rgba(18,54,18,0.05)' }}>
                <span style={{ fontFamily:'Cinzel, serif', fontSize:8, color:C.dim, minWidth:58, letterSpacing:1 }}>TABLE {i+1}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:11, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:11, color:C.dim, fontStyle:'italic', marginLeft:6 }}>{p.us.faction}</span>
                </div>
                <span style={{ color:C.goldD, margin:'0 8px' }}>⚔</span>
                <div style={{ flex:1, textAlign:'right' }}>
                  <span style={{ fontSize:11, color:C.dim, fontStyle:'italic', marginRight:6 }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:11, color:C.red }}>{p.them.faction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── KENT TEAMS ───────────────────────────────────────────────────────────────

const mkp = fs => fs.map(faction => ({ faction }));

const KENT_TEAMS = [
  { id:'kt-01', name:'Drooling Cretins',            players: mkp(['Drukhari','Grey Knights','Custodes','Tau','Victrix spam']) },
  { id:'kt-02', name:'Egg Fried Dice',              players: mkp(['Custodes','Grey Knights','Eldar','Necrons','Gladius']) },
  { id:'kt-03', name:'Warhomies',                   players: mkp(['CK','IK','TS','Tau','Necrons']) },
  { id:'kt-04', name:'Get Vekt',                    players: mkp(['CSM','Deathwatch','Guard','IK','Tau']) },
  { id:'kt-05', name:'Gothic Games Canterbury',     players: mkp(['Guard','IK','CSM','Necrons','Nids']) },
  { id:'kt-06', name:'Kent Knight - Business',      players: mkp(['Deathwatch','TS','Sisters','CSM','Necrons']) },
  { id:'kt-07', name:'Kent Knights - Shield',       players: mkp(['Daemons','DG','WE','DA','Eldar']) },
  { id:'kt-09', name:'Shed',                        players: mkp(['Guard','Victrix spam','CSM','Tau','Necrons']) },
  { id:'kt-10', name:'Shedhammer - Fun Comes First',players: mkp(['Guard','Daemons','WE','Ad Mech','Nids']) },
  { id:'kt-11', name:'Shedhammer - The B Teams',    players: mkp(['Drukhari','Victrix spam','CSM','DG','Necrons']) },
  { id:'kt-12', name:'Surrey Primarche',            players: mkp(['Guard','Custodes','TS','Victrix spam','Necrons']) },
  { id:'kt-13', name:'Team Hivemind - Bar',         players: mkp(['Victrix spam','Orks','Votan','Tau','Nids']) },
  { id:'kt-14', name:'Team Hivemind',               players: mkp(['Tau','WE','DG','BA','Necrons']) },
  { id:'kt-15', name:'TryHardWargaming',            players: mkp(['CK','BA','TS','Custodes','Necrons']) },
  { id:'kt-16', name:'Tunbridge Wells Wargaming',   players: mkp(['Guard','DG','CSM','Deathwatch','Daemons']) },
  { id:'kt-17', name:"Vee's Vegabonds",             players: mkp(['CSM','DG','EC','Orks','Necrons']) },
];
// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('home');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editTeam, setEditTeam] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ragnarok-teams');
      if (stored) {
        setTeams(JSON.parse(stored));
      } else {
        setTeams(KENT_TEAMS);
        localStorage.setItem('ragnarok-teams', JSON.stringify(KENT_TEAMS));
      }
    } catch {
      setTeams(KENT_TEAMS);
    }
  }, []);

  const save = t => {
    setTeams(t);
    try { localStorage.setItem('ragnarok-teams', JSON.stringify(t)); } catch {}
  };

  const handleSave = team => {
    const updated = teams.find(t => t.id === team.id)
      ? teams.map(t => t.id === team.id ? team : t)
      : [...teams, team];
    save(updated);
    setEditTeam(null);
    setScreen('home');
  };

  return (
    <>
      <style>{CSS}</style>
      {screen === 'home'    && <Home teams={teams} onSelect={t=>{setSelectedTeam(t);setScreen('matchup');}} onAdd={()=>{setEditTeam(null);setScreen('setup');}} onEdit={t=>{setEditTeam(t);setScreen('setup');}} />}
      {screen === 'setup'   && <Setup team={editTeam} onSave={handleSave} onBack={()=>setScreen('home')} />}
      {screen === 'matchup' && <Matchup team={selectedTeam} onStart={()=>setScreen('pairing')} onBack={()=>setScreen('home')} />}
      {screen === 'pairing' && <Pairing team={selectedTeam} onBack={()=>setScreen('matchup')} />}
    </>
  );
}
