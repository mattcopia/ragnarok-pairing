import { useState, useEffect, useMemo } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const DEFAULT_RAGNAROK = [
  { name: 'Jacob', faction: 'Orks (GT)', id: 0 },
  { name: 'Matt',  faction: 'Custodes',  id: 1 },
  { name: 'Alex',  faction: 'Space Wolves', id: 2 },
  { name: 'Ollie', faction: 'Necrons',   id: 3 },
  { name: 'Paul',  faction: 'Sisters of Battle',   id: 4 },
];

let RAGNAROK = JSON.parse(JSON.stringify(DEFAULT_RAGNAROK));
const DEFAULT_TEAM_NAME = 'Ragnarok';
let teamName = DEFAULT_TEAM_NAME;

const DEFAULT_FACTIONS = [
  'Ad Mech','Black Templars','Blood Angels','Chaos Knights','CSM','Custodes',
  'Daemons','Dark Angels','Death Guard','Deathwatch','Drukhari','Eldar',
  "Emperor's Children",'Gladius','Grey Knights','GSC','Imperial Guard',
  'Imperial Knights','Necrons','Orks','Other Marines','Sisters of Battle',
  'Space Wolves','Tau','Thousand Sons','Tyranids','Ultramarines','Votan','World Eaters'
];

let FACTIONS = [...DEFAULT_FACTIONS];

const DEFAULT_MATRIX = {
  Jacob: {Daemons:'W','Chaos Knights':'L','World Eaters':'D','Death Guard':'L',"Emperor's Children":'W-','Thousand Sons':'D',CSM:'W',Tau:'W++',Orks:'D',Necrons:'W+',GSC:'W++',Drukhari:'W',Eldar:'W++',Tyranids:'W',Votan:'W','Sisters of Battle':'W++',Custodes:'W','Ad Mech':'W','Imperial Guard':'L','Imperial Knights':'D','Grey Knights':'W++','Blood Angels':'W','Space Wolves':'W','Dark Angels':'W','Black Templars':'W',Deathwatch:'L',Gladius:'W-',Ultramarines:'L','Other Marines':'W'},
  Matt:  {Daemons:'W','Chaos Knights':'W+','World Eaters':'W','Death Guard':'W++',"Emperor's Children":'D','Thousand Sons':'D',CSM:'W',Tau:'L',Orks:'W',Necrons:'L',GSC:'W',Drukhari:'D',Eldar:'W',Tyranids:'W++',Votan:'W++','Sisters of Battle':'L',Custodes:'D','Ad Mech':'L','Imperial Guard':'W-','Imperial Knights':'W++','Grey Knights':'W++','Blood Angels':'L','Space Wolves':'D','Dark Angels':'L','Black Templars':'W+',Deathwatch:'D',Gladius:'W',Ultramarines:'L','Other Marines':'W'},
  Alex:  {Daemons:'W','Chaos Knights':'L','World Eaters':'D','Death Guard':'W',"Emperor's Children":'D','Thousand Sons':'D',CSM:'W',Tau:'W',Orks:'W',Necrons:'L',GSC:'W',Drukhari:'W++',Eldar:'W++',Tyranids:'W++',Votan:'W','Sisters of Battle':'W',Custodes:'D','Ad Mech':'D','Imperial Guard':'W-','Imperial Knights':'L','Grey Knights':'W++','Blood Angels':'W-','Space Wolves':'D','Dark Angels':'W','Black Templars':'W++',Deathwatch:'L',Gladius:'W',Ultramarines:'L','Other Marines':'W++'},
  Ollie: {Daemons:'D','Chaos Knights':'W++','World Eaters':'L','Death Guard':'W++',"Emperor's Children":'W','Thousand Sons':'W++',CSM:'W',Tau:'W++',Orks:'D',Necrons:'D',GSC:'W++',Drukhari:'W',Eldar:'W',Tyranids:'D',Votan:'W','Sisters of Battle':'D',Custodes:'W++','Ad Mech':'W','Imperial Guard':'L','Imperial Knights':'W++','Grey Knights':'W','Blood Angels':'L','Space Wolves':'D','Dark Angels':'W++','Black Templars':'W',Deathwatch:'L',Gladius:'D',Ultramarines:'W++','Other Marines':'W'},
  Paul:  {Daemons:'W','Chaos Knights':'L','World Eaters':'W++','Death Guard':'W',"Emperor's Children":'D','Thousand Sons':'W',CSM:'D',Tau:'L',Orks:'W',Necrons:'D',GSC:'D',Drukhari:'W++',Eldar:'W',Tyranids:'W++',Votan:'L','Sisters of Battle':'W',Custodes:'W++','Ad Mech':'D','Imperial Guard':'W','Imperial Knights':'L','Grey Knights':'W++','Blood Angels':'D','Space Wolves':'W++','Dark Angels':'W','Black Templars':'W++',Deathwatch:'D',Gladius:'W',Ultramarines:'D','Other Marines':'W++'},
};

const FIREBASE_URL = 'https://ragnarok-18886-default-rtdb.firebaseio.com';
const RATINGS = ['W++','W+','W','W-','D','L-','L','L+','L++'];

let matrix = JSON.parse(JSON.stringify(DEFAULT_MATRIX));

const DEFAULT_DEFS = {
  'W++':{ label:'Strong Win',      score:4.0, desc:'46+ VP diff — 19-20 game pts' },
  'W+': { label:'Comfortable Win', score:3.5, desc:'31-45 VP diff — 16-18 game pts' },
  'W':  { label:'Slight Edge',     score:3.0, desc:'11-30 VP diff — 12-15 game pts' },
  'W-': { label:'Narrow Edge',     score:2.5, desc:'6-10 VP diff — 11-9 game pts' },
  'D':  { label:'Draw',            score:2.0, desc:'~0 VP diff — 10-10 game pts' },
  'L-': { label:'Narrow Loss',     score:1.5, desc:'6-10 VP diff against — 9-11 game pts' },
  'L':  { label:'Moderate Loss',   score:1.0, desc:'11-30 VP diff against — 5-8 game pts' },
  'L+': { label:'Bad Loss',        score:0.5, desc:'31-45 VP diff against — 2-4 game pts' },
  'L++':{ label:'Heavy Loss',      score:0.0, desc:'46+ VP diff against — 0-1 game pts' },
};

let defs = JSON.parse(JSON.stringify(DEFAULT_DEFS));

const BG_COL = { 'W++':'#0d2a10', 'W+':'#0d2a10', W:'#081420', 'W-':'#1a1408', D:'#141210', 'L-':'#1a1008', L:'#1a0808', 'L+':'#200808', 'L++':'#280404' };
const FG_COL = { 'W++':'#60c030', 'W+':'#50b030', W:'#5090d0', 'W-':'#b09030', D:'#908878', 'L-':'#c08040', L:'#e04848', 'L+':'#f04040', 'L++':'#ff3030' };
const BD_COL = { 'W++':'#40a020', 'W+':'#308018', W:'#305880', 'W-':'#806020', D:'#4a4438', 'L-':'#805020', L:'#802020', 'L+':'#a01818', 'L++':'#c01010' };

const gr  = (p, f)  => matrix[p]?.[f] ?? 'D';
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
const DEFAULT_SCORING_TABLE = [
  { min:0,  max:5,   winGP:10 },
  { min:6,  max:10,  winGP:11 },
  { min:11, max:15,  winGP:12 },
  { min:16, max:20,  winGP:13 },
  { min:21, max:25,  winGP:14 },
  { min:26, max:30,  winGP:15 },
  { min:31, max:35,  winGP:16 },
  { min:36, max:40,  winGP:17 },
  { min:41, max:45,  winGP:18 },
  { min:46, max:50,  winGP:19 },
  { min:51, max:999, winGP:20 },
];

let scoringTable = [...DEFAULT_SCORING_TABLE];

function vpToGP(ourVP, theirVP) {
  const diff = Math.abs(ourVP - theirVP);
  const row = scoringTable.find(r => diff >= r.min && diff <= r.max) ?? scoringTable[scoringTable.length - 1];
  const winGP = row.winGP;
  const loseGP = 20 - winGP;
  return ourVP >= theirVP ? [winGP, loseGP] : [loseGP, winGP];
}

// Map actual game points to a suggested rating
function gpToSuggestedRating(ourGP) {
  if (ourGP >= 19) return 'W++';
  if (ourGP >= 16) return 'W+';
  if (ourGP >= 12) return 'W';
  if (ourGP >= 11) return 'W-';
  if (ourGP >= 10) return 'D';
  if (ourGP >= 9)  return 'L-';
  if (ourGP >= 5)  return 'L';
  if (ourGP >= 2)  return 'L+';
  return 'L++';
}

// ─── THEME ────────────────────────────────────────────────────────────────────

const C = {
  bg:'#0a0806', surf:'#0e0c0a', bord:'#1e1814', bordLight:'#2a2218',
  gold:'#c88838', goldD:'#a87830', goldB:'#e0a040',
  goldGlow:'rgba(200,136,56,0.06)',
  slate:'#7888a0', slateDim:'#506070',
  text:'#b0a898', dim:'#908878', white:'#e8dcd0',
  blue:'#5090d0', red:'#e04848', green:'#80d040',
  redBord:'#a83030', greenBord:'#60a830', blueBg:'#081420',
  redDark:'#1a0a08', redLight:'#e08080', amberDark:'#5a4010', amberMid:'#c08040',
  input:'#0c0a08',
  redTint:'rgba(168,48,48,0.06)', goldTint:'rgba(200,136,56,0.04)',
  purple:'#9070b0',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Source Code Pro', monospace; min-height: 100vh; }
  input, select, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.bord}; }
  select { -webkit-appearance: none; appearance: none; min-height: 48px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23908878' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px !important; }
  select option { background: ${C.surf}; }
  /* Timing */
  :root {
    --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --dur-fast: 120ms;
    --dur-med: 200ms;
    --dur-slow: 350ms;
  }

  @keyframes pulse { 0%,100% { opacity:0.3; } 50% { opacity:0.8; } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }

  /* Base transitions on interactive elements */
  button { transition: transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out), border-color var(--dur-med) var(--ease-out), background var(--dur-med) var(--ease-out); }
  button:active { transform: scale(0.97); }
  input, select { transition: border-color var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out); }
  input:focus, select:focus { box-shadow: 0 0 0 1px ${C.gold}20; }

  /* Animated containers */
  .page-enter { animation: fadeIn var(--dur-slow) var(--ease-out-expo) both; }
  .card-enter { animation: slideIn var(--dur-med) var(--ease-out) both; }

  /* Responsive layout */
  .pair-layout { display: flex; gap: 16px; }
  .pair-sidebar { width: 150px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
  .def-row-badges { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }

  @media (max-width: 640px) {
    .pair-layout { flex-direction: column; }
    .pair-sidebar { width: 100%; flex-direction: row; gap: 12px; }
    .pair-sidebar > div { flex: 1; }
    .pair-sidebar .pool-list { display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; }
    .def-row-badges { max-width: 120px; }
    .score-inputs { flex-direction: column !important; }
    .score-result { margin-top: 4px; text-align: right; }
    .stat-row { flex-direction: column !important; gap: 8px !important; }
  }

  /* Touch feedback */
  [role="button"] { transition: border-color var(--dur-med) var(--ease-out), background var(--dur-med) var(--ease-out), opacity var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }
  [role="button"]:active { opacity: 0.85; transform: scale(0.98); }
  .tap-card { transition: border-color var(--dur-med) var(--ease-out), opacity var(--dur-fast) var(--ease-out); }
  .tap-card:active { opacity: 0.9; }

  /* Focus indicators — !important overrides inline outline:none */
  *:focus-visible { outline: 2px solid ${C.gold} !important; outline-offset: 2px; }
  input:focus-visible, select:focus-visible { outline: 2px solid ${C.gold} !important; outline-offset: 0; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

// Keyboard handler for interactive divs
const clickable = (onClick) => ({
  onClick, role:'button', tabIndex:0,
  onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } }
});

// ─── ATOMS ────────────────────────────────────────────────────────────────────

function Badge({ r }) {
  return (
    <span style={{ display:'inline-block', padding:'4px 10px', background:BG_COL[r]??C.surf,
      color:FG_COL[r]??C.dim, fontSize:12, fontWeight:700, fontFamily:'Source Code Pro, monospace',
      minWidth:36, textAlign:'center', letterSpacing:0.5, borderLeft:`3px solid ${BD_COL[r]??C.bord}` }}>
      {r ?? 'D'}
    </span>
  );
}

function ScoreColor(s) { return s >= 3 ? C.green : s >= 2.5 ? C.gold : s >= 2 ? C.goldD : s >= 1 ? C.amberMid : C.red; }

function Tag({ children, color = C.goldD, block, mb = 0, center }) {
  return (
    <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, letterSpacing:3, color,
      textTransform:'uppercase', display:block?'block':'inline', marginBottom:mb,
      textAlign:center?'center':undefined }}>
      {children}
    </span>
  );
}

function Cine({ children, size = 14, color = C.white, weight = 600, mb = 0, as: Tag2 = 'div' }) {
  return <Tag2 style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:size, fontWeight:weight, color, margin:0, marginBottom:mb, overflowWrap:'break-word', wordBreak:'break-word' }}>{children}</Tag2>;
}

function Btn({ children, onClick, disabled, gold, ghost, sm, full, style: s = {} }) {
  const bg = gold ? C.gold : 'transparent';
  const col = gold ? C.bg : C.gold;
  const brd = ghost ? C.bord : C.gold;
  return (
    <button onClick={!disabled ? onClick : undefined} style={{
      border:`1px solid ${brd}`, color:col, background:bg,
      padding:sm ? '12px 16px' : '14px 22px',
      fontSize:12, letterSpacing:2.5,
      fontFamily:'Chakra Petch, sans-serif', textTransform:'uppercase', fontWeight:gold ? 900 : 600,
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
      fontFamily:'Chakra Petch, sans-serif', fontSize:12, letterSpacing:2, cursor:'pointer', marginBottom:20, padding:0 }}>
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
      <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:13, fontWeight:700, color:ScoreColor(a), minWidth:26, textAlign:'right' }}>{a.toFixed(1)}</span>
    </div>
  );
}

