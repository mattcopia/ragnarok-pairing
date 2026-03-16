import { useState, useEffect } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const DEFAULT_RAGNAROK = [
  { name: 'Jacob', faction: 'Orks (GT)', id: 0 },
  { name: 'Matt',  faction: 'Custodes',  id: 1 },
  { name: 'Alex',  faction: 'Space Wolves', id: 2 },
  { name: 'Ollie', faction: 'Necrons',   id: 3 },
  { name: 'Paul',  faction: 'Sisters',   id: 4 },
];

let RAGNAROK = JSON.parse(JSON.stringify(DEFAULT_RAGNAROK));
const DEFAULT_TEAM_NAME = 'Ragnarok';
let teamName = DEFAULT_TEAM_NAME;

const DEFAULT_FACTIONS = [
  'Ad Mech','Black Templars','Blood Angels','Chaos Knights','CSM','Custodes',
  'Daemons','Dark Angels','Death Guard','Deathwatch','Drukhari','Eldar',
  "Emperor's Children",'Gladius','Grey Knights','GSC','Imperial Guard',
  'Imperial Knights','Necrons','Orks','Other Marines','Sisters',
  'Tau','Thousand Sons','Tyranids','Ultramarines','Votan','Wolves','World Eaters'
];

let FACTIONS = [...DEFAULT_FACTIONS];

const DEFAULT_MATRIX = {
  Jacob: {Daemons:'W','Chaos Knights':'L','World Eaters':'PS','Death Guard':'L',"Emperor's Children":'W-','Thousand Sons':'?',CSM:'W',Tau:'W++',Orks:'PS',Necrons:'W+',GSC:'W++',Drukhari:'W',Eldar:'W++',Tyranids:'W',Votan:'W',Sisters:'W++',Custodes:'W','Ad Mech':'W','Imperial Guard':'L','Imperial Knights':'PS','Grey Knights':'W++','Blood Angels':'W',Wolves:'W','Dark Angels':'W','Black Templars':'W',Deathwatch:'L',Gladius:'W-',Ultramarines:'L','Other Marines':'W'},
  Matt:  {Daemons:'W','Chaos Knights':'W+','World Eaters':'W','Death Guard':'W++',"Emperor's Children":'?','Thousand Sons':'?',CSM:'W',Tau:'L',Orks:'W',Necrons:'L',GSC:'W',Drukhari:'PS',Eldar:'W',Tyranids:'W++',Votan:'W++',Sisters:'L',Custodes:'PS','Ad Mech':'L','Imperial Guard':'W-','Imperial Knights':'W++','Grey Knights':'W++','Blood Angels':'L',Wolves:'PS','Dark Angels':'L','Black Templars':'W+',Deathwatch:'?',Gladius:'W',Ultramarines:'L','Other Marines':'W'},
  Alex:  {Daemons:'W','Chaos Knights':'L','World Eaters':'PS','Death Guard':'W',"Emperor's Children":'?','Thousand Sons':'?',CSM:'W',Tau:'W',Orks:'W',Necrons:'L',GSC:'W',Drukhari:'W++',Eldar:'W++',Tyranids:'W++',Votan:'W',Sisters:'W',Custodes:'PS','Ad Mech':'?','Imperial Guard':'W-','Imperial Knights':'L','Grey Knights':'W++','Blood Angels':'W-',Wolves:'PS','Dark Angels':'W','Black Templars':'W++',Deathwatch:'L',Gladius:'W',Ultramarines:'L','Other Marines':'W++'},
  Ollie: {Daemons:'?','Chaos Knights':'W++','World Eaters':'L','Death Guard':'W++',"Emperor's Children":'W','Thousand Sons':'W++',CSM:'W',Tau:'W++',Orks:'PS',Necrons:'PS',GSC:'W++',Drukhari:'W',Eldar:'W',Tyranids:'PS',Votan:'W',Sisters:'PS',Custodes:'W++','Ad Mech':'W','Imperial Guard':'L','Imperial Knights':'W++','Grey Knights':'W','Blood Angels':'L',Wolves:'PS','Dark Angels':'W++','Black Templars':'W',Deathwatch:'L',Gladius:'PS',Ultramarines:'W++','Other Marines':'W'},
  Paul:  {Daemons:'W','Chaos Knights':'L','World Eaters':'W++','Death Guard':'W',"Emperor's Children":'?','Thousand Sons':'W',CSM:'PS',Tau:'L',Orks:'W',Necrons:'PS',GSC:'PS',Drukhari:'W++',Eldar:'W',Tyranids:'W++',Votan:'L',Sisters:'W',Custodes:'W++','Ad Mech':'?','Imperial Guard':'W','Imperial Knights':'L','Grey Knights':'W++','Blood Angels':'PS',Wolves:'W++','Dark Angels':'W','Black Templars':'W++',Deathwatch:'?',Gladius:'W',Ultramarines:'?','Other Marines':'W++'},
};

const FIREBASE_URL = 'https://ragnarok-18886-default-rtdb.firebaseio.com';
const RATINGS = ['W++','W+','W','W-','PS','?','L-','L','L+'];

let matrix = JSON.parse(JSON.stringify(DEFAULT_MATRIX));

const DEFAULT_DEFS = {
  'W++':{ label:'Strong Win',      score:4.0, desc:'46+ VP diff — 19-20 game pts' },
  'W+': { label:'Comfortable Win', score:3.5, desc:'31-45 VP diff — 16-18 game pts' },
  'W':  { label:'Slight Edge',     score:3.0, desc:'11-30 VP diff — 12-15 game pts' },
  'W-': { label:'Narrow Edge',     score:2.5, desc:'6-10 VP diff — 11-9 game pts' },
  'PS': { label:'Player Skill',    score:2.0, desc:'~0 VP diff — depends on execution' },
  '?':  { label:'Unknown',         score:2.0, desc:'No data — assume 10-10 draw' },
  'L-': { label:'Narrow Loss',     score:1.5, desc:'6-10 VP diff against — 9-11 game pts' },
  'L':  { label:'Mild Loss',       score:1.0, desc:'11-30 VP diff against — 5-8 game pts' },
  'L+': { label:'Heavy Loss',      score:0.0, desc:'31+ VP diff against — 0-4 game pts' },
};

let defs = JSON.parse(JSON.stringify(DEFAULT_DEFS));

const BG_COL = { 'W++':'#0a350a', 'W+':'#123c12', W:'#0e1e3a', 'W-':'#2e2210', PS:'#1e0e2e', '?':'#141414', 'L-':'#2a1010', L:'#380808', 'L+':'#400404' };
const FG_COL = { 'W++':'#4adc4a', 'W+':'#30c830', W:'#5a90e0', 'W-':'#c09430', PS:'#b480d0', '?':'#8a8a8a', 'L-':'#d09060', L:'#e86050', 'L+':'#f03030' };

const gr  = (p, f)  => matrix[p]?.[f] ?? '?';
const gs  = (p, f)  => (defs[gr(p,f)]?.score) ?? 2;
const avg = (p, fs) => fs.length ? fs.reduce((s,f)=>s+gs(p,f),0)/fs.length : 0;

// Brute-force optimal pairing (5! = 120 permutations)
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0,i), ...arr.slice(i+1)];
    for (const p of permutations(rest)) result.push([arr[i], ...p]);
  }
  return result;
}

// Map rating score to expected game points for that table
function scoreToGamePts(s) {
  // score 4=19.5, 3.5=17, 3=13.5, 2.5=11, 2=10, 1.5=9, 1=6.5, 0=2
  if (s >= 4)   return 19.5;
  if (s >= 3.5) return 17;
  if (s >= 3)   return 13.5;
  if (s >= 2.5) return 11;
  if (s >= 2)   return 10;
  if (s >= 1.5) return 9;
  if (s >= 1)   return 6.5;
  return 2;
}