// ─── RATINGS EDITOR ──────────────────────────────────────────────────────────

function Ratings({ matrixData, onSave, onBack }) {
  const [selected, setSelected] = useState(RAGNAROK[0]?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showKey, setShowKey] = useState(false);
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
    <div className="page-enter" style={{ maxWidth:600, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Player Rankings</Tag>
      <Cine as="h1" size={24} weight={900} mb={6}>Edit Rankings</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Tap a rating to cycle through rankings. Use the key below for reference.
      </p>
      <Btn ghost sm onClick={() => setShowKey(!showKey)} style={{ marginBottom:16 }}>{showKey ? 'Hide Ranking Key' : 'See Ranking Key'}</Btn>
      <div style={{ display:'grid', gridTemplateRows:showKey ? '1fr' : '0fr', transition:'grid-template-rows 0.3s cubic-bezier(0.25,1,0.5,1)', marginBottom:showKey ? 20 : 0 }}>
        <div style={{ overflow:'hidden' }}>
          <div style={{ borderLeft:`3px solid ${C.gold}`, background:C.surf, padding:'14px 16px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {RATINGS.map(r => (
                <div key={r} style={{ display:'flex', alignItems:'center', gap:12, padding:'6px 0', borderBottom:`1px solid ${C.bord}` }}>
                  <Badge r={r} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, color:C.white }}>{defs[r]?.label ?? r}</div>
                    <div style={{ fontSize:12, color:C.dim }}>Score: {defs[r]?.score ?? '—'}</div>
                  </div>
                  <div style={{ fontSize:12, color:C.dim, textAlign:'right', lineHeight:1.5 }}>
                    {(defs[r]?.desc ?? '').split('—').map((part, i) => <div key={i}>{part.trim()}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
        {RAGNAROK.map(r => {
          const sel = selected === r.name;
          const mod = changed(r.name);
          return (
            <button key={r.id} onClick={() => setSelected(r.name)} style={{
              borderLeft:`3px solid ${sel ? C.gold : C.bord}`, background:sel ? C.surf : 'transparent',
              color:sel ? C.gold : C.text, padding:'8px 14px', cursor:'pointer',
              fontFamily:'Chakra Petch, sans-serif', fontSize:12, fontWeight:sel ? 700 : 400, letterSpacing:1,
              position:'relative'
            }}>
              {r.name}
              {mod && sel && <span style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:3, background:C.gold }} />}
            </button>
          );
        })}
      </div>

      {/* Faction list */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:24 }}>
        {[...FACTIONS].sort((a,b)=>a.localeCompare(b)).map(f => {
          const r = playerRatings[f] ?? 'D';
          const def = DEFAULT_MATRIX[selected]?.[f] ?? 'D';
          const isChanged = r !== def;
          return (
            <div key={f} {...clickable(() => cycle(f))} style={{
              display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
              borderLeft:`3px solid ${isChanged ? C.goldD : C.bord}`,
              background:isChanged ? C.surf : 'transparent',
              transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)'
            }}>
              <div style={{ flex:1 }}>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, color:C.white }}>{f}</span>
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
        {saving && <span aria-live="polite" style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span aria-live="polite" style={{ fontSize:12, color:C.green }}>Saved</span>}
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
    <div className="page-enter" style={{ maxWidth:600, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Scoring System</Tag>
      <Cine as="h1" size={24} weight={900} mb={6}>Rating Definitions</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Edit labels, scores, and descriptions for each rating tier.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
        {RATINGS.map(key => {
          const d = local[key] ?? {};
          const def = DEFAULT_DEFS[key] ?? {};
          const changed = d.label !== def.label || d.score !== def.score || d.desc !== def.desc;
          return (
            <div key={key} style={{ borderLeft:`3px solid ${changed ? C.goldD : C.bord}`, padding:'14px 16px',
              background:changed ? C.surf : 'transparent' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <Badge r={key} />
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:14, fontWeight:700, color:FG_COL[key] ?? C.text }}>{key}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div>
                  <Tag block mb={4} color={C.dim}>Label</Tag>
                  <input value={d.label ?? ''} onChange={e => update(key, 'label', e.target.value)}
                    style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white,
                      padding:'8px 10px', fontSize:13, fontFamily:'Chakra Petch, sans-serif', outline:'none' }} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <Tag block mb={4} color={C.dim}>Score</Tag>
                    <input type="number" step="0.5" min="0" max="5" value={d.score ?? 0}
                      onChange={e => update(key, 'score', parseFloat(e.target.value) || 0)}
                      style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white,
                        padding:'8px 10px', fontSize:13, fontFamily:'Source Code Pro, monospace', outline:'none' }} />
                  </div>
                </div>
                <div>
                  <Tag block mb={4} color={C.dim}>Description</Tag>
                  <input value={d.desc ?? ''} onChange={e => update(key, 'desc', e.target.value)}
                    style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.text,
                      padding:'12px 12px', fontSize:14, outline:'none' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        {saving && <span aria-live="polite" style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span aria-live="polite" style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn gold disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Definitions'}</Btn>
        <Btn ghost sm onClick={handleReset}>Reset to Defaultss</Btn>
      </div>
    </div>
  );
}

// ─── BURGER MENU ─────────────────────────────────────────────────────────────

function NavBar({ activeEvent, onRatings, onDefs, onOurTeam, onFactions, onEvents, onEditEvent, onEditRounds, onScoringTable }) {
  const [open, setOpen] = useState(false);
  const sections = activeEvent ? [
    { label: 'Event', items: [
      { label: 'Event Settings', action: onEditEvent },
      { label: 'Edit Our Team', action: onOurTeam },
      { label: 'Edit Player Rankings', action: onRatings },
      { label: 'Edit Round Scores', action: onEditRounds },
      { label: 'Scoring Table', action: onScoringTable },
    ]},
    { label: 'General', items: [
      { label: 'Define Rankings', action: onDefs },
      { label: 'Manage Factions', action: onFactions },
    ]},
    { label: '', items: [
      { label: 'Back to Events', action: onEvents },
    ]},
  ] : [
    { label: 'General', items: [
      { label: 'Define Rankings', action: onDefs },
      { label: 'Manage Factions', action: onFactions },
    ]},
  ];
  return (
    <>
      <nav style={{
        position:'sticky', top:0, zIndex:100, background:C.bg,
        borderBottom:`1px solid ${C.bord}`, display:'flex', alignItems:'center',
        padding:'0 16px', height:52
      }}>
        <div style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:14, fontWeight:700, color:C.gold, letterSpacing:2, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {activeEvent ? activeEvent.name : 'Tactical Teams Console'}
        </div>
        <button onClick={() => setOpen(true)} style={{
          background:'transparent', border:`1px solid ${C.bord}`, color:C.gold,
          width:44, height:44, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, fontFamily:'Source Code Pro, monospace'
        }}>
          ☰
        </button>
      </nav>
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:C.bg,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <button onClick={() => setOpen(false)} style={{
            position:'absolute', top:6, right:16, background:'transparent', border:`1px solid ${C.bord}`,
            color:C.gold, width:44, height:44, cursor:'pointer', fontSize:16, fontFamily:'Source Code Pro, monospace',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            ✕
          </button>
          <div style={{ display:'flex', flexDirection:'column', gap:0, alignItems:'center', width:'100%', maxWidth:320 }}>
            {sections.map((section, si) => (
              <div key={si} style={{ width:'100%', marginBottom:si < sections.length - 1 ? 16 : 0 }}>
                {section.label && <div style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.goldD, letterSpacing:3, textTransform:'uppercase', textAlign:'center', marginBottom:8 }}>{section.label}</div>}
                {section.items.filter(i => i.action).map((item, i) => (
                  <button key={i} onClick={() => { setOpen(false); item.action(); }} style={{
                    background:'transparent', border:'none', color:C.text, padding:'14px 24px', cursor:'pointer',
                    fontFamily:'Chakra Petch, sans-serif', fontSize:16, textAlign:'center', width:'100%', display:'block'
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = C.gold}
                    onMouseLeave={e => e.currentTarget.style.color = C.text}>
                    {item.label}
                  </button>
                ))}
              </div>
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
    <div className="page-enter" style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Our Team</Tag>
      <Cine as="h1" size={24} weight={900} mb={6}>Edit Our Team</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Update team name, player names and factions.
      </p>

      <Tag block mb={8}>Team Name</Tag>
      <input value={name} onChange={e => setName(e.target.value)}
        style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white,
          padding:'10px 14px', fontSize:16, fontFamily:'Chakra Petch, sans-serif', fontWeight:600,
          marginBottom:24, outline:'none' }} />

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
        {players.map((p, i) => (
          <div key={i} style={{ borderLeft:`3px solid ${C.bord}`, background:C.surf, padding:'14px 16px' }}>
            <Tag block mb={6} color={C.dim}>Player {i + 1}</Tag>
            <div style={{ display:'flex', gap:10, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <Tag block mb={4} color={C.dim}>Name</Tag>
                <input value={p.name} onChange={e => update(i, 'name', e.target.value)}
                  style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white,
                    padding:'8px 10px', fontSize:14, fontFamily:'Chakra Petch, sans-serif', fontWeight:600, outline:'none' }} />
              </div>
            </div>
            <Tag block mb={4} color={C.dim}>Faction</Tag>
            <select value={p.faction} onChange={e => update(i, 'faction', e.target.value)}
              style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:p.faction ? C.text : C.dim,
                padding:'12px 12px', fontSize:14, outline:'none' }}>
              <option value="">— Select Faction —</option>
              {[...FACTIONS].sort((a,b)=>a.localeCompare(b)).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        {saving && <span aria-live="polite" style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span aria-live="polite" style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <Btn gold full disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Team'}</Btn>
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
    <div className="page-enter" style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Faction List</Tag>
      <Cine as="h1" size={24} weight={900} mb={6}>Manage Factions</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Add, remove, or rename factions. These appear in opponent setup and the ratings editor.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
        {local.map((f, i) => (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input value={f} onChange={e => update(i, e.target.value)}
              style={{ flex:1, background:C.input, border:`1px solid ${C.bord}`, color:C.white,
                padding:'12px 12px', fontSize:14, outline:'none' }} />
            <button onClick={() => remove(i)} style={{
              background:'transparent', border:`1px solid ${C.bord}`, color:C.red,
              width:44, height:44, cursor:'pointer', fontSize:14, fontFamily:'Source Code Pro, monospace'
            }}>✕</button>
          </div>
        ))}
      </div>

      <Btn ghost sm onClick={add} style={{ marginBottom:20 }}>+ Add Faction</Btn>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        {saving && <span aria-live="polite" style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span aria-live="polite" style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn gold disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Factions'}</Btn>
        <Btn ghost sm onClick={handleReset}>Reset to Defaultss</Btn>
      </div>
    </div>
  );
}

// ─── EVENT LIST ──────────────────────────────────────────────────────────────

function EventList({ events, onSelect, onAdd, onDelete, onSettings }) {
  const [confirmDel, setConfirmDel] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  const current = events.filter(e => (e.dates?.start ?? '') <= today && (e.dates?.end ?? e.dates?.start ?? '') >= today);
  const upcoming = events.filter(e => (e.dates?.start ?? '') > today);
  const past = events.filter(e => (e.dates?.end ?? e.dates?.start ?? '') < today && (e.dates?.start ?? '') !== '');
  const undated = events.filter(e => !e.dates?.start);

  const renderCard = (evt) => {
    if (!evt) return null;
    let roundsDone = 0;
    try {
      const evtRounds = Array.isArray(evt.rounds) ? evt.rounds.filter(Boolean) : Object.values(evt.rounds ?? {}).filter(Boolean);
      roundsDone = evtRounds.filter(r => r?.complete).length;
    } catch(e) { /* ignore */ }
    const isConfirming = confirmDel === evt.id;
    return (
      <div key={evt.id} style={{ borderLeft:`3px solid ${C.bord}`, background:C.surf, transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)' }}>
        <div {...clickable(() => onSelect(evt))} style={{ cursor:'pointer', padding:'16px 18px' }}
          onMouseEnter={e => e.currentTarget.parentElement.style.borderLeftColor = C.gold}
          onMouseLeave={e => e.currentTarget.parentElement.style.borderLeftColor = C.bord}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <Cine size={14} weight={700}>{evt.name}</Cine>
            <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:14, fontWeight:700, color:roundsDone > 0 ? C.gold : C.dim, whiteSpace:'nowrap', marginLeft:12 }}>
              {roundsDone}/{evt.numRounds ?? 5}
            </span>
          </div>
          <div style={{ fontSize:12, color:C.dim, marginBottom:6 }}>
            {evt.dates?.start ?? 'TBC'}{evt.dates?.end && evt.dates.end !== evt.dates.start ? ` — ${evt.dates.end}` : ''}
          </div>
          <Tag color={C.dim}>{(evt.opponents ?? []).length + 1} teams · {((evt.opponents ?? []).length + 1) * 5} players</Tag>
        </div>
        <div style={{ display:'flex', borderTop:`1px solid ${C.bord}` }}>
          <button onClick={e => { e.stopPropagation(); onSettings(evt); }} style={{
            flex:1, background:'transparent', border:'none', borderRight:`1px solid ${C.bord}`,
            color:C.dim, fontSize:12, fontFamily:'Chakra Petch, sans-serif', cursor:'pointer',
            padding:'10px', letterSpacing:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6
          }}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = C.dim}>
            ⚙ Settings
          </button>
          <button onClick={e => { e.stopPropagation(); setConfirmDel(evt.id); }} style={{
            flex:1, background:'transparent', border:'none',
            color:C.dim, fontSize:12, fontFamily:'Chakra Petch, sans-serif', cursor:'pointer',
            padding:'10px', letterSpacing:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6
          }}
            onMouseEnter={e => e.currentTarget.style.color = C.red}
            onMouseLeave={e => e.currentTarget.style.color = C.dim}>
            🗑 Delete
          </button>
        </div>

        {isConfirming && (
          <div style={{ border:`1px solid ${C.red}`, padding:'12px', marginTop:10, background:C.redTint }}>
            <p style={{ fontSize:13, color:C.dim, marginBottom:12 }}>Delete {evt.name}? This cannot be undone.</p>
            <div style={{ display:'flex', gap:10 }}>
              <Btn full onClick={() => { onDelete(evt.id); setConfirmDel(null); }} style={{ background:C.redDark, color:C.red, borderColor:C.red }}>
                Yes, Delete
              </Btn>
              <Btn ghost full onClick={() => setConfirmDel(null)}>Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (label, list) => {
    if (list.length === 0) return null;
    return (
      <>
        <Divider label={label} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(250px, 100%), 1fr))', gap:12, marginTop:12, marginBottom:16 }}>
          {list.sort((a, b) => (a.dates?.start ?? '').localeCompare(b.dates?.start ?? '')).map(renderCard)}
        </div>
      </>
    );
  };

  return (
    <div className="page-enter" style={{ maxWidth:840, margin:'0 auto', padding:'24px 20px' }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <Cine as="h2" size={20} weight={900} mb={8}>Your Events</Cine>
        <p style={{ color:C.dim, fontSize:14, fontStyle:'italic' }}>
          Select a tournament to manage pairings and track results
        </p>
      </div>

      {renderSection('Current', current)}
      {renderSection('Upcoming', upcoming)}
      {renderSection('Past', past)}
      {renderSection('Undated', undated)}

      <div style={{ marginTop:16 }}>
        <div {...clickable(onAdd)} style={{
          border:`1px dashed ${C.bord}`, padding:'16px 18px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, minHeight:80,
          transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)'
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

  const completedRounds = event ? Object.values(event.rounds ?? {}).filter(r => r && r.complete).length : 0;
  const minRounds = Math.max(1, completedRounds);
  const ok = name && numRounds >= minRounds;

  const handleSave = () => {
    let base = {
      teamName: DEFAULT_TEAM_NAME,
      roster: JSON.parse(JSON.stringify(DEFAULT_RAGNAROK)),
      matrix: JSON.parse(JSON.stringify(DEFAULT_MATRIX)),
      opponents: [],
      rounds: {},
      scoringTable: JSON.parse(JSON.stringify(DEFAULT_SCORING_TABLE)),
    };

    if (copyFrom && !event) {
      const src = (events ?? []).find(e => e.id === copyFrom);
      if (src) {
        base.teamName = src.teamName;
        base.roster = JSON.parse(JSON.stringify(src.roster));
        base.matrix = JSON.parse(JSON.stringify(src.matrix));
        base.opponents = JSON.parse(JSON.stringify(src.opponents ?? []));
        base.scoringTable = JSON.parse(JSON.stringify(src.scoringTable ?? DEFAULT_SCORING_TABLE));
      }
    }

    if (event) {
      base = { teamName: event.teamName, roster: event.roster, matrix: event.matrix, opponents: event.opponents, rounds: event.rounds, scoringTable: event.scoringTable ?? DEFAULT_SCORING_TABLE };
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
    <div className="page-enter" style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Cine as="h1" size={24} weight={900} mb={28}>{event ? 'Edit Event' : 'Create Event'}</Cine>

      <Tag block mb={8}>Event Name</Tag>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kent Teams March 2026"
        style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white,
          padding:'10px 14px', fontSize:16, fontFamily:'Chakra Petch, sans-serif', fontWeight:600, marginBottom:20, outline:'none' }} />

      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <div style={{ flex:1 }}>
          <Tag block mb={8}>Start Date</Tag>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 12px', fontSize:14, outline:'none' }} />
        </div>
        <div style={{ flex:1 }}>
          <Tag block mb={8}>End Date</Tag>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 12px', fontSize:14, outline:'none' }} />
        </div>
      </div>

      <Tag block mb={8}>Number of Rounds</Tag>
      <input type="number" min={minRounds} max="10" value={numRounds} onChange={e => setNumRounds(Math.max(minRounds, parseInt(e.target.value) || minRounds))}
        style={{ width:100, background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 12px', fontSize:14, fontFamily:'Source Code Pro, monospace', outline:'none', marginBottom:4 }} />
      {completedRounds > 0 && <div style={{ fontSize:12, color:C.dim, marginBottom:20 }}>{completedRounds} round{completedRounds > 1 ? 's' : ''} completed — minimum {minRounds}</div>}

      {!event && (events ?? []).length > 0 && (
        <>
          <Tag block mb={8} color={C.dim}>Copy Roster & Rankings From</Tag>
          <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)}
            style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:copyFrom ? C.text : C.dim, padding:'12px 12px', fontSize:14, outline:'none', marginBottom:20 }}>
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
            <Btn ghost sm full onClick={() => setConfirmDel(true)} style={{ color:C.red, borderColor:C.redBord }}>
              Delete Event
            </Btn>
          ) : (
            <div style={{ display:'flex', gap:10 }}>
              <Btn sm full onClick={() => onDelete(event.id)} style={{ background:C.redDark, color:C.red, borderColor:C.red }}>
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

function Home({ teams, rounds = {}, event, onSelect, onAdd, onEdit, onRound, onBack, onImport }) {
  const [confirmPlayed, setConfirmPlayed] = useState(null);
  const [copied, setCopied] = useState(false);
  const playedIds = new Set(Object.values(rounds).filter(r => r?.opponentId).map(r => r.opponentId));
  const allTeams = [...(teams ?? [])].filter(t => t).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  const sorted = [...allTeams.filter(t => !playedIds.has(t.id)), ...allTeams.filter(t => playedIds.has(t.id))];

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
    <div className="page-enter" style={{ maxWidth:840, margin:'0 auto', padding:'24px 20px', backgroundImage:`radial-gradient(ellipse at 50% -20%, ${C.goldGlow} 0%, transparent 50%)` }}>
      <Back onClick={onBack} />
      <div style={{ textAlign:'center', marginBottom:24 }}>
        {(() => {
          const numR = event?.numRounds ?? 5;
          const nextRound = Array.from({ length: numR }, (_, i) => i + 1).find(n => !rounds[n]?.complete);
          return nextRound
            ? <Cine as="h1" size={24} weight={900} mb={12}>Round {nextRound}</Cine>
            : <Cine as="h1" size={24} weight={900} mb={12}>Event Complete</Cine>;
        })()}
        {(() => {
          const numR = event?.numRounds ?? 5;
          const nextRound = Array.from({ length: numR }, (_, i) => i + 1).find(n => !rounds[n]?.complete);
          if (!nextRound) return null;
          const nextRoundData = rounds[nextRound];
          const hasOpponent = nextRoundData?.opponentId;
          return (
            <div style={{ marginTop:8 }}>
              <Btn gold full onClick={() => onRound(nextRound)}>
                {hasOpponent ? `Continue Round ${nextRound} →` : `Start Round ${nextRound} →`}
              </Btn>
            </div>
          );
        })()}
        {completedRounds.length === 0 && !Object.values(rounds).some(r => r?.opponentId) && (
          <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginTop:12 }}>
            Select your round opponent to view matchups and begin pairing
          </p>
        )}
      </div>

      <Divider label="Opponents" />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(210px, 100%), 1fr))', gap:12, marginTop:12 }}>
        {sorted.map(t => {
          const facs = (t.players ?? []).map(p => p?.faction ?? 'D');
          // Count best matchup per opponent faction across all our players
          const matchupCounts = { wins:0, draws:0, losses:0 };
          facs.forEach(f => {
            const bestScore = Math.max(...RAGNAROK.map(r => defs[gr(r.name, f)]?.score ?? 2));
            if (bestScore >= 3) matchupCounts.wins++;
            else if (bestScore >= 2) matchupCounts.draws++;
            else matchupCounts.losses++;
          });
          const played = playedIds.has(t.id);
          const handleSelect = () => {
            if (played) setConfirmPlayed(t);
            else onSelect(t);
          };
          return (
            <div key={t.id} className="tap-card" {...clickable(handleSelect)} style={{
              borderLeft:`3px solid ${played ? C.greenBord : C.bord}`, background:C.surf, padding:'14px 16px', cursor:'pointer',
              transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1), opacity 0.12s',
              display:'flex', flexDirection:'column', gap:8, opacity:played ? 0.6 : 1
            }}
              onMouseEnter={e => e.currentTarget.style.borderLeftColor = played ? C.greenBord : C.slate}
              onMouseLeave={e => e.currentTarget.style.borderLeftColor = played ? C.greenBord : C.bord}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Cine size={14} weight={700}>{t.name}</Cine>
                {played && <span style={{ color:C.green, fontSize:16 }}>✓</span>}
              </div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {facs.map((f, i) => (
                  <span key={i} style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{f}{i < facs.length - 1 ? ',' : ''}</span>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
                <div style={{ display:'flex', gap:8, fontSize:12 }}>
                  {matchupCounts.wins > 0 && <span style={{ color:C.green }}>{matchupCounts.wins}W</span>}
                  {matchupCounts.draws > 0 && <span style={{ color:C.dim }}>{matchupCounts.draws}D</span>}
                  {matchupCounts.losses > 0 && <span style={{ color:C.red }}>{matchupCounts.losses}L</span>}
                </div>
                <button onClick={e => { e.stopPropagation(); onEdit(t); }} style={{
                  background:'transparent', border:`1px solid ${C.bord}`, color:C.dim, padding:'10px 14px',
                  fontSize:12, fontFamily:'Chakra Petch, sans-serif', cursor:'pointer', letterSpacing:1, minHeight:44
                }}>Edit</button>
              </div>
            </div>
          );
        })}
        <div {...clickable(onAdd)} style={{ border:`1px dashed ${C.bord}`, padding:'14px 16px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, minHeight:80,
          transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
          <div style={{ fontSize:22, color:C.dim }}>+</div>
          <Tag color={C.dim}>Add Opponent</Tag>
        </div>
        {onImport && (
          <div {...clickable(onImport)} style={{ border:`1px dashed ${C.bord}`, padding:'14px 16px', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, minHeight:80,
            transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
            <div style={{ fontSize:18, color:C.dim }}>↑</div>
            <Tag color={C.dim}>Import Opponents</Tag>
          </div>
        )}
      </div>

      {/* Already played warning */}
      {confirmPlayed && (
        <div style={{ borderLeft:`3px solid ${C.gold}`, background:C.surf, padding:'16px', marginTop:12 }}>
          <Cine size={14} weight={700} mb={8} color={C.gold}>Already Played</Cine>
          <p style={{ fontSize:13, color:C.dim, marginBottom:14 }}>
            You've already faced {confirmPlayed.name} in a previous round. Are you sure you want to view this matchup again?
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <Btn gold full onClick={() => { onSelect(confirmPlayed); setConfirmPlayed(null); }}>Yes, Continue</Btn>
            <Btn ghost full onClick={() => setConfirmPlayed(null)}>Cancel</Btn>
          </div>
        </div>
      )}

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
                <div key={n} {...clickable(() => onRound(n))} style={{
                  display:'flex', alignItems:'center', padding:'14px 16px',
                  borderLeft:`3px solid ${complete ? C.greenBord : (n === Array.from({ length: event?.numRounds ?? 5 }, (_, j) => j + 1).find(x => !rounds[x]?.complete)) ? C.gold : C.bord}`,
                  background:C.surf, cursor:'pointer', transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)', gap:12, marginBottom:4
                }}
                  onMouseEnter={e => e.currentTarget.style.borderLeftColor = C.gold}
                  onMouseLeave={e => e.currentTarget.style.borderLeftColor = complete ? C.greenBord : C.bord}>
                  <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:12, color:C.dim, minWidth:28 }}>{String(n).padStart(2,'0')}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, color:opp ? C.white : C.dim }}>
                      {opp ? `vs ${opp.name}` : 'Not started'}
                    </span>
                    {complete && round.pairings?.length > 0 && opp && (
                      <div style={{ fontSize:12, color:C.dim, marginTop:4, display:'flex', gap:6, flexWrap:'wrap' }}>
                        {(round.pairings ?? []).map((p, pi) => {
                          const player = RAGNAROK.find(r => r.id === p.usIdx);
                          const faction = opp.players?.[p.themIdx]?.faction;
                          if (!player || !faction) return null;
                          return <span key={pi}>{player.name} v {faction}{pi < round.pairings.length - 1 ? ',' : ''}</span>;
                        })}
                      </div>
                    )}
                  </div>
                  {complete && (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:13, fontWeight:700, color:resultCol }}>{ourTotal}-{theirTotal}</span>
                      <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, fontWeight:700, color:resultCol }}>{result}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Standings */}
      {completedRounds.length > 0 && (
        <>
          <Divider label="Standings" />
          <div className="stat-row" style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:16, marginTop:12 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Source Code Pro, monospace', fontSize:20, fontWeight:700, color:C.gold }}>{wins}-{draws}-{losses}</div>
              <Tag color={C.dim}>W-D-L</Tag>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Source Code Pro, monospace', fontSize:20, fontWeight:700, color:totalOurGP > totalTheirGP ? C.green : totalOurGP < totalTheirGP ? C.red : C.gold }}>{totalOurGP}-{totalTheirGP}</div>
              <Tag color={C.dim}>Game Points</Tag>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:20 }}>
            {[...playerStats].sort((a, b) => b.gp - a.gp).map(p => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderLeft:`3px solid ${C.bord}`, background:C.surf, gap:10, marginBottom:4 }}>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.white, flex:1 }}>{p.name}</span>
                <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{p.faction}</span>
                <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:12, fontWeight:700, color:C.gold, minWidth:30, textAlign:'right' }}>{p.gp}</span>
                <span style={{ fontSize:12, color:C.dim }}>({p.games}g, avg {p.avg})</span>
              </div>
            ))}
          </div>
          <Btn ghost sm onClick={() => {
            const lines = [`${event?.name ?? 'Event'} — ${teamName}`, `Record: ${wins}-${draws}-${losses} | GP: ${totalOurGP}-${totalTheirGP}`, ''];
            Object.keys(rounds).sort().forEach(n => {
              const r = rounds[n];
              if (!r?.complete) return;
              const opp = teams.find(t => t.id === r.opponentId);
              const rGP = (r.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0);
              const tGP = (r.scores ?? []).reduce((s, sc) => s + (parseInt(sc.theirGP) || 0), 0);
              const res = rGP >= 55 ? 'WIN' : rGP <= 45 ? 'LOSS' : 'TIE';
              lines.push(`R${n}: vs ${opp?.name ?? '?'} — ${rGP}-${tGP} (${res})`);
              (r.pairings ?? []).forEach((p, pi) => {
                const player = RAGNAROK.find(x => x.id === p.usIdx);
                const fac = opp?.players?.[p.themIdx]?.faction;
                const sc = r.scores?.[pi];
                if (player && fac && sc) lines.push(`  ${player.name} v ${fac}: ${sc.ourGP}-${sc.theirGP}${sc.ourVP ? ` (VP: ${sc.ourVP}-${sc.theirVP})` : ''}`);
              });
              lines.push('');
            });
            lines.push('Player Stats:');
            [...playerStats].sort((a, b) => b.gp - a.gp).forEach(p => {
              lines.push(`  ${p.name} (${p.faction}): ${p.gp}GP, ${p.games}g, avg ${p.avg}`);
            });
            navigator.clipboard.writeText(lines.join('\n')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); });
          }} style={{ marginTop:12 }}>
            {copied ? '✓ Copied!' : 'Copy Results to Clipboard'}
          </Btn>
          <Btn ghost sm onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}#${event?.id ?? ''}`;
            if (navigator.share) {
              navigator.share({ title: event?.name ?? 'Event', text: `${teamName} — ${event?.name}`, url });
            } else {
              navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); });
            }
          }} style={{ marginTop:8 }}>
            Share Event Link
          </Btn>
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
    <div className="page-enter" style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Cine as="h1" size={24} weight={900} mb={32}>{team ? 'Edit Opponent' : 'Add Opponent'}</Cine>

      <Tag block mb={10}>Team Name</Tag>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Opponent team name"
        style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white,
          padding:'10px 14px', fontSize:16, fontFamily:'Chakra Petch, sans-serif', fontWeight:600,
          marginBottom:24, outline:'none' }} />

      <Tag block mb={12}>Factions (5 players)</Tag>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
        {players.map((p, i) => (
          <div key={i}>
            <select value={p.faction} onChange={e => set(i, 'faction', e.target.value)}
              style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:p.faction ? C.text : C.dim, padding:'12px 12px', fontSize:14, outline:'none' }}>
              <option value="">— Player {i+1} Faction —</option>
              {[...FACTIONS].sort((a,b)=>a.localeCompare(b)).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        ))}
      </div>
      <Btn gold full disabled={!ok} onClick={() => onSave({ ...team, id:team?.id ?? Date.now().toString(), name, players })}>
        {team ? 'Save Changes' : 'Add Opponent'}
      </Btn>

      {team && (
        <div style={{ marginTop:24, borderTop:`1px solid ${C.bord}`, paddingTop:20 }}>
          {!confirmDelete ? (
            <Btn ghost full onClick={() => setConfirmDelete(true)} style={{ color:C.red, borderColor:C.redBord }}>
              Remove Team
            </Btn>
          ) : (
            <div style={{ border:`1px solid ${C.red}`, padding:'16px', background:C.redTint }}>
              <Cine size={14} weight={700} color={C.red} mb={8}>Remove {team.name}?</Cine>
              <p style={{ fontSize:13, color:C.dim, marginBottom:16 }}>
                This will permanently remove this opponent team. Any round data linked to them will remain but won't show the team name.
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <Btn full onClick={() => { onDelete(team.id); }} style={{ background:C.redDark, color:C.red, borderColor:C.red }}>
                  Yes, Remove
                </Btn>
                <Btn ghost full onClick={() => setConfirmDelete(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MATCHUP VIEW ─────────────────────────────────────────────────────────────

function Matchup({ team, onStart, onBack }) {
  const theirFacs = (team?.players ?? []).map(p => p?.faction ?? 'D');

  return (
    <div className="page-enter" style={{ maxWidth:960, margin:'0 auto', padding:'32px 18px' }}>
      <Back onClick={onBack} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <Tag color={C.dim} block mb={6}>Round Opponent</Tag>
          <Cine as="h1" size={24} weight={900}>{team.name}</Cine>
        </div>
        <Btn gold onClick={onStart}>Begin Pairing →</Btn>
      </div>

      <div style={{ position:'relative', marginBottom:24 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth:480 }}>
            <thead>
              <tr>
                <th style={{ padding:'8px 14px', borderBottom:`1px solid ${C.bord}` }} />
                <th style={{ padding:'8px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}`, minWidth:44 }}>
                  <Tag color={C.dim}>Avg</Tag>
                </th>
                {team.players.map((p, i) => (
                  <th key={i} style={{ padding:'8px 10px', textAlign:'center', borderBottom:`1px solid ${C.bord}`, minWidth:70 }}>
                    <Cine size={13} weight={700}>{p.faction}</Cine>
                  </th>
                ))}
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
                    <td style={{ padding:'10px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}` }}>
                      <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:14, fontWeight:700, color:ScoreColor(a) }}>{a.toFixed(1)}</span>
                    </td>
                    {team.players.map((p, i) => {
                      const rat = gr(r.name, p.faction);
                      return (
                        <td key={i} style={{ padding:'10px 12px', textAlign:'center', borderBottom:`1px solid ${C.bord}`, background:BG_COL[rat]+'30' }}>
                          <Badge r={rat} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:32, pointerEvents:'none',
          background:`linear-gradient(to right, transparent, ${C.bg})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:C.dim, fontSize:16 }}>→</span>
        </div>
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

function Pairing({ team, onBack, onComplete, onScores }) {
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

  const defRecs = useMemo(() => [...ourPool].sort((a, b) =>
    avg(RAGNAROK[b].name, theirRemFacs) - avg(RAGNAROK[a].name, theirRemFacs)
  ), [ourPool, theirRemFacs]);

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
  const sideBorder = { paired:C.bord, defender:C.slateDim, attacker:C.amberDark, pool:C.bord };

  const sidebar = (
    <div className="pair-sidebar">
      <div>
        <Tag block mb={8} color={C.blue}>Our Pool</Tag>
        <div className="pool-list" style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {RAGNAROK.map(r => {
            const st = poolStatus('our', r.id);
            return (
              <div key={r.id} style={{ padding:'8px 10px', borderLeft:`3px solid ${sideBorder[st]}`, background:C.surf, opacity:st==='paired'?0.28:1 }}>
                <div style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, fontWeight:600, color:sideColor[st] }}>{r.name}</div>
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
              <div key={i} style={{ padding:'8px 10px', borderLeft:`3px solid ${sideBorder[st]}`, background:C.surf, opacity:st==='paired'?0.28:1 }}>
                <div style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, fontWeight:600, color:st==='defender'?C.red:sideColor[st] }}>{p.faction}</div>
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
        <Cine as="h2" size={20} weight={900} mb={6}>Select Your Defender</Cine>
        <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:20 }}>
          Choose secretly. Ranked by average matchup score vs their remaining players.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {defRecs.map((i, rank) => {
            const r = RAGNAROK[i];
            const a = avg(r.name, theirRemFacs);
            const sel = ourDef === i;
            const exp = expanded === i;
            return (
              <div key={i} style={{ borderLeft:`3px solid ${sel ? C.gold : C.bord}`, background:sel ? C.surf : 'transparent', transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)' }}>
                <div {...clickable(() => setOurDef(sel ? null : i))} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                }}>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, minWidth:16 }}>#{rank+1}</span>
                  <div style={{ flex:1 }}>
                    <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                    <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                    <div style={{ fontSize:12, marginTop:4 }}>
                      <span style={{ color:C.dim }}>Avg </span>
                      <span style={{ fontFamily:'Source Code Pro, monospace', fontWeight:700, color:ScoreColor(a) }}>{a.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="def-row-badges">
                    {theirRemFacs.map((f, fi) => <Badge key={fi} r={gr(r.name, f)} />)}
                  </div>
                </div>
                <div {...clickable(e => { e.stopPropagation(); setExpanded(exp ? null : i); })} style={{
                  padding:'0 14px 4px', cursor:'pointer', display:'flex', justifyContent:'flex-end'
                }}>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, letterSpacing:1 }}>{exp ? '▲ Hide' : '▼ Details'}</span>
                </div>
                {exp && (
                  <div style={{ padding:'10px 14px 14px', borderTop:`1px solid ${C.bord}`, borderBottom:`1px solid ${C.bord}`, display:'flex', flexDirection:'column', gap:6, marginBottom:4 }}>
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
        <Cine as="h2" size={20} weight={900} mb={6}>Enter Their Defender</Cine>
        <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:18 }}>
          Both teams have revealed defenders. Select the faction {team.name} put forward.
        </p>
        <div style={{ padding:'10px 14px', borderLeft:`3px solid ${C.slate}`, background:C.surf, marginBottom:18 }}>
          <Tag color={C.blue} block mb={5}>Your Defender</Tag>
          <Cine size={13}>{RAGNAROK[ourDef].name}</Cine>
          <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{RAGNAROK[ourDef].faction}</div>
        </div>
        <div style={{ padding:'10px 14px', borderLeft:`3px solid ${C.gold}`, background:C.goldTint, marginBottom:14 }}>
          <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, color:C.gold }}>Your input needed — select their revealed defender</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {theirPool.map(i => {
            const p = team.players[i];
            const sel = theirDef === i;
            return (
              <div key={i} {...clickable(() => setTheirDef(sel ? null : i))} style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer',
                borderLeft:`3px solid ${sel ? C.redBord : C.bord}`, background:sel ? C.surf : 'transparent'
              }}>
                <Cine size={13} color={sel ? C.redLight : C.white}>{p.faction}</Cine>
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
    const autoSelected = atkRecs.length <= maxOurAtk;

    // Auto-select if only exact number of choices available
    if (autoSelected && ourAtk.length !== atkRecs.length) {
      setTimeout(() => setOurAtk(atkRecs), 0);
    }

    return (
      <>
        <Tag block mb={8}>Step 2 · Attackers</Tag>
        <Cine as="h2" size={20} weight={900} mb={6}>Select Your Attackers</Cine>
        <div style={{ padding:'10px 14px', borderLeft:`3px solid ${C.redBord}`, background:C.surf, marginBottom:18 }}>
          <Tag color={C.red} block mb={5}>Their Defender</Tag>
          <Cine size={13}>{team.players[theirDef].name}</Cine>
          <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{team.players[theirDef].faction}</div>
        </div>
        {autoSelected ? (
          <div style={{ padding:'12px 14px', borderLeft:`3px solid ${C.gold}`, background:C.surf, marginBottom:14 }}>
            <span style={{ fontSize:13, color:C.gold }}>Only {atkRecs.length} player{atkRecs.length > 1 ? 's' : ''} available — auto-selected.</span>
          </div>
        ) : (
          <p style={{ color:C.dim, fontSize:13, fontStyle:'italic', marginBottom:14 }}>
            Pick {maxOurAtk} to attack their defender. Ranked by matchup vs their faction.
          </p>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
          {atkRecs.map((i, rank) => {
            const r = RAGNAROK[i];
            const rat = gr(r.name, theirDefFac||'');
            const sel = ourAtk.includes(i);
            return (
              <div key={i} {...clickable(() => !autoSelected && toggleOurAtk(i))} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                cursor:autoSelected ? 'default' : 'pointer',
                borderLeft:`3px solid ${sel ? C.gold : C.bord}`, background:sel ? C.surf : 'transparent'
              }}>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, minWidth:16 }}>#{rank+1}</span>
                <div style={{ flex:1 }}>
                  <Cine size={12} color={sel ? C.gold : C.white}>{r.name}</Cine>
                  <div style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{r.faction}</div>
                </div>
                <Badge r={rat} />
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, letterSpacing:2, marginBottom:14 }}>
          {ourAtk.length} / {maxOurAtk} selected
        </div>
        <Btn gold full disabled={ourAtk.length !== maxOurAtk} onClick={() => setPhase('their_atk')}>Lock In →</Btn>
      </>
    );
  }

  // Phase: enter their attackers
  function PhaseTheirAtk() {
    const available = theirPool.filter(i => i !== theirDef);
    const autoSelected = available.length <= maxTheirAtk;

    if (autoSelected && theirAtk.length !== available.length) {
      setTimeout(() => setTheirAtk(available), 0);
    }

    return (
      <>
        <Tag block mb={8}>Step 2 · Reveal</Tag>
        <Cine as="h2" size={20} weight={900} mb={6}>Enter Their Attackers</Cine>
        <div style={{ padding:'10px 14px', borderLeft:`3px solid ${C.slate}`, background:C.surf, marginBottom:18 }}>
          <Tag color={C.blue} block mb={5}>Your Defender Faces</Tag>
          <Cine size={13}>{RAGNAROK[ourDef].name} — select who they're sending</Cine>
        </div>
        {autoSelected && (
          <div style={{ padding:'12px 14px', borderLeft:`3px solid ${C.slate}`, background:C.surf, marginBottom:14 }}>
            <span style={{ fontSize:13, color:C.slate }}>Only {available.length} opponent{available.length > 1 ? 's' : ''} remaining — auto-selected.</span>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
          {available.map(i => {
            const p = team.players[i];
            const sel = theirAtk.includes(i);
            return (
              <div key={i} {...clickable(() => !autoSelected && toggleTheirAtk(i))} style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                cursor:autoSelected ? 'default' : 'pointer',
                borderLeft:`3px solid ${sel ? C.redBord : C.bord}`, background:sel ? C.surf : 'transparent'
              }}>
                <Cine size={13} color={sel ? C.redLight : C.white}>{p.faction}</Cine>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, letterSpacing:2, marginBottom:14 }}>
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
        <Cine as="h2" size={20} weight={900} mb={18}>Defenders Choose</Cine>

        {/* Our defender picks */}
        <div style={{ borderLeft:`3px solid ${C.blue}`, background:C.surf, padding:'16px 18px', marginBottom:16 }}>
          <Tag color={C.blue} block mb={10}>{ourDefP.name}'s Pick</Tag>
          <div style={{ fontSize:12, color:C.dim, marginBottom:12 }}>
            Which of their attackers will {ourDefP.name} face?
          </div>
          {theirAtk.length === 1 ? (
            (() => { if (acceptedTheirAtk === null) setTimeout(() => setAcceptedTheirAtk(theirAtk[0]), 0); return null; })()
          ) : null}
          {theirAtk.length === 1 && (
            <div style={{ padding:'12px 14px', borderLeft:`3px solid ${C.gold}`, background:C.surf, marginBottom:12 }}>
              <span style={{ fontSize:13, color:C.gold }}>Only 1 attacker — auto-selected.</span>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {theirAtk.map(i => {
              const p = team.players[i];
              const rat = gr(ourDefP.name, p.faction);
              const isRec = i === bestTheirAtk && theirAtk.length > 1;
              const sel = acceptedTheirAtk === i;
              return (
                <div key={i} {...clickable(() => theirAtk.length > 1 && setAcceptedTheirAtk(sel ? null : i))} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  cursor:theirAtk.length > 1 ? 'pointer' : 'default',
                  borderLeft:`3px solid ${sel ? C.gold : C.bord}`, background:sel ? C.surf : 'transparent',
                  position:'relative'
                }}>
                  {isRec && <span style={{ position:'absolute', top:5, right:8, fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.green, letterSpacing:1 }}>RECOMMENDED</span>}
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
        <div style={{ borderLeft:`3px solid ${C.gold}`, background:C.surf, padding:'16px 18px', marginBottom:18 }}>
          <Tag color={C.gold} block mb={10}>Your Attacker vs Their Defender</Tag>
          <div style={{ fontSize:12, color:C.dim, marginBottom:12 }}>
            Who attacks their defender <span style={{ fontFamily:'Chakra Petch, sans-serif', color:C.white }}>{theirDefP.faction}</span>?
          </div>
          {ourAtk.length === 1 ? (
            (() => { if (chosenOurAtk === null) setTimeout(() => setChosenOurAtk(ourAtk[0]), 0); return null; })()
          ) : null}
          {ourAtk.length === 1 && (
            <div style={{ padding:'12px 14px', borderLeft:`3px solid ${C.gold}`, marginBottom:12 }}>
              <span style={{ fontSize:13, color:C.gold }}>Only 1 attacker — auto-selected.</span>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {ourAtk.map(i => {
              const r = RAGNAROK[i];
              const rat = gr(r.name, theirDefP.faction);
              const isRec = i === bestOurAtk && ourAtk.length > 1;
              const sel = chosenOurAtk === i;
              return (
                <div key={i} {...clickable(() => ourAtk.length > 1 && setChosenOurAtk(sel ? null : i))} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  cursor:ourAtk.length > 1 ? 'pointer' : 'default',
                  borderLeft:`3px solid ${sel ? C.gold : C.bord}`, background:sel ? C.surf : 'transparent',
                  position:'relative'
                }}>
                  {isRec && <span style={{ position:'absolute', top:5, right:8, fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.green, letterSpacing:1 }}>RECOMMENDED</span>}
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
          <Cine as="h1" size={24} weight={900} mb={28} color={C.gold}>Final Draw</Cine>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:32 }}>
            {pairings.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderLeft:`3px solid ${C.gold}`, background:C.surf }}>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.goldD, minWidth:64, letterSpacing:1 }}>TABLE {i+1}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginLeft:6 }}>{p.us.faction}</span>
                </div>
                <span style={{ color:C.goldD, margin:'0 10px' }}>⚔</span>
                <div style={{ flex:1, textAlign:'right' }}>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginRight:6 }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.red }}>{p.them.faction}</span>
                </div>
              </div>
            ))}
          </div>
          {onScores && <Btn gold onClick={onScores} full style={{ marginBottom:10 }}>Enter Scores →</Btn>}
          <Btn ghost onClick={onBack} full>← Back to Dashboard</Btn>
        </>
      );
    }

    return (
      <>
        <Tag block mb={18} style={{ fontSize:12, letterSpacing:4 }}>◆ Cycle Complete</Tag>
        <Cine as="h2" size={20} weight={900} mb={18}>Pairings Confirmed</Cine>
        {cycleRes && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
            {[cycleRes.p1, cycleRes.p2].map((p, i) => (
              <div key={i} style={{ padding:'12px 16px', borderLeft:`3px solid ${C.greenBord}`, background:C.surf }}>
                <Tag color={C.green} block mb={6}>Confirmed</Tag>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{p.us.faction}</span>
                  <span style={{ color:C.goldD }}>⚔</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.red }}>{p.them.faction}</span>
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
                    ↩ <span style={{ color:C.blue }}>{cycleRes.refusedOur.name}</span> ({cycleRes.refusedOur.faction}) back to your pool
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
    <div className="page-enter" style={{ maxWidth:940, margin:'0 auto', padding:'28px 16px' }}>
      <Back onClick={onBack} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <Tag color={C.dim} block mb={4}>Round Pairing vs</Tag>
          <Cine as="h1" size={24} weight={900}>{team.name}</Cine>
        </div>
        <div style={{ textAlign:'right' }}>
          <Tag color={C.dim} block mb={4}>Pairings</Tag>
          <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:26, fontWeight:900, color:C.gold }}>{pairings.length}<span style={{ color:C.dim, fontSize:13 }}> / 5</span></span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display:'flex', gap:3, marginBottom:14 }}>
        {Array.from({ length:5 }, (_, i) => (
          <div key={i} style={{ flex:1, height:4, background: i < pairings.length ? C.gold : C.bord, transition:'background 0.4s cubic-bezier(0.25,1,0.5,1)' }} />
        ))}
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', gap:0, marginBottom:22 }}>
        {steps.map((s, i) => {
          const done = i < curStep, active = i === curStep;
          return (
            <div key={i} style={{ flex:1, borderTop:`2px solid ${done||active ? C.gold : C.bord}`, paddingTop:7, opacity:done||active ? 1 : 0.3, transition:'border-color 0.3s cubic-bezier(0.25,1,0.5,1), opacity 0.3s cubic-bezier(0.25,1,0.5,1)' }}>
              <div style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, letterSpacing:1.5, color:active ? C.gold : done ? C.goldD : C.dim }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div className="pair-layout">
        <div style={{ flex:1, borderLeft:`3px solid ${C.gold}`, background:C.surf, padding:'22px 20px', minWidth:0 }}>
          {panels[phase]}
        </div>
        {sidebar}
      </div>

      {pairings.length > 0 && (
        <div style={{ marginTop:22 }}>
          <Divider label="Confirmed Pairings" />
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {pairings.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderLeft:`3px solid ${C.greenBord}`, background:C.surf }}>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, minWidth:58, letterSpacing:1 }}>TABLE {i+1}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.blue }}>{p.us.name}</span>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginLeft:6 }}>{p.us.faction}</span>
                </div>
                <span style={{ color:C.goldD, margin:'0 8px' }}>⚔</span>
                <div style={{ flex:1, textAlign:'right' }}>
                  <span style={{ fontSize:12, color:C.dim, fontStyle:'italic', marginRight:6 }}>{p.them.faction}</span>
                  <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.red }}>{p.them.faction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── SCORING TABLE EDITOR ────────────────────────────────────────────────────

function ScoringTableEditor({ table, onSave, onBack }) {
  const [local, setLocal] = useState(JSON.parse(JSON.stringify(table ?? DEFAULT_SCORING_TABLE)));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const update = (idx, field, value) => {
    const next = [...local];
    next[idx] = { ...next[idx], [field]: parseInt(value) || 0 };
    setLocal(next);
  };

  const addRow = () => {
    const last = local[local.length - 1];
    setLocal([...local, { min: (last?.max ?? 0) + 1, max: (last?.max ?? 0) + 5, winGP: 20 }]);
  };

  const removeRow = (idx) => setLocal(local.filter((_, i) => i !== idx));

  const handleSave = () => {
    setSaving(true);
    onSave(local).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  const handleReset = () => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SCORING_TABLE));
    setLocal(fresh);
    setSaving(true);
    onSave(fresh).then(() => { setSaving(false); setLastSaved(new Date()); });
  };

  return (
    <div className="page-enter" style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Event Scoring</Tag>
      <Cine as="h1" size={24} weight={900} mb={6}>VP to Game Points</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Edit the conversion table used to calculate game points from VP difference.
      </p>

      <div style={{ display:'flex', gap:8, padding:'8px 12px', borderBottom:`1px solid ${C.bord}`, marginBottom:8 }}>
        <span style={{ flex:1, fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim }}>VP Diff</span>
        <span style={{ width:70, fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, textAlign:'center' }}>Winner</span>
        <span style={{ width:70, fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.dim, textAlign:'center' }}>Loser</span>
        <span style={{ width:44 }} />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:20 }}>
        {local.map((row, idx) => (
          <div key={idx} style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 12px', borderLeft:`3px solid ${C.bord}`, background:C.surf }}>
            <div style={{ flex:1, display:'flex', gap:4, alignItems:'center' }}>
              <input type="number" min="0" value={row.min} onChange={e => update(idx, 'min', e.target.value)}
                style={{ width:50, background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'10px 6px', fontSize:14, fontFamily:'Source Code Pro, monospace', outline:'none', textAlign:'center' }} />
              <span style={{ color:C.dim }}>-</span>
              <input type="number" min="0" value={row.max} onChange={e => update(idx, 'max', e.target.value)}
                style={{ width:50, background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'10px 6px', fontSize:14, fontFamily:'Source Code Pro, monospace', outline:'none', textAlign:'center' }} />
            </div>
            <input type="number" min="0" max="20" value={row.winGP} onChange={e => update(idx, 'winGP', e.target.value)}
              style={{ width:70, background:C.input, border:`1px solid ${C.bord}`, color:C.green, padding:'10px 6px', fontSize:14, fontFamily:'Source Code Pro, monospace', outline:'none', textAlign:'center' }} />
            <span style={{ width:70, fontFamily:'Source Code Pro, monospace', fontSize:13, color:C.red, textAlign:'center' }}>{20 - row.winGP}</span>
            <button onClick={() => removeRow(idx)} style={{
              background:'transparent', border:`1px solid ${C.bord}`, color:C.red,
              width:44, height:34, cursor:'pointer', fontSize:14, fontFamily:'Source Code Pro, monospace'
            }}>✕</button>
          </div>
        ))}
      </div>

      <Btn ghost sm onClick={addRow} style={{ marginBottom:20 }}>+ Add Row</Btn>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        {saving && <span aria-live="polite" style={{ fontSize:12, color:C.dim, fontStyle:'italic' }}>Saving...</span>}
        {!saving && lastSaved && <span aria-live="polite" style={{ fontSize:12, color:C.green }}>Saved</span>}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn gold disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Table'}</Btn>
        <Btn ghost sm onClick={handleReset}>Reset to Defaults</Btn>
      </div>
    </div>
  );
}

// ─── ROUND PICKER ────────────────────────────────────────────────────────────

function RoundPicker({ rounds, teams, event, onSelect, onBack }) {
  const numRounds = event?.numRounds ?? 5;
  const completedRounds = Array.from({ length: numRounds }, (_, i) => i + 1)
    .filter(n => rounds[n]?.complete);

  return (
    <div className="page-enter" style={{ maxWidth:560, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={10}>Edit Scores</Tag>
      <Cine as="h1" size={24} weight={900} mb={8}>Select a Round</Cine>
      <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:24 }}>
        Choose a completed round to review or edit its scores.
      </p>

      {completedRounds.length === 0 && (
        <div style={{ padding:'16px', border:`1px solid ${C.bord}`, textAlign:'center' }}>
          <span style={{ fontSize:13, color:C.dim, fontStyle:'italic' }}>No rounds have been scored yet. Complete a round first.</span>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {completedRounds.map(n => {
          const round = rounds[n];
          const opp = teams.find(t => t.id === round.opponentId);
          const ourTotal = (round.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0);
          const theirTotal = (round.scores ?? []).reduce((s, sc) => s + (parseInt(sc.theirGP) || 0), 0);
          const result = ourTotal >= 55 ? 'W' : ourTotal <= 45 ? 'L' : 'D';
          const resultCol = result === 'W' ? C.green : result === 'L' ? C.red : C.gold;
          return (
            <div key={n} {...clickable(() => onSelect(n))} style={{
              display:'flex', alignItems:'center', padding:'14px 16px', border:`1px solid ${C.bord}`,
              cursor:'pointer', transition:'border-color 0.2s cubic-bezier(0.25,1,0.5,1)', gap:12
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.goldD}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.bord}>
              <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, color:C.dim, minWidth:70 }}>Round {n}</span>
              <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, color:C.white, flex:1 }}>
                {opp ? `vs ${opp.name}` : 'Unknown'}
              </span>
              <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:14, fontWeight:700, color:resultCol }}>{ourTotal}-{theirTotal}</span>
              <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, fontWeight:700, color:resultCol }}>{result}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ROUND VIEW ──────────────────────────────────────────────────────────────

function RoundView({ roundNum, rounds, teams, onSave, onBack, matrixData, onSaveMatrix, numRounds, onRound }) {
  const round = rounds[roundNum] ?? {};
  const [opponentId, setOpponentId] = useState(round.opponentId ?? '');
  const [scores, setScores] = useState(round.scores ?? Array.from({ length: 5 }, (_, i) => ({ table: i+1, ourVP:'', theirVP:'', ourGP:'', theirGP:'' })));
  const [inputMode, setInputMode] = useState('vp');
  const [confirmSave, setConfirmSave] = useState(false);
  const [editing, setEditing] = useState(!round.complete);
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [undoData, setUndoData] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);
  const [manualPairings, setManualPairings] = useState(
    pairings.length > 0 ? null : Array.from({ length: 5 }, (_, i) => ({ usIdx: '', themIdx: '' }))
  );
  const opponent = teams.find(t => t.id === opponentId);
  const pairings = round.pairings ?? [];

  const updateScore = (idx, field, value) => {
    const next = [...scores];
    next[idx] = { ...next[idx], [field]: value };
    if (inputMode === 'vp') {
      const ov = Math.max(0, Math.min(100, parseInt(field === 'ourVP' ? value : next[idx].ourVP, 10) || 0));
      const tv = Math.max(0, Math.min(100, parseInt(field === 'theirVP' ? value : next[idx].theirVP, 10) || 0));
      if (next[idx].ourVP !== '' && next[idx].theirVP !== '') {
        const [og, tg] = vpToGP(ov, tv);
        next[idx].ourGP = og;
        next[idx].theirGP = tg;
      }
    } else {
      const og = Math.max(0, Math.min(20, parseInt(next[idx].ourGP, 10) || 0));
      const tg = Math.max(0, Math.min(20, parseInt(next[idx].theirGP, 10) || 0));
      next[idx].ourGP = next[idx].ourGP === '' ? '' : og;
      next[idx].theirGP = next[idx].theirGP === '' ? '' : tg;
    }
    setScores(next);
  };

  const assignOpponent = () => {
    const updated = { ...rounds, [roundNum]: { ...round, opponentId } };
    onSave(updated);
  };

  const saveScores = () => {
    const prevRounds = JSON.parse(JSON.stringify(rounds));
    const complete = scores.every(s => !isNaN(parseInt(s.ourGP, 10)) && !isNaN(parseInt(s.theirGP, 10)));
    const finalPairings = pairings.length > 0 ? pairings : (manualPairings ?? []).filter(p => p.usIdx !== '' && p.themIdx !== '').map((p, i) => ({ table: i + 1, usIdx: p.usIdx, themIdx: p.themIdx }));
    const updated = { ...rounds, [roundNum]: { ...round, opponentId: round.opponentId || opponentId, scores, complete, pairings: finalPairings.length > 0 ? finalPairings : (round.pairings ?? []) } };
    onSave(updated);
    setUndoData(prevRounds);
    if (undoTimer) clearTimeout(undoTimer);
    setUndoTimer(setTimeout(() => { setUndoData(null); setUndoTimer(null); }, 5000));
  };

  const handleUndo = () => {
    if (undoData) {
      onSave(undoData);
      setScores(undoData[roundNum]?.scores ?? Array.from({ length: 5 }, (_, i) => ({ table: i+1, ourVP:'', theirVP:'', ourGP:'', theirGP:'' })));
      setEditing(true);
      setUndoData(null);
      if (undoTimer) clearTimeout(undoTimer);
      setUndoTimer(null);
    }
  };

  const ourTotal = scores.reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0);
  const theirTotal = scores.reduce((s, sc) => s + (parseInt(sc.theirGP) || 0), 0);

  return (
    <div className="page-enter" style={{ maxWidth:700, margin:'0 auto', padding:'28px 20px' }}>
      <Back onClick={onBack} />
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
        {roundNum > 1 && onRound && (
          <button onClick={() => onRound(roundNum - 1)} style={{
            background:'transparent', border:`1px solid ${C.bord}`, color:C.dim, width:44, height:44,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16
          }}>←</button>
        )}
        <Cine as="h1" size={24} weight={900} mb={0} style={{ flex:1 }}>
          {opponent ? `R${roundNum} vs ${opponent.name}` : `Round ${roundNum}`}
        </Cine>
        {roundNum < (numRounds ?? 5) && onRound && (
          <button onClick={() => onRound(roundNum + 1)} style={{
            background:'transparent', border:`1px solid ${C.bord}`, color:C.dim, width:44, height:44,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16
          }}>→</button>
        )}
      </div>

      {!round.opponentId && (
        <div style={{ marginBottom:24 }}>
          <p style={{ color:C.dim, fontSize:14, fontStyle:'italic', marginBottom:16 }}>
            Who are you facing in Round {roundNum}? Select your opponent from the list below.
          </p>
          <Tag block mb={10}>Opponent</Tag>
          <select value={opponentId} onChange={e => setOpponentId(e.target.value)}
            style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:opponentId ? C.text : C.dim, padding:'12px 12px', fontSize:14, outline:'none', marginBottom:12 }}>
            <option value="">— Select Opponent —</option>
            {teams.map(t => {
              const alreadyPlayed = Object.values(rounds).some(r => r?.opponentId === t.id);
              return <option key={t.id} value={t.id}>{t.name}{alreadyPlayed ? ' ✓ (played)' : ''}</option>;
            })}
          </select>
          <Btn gold full disabled={!opponentId} onClick={assignOpponent}>Assign Opponent</Btn>
        </div>
      )}

      {(round.opponentId || opponentId) && opponent && (
        <>
          {/* Read-only summary for completed rounds */}
          {round.complete && !editing && (
            <>
              <Tag block mb={12} color={C.green}>Round Complete</Tag>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                {(round.scores ?? []).map((sc, idx) => {
                  const pairing = pairings[idx];
                  const usPlayer = pairing ? RAGNAROK.find(r => r.id === pairing.usIdx) : null;
                  const themFaction = pairing && opponent ? opponent.players[pairing.themIdx]?.faction : null;
                  return (
                    <div key={idx} style={{ display:'flex', alignItems:'center', padding:'10px 14px', border:`1px solid ${C.bord}`, gap:10 }}>
                      <Tag color={C.dim}>T{idx + 1}</Tag>
                      {usPlayer && <span style={{ fontSize:12, color:C.blue, flex:1 }}>{usPlayer.name} <span style={{ color:C.dim }}>vs</span> <span style={{ color:C.red }}>{themFaction}</span></span>}
                      {!usPlayer && <span style={{ fontSize:12, color:C.dim, flex:1 }}>Table {idx + 1}</span>}
                      {sc.ourVP !== '' && sc.ourVP !== undefined && <span style={{ fontSize:12, color:C.dim }}>VP: {sc.ourVP}-{sc.theirVP}</span>}
                      <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:14, fontWeight:700, color:parseInt(sc.ourGP) > parseInt(sc.theirGP) ? C.green : parseInt(sc.ourGP) < parseInt(sc.theirGP) ? C.red : C.gold }}>
                        {sc.ourGP}-{sc.theirGP}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderLeft:`3px solid ${C.gold}`, background:C.surf, marginBottom:16 }}>
                <Tag color={C.gold}>Round Total</Tag>
                <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:18, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
                  {ourTotal} - {theirTotal}
                </span>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
                  {ourTotal >= 55 ? 'WIN' : ourTotal <= 45 ? 'LOSS' : 'TIE'}
                </span>
              </div>
              <Btn ghost full onClick={() => setEditing(true)}>Edit Scores</Btn>
            </>
          )}

          {/* Editable score entry */}
          {editing && (
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
                    <div key={idx} style={{ borderLeft:`3px solid ${C.bord}`, background:C.surf, padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:4 }}>
                        <Tag color={C.dim}>Table {idx + 1}</Tag>
                        {usPlayer ? (
                          <span style={{ fontSize:13, fontFamily:'Chakra Petch, sans-serif' }}>
                            <span style={{ color:C.gold, fontWeight:600 }}>{usPlayer.name}</span>
                            <span style={{ color:C.dim }}> ({usPlayer.faction})</span>
                            <span style={{ color:C.dim }}> vs </span>
                            <span style={{ color:C.slate, fontWeight:600 }}>{themFaction}</span>
                          </span>
                        ) : (
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:1 }}>
                            <select value={manualPairings?.[idx]?.usIdx ?? ''} onChange={e => {
                              const mp = [...(manualPairings ?? Array.from({ length:5 }, () => ({ usIdx:'', themIdx:'' })))];
                              mp[idx] = { ...mp[idx], usIdx: parseInt(e.target.value) };
                              setManualPairings(mp);
                            }} style={{ flex:1, background:C.input, border:`1px solid ${C.bord}`, color:C.text, padding:'8px', fontSize:12, outline:'none', minWidth:80 }}>
                              <option value="">Our player</option>
                              {RAGNAROK.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <span style={{ color:C.dim, fontSize:12, alignSelf:'center' }}>vs</span>
                            <select value={manualPairings?.[idx]?.themIdx ?? ''} onChange={e => {
                              const mp = [...(manualPairings ?? Array.from({ length:5 }, () => ({ usIdx:'', themIdx:'' })))];
                              mp[idx] = { ...mp[idx], themIdx: parseInt(e.target.value) };
                              setManualPairings(mp);
                            }} style={{ flex:1, background:C.input, border:`1px solid ${C.bord}`, color:C.text, padding:'8px', fontSize:12, outline:'none', minWidth:80 }}>
                              <option value="">Their faction</option>
                              {(opponent?.players ?? []).map((p, pi) => <option key={pi} value={pi}>{p?.faction}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                      {inputMode === 'vp' ? (
                        <div className="score-inputs" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                          <div style={{ flex:1, minWidth:100 }}>
                            <Tag block mb={4} color={C.dim}>Our VP</Tag>
                            <input aria-label={`Table ${idx+1} our VP`} type="number" min="0" max="100" value={sc.ourVP} onChange={e => updateScore(idx, 'ourVP', e.target.value)}
                              style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 10px', fontSize:16, fontFamily:'Source Code Pro, monospace', outline:'none' }} />
                          </div>
                          <div style={{ flex:1, minWidth:100 }}>
                            <Tag block mb={4} color={C.dim}>Their VP</Tag>
                            <input aria-label={`Table ${idx+1} their VP`} type="number" min="0" max="100" value={sc.theirVP} onChange={e => updateScore(idx, 'theirVP', e.target.value)}
                              style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 10px', fontSize:16, fontFamily:'Source Code Pro, monospace', outline:'none' }} />
                          </div>
                          {sc.ourGP !== '' && sc.ourGP !== undefined && (
                            <span className="score-result" style={{ fontFamily:'Source Code Pro, monospace', fontSize:14, fontWeight:700, color:sc.ourGP > sc.theirGP ? C.green : sc.ourGP < sc.theirGP ? C.red : C.gold, whiteSpace:'nowrap' }}>
                              {sc.ourGP}-{sc.theirGP}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="score-inputs" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                          <div style={{ flex:1, minWidth:100 }}>
                            <Tag block mb={4} color={C.dim}>Our GP</Tag>
                            <input aria-label={`Table ${idx+1} our game points`} type="number" min="0" max="20" value={sc.ourGP} onChange={e => updateScore(idx, 'ourGP', e.target.value)}
                              style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 10px', fontSize:16, fontFamily:'Source Code Pro, monospace', outline:'none' }} />
                          </div>
                          <div style={{ flex:1, minWidth:100 }}>
                            <Tag block mb={4} color={C.dim}>Their GP</Tag>
                            <input aria-label={`Table ${idx+1} their game points`} type="number" min="0" max="20" value={sc.theirGP} onChange={e => updateScore(idx, 'theirGP', e.target.value)}
                              style={{ width:'100%', background:C.input, border:`1px solid ${C.bord}`, color:C.white, padding:'12px 10px', fontSize:16, fontFamily:'Source Code Pro, monospace', outline:'none' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderLeft:`3px solid ${C.gold}`, background:C.surf, marginBottom:16 }}>
                <Tag color={C.gold}>Round Total</Tag>
                <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:18, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
                  {ourTotal} - {theirTotal}
                </span>
                <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:13, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
                  {ourTotal >= 55 ? 'WIN' : ourTotal <= 45 ? 'LOSS' : 'TIE'}
                </span>
              </div>

              {!confirmSave ? (
                <Btn gold full onClick={() => setConfirmSave(true)}>Save Scores</Btn>
              ) : (
                <div style={{ border:`1px solid ${C.gold}`, padding:'16px', marginBottom:8 }}>
                  <Cine size={14} weight={700} mb={12}>Confirm Scores</Cine>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:14 }}>
                    {scores.map((sc, idx) => (
                      <div key={idx} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:C.text }}>
                        <span>Table {idx + 1}</span>
                        {inputMode === 'vp' && sc.ourVP !== '' && <span style={{ color:C.dim }}>VP: {sc.ourVP} - {sc.theirVP}</span>}
                        <span style={{ fontFamily:'Source Code Pro, monospace', fontWeight:700, color:parseInt(sc.ourGP) > parseInt(sc.theirGP) ? C.green : parseInt(sc.ourGP) < parseInt(sc.theirGP) ? C.red : C.gold }}>
                          {sc.ourGP} - {sc.theirGP}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign:'center', marginBottom:14 }}>
                    <span style={{ fontFamily:'Source Code Pro, monospace', fontSize:16, fontWeight:700, color:ourTotal >= 55 ? C.green : ourTotal <= 45 ? C.red : C.gold }}>
                      Total: {ourTotal} - {theirTotal} ({ourTotal >= 55 ? 'WIN' : ourTotal <= 45 ? 'LOSS' : 'TIE'})
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <Btn gold full onClick={() => { saveScores(); setConfirmSave(false); setEditing(false); }}>Confirm</Btn>
                    <Btn ghost full onClick={() => setConfirmSave(false)}>Go Back</Btn>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Undo toast */}
          {undoData && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px',
              borderLeft:`3px solid ${C.gold}`, background:C.surf, marginTop:12, marginBottom:12 }}>
              <span style={{ fontSize:13, color:C.text }}>Scores saved</span>
              <button onClick={handleUndo} style={{
                background:'transparent', border:`1px solid ${C.gold}`, color:C.gold, padding:'8px 16px',
                fontSize:12, fontFamily:'Chakra Petch, sans-serif', cursor:'pointer', letterSpacing:1, fontWeight:600
              }}>Undo</button>
            </div>
          )}

          {/* Rating suggestions after round is complete */}
          {round.complete && !editing && pairings.length > 0 && opponent && (() => {
            const suggestions = [];
            (round.scores ?? []).forEach((sc, idx) => {
              const pairing = pairings[idx];
              if (!pairing) return;
              const player = RAGNAROK.find(r => r.id === pairing.usIdx);
              const faction = opponent.players[pairing.themIdx]?.faction;
              if (!player || !faction) return;
              const ourGP = parseInt(sc.ourGP);
              if (isNaN(ourGP)) return;
              const currentRating = matrixData[player.name]?.[faction] ?? 'D';
              const suggested = gpToSuggestedRating(ourGP);
              if (suggested !== currentRating) {
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
                      <div key={s.key} {...clickable(() => toggleSuggestion(s.key))} style={{
                        display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer',
                        borderLeft:`3px solid ${checked ? C.gold : C.bord}`, background:checked ? C.surf : 'transparent'
                      }}>
                        <span style={{ fontSize:16, color:checked ? C.gold : C.dim }}>{checked ? '☑' : '☐'}</span>
                        <span style={{ fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.white, minWidth:60 }}>{s.player}</span>
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

// ─── IMPORT OPPONENTS ─────────────────────────────────────────────────────────

const FACTION_ALIASES = {
  'T\'au Empire':'Tau','Tau Empire':'Tau',
  'Adeptus Custodes':'Custodes',
  'Aeldari':'Eldar',
  'Adepta Sororitas':'Sisters of Battle',
  'Astra Militarum':'Imperial Guard',
  'Chaos Daemons':'Daemons',
  'Chaos Space Marines':'CSM',
  'Leagues of Votann':'Votan',
  'Adeptus Mechanicus':'Ad Mech',
  'Space Marines (Astartes)':'_MARINE_',
  'Drukhari':'Drukhari',
  'Grey Knights':'Grey Knights',
  'Death Guard':'Death Guard',
  'World Eaters':'World Eaters',
  'Thousand Sons':'Thousand Sons',
  'Necrons':'Necrons',
  'Orks':'Orks',
  'Tyranids':'Tyranids',
  'Imperial Knights':'Imperial Knights',
  'Chaos Knights':'Chaos Knights',
  'Dark Angels':'Dark Angels',
  'Blood Angels':'Blood Angels',
  'Space Wolves':'Space Wolves',
  'Black Templars':'Black Templars',
  'Deathwatch':'Deathwatch',
  "Emperor's Children":"Emperor's Children",
};

function mapFaction(raw) {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { mapped: '', status: 'missing' };
  // Exact match to our factions
  if (FACTIONS.includes(trimmed)) return { mapped: trimmed, status: 'exact' };
  // Known alias
  const alias = FACTION_ALIASES[trimmed];
  if (alias === '_MARINE_') return { mapped: '', status: 'marine', original: trimmed };
  if (alias && FACTIONS.includes(alias)) return { mapped: alias, status: 'alias', original: trimmed };
  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  const ci = FACTIONS.find(f => f.toLowerCase() === lower);
  if (ci) return { mapped: ci, status: 'exact' };
  // Fuzzy — check if any faction contains or is contained by the input
  const partial = FACTIONS.find(f => f.toLowerCase().includes(lower) || lower.includes(f.toLowerCase()));
  if (partial) return { mapped: partial, status: 'alias', original: trimmed };
  return { mapped: '', status: 'unknown', original: trimmed };
}

function parseBCPText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const teams = [];
  let current = null;
  let expectFaction = false;

  for (const line of lines) {
    if (line === 'CHECKED IN' || line === 'NOT CHECKED IN') { expectFaction = false; continue; }
    if (line.startsWith('Team Captain:')) continue;

    if (!current) {
      // First unrecognised line is a team name
      current = { name: line, factions: [] };
      teams.push(current);
      expectFaction = false;
      continue;
    }

    if (expectFaction) {
      // This line is a faction
      current.factions.push(line);
      expectFaction = false;
      if (current.factions.length >= 5) { current = null; }
      continue;
    }

    // Could be a player name (next line is faction) or a new team name
    // If current team already has 5 factions, this is a new team
    if (current.factions.length >= 5) {
      current = { name: line, factions: [] };
      teams.push(current);
      expectFaction = false;
      continue;
    }

    // Player name line — next line should be faction
    expectFaction = true;
  }

  return teams;
}

function parseCSVText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const teams = [];
  for (const line of lines) {
    const parts = line.split(',').map(s => s.trim());
    if (parts.length < 2) continue;
    // Skip header row
    if (parts[0].toLowerCase() === 'team name') continue;
    teams.push({ name: parts[0], factions: parts.slice(1, 6) });
  }
  return teams;
}

const MARINE_OPTIONS = ['Ultramarines','Gladius','Blood Angels','Dark Angels','Space Wolves','Black Templars','Deathwatch','Other Marines'];

function ImportOpponents({ existingTeams, onImport, onBack }) {
  const [mode, setMode] = useState('paste');
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [mappings, setMappings] = useState({});
  const [excluded, setExcluded] = useState({});

  const handleParse = () => {
    const raw = mode === 'paste' ? parseBCPText(inputText) : parseCSVText(inputText);
    const mapped = raw.map((t, ti) => ({
      ...t,
      id: `imp-${ti}`,
      factionMaps: t.factions.map(f => mapFaction(f)),
    }));
    setParsed(mapped);
    // Init mappings for flagged factions
    const m = {};
    mapped.forEach((t, ti) => {
      t.factionMaps.forEach((fm, fi) => {
        if (fm.status === 'marine' || fm.status === 'unknown' || fm.status === 'missing') {
          m[`${ti}-${fi}`] = fm.mapped;
        }
      });
    });
    setMappings(m);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setInputText(ev.target.result); setMode('csv'); };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const header = 'Team Name,Player 1 Faction,Player 2 Faction,Player 3 Faction,Player 4 Faction,Player 5 Faction';
    const example = 'Example Team,Custodes,Necrons,Eldar,Tau,Space Wolves';
    const factionList = '# Valid factions: ' + [...FACTIONS].sort().join(', ');
    const csv = [header, example, '', factionList].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'opponent_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const getFinalFaction = (ti, fi) => {
    const key = `${ti}-${fi}`;
    if (mappings[key] !== undefined) return mappings[key];
    return parsed[ti].factionMaps[fi].mapped;
  };

  const allResolved = parsed && parsed.every((t, ti) =>
    excluded[ti] || t.factionMaps.every((fm, fi) => {
      const final = getFinalFaction(ti, fi);
      return final && FACTIONS.includes(final);
    })
  );

  const handleImport = () => {
    const teams = parsed.filter((_, ti) => !excluded[ti]).map((t, ti) => ({
      id: `imp-${Date.now()}-${ti}`,
      name: t.name,
      players: t.factionMaps.map((_, fi) => ({ faction: getFinalFaction(ti, fi) })),
    }));
    onImport(teams);
  };

  const existingNames = new Set((existingTeams ?? []).map(t => (t.name ?? '').toLowerCase()));

  // Step 1: Input
  if (!parsed) {
    return (
      <div className="page-enter" style={{ maxWidth:600, margin:'0 auto', padding:'36px 20px' }}>
        <Back onClick={onBack} />
        <Cine as="h1" size={24} weight={900} mb={24}>Import Opponents</Cine>

        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <Btn sm gold={mode === 'paste'} ghost={mode !== 'paste'} onClick={() => setMode('paste')}>Paste from BCP</Btn>
          <Btn sm gold={mode === 'csv'} ghost={mode !== 'csv'} onClick={() => setMode('csv')}>CSV File</Btn>
        </div>

        {mode === 'paste' && (
          <>
            <p style={{ color:C.dim, fontSize:13, marginBottom:12 }}>
              Copy the full roster from Best Coast Pairings and paste it below. The parser will extract team names and factions automatically.
            </p>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder="Paste BCP roster text here..."
              style={{ width:'100%', minHeight:200, background:C.input, border:`1px solid ${C.bord}`, color:C.text,
                padding:'12px', fontSize:14, fontFamily:'Source Code Pro, monospace', outline:'none', resize:'vertical' }} />
          </>
        )}

        {mode === 'csv' && (
          <>
            <p style={{ color:C.dim, fontSize:13, marginBottom:12 }}>
              Upload a CSV file or paste CSV text below. One team per row: team name followed by 5 factions.
            </p>
            <div style={{ display:'flex', gap:10, marginBottom:12 }}>
              <label style={{
                borderLeft:`3px solid ${C.gold}`, background:C.surf, padding:'12px 16px', cursor:'pointer',
                fontFamily:'Chakra Petch, sans-serif', fontSize:12, color:C.gold, letterSpacing:1, flex:1, textAlign:'center'
              }}>
                Choose CSV File
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display:'none' }} />
              </label>
              <Btn ghost sm onClick={downloadTemplate}>Download Template</Btn>
            </div>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder="Or paste CSV text here..."
              style={{ width:'100%', minHeight:150, background:C.input, border:`1px solid ${C.bord}`, color:C.text,
                padding:'12px', fontSize:14, fontFamily:'Source Code Pro, monospace', outline:'none', resize:'vertical' }} />
          </>
        )}

        <Btn gold full disabled={!inputText.trim()} onClick={handleParse} style={{ marginTop:16 }}>
          Parse Roster →
        </Btn>
      </div>
    );
  }

  // Step 2: Review
  return (
    <div className="page-enter" style={{ maxWidth:600, margin:'0 auto', padding:'36px 20px' }}>
      <Back onClick={() => setParsed(null)} />
      <Cine as="h1" size={24} weight={900} mb={8}>Review Import</Cine>
      <p style={{ color:C.dim, fontSize:13, marginBottom:20 }}>
        {parsed.length} team{parsed.length !== 1 ? 's' : ''} found. Resolve any flagged factions before importing.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {parsed.map((t, ti) => {
          const isDupe = existingNames.has(t.name.toLowerCase());
          const isExcluded = excluded[ti];
          return (
            <div key={ti} style={{ borderLeft:`3px solid ${isExcluded ? C.bord : isDupe ? C.gold : C.greenBord}`, background:C.surf,
              padding:'14px 16px', opacity:isExcluded ? 0.4 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <Cine size={14} weight={700}>{t.name}</Cine>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  {isDupe && <span style={{ fontSize:12, color:C.gold }}>Exists</span>}
                  <button onClick={() => setExcluded(prev => ({ ...prev, [ti]: !prev[ti] }))} style={{
                    background:'transparent', border:`1px solid ${C.bord}`, color:isExcluded ? C.green : C.dim,
                    padding:'6px 12px', fontSize:12, fontFamily:'Chakra Petch, sans-serif', cursor:'pointer'
                  }}>{isExcluded ? 'Include' : 'Skip'}</button>
                </div>
              </div>
              {!isExcluded && (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {t.factionMaps.map((fm, fi) => {
                    const key = `${ti}-${fi}`;
                    const needsInput = fm.status === 'marine' || fm.status === 'unknown' || fm.status === 'missing';
                    const final = getFinalFaction(ti, fi);
                    const isValid = final && FACTIONS.includes(final);
                    return (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, color:C.dim, minWidth:14 }}>{fi + 1}</span>
                        {needsInput ? (
                          <div style={{ flex:1 }}>
                            {fm.original && <span style={{ fontSize:12, color:C.red, display:'block', marginBottom:4 }}>
                              {fm.status === 'marine' ? 'Space Marine — select chapter:' : `"${fm.original}" — select:`}
                            </span>}
                            {fm.status === 'missing' && <span style={{ fontSize:12, color:C.red, display:'block', marginBottom:4 }}>No faction — select:</span>}
                            <select value={mappings[key] ?? ''} onChange={e => setMappings(prev => ({ ...prev, [key]: e.target.value }))}
                              style={{ width:'100%', background:C.input, border:`1px solid ${isValid ? C.greenBord : C.redBord}`,
                                color:isValid ? C.text : C.dim, padding:'10px 12px', fontSize:13, outline:'none' }}>
                              <option value="">— Select —</option>
                              {(fm.status === 'marine' ? MARINE_OPTIONS : [...FACTIONS].sort((a,b) => a.localeCompare(b))).map(f =>
                                <option key={f} value={f}>{f}</option>
                              )}
                            </select>
                          </div>
                        ) : (
                          <div style={{ flex:1, display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:13, color:C.text }}>{fm.mapped}</span>
                            {fm.status === 'alias' && <span style={{ fontSize:12, color:C.dim }}>← {fm.original}</span>}
                            <span style={{ color:C.green, fontSize:14, marginLeft:'auto' }}>✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Btn gold full disabled={!allResolved} onClick={handleImport}>
        Import {parsed.filter((_, ti) => !excluded[ti]).length} Teams
      </Btn>
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
  { id:'kt-06', name:'Kent Knight - Business',      players: mkp(['Deathwatch','Thousand Sons','Sisters of Battle','CSM','Necrons']) },
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
  scoringTable: JSON.parse(JSON.stringify(DEFAULT_SCORING_TABLE)),
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  // Hash routing helpers
  const parseHash = () => {
    const h = window.location.hash.slice(1);
    if (!h) return { eventId: null, screen: 'events' };
    const parts = h.split('/');
    if (parts[0] === 'events') return { eventId: null, screen: 'events' };
    // e.g. #evt-kent-2026 or #evt-kent-2026/ratings
    return { eventId: parts[0], screen: parts[1] || 'home' };
  };

  const setHash = (eventId, scr) => {
    const h = eventId ? (scr === 'home' ? eventId : `${eventId}/${scr}`) : 'events';
    if (window.location.hash !== '#' + h) window.location.hash = h;
  };

  const initial = parseHash();
  const [screen, setScreenRaw] = useState(initial.screen);
  const [pendingEventId, setPendingEventId] = useState(initial.eventId);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [editEventData, setEditEventData] = useState(null);

  const setScreen = (scr) => {
    setScreenRaw(scr);
    setHash(activeEvent?.id ?? null, scr);
  };

  // Listen for back/forward browser navigation
  useEffect(() => {
    const onHashChange = () => {
      const { eventId, screen: scr } = parseHash();
      if (!eventId) {
        setActiveEvent(null);
        setScreenRaw('events');
      } else if (activeEvent && activeEvent.id === eventId) {
        setScreenRaw(scr);
      } else {
        // Try to load from already-fetched events
        const evt = events.find(e => e.id === eventId);
        if (evt) { loadEvent(evt, scr); }
        else { setPendingEventId(eventId); setScreenRaw(scr); }
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeEvent]);

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
          const list = Object.values(data).filter(Boolean).map(e => ({ ...e, rounds: normalizeRounds(e.rounds) }));
          setEvents(list);
          // Restore active event from URL hash
          if (pendingEventId) {
            const evt = list.find(e => e.id === pendingEventId);
            if (evt) { loadEvent(evt, screen); setPendingEventId(null); }
          }
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

  // Migrate old rating codes and faction names
  const RATING_MIGRATION = { 'PS':'D', '?':'D', 'N':'D', 'R':'L', 'G':'W++', 'A+':'W+', 'A':'W', 'A-':'W-', 'A++':'W++' };
  const FACTION_MIGRATION = { 'Sisters':'Sisters of Battle', 'Guard':'Imperial Guard', 'Nids':'Tyranids',
    'EC':"Emperor's Children", 'CK':'Chaos Knights', 'IK':'Imperial Knights', 'WE':'World Eaters',
    'DG':'Death Guard', 'TS':'Thousand Sons', 'BA':'Blood Angels', 'DA':'Dark Angels',
    'Wolves':'Space Wolves', 'Black Temp':'Black Templars', 'Victrix spam':'Ultramarines' };

  const migrateMatrix = (m) => {
    if (!m) return m;
    const migrated = {};
    let changed = false;
    for (const player of Object.keys(m)) {
      migrated[player] = {};
      for (const [faction, rating] of Object.entries(m[player] ?? {})) {
        const newFaction = FACTION_MIGRATION[faction] ?? faction;
        const newRating = RATING_MIGRATION[rating] ?? rating;
        if (newFaction !== faction || newRating !== rating) changed = true;
        migrated[player][newFaction] = newRating;
      }
    }
    return changed ? migrated : m;
  };

  const migrateOpponents = (opps) => {
    if (!opps) return opps;
    let changed = false;
    const migrated = opps.map(t => {
      if (!t?.players) return t;
      const newPlayers = t.players.map(p => {
        const newFaction = FACTION_MIGRATION[p?.faction] ?? p?.faction;
        if (newFaction !== p?.faction) { changed = true; return { ...p, faction: newFaction }; }
        return p;
      });
      return { ...t, players: newPlayers };
    });
    return changed ? migrated : opps;
  };

  const migrateRoster = (r) => {
    if (!r) return r;
    let changed = false;
    const migrated = r.map(p => {
      const newFaction = FACTION_MIGRATION[p?.faction] ?? p?.faction;
      if (newFaction !== p?.faction) { changed = true; return { ...p, faction: newFaction }; }
      return p;
    });
    return changed ? migrated : r;
  };

  const loadEvent = (evt, targetScreen) => {
    // Run migrations
    const mMatrix = migrateMatrix(evt.matrix);
    const mOpponents = migrateOpponents(evt.opponents);
    const mRoster = migrateRoster(evt.roster);
    const needsSave = mMatrix !== evt.matrix || mOpponents !== evt.opponents || mRoster !== evt.roster;
    const migrated = needsSave ? { ...evt, matrix: mMatrix ?? evt.matrix, opponents: mOpponents ?? evt.opponents, roster: mRoster ?? evt.roster } : evt;

    setActiveEvent(migrated);
    setMatrixData(migrated.matrix ?? DEFAULT_MATRIX); matrix = migrated.matrix ?? DEFAULT_MATRIX;
    setRoster(migrated.roster ?? DEFAULT_RAGNAROK); RAGNAROK = migrated.roster ?? DEFAULT_RAGNAROK;
    setOurTeamName(migrated.teamName ?? DEFAULT_TEAM_NAME); teamName = migrated.teamName ?? DEFAULT_TEAM_NAME;
    setTeams(migrated.opponents ?? []);
    setRoundsData(normalizeRounds(migrated.rounds));
    scoringTable = migrated.scoringTable ?? DEFAULT_SCORING_TABLE;
    const scr = targetScreen || 'home';
    setScreenRaw(scr);
    setHash(migrated.id, scr);

    // Save migrated data back to Firebase
    if (needsSave && migrated.id) {
      const base = `${FIREBASE_URL}/events/${migrated.id}`;
      if (mMatrix !== evt.matrix) fetch(`${base}/matrix.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(mMatrix) }).catch(() => {});
      if (mOpponents !== evt.opponents) fetch(`${base}/opponents.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(mOpponents) }).catch(() => {});
      if (mRoster !== evt.roster) fetch(`${base}/roster.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(mRoster) }).catch(() => {});
    }
  };

  const saveEvent = (evt) => {
    const updated = events.find(e => e.id === evt.id) ? events.map(e => e.id === evt.id ? evt : e) : [...events, evt];
    setEvents(updated);
    return fetch(`${FIREBASE_URL}/events/${evt.id}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(evt) }).then(() => {}).catch(() => {});
  };

  const saveEventField = (field, value) => {
    if (!activeEvent) return Promise.resolve();
    const updated = { ...activeEvent, [field]: value };
    setActiveEvent(updated);
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    return fetch(`${FIREBASE_URL}/events/${activeEvent.id}/${field}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(value) }).then(() => {}).catch(() => {});
  };

  const saveMatrix = (m) => { setMatrixData(m); matrix = m; return saveEventField('matrix', m); };
  const saveRoster = (r, n) => { setRoster(r); RAGNAROK = r; setOurTeamName(n); teamName = n; return Promise.all([saveEventField('roster', r), saveEventField('teamName', n)]); };
  const saveOpponents = (t) => { setTeams(t); return saveEventField('opponents', t); };
  const saveScoringTable = (t) => { scoringTable = t; return saveEventField('scoringTable', t); };
  const saveRounds = (r) => { setRoundsData(r); return saveEventField('rounds', r); };
  const saveDefs = (d) => { setDefsData(d); defs = d; return fetch(`${FIREBASE_URL}/defs.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(() => {}).catch(() => {}); };
  const saveFactions = (f) => { setFactionList(f); FACTIONS = f; return fetch(`${FIREBASE_URL}/factions.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(f) }).then(() => {}).catch(() => {}); };

  const handleSaveOpponent = team => {
    const updated = teams.find(t => t.id === team.id) ? teams.map(t => t.id === team.id ? team : t) : [...teams, team];
    saveOpponents(updated); setEditTeam(null); setScreen('home');
  };
  const handleDeleteOpponent = id => { saveOpponents(teams.filter(t => t.id !== id)); setEditTeam(null); setScreen('home'); };

  const handleSaveEvent = (evt) => { saveEvent(evt).then(() => { if (!activeEvent || activeEvent.id === evt.id) loadEvent(evt); else setScreen('events'); }); };
  const handleDeleteEvent = (id) => { setEvents(prev => prev.filter(e => e.id !== id)); fetch(`${FIREBASE_URL}/events/${id}.json`, { method:'DELETE' }); setActiveEvent(null); setScreenRaw('events'); setHash(null, 'events'); };

  const navProps = activeEvent ? {
    onRatings: () => setScreen('ratings'), onDefs: () => setScreen('defs'),
    onOurTeam: () => setScreen('ourteam'), onFactions: () => setScreen('factions'),
    onEvents: () => { setActiveEvent(null); setScreenRaw('events'); setHash(null, 'events'); },
    onEditEvent: () => { setEditEventData(activeEvent); setScreen('eventEdit'); },
    onEditRounds: () => setScreen('roundPicker'),
    onScoringTable: () => setScreen('scoringTable'),
  } : { onDefs: () => setScreen('defs'), onFactions: () => setScreen('factions') };

  return (
    <>
      <style>{CSS}</style>
      <NavBar {...navProps} activeEvent={activeEvent} />
      <main>

      {screen === 'events' && <EventList events={events} onSelect={loadEvent} onAdd={() => { setEditEventData(null); setScreen('eventSetup'); }} onDelete={handleDeleteEvent} onSettings={evt => { setEditEventData(evt); setScreen('eventEdit'); }} />}
      {screen === 'eventSetup' && <EventSetup events={events} onSave={handleSaveEvent} onBack={() => setScreen('events')} />}
      {screen === 'eventEdit' && <EventSetup event={editEventData} events={events} onSave={handleSaveEvent} onDelete={handleDeleteEvent} onBack={() => setScreen(activeEvent ? 'home' : 'events')} />}

      {activeEvent && screen === 'home' && <Home teams={teams} rounds={roundsData} event={activeEvent} onSelect={t=>{setSelectedTeam(t);setScreen('matchup');}} onAdd={()=>{setEditTeam(null);setScreen('setup');}} onEdit={t=>{setEditTeam(t);setScreen('setup');}} onRound={n=>setScreen('round-'+n)} onBack={()=>{setActiveEvent(null);setScreenRaw('events');setHash(null,'events');}} onImport={()=>setScreen('import')} />}
      {activeEvent && screen === 'setup' && <Setup team={editTeam} onSave={handleSaveOpponent} onDelete={handleDeleteOpponent} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'matchup' && <Matchup team={selectedTeam} onStart={()=>setScreen('pairing')} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'pairing' && <Pairing team={selectedTeam} onBack={()=>setScreen('matchup')} onComplete={(pairings) => {
        const roundNum = Object.keys(roundsData).find(k => roundsData[k]?.opponentId === selectedTeam?.id);
        if (roundNum) {
          const mapped = pairings.map((p, i) => {
            const themIdx = (selectedTeam?.players ?? []).findIndex(pl => pl === p.them || pl?.faction === p.them?.faction);
            return { table: i + 1, usIdx: p.us.id, themIdx: themIdx >= 0 ? themIdx : i };
          });
          saveRounds({ ...roundsData, [roundNum]: { ...roundsData[roundNum], pairings: mapped } });
        }
      }} onScores={() => {
        let roundNum = Object.keys(roundsData).find(k => roundsData[k]?.opponentId === selectedTeam?.id);
        if (!roundNum) {
          // Find first unassigned round and assign this opponent
          const numR = activeEvent?.numRounds ?? 5;
          for (let n = 1; n <= numR; n++) {
            if (!roundsData[n]?.opponentId) {
              roundNum = String(n);
              const updated = { ...roundsData, [n]: { ...roundsData[n], opponentId: selectedTeam.id } };
              saveRounds(updated);
              break;
            }
          }
        }
        if (roundNum) setScreen('round-' + roundNum);
        else setScreen('home');
      }} />}
      {activeEvent && screen === 'ratings' && <Ratings matrixData={matrixData} onSave={saveMatrix} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'defs' && <Definitions defsData={defsData} onSave={saveDefs} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'ourteam' && <EditOurTeam roster={roster} currentTeamName={ourTeamName} onSave={saveRoster} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'factions' && <ManageFactions factionList={factionList} onSave={saveFactions} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'import' && <ImportOpponents existingTeams={teams} onImport={(newTeams) => {
        saveOpponents([...teams, ...newTeams]);
        setScreen('home');
      }} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'roundPicker' && <RoundPicker rounds={roundsData} teams={teams} event={activeEvent} onSelect={n=>setScreen('round-'+n)} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'scoringTable' && <ScoringTableEditor table={activeEvent.scoringTable} onSave={saveScoringTable} onBack={()=>setScreen('home')} />}
      {activeEvent && screen.startsWith('round-') && <RoundView roundNum={parseInt(screen.split('-')[1])} rounds={roundsData} teams={teams} onSave={saveRounds} onBack={()=>setScreen('home')} matrixData={matrixData} onSaveMatrix={saveMatrix} numRounds={activeEvent?.numRounds ?? 5} onRound={n=>setScreen('round-'+n)} />}

      {!activeEvent && (screen === 'defs') && <Definitions defsData={defsData} onSave={saveDefs} onBack={()=>setScreen('events')} />}
      {!activeEvent && (screen === 'factions') && <ManageFactions factionList={factionList} onSave={saveFactions} onBack={()=>setScreen('events')} />}
      </main>
    </>
  );
}