function winChance(theirFacs) {
  if (!theirFacs.length || !RAGNAROK.length) return 50;
  const n = Math.min(RAGNAROK.length, theirFacs.length);
  const perms = permutations(theirFacs.map((_, i) => i));

  // Find optimal pairing total game points
  let bestGP = 0;
  for (const perm of perms) {
    let gp = 0;
    for (let i = 0; i < n; i++) {
      gp += scoreToGamePts(gs(RAGNAROK[i].name, theirFacs[perm[i]]));
    }
    bestGP = Math.max(bestGP, gp);
  }

  // Discount ~15% since you don't get to freely choose pairings
  const realisticGP = bestGP * 0.85 + 50 * 0.15;

  // Convert to win probability: 55+ = win, 45- = loss, sigmoid around 50
  const margin = realisticGP - 50;
  const pct = Math.round(50 + (margin / 50) * 50);
  return Math.min(95, Math.max(5, pct));
}

// VP ↔ Game Points conversion
function vpDiffToGP(diff) {
  if (diff > 50) return [20, 0];
  const bracket = Math.min(Math.floor(diff / 5), 10);
  return [10 + bracket, 10 - bracket];
}

function vpToGP(ourVP, theirVP) {
  const diff = Math.abs(ourVP - theirVP);
  const [winGP, loseGP] = vpDiffToGP(diff);
  return ourVP >= theirVP ? [winGP, loseGP] : [loseGP, winGP];
}

// Map actual game points to a suggested rating
function gpToSuggestedRating(ourGP) {
  if (ourGP >= 19) return 'W++';
  if (ourGP >= 16) return 'W+';
  if (ourGP >= 12) return 'W';
  if (ourGP >= 11) return 'W-';
  if (ourGP >= 10) return 'PS';
  if (ourGP >= 9)  return 'L-';
  if (ourGP >= 5)  return 'L';
  return 'L+';
}

// ─── THEME ────────────────────────────────────────────────────────────────────

const C = {
  bg:'#07080b', surf:'#0b0d13', bord:'#18202e',
  gold:'#c8a848', goldD:'#a08838', goldB:'#e0c060',
  text:'#b8b0a0', dim:'#9a9488', white:'#e8e0d0',
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
  return (
    <span style={{ display:'inline-block', padding:'4px 8px', background:BG_COL[r]??'#141414',
      color:FG_COL[r]??'#686868', fontSize:12, fontWeight:700, fontFamily:'monospace',
      minWidth:32, textAlign:'center', letterSpacing:0.5 }}>
      {r ?? '?'}
    </span>
  );
}

function ScoreColor(s) { return s >= 3 ? C.green : s >= 2.5 ? C.gold : s >= 2 ? '#c08030' : s >= 1 ? '#d09060' : C.red; }

function Tag({ children, color = C.goldD, block, mb = 0, center }) {
  return (
    <span style={{ fontFamily:'Cinzel, serif', fontSize:12, letterSpacing:3, color,
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
      padding:sm ? '10px 16px' : '12px 22px',
      fontSize:sm ? 11 : 12, letterSpacing:2.5,
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
      fontFamily:'Cinzel, serif', fontSize:12, letterSpacing:2, cursor:'pointer', marginBottom:20, padding:0 }}>
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
        <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{player.faction}</div>
      </div>
      <div style={{ display:'flex', gap:5, flex:1, flexWrap:'wrap' }}>
        {factions.map((f, i) => <Badge key={i} r={gr(player.name, f)} />)}
      </div>
      <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:ScoreColor(a), minWidth:26, textAlign:'right' }}>{a.toFixed(1)}</span>
    </div>
  );
}

// ─── RATINGS EDITOR ──────────────────────────────────────────────────────────

function Ratings({ matrixData, onSave, onBack }) {
  const [selected, setSelected] = useState(RAGNAROK[0].name);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const playerRatings = matrixData[selected] ?? {};

  const cycle = (faction) => {
    const cur = playerRatings[faction] ?? 'N';
    const idx = RATINGS.indexOf(cur);
    const next = RATINGS[(idx + 1) % RATINGS.length];
    const updated = { ...matrixData, [selected]: { ...playerRatings, [faction]: next } };
    setSaving(true);
    onSave(updated).then(() => {
      setSaving(false);
      setLastSaved(new Date());
    });
  };

  const resetPlayer = () => {
    const updated = { ...matrixData, [selected]: { ...DEFAULT_MATRIX[selected] } };
    setSaving(true);
    onSave(updated).then(() => {
      setSaving(false);
      setLastSaved(new Date());
    });
  };

  const resetAll = () => {
    setSaving(true);
    onSave(JSON.parse(JSON.stringify(DEFAULT_MATRIX))).then(() => {
      setSaving(false);
      setLastSaved(new Date());
    });
  };

  const changed = (p) => {
    const def = DEFAULT_MATRIX[p] ?? {};
    const cur = matrixData[p] ?? {};
    return FACTIONS.some(f => (cur[f] ?? 'N') !== (def[f] ?? 'N'));
  };

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Matchup Matrix</Tag>
      <Cine size={24} weight={900} mb={6}>Edit Ratings</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Tap a rating to cycle through: G → A+ → A → A- → PS → N → R
      </p>

      {/* Player tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
        {RAGNAROK.map(r => {
          const sel = selected === r.name;
          const mod = changed(r.name);
          return (
            <button key={r.id} onClick={() => setSelected(r.name)} style={{
              border:`1px solid ${sel ? C.gold : C.bord}`, background:sel ? 'rgba(200,168,72,0.1)' : 'transparent',
              color:sel ? C.gold : C.text, padding:'8px 14px', cursor:'pointer',
              fontFamily:'Cinzel, serif', fontSize:12, fontWeight:sel ? 700 : 400, letterSpacing:1,
              position:'relative'
            }}>
              {r.name}
              {mod && <span style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:3, background:C.gold }} />}
            </button>
          );
        })}
      </div>

      {/* Faction list */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:24 }}>
        {[...FACTIONS].sort((a,b)=>a.localeCompare(b)).map(f => {
          const r = playerRatings[f] ?? '?';
          const def = DEFAULT_MATRIX[selected]?.[f] ?? '?';
          const isChanged = r !== def;
          return (
            <div key={f} onClick={() => cycle(f)} style={{
              display:'flex', alignItems:'center', gap:12, padding:'9px 14px', cursor:'pointer',
              border:`1px solid ${isChanged ? C.goldD : C.bord}`,
              background:isChanged ? 'rgba(200,168,72,0.04)' : 'transparent',
              transition:'border-color 0.12s'
            }}>
              <div style={{ flex:1 }}>
                <span style={{ fontFamily:'Cinzel, serif', fontSize:13, color:C.white }}>{f}</span>
                {isChanged && <span style={{ fontSize:12, color:C.goldD, marginLeft:8 }}>was {def}</span>}
              </div>
              <Badge r={r} />
              <span style={{ fontSize:12, color:FG_COL[r] ?? '#8a8a8a', minWidth:70, textAlign:'right' }}>{defs[r]?.label}</span>
            </div>
          );
        })}
      </div>

      {/* Status + actions */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        {saving && <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn ghost sm onClick={resetPlayer}>Reset {selected}</Btn>
        <Btn ghost sm onClick={resetAll}>Reset All to Defaults</Btn>
      </div>
    </div>
  );
}

// ─── DEFINITIONS EDITOR ──────────────────────────────────────────────────────

function Definitions({ defsData, onSave, onBack }) {
  const [local, setLocal] = useState(JSON.parse(JSON.stringify(defsData)));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const update = (key, field, value) => {
    const next = { ...local, [key]: { ...local[key], [field]: value } };
    setLocal(next);
  };

  const handleSave = () => {
    setSaving(true);
    onSave(local).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  const handleReset = () => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_DEFS));
    setLocal(fresh);
    setSaving(true);
    onSave(fresh).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Scoring System</Tag>
      <Cine size={24} weight={900} mb={6}>Rating Definitions</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Edit labels, scores, and descriptions for each rating tier.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
        {RATINGS.map(key => {
          const d = local[key] ?? {};
          const def = DEFAULT_DEFS[key] ?? {};
          const changed = d.label !== def.label || d.score !== def.score || d.desc !== def.desc;
          return (
            <div key={key} style={{ border:`1px solid ${changed ? C.goldD : C.bord}`, padding:'14px 16px',
              background:changed ? 'rgba(200,168,72,0.04)' : 'transparent' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <Badge r={key} />
                <span style={{ fontFamily:'Cinzel, serif', fontSize:14, fontWeight:700, color:FG_COL[key] ?? C.text }}>{key}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div>
                  <Tag block mb={4} color={C.dim}>Label</Tag>
                  <input value={d.label ?? ''} onChange={e => update(key, 'label', e.target.value)}
                    style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
                      padding:'8px 10px', fontSize:13, fontFamily:'Cinzel, serif', outline:'none' }} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <Tag block mb={4} color={C.dim}>Score</Tag>
                    <input type="number" step="0.5" min="0" max="5" value={d.score ?? 0}
                      onChange={e => update(key, 'score', parseFloat(e.target.value) || 0)}
                      style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
                        padding:'8px 10px', fontSize:13, fontFamily:'monospace', outline:'none' }} />
                  </div>
                </div>
                <div>
                  <Tag block mb={4} color={C.dim}>Description</Tag>
                  <input value={d.desc ?? ''} onChange={e => update(key, 'desc', e.target.value)}
                    style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.text,
                      padding:'8px 10px', fontSize:13, outline:'none' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        {saving && <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn gold onClick={handleSave}>Save Definitions</Btn>
        <Btn ghost sm onClick={handleReset}>Reset to Defaults</Btn>
      </div>
    </div>
  );
}

// ─── BURGER MENU ─────────────────────────────────────────────────────────────

function NavBar({ activeEvent, onRatings, onDefs, onOurTeam, onFactions, onEvents, onEditEvent }) {
  const [open, setOpen] = useState(false);
  const items = activeEvent ? [
    { label: 'Back to Events', action: onEvents },
    { label: 'Edit Event', action: onEditEvent },
    { label: 'Edit Player Rankings', action: onRatings },
    { label: 'Define Rankings', action: onDefs },
    { label: 'Edit Our Team', action: onOurTeam },
    { label: 'Manage Factions', action: onFactions },
  ] : [
    { label: 'Define Rankings', action: onDefs },
    { label: 'Manage Factions', action: onFactions },
  ].filter(i => i.action);
  return (
    <>
      <nav style={{
        position:'sticky', top:0, zIndex:100, background:C.bg,
        borderBottom:`1px solid ${C.bord}`, display:'flex', alignItems:'center',
        padding:'0 16px', height:48
      }}>
        <div style={{ fontFamily:'Cinzel, serif', fontSize:14, fontWeight:700, color:C.gold, letterSpacing:2, flex:1 }}>
          {activeEvent ? activeEvent.name : 'Tactical Teams Console'}
        </div>
        <button onClick={() => setOpen(true)} style={{
          background:'transparent', border:`1px solid ${C.bord}`, color:C.gold,
          width:44, height:44, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, fontFamily:'monospace'
        }}>
          ☰
        </button>
      </nav>
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:C.bg,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <button onClick={() => setOpen(false)} style={{
            position:'absolute', top:6, right:16, background:'transparent', border:`1px solid ${C.bord}`,
            color:C.gold, width:44, height:44, cursor:'pointer', fontSize:16, fontFamily:'monospace',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            ✕
          </button>
          <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
            {items.map((item, i) => (
              <button key={i} onClick={() => { setOpen(false); item.action(); }} style={{
                background:'transparent', border:'none', color:C.text, padding:'16px 24px', cursor:'pointer',
                fontFamily:'Cinzel, serif', fontSize:18, letterSpacing:2, textAlign:'center'
              }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.text}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── EDIT OUR TEAM ───────────────────────────────────────────────────────────

function EditOurTeam({ roster, currentTeamName, onSave, onBack }) {
  const [players, setPlayers] = useState(JSON.parse(JSON.stringify(roster)));
  const [name, setName] = useState(currentTeamName);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const update = (i, field, value) => {
    const next = [...players];
    next[i] = { ...next[i], [field]: value };
    setPlayers(next);
  };

  const handleSave = () => {
    setSaving(true);
    onSave(players, name).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  return (
    <div style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Our Team</Tag>
      <Cine size={24} weight={900} mb={6}>Edit Our Team</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Update team name, player names and factions.
      </p>

      <Tag block mb={8}>Team Name</Tag>
      <input value={name} onChange={e => setName(e.target.value)}
        style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
          padding:'10px 14px', fontSize:16, fontFamily:'Cinzel, serif', fontWeight:600,
          marginBottom:24, outline:'none' }} />

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
        {players.map((p, i) => (
          <div key={i} style={{ border:`1px solid ${C.bord}`, padding:'14px 16px' }}>
            <Tag block mb={6} color={C.dim}>Player {i + 1}</Tag>
            <div style={{ display:'flex', gap:10, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <Tag block mb={4} color={C.dim}>Name</Tag>
                <input value={p.name} onChange={e => update(i, 'name', e.target.value)}
                  style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
                    padding:'8px 10px', fontSize:14, fontFamily:'Cinzel, serif', fontWeight:600, outline:'none' }} />
              </div>
            </div>
            <Tag block mb={4} color={C.dim}>Faction</Tag>
            <input value={p.faction} onChange={e => update(i, 'faction', e.target.value)}
              style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.text,
                padding:'8px 10px', fontSize:13, outline:'none' }} />
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        {saving && <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <Btn gold full onClick={handleSave}>Save Team</Btn>
    </div>
  );
}

// ─── MANAGE FACTIONS ─────────────────────────────────────────────────────────

function ManageFactions({ factionList, onSave, onBack }) {
  const [local, setLocal] = useState([...factionList]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const update = (i, value) => { const next = [...local]; next[i] = value; setLocal(next); };
  const remove = (i) => setLocal(local.filter((_, idx) => idx !== i));
  const add = () => setLocal([...local, '']);

  const handleSave = () => {
    const cleaned = local.filter(f => f.trim());
    setSaving(true);
    onSave(cleaned).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  const handleReset = () => {
    const fresh = [...DEFAULT_FACTIONS];
    setLocal(fresh);
    setSaving(true);
    onSave(fresh).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  return (
    <div style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Faction List</Tag>
      <Cine size={24} weight={900} mb={6}>Manage Factions</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Add, remove, or rename factions. These appear in opponent setup and the ratings editor.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
        {local.map((f, i) => (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input value={f} onChange={e => update(i, e.target.value)}
              style={{ flex:1, background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
                padding:'8px 10px', fontSize:13, outline:'none' }} />
            <button onClick={() => remove(i)} style={{
              background:'transparent', border:`1px solid ${C.bord}`, color:C.red,
              width:44, height:44, cursor:'pointer', fontSize:14, fontFamily:'monospace'
            }}>✕</button>
          </div>
        ))}
      </div>

      <Btn ghost sm onClick={add} style={{ marginBottom:20 }}>+ Add Faction</Btn>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        {saving && <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn gold onClick={handleSave}>Save Factions</Btn>
        <Btn ghost sm onClick={handleReset}>Reset to Defaults</Btn>
      </div>
    </div>
  );
}

// ─── EVENT LIST ──────────────────────────────────────────────────────────────

function EventList({ events, onSelect, onAdd }) {
  const sorted = [...events].sort((a, b) => (b.dates?.start ?? '').localeCompare(a.dates?.start ?? ''));
  return (
    <div style={{ maxWidth:840, margin:'0 auto', padding:'24px 20px' }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <Cine size={20} weight={900} mb={8}>Your Events</Cine>
        <p style={{ color:C.dim, fontSize:14, fontStyle:'italic' }}>
          Select a tournament to manage pairings and track results
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:12 }}>
        {sorted.map(evt => {
          const roundsDone = Object.keys(evt.rounds ?? {}).filter(k => evt.rounds[k]?.complete).length;
          return (
            <div key={evt.id} onClick={() => onSelect(evt)} style={{
              border:`1px solid ${C.bord}`, padding:'16px 18px', cursor:'pointer', transition:'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
              <Cine size={15} weight={700} mb={4}>{evt.name}</Cine>
              <div style={{ fontSize:12, color:C.dim, marginBottom:8 }}>
                {evt.dates?.start ?? 'TBC'}{evt.dates?.end && evt.dates.end !== evt.dates.start ? ` — ${evt.dates.end}` : ''}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Tag color={C.dim}>{(evt.opponents ?? []).length} opponents</Tag>
                <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:roundsDone > 0 ? C.gold : C.dim }}>
                  {roundsDone}/{evt.numRounds ?? 5}
                </span>
              </div>
            </div>
          );
        })}
        <div onClick={onAdd} style={{
          border:`1px dashed ${C.bord}`, padding:'16px 18px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, minHeight:80,
          transition:'border-color 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
          <div style={{ fontSize:22, color:C.dim }}>+</div>
          <Tag color={C.dim}>New Event</Tag>
        </div>
      </div>
    </div>
  );
}

// ─── EVENT SETUP ─────────────────────────────────────────────────────────────

function EventSetup({ event, events, onSave, onDelete, onBack }) {
  const [name, setName] = useState(event?.name ?? '');
  const [startDate, setStartDate] = useState(event?.dates?.start ?? '');
  const [endDate, setEndDate] = useState(event?.dates?.end ?? '');
  const [numRounds, setNumRounds] = useState(event?.numRounds ?? 5);
  const [copyFrom, setCopyFrom] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);

  const ok = name && numRounds > 0;

  const handleSave = () => {
    let base = {
      teamName: DEFAULT_TEAM_NAME,
      roster: JSON.parse(JSON.stringify(DEFAULT_RAGNAROK)),
      matrix: JSON.parse(JSON.stringify(DEFAULT_MATRIX)),
      opponents: [],
      rounds: {},
    };

    if (copyFrom && !event) {
      const src = (events ?? []).find(e => e.id === copyFrom);
      if (src) {
        base.teamName = src.teamName;
        base.roster = JSON.parse(JSON.stringify(src.roster));
        base.matrix = JSON.parse(JSON.stringify(src.matrix));
        base.opponents = JSON.parse(JSON.stringify(src.opponents ?? []));
      }
    }

    if (event) {
      base = { teamName: event.teamName, roster: event.roster, matrix: event.matrix, opponents: event.opponents, rounds: event.rounds };
    }

    onSave({
      ...base,
      id: event?.id ?? `evt-${Date.now()}`,
      name,
      dates: { start: startDate, end: endDate },
      numRounds: parseInt(numRounds) || 5,
    });
  };

  return (
    <div style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>{event ? 'Edit Event' : 'New Event'}</Tag>
      <Cine size={24} weight={900} mb={28}>{event ? 'Edit Event' : 'Create Event'}</Cine>

      <Tag block mb={8}>Event Name</Tag>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kent Teams March 2026"
        style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white,
          padding:'10px 14px', fontSize:16, fontFamily:'Cinzel, serif', fontWeight:600, marginBottom:20, outline:'none' }} />

      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <div style={{ flex:1 }}>
          <Tag block mb={8}>Start Date</Tag>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'8px 10px', fontSize:13, outline:'none' }} />
        </div>
        <div style={{ flex:1 }}>
          <Tag block mb={8}>End Date</Tag>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'8px 10px', fontSize:13, outline:'none' }} />
        </div>
      </div>

      <Tag block mb={8}>Number of Rounds</Tag>
      <input type="number" min="1" max="10" value={numRounds} onChange={e => setNumRounds(e.target.value)}
        style={{ width:80, background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'8px 10px', fontSize:13, fontFamily:'monospace', outline:'none', marginBottom:20 }} />

      {!event && (events ?? []).length > 0 && (
        <>
          <Tag block mb={8} color={C.dim}>Copy Roster & Rankings From</Tag>
          <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)}
            style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:copyFrom ? C.text : C.dim, padding:'8px 10px', fontSize:13, outline:'none', marginBottom:20 }}>
            <option value="">— Start Fresh —</option>
            {(events ?? []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </>
      )}

      <Btn gold full disabled={!ok} onClick={handleSave}>
        {event ? 'Save Changes' : 'Create Event'}
      </Btn>

      {event && onDelete && (
        <div style={{ marginTop:24, borderTop:`1px solid ${C.bord}`, paddingTop:20 }}>
          {!confirmDel ? (
            <Btn ghost sm full onClick={() => setConfirmDel(true)} style={{ color:C.red, borderColor:'#3a1818' }}>
              Delete Event
            </Btn>
          ) : (
            <div style={{ display:'flex', gap:10 }}>
              <Btn sm full onClick={() => onDelete(event.id)} style={{ background:'#3a1010', color:C.red, borderColor:C.red }}>
                Confirm Delete
              </Btn>
              <Btn ghost sm full onClick={() => setConfirmDel(false)}>Cancel</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function Home({ teams, rounds = {}, event, onSelect, onAdd, onEdit, onRound }) {
  const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  // Standings
  const completedRounds = Object.values(rounds).filter(r => r && r.complete);
  const totalOurGP = completedRounds.reduce((s, r) => s + (r.scores ?? []).reduce((s2, sc) => s2 + (parseInt(sc.ourGP) || 0), 0), 0);
  const totalTheirGP = completedRounds.reduce((s, r) => s + (r.scores ?? []).reduce((s2, sc) => s2 + (parseInt(sc.theirGP) || 0), 0), 0);
  const wins = completedRounds.filter(r => (r.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0) >= 55).length;
  const losses = completedRounds.filter(r => (r.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0) <= 45).length;
  const draws = completedRounds.length - wins - losses;

  const playerStats = RAGNAROK.map(r => {
    let gp = 0, games = 0;
    completedRounds.forEach(round => {
      (round.scores ?? []).forEach((sc, idx) => {
        const pairing = (round.pairings ?? [])[idx];
        if (pairing && pairing.usIdx === r.id) { gp += parseInt(sc.ourGP) || 0; games++; }
      });
    });
    return { ...r, gp, games, avg: games > 0 ? (gp / games).toFixed(1) : '-' };
  });

  return (
    <div style={{ maxWidth:840, margin:'0 auto', padding:'24px 20px' }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <Tag color={C.gold} block mb={10}>Team: {teamName}</Tag>
        {completedRounds.length > 0 && (
          <>
            <div style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:16 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:C.gold }}>{wins}-{draws}-{losses}</div>
                <Tag color={C.dim}>W-D-L</Tag>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:totalOurGP > totalTheirGP ? C.green : totalOurGP < totalTheirGP ? C.red : C.gold }}>{totalOurGP}-{totalTheirGP}</div>
                <Tag color={C.dim}>Game Points</Tag>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:20, maxWidth:500, margin:'0 auto 20px' }}>
              {[...playerStats].sort((a, b) => b.gp - a.gp).map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', padding:'6px 12px', border:`1px solid ${C.bord}`, gap:10 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.white, flex:1 }}>{p.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{p.faction}</span>
                  <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:C.gold, minWidth:30, textAlign:'right' }}>{p.gp}</span>
                  <span style={{ fontSize:12, color:C.dim }}>({p.games}g, avg {p.avg})</span>
                </div>
              ))}
            </div>
          </>
        )}
        {completedRounds.length === 0 && (
          <p style={{ color:C.dim, fontSize:15, fontStyle:'italic' }}>
            Select your round opponent to view matchups and begin pairing
          </p>
        )}
      </div>

      <Divider label="Opponents" />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:12, marginTop:12 }}>
        {sorted.map(t => {
          const facs = t.players.map(p => p.faction);
          return (
            <div key={t.id} onClick={() => onSelect(t)} style={{ border:`1px solid ${C.bord}`, padding:'14px 16px', cursor:'pointer', transition:'border-color 0.15s',
              display:'flex', flexDirection:'column', gap:8 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
              <Cine size={14} weight={700}>{t.name}</Cine>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {facs.map((f, i) => (
                  <span key={i} style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{f}{i < facs.length - 1 ? ',' : ''}</span>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', marginTop:4 }}>
                <button onClick={e => { e.stopPropagation(); onEdit(t); }} style={{
                  background:'transparent', border:`1px solid ${C.bord}`, color:C.dim, padding:'8px 12px',
                  fontSize:12, fontFamily:'Cinzel, serif', cursor:'pointer', letterSpacing:1
                }}>Edit</button>
              </div>
            </div>
          );
        })}
        <div onClick={onAdd} style={{ border:`1px dashed ${C.bord}`, padding:'14px 16px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, minHeight:80,
          transition:'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
          <div style={{ fontSize:22, color:C.dim }}>+</div>
          <Tag color={C.dim}>Add Opponent</Tag>
        </div>
      </div>

      {/* Rounds */}
      {event && (
        <>
          <Divider label="Rounds" />
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
            {Array.from({ length: event.numRounds ?? 5 }, (_, i) => i + 1).map(n => {
              const round = rounds[n];
              const opp = round?.opponentId ? teams.find(t => t.id === round.opponentId) : null;
              const complete = round?.complete;
              const ourTotal = complete ? (round.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0) : null;
              const theirTotal = complete ? (round.scores ?? []).reduce((s, sc) => s + (parseInt(sc.theirGP) || 0), 0) : null;
              const result = ourTotal !== null ? (ourTotal >= 55 ? 'W' : ourTotal <= 45 ? 'L' : 'D') : null;
              const resultCol = result === 'W' ? C.green : result === 'L' ? C.red : C.gold;
              return (
                <div key={n} onClick={() => onRound(n)} style={{
                  display:'flex', alignItems:'center', padding:'12px 16px', border:`1px solid ${C.bord}`,
                  cursor:'pointer', transition:'border-color 0.15s', gap:12
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, minWidth:60 }}>Round {n}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontFamily:'Cinzel, serif', fontSize:13, color:opp ? C.white : C.dim }}>
                      {opp ? `vs ${opp.name}` : 'Not started'}
                    </span>
                  </div>
                  {complete && (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:resultCol }}>{ourTotal}-{theirTotal}</span>
                      <span style={{ fontFamily:'Cinzel, serif', fontSize:12, fontWeight:700, color:resultCol }}>{result}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────

function Setup({ team, onSave, onDelete, onBack }) {
  const blank = Array(5).fill(null).map(() => ({ faction:'' }));
  const [name, setName] = useState(team?.name ?? '');
  const [players, setPlayers] = useState(team?.players ?? blank);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
              {[...FACTIONS].sort((a,b)=>a.localeCompare(b)).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        ))}
      </div>
      <Btn gold full disabled={!ok} onClick={() => onSave({ ...team, id:team?.id ?? Date.now().toString(), name, players })}>
        Save Team
      </Btn>

      {team && (
        <div style={{ marginTop:24, borderTop:`1px solid ${C.bord}`, paddingTop:20 }}>
          {!confirmDelete ? (
            <Btn ghost sm full onClick={() => setConfirmDelete(true)} style={{ color:C.red, borderColor:'#3a1818' }}>
              Remove Team
            </Btn>
          ) : (
            <div style={{ display:'flex', gap:10 }}>
              <Btn sm full onClick={() => { onDelete(team.id); }} style={{ background:'#3a1010', color:C.red, borderColor:C.red }}>
                Confirm Remove
              </Btn>
              <Btn ghost sm full onClick={() => setConfirmDelete(false)}>Cancel</Btn>
            </div>
          )}
        </div>
      )}
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
                    <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
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
        {RATINGS.map(k => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Badge r={k} /><span style={{ fontSize:12, color:C.dim }}>{defs[k]?.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAIRING ──────────────────────────────────────────────────────────────────

const PHASES = ['our_def','their_def','our_atk','their_atk','resolve','cycle_done'];

function Pairing({ team, onBack, onComplete }) {
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
  const [expanded, setExpanded] = useState(null);

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
    if (done) {
      setAllDone(true);
      if (onComplete) onComplete(newPairings);
    }
    setPhase('cycle_done');
  }

  function nextCycle() {
    setOurDef(null); setTheirDef(null);
    setOurAtk([]); setTheirAtk([]);
    setAcceptedTheirAtk(null); setChosenOurAtk(null);
    setCycleRes(null); setExpanded(null);
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
              <div key={r.id} style={{ padding:'8px 10px', border:`1px solid ${sideBorder[st]}`, opacity:st==='paired'?0.28:1 }}>
                <div style={{ fontFamily:'Cinzel, serif', fontSize:12, fontWeight:600, color:sideColor[st] }}>{r.name}</div>
                <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
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
              <div key={i} style={{ padding:'8px 10px', border:`1px solid ${sideBorder[st]}`, opacity:st==='paired'?0.28:1 }}>
                <div style={{ fontFamily:'Cinzel, serif', fontSize:12, fontWeight:600, color:st==='defender'?C.red:sideColor[st] }}>{p.faction}</div>
                <div style={{ fontSize:12, visibility:'hidden' }}>–</div>
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
            const exp = expanded === i;
            return (
              <div key={i} style={{ border:`1px solid ${sel ? C.gold : C.bord}`, background:sel ? 'rgba(200,168,72,0.06)' : 'transparent', transition:'border-color 0.12s' }}>
                <div onClick={() => setOurDef(sel ? null : i)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, minWidth:16 }}>#{rank+1}</span>
                  <div style={{ flex:1 }}>
                    <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                    <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                  </div>
                  <div className="def-row-badges">
                    {theirRemFacs.map((f, fi) => <Badge key={fi} r={gr(r.name, f)} />)}
                  </div>
                  <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:ScoreColor(a), minWidth:24, textAlign:'right' }}>{a.toFixed(1)}</span>
                </div>
                <div onClick={e => { e.stopPropagation(); setExpanded(exp ? null : i); }} style={{
                  padding:'0 14px 4px', cursor:'pointer', display:'flex', justifyContent:'flex-end'
                }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, letterSpacing:1 }}>{exp ? '▲ Hide' : '▼ Details'}</span>
                </div>
                {exp && (
                  <div style={{ padding:'6px 14px 12px', borderTop:`1px solid ${C.bord}`, display:'flex', flexDirection:'column', gap:4 }}>
                    {theirRemFacs.map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Badge r={gr(r.name, f)} />
                        <span style={{ fontSize:12, color:C.text }}>{f}</span>
                        <span style={{ fontSize:12, color:FG_COL[gr(r.name, f)] ?? C.dim, marginLeft:'auto' }}>{defs[gr(r.name, f)]?.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Btn gold full disabled={ourDef === null} onClick={() => { setExpanded(null); setPhase('their_def'); }}>Confirm Defender →</Btn>
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
          <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{RAGNAROK[ourDef].faction}</div>
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
                  <span style={{ fontSize:12, color:C.dim }}>we rate this</span>
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
          <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{team.players[theirDef].faction}</div>
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
                {rank === 0 && !sel && <span style={{ position:'absolute', fontFamily:'Cinzel, serif', fontSize:12, color:C.green, letterSpacing:1 }}>★</span>}
                <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, minWidth:16 }}>#{rank+1}</span>
                <div style={{ flex:1 }}>
                  <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                  <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                </div>
                <Badge r={rat} />
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, letterSpacing:2, marginBottom:14 }}>
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
                  <span style={{ fontSize:12, color:C.dim }}>our matchup</span>
                  <Badge r={rat} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, letterSpacing:2, marginBottom:14 }}>
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
                  {isRec && <span style={{ position:'absolute', top:5, right:8, fontFamily:'Cinzel, serif', fontSize:12, color:C.green, letterSpacing:1 }}>RECOMMENDED</span>}
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
                  {isRec && <span style={{ position:'absolute', top:5, right:8, fontFamily:'Cinzel, serif', fontSize:12, color:C.green, letterSpacing:1 }}>RECOMMENDED</span>}
                  <div style={{ flex:1 }}>
                    <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                    <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
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
          <Tag center block mb={18} style={{ fontSize:12, letterSpacing:5 }}>◆ All Pairings Complete ◆</Tag>
          <Cine size={22} weight={900} mb={28} color={C.gold}>Final Draw</Cine>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:32 }}>
            {pairings.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'12px 16px', border:`1px solid ${C.gold}`, background:'rgba(200,168,72,0.03)' }}>
                <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.goldD, minWidth:64, letterSpacing:1 }}>TABLE {i+1}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginLeft:6 }}>{p.us.faction}</span>
                </div>
                <span style={{ color:C.goldD, margin:'0 10px' }}>⚔</span>
                <div style={{ flex:1, textAlign:'right' }}>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginRight:6 }}>{p.them.faction}</span>
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
        <Tag block mb={18} style={{ fontSize:12, letterSpacing:4 }}>◆ Cycle Complete</Tag>
        <Cine size={20} weight={900} mb={18}>Pairings Confirmed</Cine>
        {cycleRes && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
            {[cycleRes.p1, cycleRes.p2].map((p, i) => (
              <div key={i} style={{ padding:'12px 16px', border:'1px solid #1a381a', background:'rgba(20,56,20,0.08)' }}>
                <Tag color={C.green} block mb={6}>Confirmed</Tag>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{p.us.faction}</span>
                  <span style={{ color:C.goldD }}>⚔</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{p.them.faction}</span>
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
              <div style={{ fontFamily:'Cinzel, serif', fontSize:12, letterSpacing:1.5, color:active ? C.gold : done ? C.goldD : C.dim }}>{s}</div>
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
                <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.dim, minWidth:58, letterSpacing:1 }}>TABLE {i+1}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginLeft:6 }}>{p.us.faction}</span>
                </div>
                <span style={{ color:C.goldD, margin:'0 8px' }}>⚔</span>
                <div style={{ flex:1, textAlign:'right' }}>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginRight:6 }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.red }}>{p.them.faction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── ROUND VIEW ──────────────────────────────────────────────────────────────

function RoundView({ roundNum, rounds, teams, onSave, onBack, matrixData, onSaveMatrix }) {
  const round = rounds[roundNum] ?? {};
  const [opponentId, setOpponentId] = useState(round.opponentId ?? '');
  const [scores, setScores] = useState(round.scores ?? Array.from({ length: 5 }, (_, i) => ({ table: i+1, ourVP:'', theirVP:'', ourGP:'', theirGP:'' })));
  const [inputMode, setInputMode] = useState('vp');
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const opponent = teams.find(t => t.id === opponentId);
  const pairings = round.pairings ?? [];

  const updateScore = (idx, field, value) => {
    const next = [...scores];
    next[idx] = { ...next[idx], [field]: value };
    if (inputMode === 'vp') {
      const ov = parseInt(field === 'ourVP' ? value : next[idx].ourVP);
      const tv = parseInt(field === 'theirVP' ? value : next[idx].theirVP);
      if (!isNaN(ov) && !isNaN(tv)) {
        const [og, tg] = vpToGP(ov, tv);
        next[idx].ourGP = og;
        next[idx].theirGP = tg;
      }
    }
    setScores(next);
  };

  const assignOpponent = () => {
    const updated = { ...rounds, [roundNum]: { ...round, opponentId } };
    onSave(updated);
  };

  const saveScores = () => {
    const complete = scores.every(s => (s.ourGP !== '' && s.theirGP !== ''));
    const updated = { ...rounds, [roundNum]: { ...round, opponentId: round.opponentId || opponentId, scores, complete } };
    onSave(updated);
  };

  const ourTotal = scores.reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0);
  const theirTotal = scores.reduce((s, sc) => s + (parseInt(sc.theirGP) || 0), 0);

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'28px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={8}>Round {roundNum}</Tag>
      <Cine size={22} weight={900} mb={8}>
        {opponent ? `vs ${opponent.name}` : `Round ${roundNum}`}
      </Cine>

      {!round.opponentId && (
        <div style={{ marginBottom:24 }}>
          <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:16 }}>
            Who are you facing in Round {roundNum}? Select your opponent from the list below.
          </p>
          <Tag block mb={10}>Opponent</Tag>
          <select value={opponentId} onChange={e => setOpponentId(e.target.value)}
            style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:opponentId ? C.text : C.dim, padding:'8px 10px', fontSize:13, outline:'none', marginBottom:12 }}>
            <option value="">— Select Opponent —</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Btn gold full disabled={!opponentId} onClick={assignOpponent}>Assign Opponent</Btn>
        </div>
      )}

      {(round.opponentId || opponentId) && opponent && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <Btn sm gold={inputMode === 'vp'} ghost={inputMode !== 'vp'} onClick={() => setInputMode('vp')}>Enter VP</Btn>
            <Btn sm gold={inputMode === 'gp'} ghost={inputMode !== 'gp'} onClick={() => setInputMode('gp')}>Enter Game Pts</Btn>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {scores.map((sc, idx) => {
              const pairing = pairings[idx];
              const usPlayer = pairing ? RAGNAROK.find(r => r.id === pairing.usIdx) : null;
              const themFaction = pairing && opponent ? opponent.players[pairing.themIdx]?.faction : null;
              return (
                <div key={idx} style={{ border:`1px solid ${C.bord}`, padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <Tag color={C.dim}>Table {idx + 1}</Tag>
                    {usPlayer && <span style={{ fontSize:12, color:C.blue }}>{usPlayer.name} vs <span style={{ color:C.red }}>{themFaction}</span></span>}
                  </div>
                  {inputMode === 'vp' ? (
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ flex:1 }}>
                        <Tag block mb={4} color={C.dim}>Our VP</Tag>
                        <input type="number" min="0" max="100" value={sc.ourVP} onChange={e => updateScore(idx, 'ourVP', e.target.value)}
                          style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'6px 8px', fontSize:13, fontFamily:'monospace', outline:'none' }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <Tag block mb={4} color={C.dim}>Their VP</Tag>
                        <input type="number" min="0" max="100" value={sc.theirVP} onChange={e => updateScore(idx, 'theirVP', e.target.value)}
                          style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'6px 8px', fontSize:13, fontFamily:'monospace', outline:'none' }} />
                      </div>
                      {sc.ourGP !== '' && sc.ourGP !== undefined && (
                        <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:sc.ourGP > sc.theirGP ? C.green : sc.ourGP < sc.theirGP ? C.red : C.gold, whiteSpace:'nowrap' }}>
                          {sc.ourGP}-{sc.theirGP}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ flex:1 }}>
                        <Tag block mb={4} color={C.dim}>Our GP</Tag>
                        <input type="number" min="0" max="20" value={sc.ourGP} onChange={e => updateScore(idx, 'ourGP', e.target.value)}
                          style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'6px 8px', fontSize:13, fontFamily:'monospace', outline:'none' }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <Tag block mb={4} color={C.dim}>Their GP</Tag>
                        <input type="number" min="0" max="20" value={sc.theirGP} onChange={e => updateScore(idx, 'theirGP', e.target.value)}
                          style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:C.white, padding:'6px 8px', fontSize:13, fontFamily:'monospace', outline:'none' }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', border:`1px solid ${C.gold}`, marginBottom:16 }}>
            <Tag color={C.gold}>Round Total</Tag>
            <span style={{ fontFamily:'monospace', fontSize:18, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
              {ourTotal} - {theirTotal}
            </span>
            <span style={{ fontFamily:'Cinzel, serif', fontSize:13, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
              {ourTotal >= 55 ? 'WIN' : ourTotal <= 45 ? 'LOSS' : 'TIE'}
            </span>
          </div>

          <Btn gold full onClick={saveScores}>Save Scores</Btn>

          {/* Rating suggestions after round is complete */}
          {round.complete && pairings.length > 0 && opponent && (() => {
            const suggestions = [];
            (round.scores ?? []).forEach((sc, idx) => {
              const pairing = pairings[idx];
              if (!pairing) return;
              const player = RAGNAROK.find(r => r.id === pairing.usIdx);
              const faction = opponent.players[pairing.themIdx]?.faction;
              if (!player || !faction) return;
              const ourGP = parseInt(sc.ourGP);
              if (isNaN(ourGP)) return;
              const currentRating = matrixData[player.name]?.[faction] ?? '?';
              const suggested = gpToSuggestedRating(ourGP);
              if (currentRating !== '?' && suggested !== currentRating) {
                const rIdx = RATINGS.indexOf(currentRating);
                const sIdx = RATINGS.indexOf(suggested);
                suggestions.push({ player: player.name, faction, current: currentRating, suggested, isUpgrade: sIdx < rIdx, key: `${player.name}-${faction}` });
              }
            });

            if (suggestions.length === 0) return (
              <div style={{ marginTop:20, padding:'12px 16px', border:`1px solid ${C.bord}`, textAlign:'center' }}>
                <span style={{ fontSize:13, color:C.dim, fontStyle:'italic' }}>All results matched your predictions — no ranking changes suggested.</span>
              </div>
            );

            const toggleSuggestion = (key) => setSelectedSuggestions(prev => ({ ...prev, [key]: !prev[key] }));
            const applyChanges = () => {
              const newMatrix = JSON.parse(JSON.stringify(matrixData));
              suggestions.forEach(s => {
                if (selectedSuggestions[s.key]) {
                  if (!newMatrix[s.player]) newMatrix[s.player] = {};
                  newMatrix[s.player][s.faction] = s.suggested;
                }
              });
              onSaveMatrix(newMatrix);
            };
            const anySelected = Object.values(selectedSuggestions).some(v => v);

            return (
              <div style={{ marginTop:20 }}>
                <Divider label="Ranking Suggestions" />
                <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:14 }}>
                  Based on this round's results, some matchup ratings may need updating. Tick the ones you agree with.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                  {suggestions.map(s => {
                    const checked = !!selectedSuggestions[s.key];
                    return (
                      <div key={s.key} onClick={() => toggleSuggestion(s.key)} style={{
                        display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer',
                        border:`1px solid ${checked ? C.gold : C.bord}`, background:checked ? 'rgba(200,168,72,0.06)' : 'transparent'
                      }}>
                        <span style={{ fontSize:16, color:checked ? C.gold : C.dim }}>{checked ? '☑' : '☐'}</span>
                        <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.white, minWidth:60 }}>{s.player}</span>
                        <span style={{ fontSize:12, color:C.dim }}>vs {s.faction}</span>
                        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
                          <Badge r={s.current} />
                          <span style={{ color:C.dim }}>→</span>
                          <Badge r={s.suggested} />
                        </span>
                      </div>
                    );
                  })}
                </div>
                {anySelected && <Btn gold full onClick={applyChanges}>Apply Selected Changes</Btn>}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

// ─── KENT TEAMS ───────────────────────────────────────────────────────────────

const mkp = fs => fs.map(faction => ({ faction }));

const KENT_TEAMS = [
  { id:'kt-01', name:'Drooling Cretins',            players: mkp(['Drukhari','Grey Knights','Custodes','Tau','Ultramarines']) },
  { id:'kt-02', name:'Egg Fried Dice',              players: mkp(['Custodes','Grey Knights','Eldar','Necrons','Gladius']) },
  { id:'kt-03', name:'Warhomies',                   players: mkp(['Chaos Knights','Imperial Knights','Thousand Sons','Tau','Necrons']) },
  { id:'kt-04', name:'Get Vekt',                    players: mkp(['CSM','Deathwatch','Imperial Guard','Imperial Knights','Tau']) },
  { id:'kt-05', name:'Gothic Games Canterbury',     players: mkp(['Imperial Guard','Imperial Knights','CSM','Necrons','Tyranids']) },
  { id:'kt-06', name:'Kent Knight - Business',      players: mkp(['Deathwatch','Thousand Sons','Sisters','CSM','Necrons']) },
  { id:'kt-07', name:'Kent Knights - Shield',       players: mkp(['Daemons','Death Guard','World Eaters','Dark Angels','Eldar']) },
  { id:'kt-09', name:'Shed',                        players: mkp(['Imperial Guard','Ultramarines','CSM','Tau','Necrons']) },
  { id:'kt-10', name:'Shedhammer - Fun Comes First',players: mkp(['Imperial Guard','Daemons','World Eaters','Ad Mech','Tyranids']) },
  { id:'kt-11', name:'Shedhammer - The B Teams',    players: mkp(['Drukhari','Ultramarines','CSM','Death Guard','Necrons']) },
  { id:'kt-12', name:'Surrey Primarche',            players: mkp(['Imperial Guard','Custodes','Thousand Sons','Ultramarines','Necrons']) },
  { id:'kt-13', name:'Team Hivemind - Bar',         players: mkp(['Ultramarines','Orks','Votan','Tau','Tyranids']) },
  { id:'kt-14', name:'Team Hivemind',               players: mkp(['Tau','World Eaters','Death Guard','Blood Angels','Necrons']) },
  { id:'kt-15', name:'TryHardWargaming',            players: mkp(['Chaos Knights','Blood Angels','Thousand Sons','Custodes','Necrons']) },
  { id:'kt-16', name:'Tunbridge Wells Wargaming',   players: mkp(['Imperial Guard','Death Guard','CSM','Deathwatch','Daemons']) },
  { id:'kt-17', name:"Vee's Vegabonds",             players: mkp(['CSM','Death Guard',"Emperor's Children",'Orks','Necrons']) },
];

const SEED_EVENT = {
  id: 'evt-kent-2026',
  name: 'Kent Teams March 2026',
  dates: { start: '2026-03-21', end: '2026-03-22' },
  numRounds: 5,
  teamName: DEFAULT_TEAM_NAME,
  roster: JSON.parse(JSON.stringify(DEFAULT_RAGNAROK)),
  matrix: JSON.parse(JSON.stringify(DEFAULT_MATRIX)),
  opponents: KENT_TEAMS,
  rounds: {},
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('events');
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [editEventData, setEditEventData] = useState(null);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [matrixData, setMatrixData] = useState(DEFAULT_MATRIX);
  const [defsData, setDefsData] = useState(DEFAULT_DEFS);
  const [roster, setRoster] = useState(DEFAULT_RAGNAROK);
  const [ourTeamName, setOurTeamName] = useState(DEFAULT_TEAM_NAME);
  const [factionList, setFactionList] = useState(DEFAULT_FACTIONS);
  const [roundsData, setRoundsData] = useState({});

  useEffect(() => { matrix = matrixData; }, [matrixData]);
  useEffect(() => { defs = defsData; }, [defsData]);
  useEffect(() => { RAGNAROK = roster; }, [roster]);
  useEffect(() => { teamName = ourTeamName; }, [ourTeamName]);
  useEffect(() => { FACTIONS = factionList; }, [factionList]);

  // Load global data + event list
  useEffect(() => {
    fetch(`${FIREBASE_URL}/defs.json`).then(r => r.json())
      .then(data => { if (data) { setDefsData(data); defs = data; } }).catch(() => {});
    fetch(`${FIREBASE_URL}/factions.json`).then(r => r.json())
      .then(data => { if (data) { setFactionList(data); FACTIONS = data; } }).catch(() => {});
    fetch(`${FIREBASE_URL}/events.json`).then(r => r.json())
      .then(data => {
        if (data) {
          setEvents(Object.values(data));
        } else {
          // Migration: seed from legacy data or defaults
          Promise.all([
            fetch(`${FIREBASE_URL}/matrix.json`).then(r => r.json()).catch(() => null),
            fetch(`${FIREBASE_URL}/roster.json`).then(r => r.json()).catch(() => null),
            fetch(`${FIREBASE_URL}/teamName.json`).then(r => r.json()).catch(() => null),
          ]).then(([lm, lr, lt]) => {
            const seed = { ...SEED_EVENT, matrix: lm || SEED_EVENT.matrix, roster: lr || SEED_EVENT.roster, teamName: lt || SEED_EVENT.teamName };
            setEvents([seed]);
            fetch(`${FIREBASE_URL}/events/${seed.id}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(seed) });
          }).catch(() => setEvents([SEED_EVENT]));
        }
      }).catch(() => setEvents([SEED_EVENT]));
    localStorage.removeItem('ragnarok-teams');
  }, []);

  // Normalize rounds from Firebase (may be array with nulls or object)
  const normalizeRounds = (r) => {
    if (!r) return {};
    if (Array.isArray(r)) {
      const obj = {};
      r.forEach((v, i) => { if (v) obj[i] = v; });
      return obj;
    }
    return r;
  };

  const loadEvent = (evt) => {
    setActiveEvent(evt);
    setMatrixData(evt.matrix ?? DEFAULT_MATRIX); matrix = evt.matrix ?? DEFAULT_MATRIX;
    setRoster(evt.roster ?? DEFAULT_RAGNAROK); RAGNAROK = evt.roster ?? DEFAULT_RAGNAROK;
    setOurTeamName(evt.teamName ?? DEFAULT_TEAM_NAME); teamName = evt.teamName ?? DEFAULT_TEAM_NAME;
    setTeams(evt.opponents ?? []);
    setRoundsData(normalizeRounds(evt.rounds));
    setScreen('home');
  };

  const saveEvent = (evt) => {
    const updated = events.find(e => e.id === evt.id) ? events.map(e => e.id === evt.id ? evt : e) : [...events, evt];
    setEvents(updated);
    return fetch(`${FIREBASE_URL}/events/${evt.id}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(evt) }).then(() => {});
  };

  const saveEventField = (field, value) => {
    if (!activeEvent) return Promise.resolve();
    const updated = { ...activeEvent, [field]: value };
    setActiveEvent(updated);
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    return fetch(`${FIREBASE_URL}/events/${activeEvent.id}/${field}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(value) }).then(() => {});
  };

  const saveMatrix = (m) => { setMatrixData(m); matrix = m; return saveEventField('matrix', m); };
  const saveRoster = (r, n) => { setRoster(r); RAGNAROK = r; setOurTeamName(n); teamName = n; return Promise.all([saveEventField('roster', r), saveEventField('teamName', n)]); };
  const saveOpponents = (t) => { setTeams(t); return saveEventField('opponents', t); };
  const saveRounds = (r) => { setRoundsData(r); return saveEventField('rounds', r); };
  const saveDefs = (d) => { setDefsData(d); defs = d; return fetch(`${FIREBASE_URL}/defs.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(() => {}); };
  const saveFactions = (f) => { setFactionList(f); FACTIONS = f; return fetch(`${FIREBASE_URL}/factions.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(f) }).then(() => {}); };

  const handleSaveOpponent = team => {
    const updated = teams.find(t => t.id === team.id) ? teams.map(t => t.id === team.id ? team : t) : [...teams, team];
    saveOpponents(updated); setEditTeam(null); setScreen('home');
  };
  const handleDeleteOpponent = id => { saveOpponents(teams.filter(t => t.id !== id)); setEditTeam(null); setScreen('home'); };

  const handleSaveEvent = (evt) => { saveEvent(evt).then(() => { if (!activeEvent || activeEvent.id === evt.id) loadEvent(evt); else setScreen('events'); }); };
  const handleDeleteEvent = (id) => { setEvents(prev => prev.filter(e => e.id !== id)); fetch(`${FIREBASE_URL}/events/${id}.json`, { method:'DELETE' }); setActiveEvent(null); setScreen('events'); };

  const navProps = activeEvent ? {
    onRatings: () => setScreen('ratings'), onDefs: () => setScreen('defs'),
    onOurTeam: () => setScreen('ourteam'), onFactions: () => setScreen('factions'),
    onEvents: () => { setActiveEvent(null); setScreen('events'); },
    onEditEvent: () => { setEditEventData(activeEvent); setScreen('eventEdit'); },
  } : { onDefs: () => setScreen('defs'), onFactions: () => setScreen('factions') };

  return (
    <>
      <style>{CSS}</style>
      <NavBar {...navProps} activeEvent={activeEvent} />

      {screen === 'events' && <EventList events={events} onSelect={loadEvent} onAdd={() => { setEditEventData(null); setScreen('eventSetup'); }} />}
      {screen === 'eventSetup' && <EventSetup events={events} onSave={handleSaveEvent} onBack={() => setScreen('events')} />}
      {screen === 'eventEdit' && <EventSetup event={editEventData} events={events} onSave={handleSaveEvent} onDelete={handleDeleteEvent} onBack={() => setScreen('home')} />}

      {activeEvent && screen === 'home' && <Home teams={teams} rounds={roundsData} event={activeEvent} onSelect={t=>{setSelectedTeam(t);setScreen('matchup');}} onAdd={()=>{setEditTeam(null);setScreen('setup');}} onEdit={t=>{setEditTeam(t);setScreen('setup');}} onRound={n=>setScreen('round-'+n)} />}
      {activeEvent && screen === 'setup' && <Setup team={editTeam} onSave={handleSaveOpponent} onDelete={handleDeleteOpponent} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'matchup' && <Matchup team={selectedTeam} onStart={()=>setScreen('pairing')} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'pairing' && <Pairing team={selectedTeam} onBack={()=>setScreen('matchup')} onComplete={(pairings) => {
        const roundNum = Object.keys(roundsData).find(k => roundsData[k]?.opponentId === selectedTeam?.id);
        if (roundNum) {
          const mapped = pairings.map((p, i) => ({ table: i + 1, usIdx: p.us.id, themIdx: selectedTeam.players.indexOf(p.them) }));
          saveRounds({ ...roundsData, [roundNum]: { ...roundsData[roundNum], pairings: mapped } });
        }
      }} />}
      {activeEvent && screen === 'ratings' && <Ratings matrixData={matrixData} onSave={saveMatrix} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'defs' && <Definitions defsData={defsData} onSave={saveDefs} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'ourteam' && <EditOurTeam roster={roster} currentTeamName={ourTeamName} onSave={saveRoster} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'factions' && <ManageFactions factionList={factionList} onSave={saveFactions} onBack={()=>setScreen('home')} />}
      {activeEvent && screen.startsWith('round-') && <RoundView roundNum={parseInt(screen.split('-')[1])} rounds={roundsData} teams={teams} onSave={saveRounds} onBack={()=>setScreen('home')} matrixData={matrixData} onSaveMatrix={saveMatrix} />}

      {!activeEvent && (screen === 'defs') && <Definitions defsData={defsData} onSave={saveDefs} onBack={()=>setScreen('events')} />}
      {!activeEvent && (screen === 'factions') && <ManageFactions factionList={factionList} onSave={saveFactions} onBack={()=>setScreen('events')} />}
    </>
  );
}
