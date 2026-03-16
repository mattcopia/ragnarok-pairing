# Events System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the app so the home page lists events (tournaments), with each event containing its own roster, rankings, opponents, and round-by-round tracking with score entry and standings.

**Architecture:** The app currently stores all data flat in Firebase (one matrix, one roster, one set of opponents). This restructures everything under `/events/{eventId}/`. The home page becomes an event list. Selecting an event loads its data into the existing module-level variables and shows an event dashboard with opponents, rounds, and standings. Existing screens (pairing, matchup, ratings, etc.) work unchanged but read/write to the active event's Firebase path. Score entry per round supports both VP input (0-100 per player) and game points input (0-20 scale), auto-calculating the other.

**Tech Stack:** React 18, Vite, Firebase Realtime Database (REST API, no SDK), inline styles, single-file architecture (src/App.jsx)

**Note:** This project has no test infrastructure. Steps reference manual verification via `npm run build` and browser testing rather than automated tests.

---

## Firebase Data Model

```
/events/{eventId}/
  name: "Kent Teams March 2026"
  dates: { start: "2026-03-21", end: "2026-03-22" }
  numRounds: 5
  teamName: "Ragnarok"
  roster: [{ name: "Jacob", faction: "Orks (GT)", id: 0 }, ...]
  matrix: { Jacob: { Daemons: "W", ... }, ... }
  defs: { "W++": { label: "Strong Win", score: 4.0, desc: "..." }, ... }
  factions: ["Ad Mech", "Blood Angels", ...]
  opponents: [{ id: "kt-01", name: "Drooling Cretins", players: [{ faction: "Drukhari" }, ...] }, ...]
  rounds: {
    "1": {
      opponentId: "kt-01",
      pairings: [
        { table: 1, usIdx: 0, themIdx: 2 }
      ],
      scores: [
        { table: 1, ourVP: 85, theirVP: 60, ourGP: 15, theirGP: 5 }
      ],
      complete: true
    }
  }
/defs: { ... }  (shared rating definitions, kept global)
/factions: [ ... ]  (shared faction list, kept global)
```

**Key decisions:**
- `defs` and `factions` remain global (shared across events) since rating tiers and faction names are universal
- `matrix`, `roster`, `teamName`, `opponents` move inside each event (they vary per tournament)
- `rounds` stores pairings and scores per round number
- VP-to-GP conversion uses the scoring table from the event rules (5-point bands from 0-5 to >50 VP diff)

## VP ↔ Game Points Conversion

```js
function vpDiffToGP(vpDiff) {
  // vpDiff is absolute difference, always >= 0
  if (vpDiff > 50) return [20, 0];
  const bracket = Math.min(Math.floor(vpDiff / 5), 10);
  return [10 + bracket, 10 - bracket];
}

function vpToGP(ourVP, theirVP) {
  const diff = Math.abs(ourVP - theirVP);
  const [winnerGP, loserGP] = vpDiffToGP(diff);
  return ourVP >= theirVP ? [winnerGP, loserGP] : [loserGP, winnerGP];
}

function gpToApproxVP(ourGP, theirGP) {
  // Reverse: GP difference implies a VP diff band midpoint
  // e.g. 15-5 means bracket 5 → VP diff ~26-30, midpoint 28
  const bracket = Math.abs(ourGP - 10);
  const midVP = bracket * 5 + 2; // midpoint of the band
  return ourGP >= theirGP ? [75 + Math.round(midVP/2), 75 - Math.round(midVP/2)] : [75 - Math.round(midVP/2), 75 + Math.round(midVP/2)];
}
```

---

## Chunk 1: Data Model + Event List + Create/Edit Event

### Task 1: Add VP/GP conversion helpers and event data defaults

**Files:**
- Modify: `src/App.jsx` (top of file, after existing utility functions)

- [ ] **Step 1: Add VP/GP conversion functions after the `winChance` function (~line 98)**

```js
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
```

- [ ] **Step 2: Add default event seed data constant (after KENT_TEAMS)**

Create a `SEED_EVENT` constant that packages the current Kent Teams data into the new event structure:

```js
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: successful build with no errors

---

### Task 2: Add EventList screen (new home page)

**Files:**
- Modify: `src/App.jsx` — add `EventList` component before existing `Home` component

- [ ] **Step 1: Create EventList component**

This is the new top-level home page showing all events as cards. Each card shows event name, dates, number of rounds, and a progress indicator (rounds completed / total).

```jsx
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
```

- [ ] **Step 2: Verify build**

---

### Task 3: Add CreateEvent / EditEvent screen

**Files:**
- Modify: `src/App.jsx` — add `EventSetup` component

- [ ] **Step 1: Create EventSetup component**

Fields: name, start date, end date, number of rounds. Option to copy roster/matrix from an existing event or start fresh with defaults.

```jsx
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
      const src = events.find(e => e.id === copyFrom);
      if (src) {
        base.teamName = src.teamName;
        base.roster = JSON.parse(JSON.stringify(src.roster));
        base.matrix = JSON.parse(JSON.stringify(src.matrix));
        base.opponents = JSON.parse(JSON.stringify(src.opponents ?? []));
      }
    }

    if (event) {
      // Editing — preserve existing nested data
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

      {!event && events.length > 0 && (
        <>
          <Tag block mb={8} color={C.dim}>Copy Roster & Rankings From</Tag>
          <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)}
            style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:copyFrom ? C.text : C.dim, padding:'8px 10px', fontSize:13, outline:'none', marginBottom:20 }}>
            <option value="">— Start Fresh —</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </>
      )}

      <Btn gold full disabled={!ok} onClick={handleSave}>
        {event ? 'Save Changes' : 'Create Event'}
      </Btn>

      {event && (
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
```

- [ ] **Step 2: Verify build**

---

### Task 4: Restructure App root to support events

**Files:**
- Modify: `src/App.jsx` — rewrite the `App` component

- [ ] **Step 1: Rewrite App component state and routing**

The App component now manages two levels:
1. **Events level**: list of events, create/edit events
2. **Active event level**: all existing screens (home/opponents, matchup, pairing, ratings, etc.)

When an event is selected, its data is loaded into the module-level variables (matrix, RAGNAROK, teamName, defs, FACTIONS) and all existing components work as before.

Key state changes:
- Add: `events` (array), `activeEvent` (the selected event object), `activeEventId`
- Remove: individual `matrixData`, `roster`, `ourTeamName` state (these come from `activeEvent`)
- Keep: `defsData`, `factionList` as global (shared across events)
- Screen routing adds: `'events'` (home), `'eventSetup'`, `'eventEdit'`

Firebase reads/writes for event-specific data now use `/events/{eventId}/` paths.

The existing `Home` component (opponent list) becomes the event dashboard, shown when an event is active and `screen === 'home'`.

```jsx
export default function App() {
  const [screen, setScreen] = useState('events');
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [editEventData, setEditEventData] = useState(null);

  // Within-event state (same as before)
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [matrixData, setMatrixData] = useState(DEFAULT_MATRIX);
  const [defsData, setDefsData] = useState(DEFAULT_DEFS);
  const [roster, setRoster] = useState(DEFAULT_RAGNAROK);
  const [ourTeamName, setOurTeamName] = useState(DEFAULT_TEAM_NAME);
  const [factionList, setFactionList] = useState(DEFAULT_FACTIONS);
  const [roundsData, setRoundsData] = useState({});

  // Sync module-level refs
  useEffect(() => { matrix = matrixData; }, [matrixData]);
  useEffect(() => { defs = defsData; }, [defsData]);
  useEffect(() => { RAGNAROK = roster; }, [roster]);
  useEffect(() => { teamName = ourTeamName; }, [ourTeamName]);
  useEffect(() => { FACTIONS = factionList; }, [factionList]);

  // Load global data (defs, factions) + event list
  useEffect(() => {
    fetch(`${FIREBASE_URL}/defs.json`).then(r => r.json())
      .then(data => { if (data) { setDefsData(data); defs = data; } }).catch(() => {});
    fetch(`${FIREBASE_URL}/factions.json`).then(r => r.json())
      .then(data => { if (data) { setFactionList(data); FACTIONS = data; } }).catch(() => {});
    fetch(`${FIREBASE_URL}/events.json`).then(r => r.json())
      .then(data => {
        if (data) {
          const list = Object.values(data);
          setEvents(list);
        }
      }).catch(() => {});
  }, []);

  // Load event-specific data when activeEvent changes
  const loadEvent = (evt) => {
    setActiveEvent(evt);
    setMatrixData(evt.matrix ?? DEFAULT_MATRIX);
    matrix = evt.matrix ?? DEFAULT_MATRIX;
    setRoster(evt.roster ?? DEFAULT_RAGNAROK);
    RAGNAROK = evt.roster ?? DEFAULT_RAGNAROK;
    setOurTeamName(evt.teamName ?? DEFAULT_TEAM_NAME);
    teamName = evt.teamName ?? DEFAULT_TEAM_NAME;
    setTeams(evt.opponents ?? []);
    setRoundsData(evt.rounds ?? {});
    setScreen('home');
  };

  // Save event to Firebase
  const saveEvent = (evt) => {
    const updated = events.find(e => e.id === evt.id)
      ? events.map(e => e.id === evt.id ? evt : e)
      : [...events, evt];
    setEvents(updated);
    return fetch(`${FIREBASE_URL}/events/${evt.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evt),
    }).then(() => {});
  };

  // Save a field within the active event
  const saveEventField = (field, value) => {
    if (!activeEvent) return Promise.resolve();
    const updated = { ...activeEvent, [field]: value };
    setActiveEvent(updated);
    setEvents(events.map(e => e.id === updated.id ? updated : e));
    return fetch(`${FIREBASE_URL}/events/${activeEvent.id}/${field}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    }).then(() => {});
  };

  // Wrappers that save to active event
  const saveMatrix = (m) => { setMatrixData(m); matrix = m; return saveEventField('matrix', m); };
  const saveRoster = (r, n) => {
    setRoster(r); RAGNAROK = r; setOurTeamName(n); teamName = n;
    return Promise.all([saveEventField('roster', r), saveEventField('teamName', n)]);
  };
  const saveOpponents = (t) => { setTeams(t); return saveEventField('opponents', t); };
  const saveRounds = (r) => { setRoundsData(r); return saveEventField('rounds', r); };

  // Global saves (shared across events)
  const saveDefs = (d) => { setDefsData(d); defs = d; return fetch(`${FIREBASE_URL}/defs.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(()=>{}); };
  const saveFactions = (f) => { setFactionList(f); FACTIONS = f; return fetch(`${FIREBASE_URL}/factions.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(f) }).then(()=>{}); };

  // Opponent handlers
  const handleSaveOpponent = team => {
    const updated = teams.find(t => t.id === team.id) ? teams.map(t => t.id === team.id ? team : t) : [...teams, team];
    saveOpponents(updated);
    setEditTeam(null);
    setScreen('home');
  };
  const handleDeleteOpponent = id => {
    saveOpponents(teams.filter(t => t.id !== id));
    setEditTeam(null);
    setScreen('home');
  };

  // Event handlers
  const handleSaveEvent = (evt) => {
    saveEvent(evt).then(() => {
      if (!activeEvent || activeEvent.id === evt.id) loadEvent(evt);
      else setScreen('events');
    });
  };
  const handleDeleteEvent = (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    fetch(`${FIREBASE_URL}/events/${id}.json`, { method:'DELETE' });
    setActiveEvent(null);
    setScreen('events');
  };

  // NavBar context changes depending on whether we're in an event
  const navProps = activeEvent ? {
    onRatings: () => setScreen('ratings'),
    onDefs: () => setScreen('defs'),
    onOurTeam: () => setScreen('ourteam'),
    onFactions: () => setScreen('factions'),
    onEvents: () => { setActiveEvent(null); setScreen('events'); },
    onEditEvent: () => { setEditEventData(activeEvent); setScreen('eventEdit'); },
  } : {
    onDefs: () => setScreen('defs'),
    onFactions: () => setScreen('factions'),
  };

  return (
    <>
      <style>{CSS}</style>
      <NavBar {...navProps} activeEvent={activeEvent} />

      {/* Event-level screens */}
      {screen === 'events' && <EventList events={events} onSelect={loadEvent} onAdd={() => { setEditEventData(null); setScreen('eventSetup'); }} />}
      {screen === 'eventSetup' && <EventSetup events={events} onSave={handleSaveEvent} onBack={() => setScreen('events')} />}
      {screen === 'eventEdit' && <EventSetup event={editEventData} events={events} onSave={handleSaveEvent} onDelete={handleDeleteEvent} onBack={() => setScreen('home')} />}

      {/* Within-event screens (only when activeEvent is set) */}
      {activeEvent && screen === 'home' && <Home teams={teams} rounds={roundsData} event={activeEvent} onSelect={t=>{setSelectedTeam(t);setScreen('matchup');}} onAdd={()=>{setEditTeam(null);setScreen('setup');}} onEdit={t=>{setEditTeam(t);setScreen('setup');}} onRound={(n)=>{setScreen('round-'+n);}} />}
      {activeEvent && screen === 'setup' && <Setup team={editTeam} onSave={handleSaveOpponent} onDelete={handleDeleteOpponent} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'matchup' && <Matchup team={selectedTeam} onStart={()=>setScreen('pairing')} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'pairing' && <Pairing team={selectedTeam} onBack={()=>setScreen('matchup')} />}
      {activeEvent && screen === 'ratings' && <Ratings matrixData={matrixData} onSave={saveMatrix} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'defs' && <Definitions defsData={defsData} onSave={saveDefs} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'ourteam' && <EditOurTeam roster={roster} currentTeamName={ourTeamName} onSave={saveRoster} onBack={()=>setScreen('home')} />}
      {activeEvent && screen === 'factions' && <ManageFactions factionList={factionList} onSave={saveFactions} onBack={()=>setScreen('home')} />}
      {activeEvent && screen.startsWith('round-') && <RoundView roundNum={parseInt(screen.split('-')[1])} rounds={roundsData} teams={teams} event={activeEvent} onSave={saveRounds} onBack={()=>setScreen('home')} />}
    </>
  );
}
```

- [ ] **Step 2: Update NavBar to support event context**

The NavBar needs to:
- Show event name when inside an event
- Show "Back to Events" option in burger menu when inside an event
- Show "Edit Event" option when inside an event
- Only show "Edit Player Rankings" and "Edit Our Team" when inside an event

- [ ] **Step 3: Verify build**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add events system - event list, create/edit, restructured routing and Firebase paths"
```

---

## Chunk 2: Round Tracking + Score Entry

### Task 5: Update Home (event dashboard) to show rounds

**Files:**
- Modify: `src/App.jsx` — update `Home` component

- [ ] **Step 1: Add rounds section to Home component**

Below the opponents grid, add a "Rounds" section showing each round (1 through numRounds). Each round card shows:
- Round number
- Opponent name (if assigned) or "Not started"
- Score (if complete) with win/tie/loss indicator
- Click to enter/view round details

```jsx
// Inside Home component, after the opponents grid:
<Divider label="Rounds" />
<div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
  {Array.from({ length: event.numRounds ?? 5 }, (_, i) => i + 1).map(n => {
    const round = rounds[n];
    const opp = round?.opponentId ? teams.find(t => t.id === round.opponentId) : null;
    const complete = round?.complete;
    const ourTotal = complete ? (round.scores ?? []).reduce((s, sc) => s + (sc.ourGP ?? 0), 0) : null;
    const theirTotal = complete ? (round.scores ?? []).reduce((s, sc) => s + (sc.theirGP ?? 0), 0) : null;
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
            <span style={{ fontFamily:'Cinzel, serif', fontSize:11, fontWeight:700, color:resultCol }}>{result}</span>
          </div>
        )}
      </div>
    );
  })}
</div>
```

- [ ] **Step 2: Verify build**

---

### Task 6: Create RoundView component

**Files:**
- Modify: `src/App.jsx` — add `RoundView` component

- [ ] **Step 1: Create RoundView component**

This screen handles the full lifecycle of a round:
1. **Select opponent** (if not yet assigned)
2. **Begin pairing** (links to existing Pairing flow)
3. **Enter scores** (after games are played)
4. **View results** (when complete)

The score entry section allows entering either:
- VP scores (0-100 per player per table) — auto-calculates GP
- GP scores (0-20 per table) — auto-calculates approximate VP

```jsx
function RoundView({ roundNum, rounds, teams, event, onSave, onBack }) {
  const round = rounds[roundNum] ?? {};
  const [opponentId, setOpponentId] = useState(round.opponentId ?? '');
  const [scores, setScores] = useState(round.scores ?? []);
  const [inputMode, setInputMode] = useState('vp'); // 'vp' or 'gp'
  const opponent = teams.find(t => t.id === opponentId);
  const pairings = round.pairings ?? [];

  // Initialize score slots from pairings
  useEffect(() => {
    if (pairings.length > 0 && scores.length === 0) {
      setScores(pairings.map((p, i) => ({ table: i + 1, ourVP: '', theirVP: '', ourGP: '', theirGP: '' })));
    }
  }, [pairings.length]);

  const updateScore = (idx, field, value) => {
    const next = [...scores];
    next[idx] = { ...next[idx], [field]: value };

    // Auto-calculate
    if (inputMode === 'vp') {
      const ourVP = parseInt(next[idx].ourVP);
      const theirVP = parseInt(next[idx].theirVP);
      if (!isNaN(ourVP) && !isNaN(theirVP)) {
        const [ourGP, theirGP] = vpToGP(ourVP, theirVP);
        next[idx].ourGP = ourGP;
        next[idx].theirGP = theirGP;
      }
    } else {
      const ourGP = parseInt(next[idx].ourGP);
      const theirGP = parseInt(next[idx].theirGP);
      if (!isNaN(ourGP) && !isNaN(theirGP) && ourGP + theirGP === 20) {
        next[idx].ourVP = '';
        next[idx].theirVP = '';
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
    const updated = { ...rounds, [roundNum]: { ...round, scores, complete } };
    onSave(updated);
  };

  const ourTotal = scores.reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0);
  const theirTotal = scores.reduce((s, sc) => s + (parseInt(sc.theirGP) || 0), 0);

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'28px 20px' }}>
      <Back onClick={onBack} />
      <Tag block mb={8}>Round {roundNum}</Tag>
      <Cine size={22} weight={900} mb={20}>
        {opponent ? `vs ${opponent.name}` : 'Select Opponent'}
      </Cine>

      {/* Step 1: Assign opponent */}
      {!round.opponentId && (
        <div style={{ marginBottom:24 }}>
          <Tag block mb={10}>Choose Opponent for This Round</Tag>
          <select value={opponentId} onChange={e => setOpponentId(e.target.value)}
            style={{ width:'100%', background:'#0c0e14', border:`1px solid ${C.bord}`, color:opponentId ? C.text : C.dim, padding:'8px 10px', fontSize:13, outline:'none', marginBottom:12 }}>
            <option value="">— Select Opponent —</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Btn gold full disabled={!opponentId} onClick={assignOpponent}>Assign Opponent</Btn>
        </div>
      )}

      {/* Step 2: Score entry */}
      {round.opponentId && (
        <>
          {/* Input mode toggle */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <Btn sm ghost={inputMode !== 'vp'} gold={inputMode === 'vp'} onClick={() => setInputMode('vp')}>Enter VP</Btn>
            <Btn sm ghost={inputMode !== 'gp'} gold={inputMode === 'gp'} onClick={() => setInputMode('gp')}>Enter Game Pts</Btn>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {(scores.length > 0 ? scores : Array.from({ length: 5 }, (_, i) => ({ table: i+1, ourVP:'', theirVP:'', ourGP:'', theirGP:'' }))).map((sc, idx) => {
              const pairing = pairings[idx];
              const usPlayer = pairing ? RAGNAROK[pairing.usIdx] : null;
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
                      {sc.ourGP !== '' && (
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

          {/* Totals */}
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
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add round tracking with score entry (VP and GP modes)"
```

---

## Chunk 3: Standings + Migration + Polish

### Task 7: Add standings section to event dashboard

**Files:**
- Modify: `src/App.jsx` — update `Home` component

- [ ] **Step 1: Add event standings summary at the top of Home**

Show overall record (W-D-L), total game points, and per-player performance table.

```jsx
// Add after the team name Tag at the top of Home:
// Event summary stats
const completedRounds = Object.values(rounds).filter(r => r.complete);
const totalOurGP = completedRounds.reduce((s, r) => s + (r.scores ?? []).reduce((s2, sc) => s2 + (parseInt(sc.ourGP) || 0), 0), 0);
const totalTheirGP = completedRounds.reduce((s, r) => s + (r.scores ?? []).reduce((s2, sc) => s2 + (parseInt(sc.theirGP) || 0), 0), 0);
const wins = completedRounds.filter(r => (r.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0) >= 55).length;
const losses = completedRounds.filter(r => (r.scores ?? []).reduce((s, sc) => s + (parseInt(sc.ourGP) || 0), 0) <= 45).length;
const draws = completedRounds.length - wins - losses;

// Player performance: for each of our players, sum their GP across all rounds
const playerStats = RAGNAROK.map(r => {
  let gp = 0, games = 0;
  completedRounds.forEach(round => {
    (round.scores ?? []).forEach((sc, idx) => {
      const pairing = (round.pairings ?? [])[idx];
      if (pairing && pairing.usIdx === r.id) {
        gp += parseInt(sc.ourGP) || 0;
        games++;
      }
    });
  });
  return { ...r, gp, games, avg: games > 0 ? (gp / games).toFixed(1) : '-' };
});
```

Then render a compact stats bar and player leaderboard:

```jsx
{completedRounds.length > 0 && (
  <>
    <div style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:16 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:C.gold }}>{wins}-{draws}-{losses}</div>
        <Tag color={C.dim}>W-D-L</Tag>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:totalOurGP > totalTheirGP ? C.green : C.red }}>{totalOurGP}-{totalTheirGP}</div>
        <Tag color={C.dim}>Game Points</Tag>
      </div>
    </div>

    <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:20 }}>
      {playerStats.sort((a, b) => b.gp - a.gp).map(p => (
        <div key={p.id} style={{ display:'flex', alignItems:'center', padding:'6px 12px', border:`1px solid ${C.bord}`, gap:10 }}>
          <span style={{ fontFamily:'Cinzel, serif', fontSize:12, color:C.white, flex:1 }}>{p.name}</span>
          <span style={{ fontSize:11, color:C.dim, fontStyle:'italic' }}>{p.faction}</span>
          <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:C.gold, minWidth:30, textAlign:'right' }}>{p.gp}</span>
          <span style={{ fontSize:11, color:C.dim }}>({p.games}g, avg {p.avg})</span>
        </div>
      ))}
    </div>
  </>
)}
```

- [ ] **Step 2: Verify build**

---

### Task 8: Migration — seed first event from existing Firebase data

**Files:**
- Modify: `src/App.jsx` — update the initial data load in `App`

- [ ] **Step 1: Add migration logic in the initial useEffect**

On first load, if `/events.json` is empty but old flat data exists (e.g. `/matrix.json`), auto-migrate into a seed event:

```js
// Inside the initial useEffect, after loading events:
// If no events exist, check for legacy flat data and migrate
if (!data) {
  // Try to load legacy data
  Promise.all([
    fetch(`${FIREBASE_URL}/matrix.json`).then(r => r.json()),
    fetch(`${FIREBASE_URL}/roster.json`).then(r => r.json()),
    fetch(`${FIREBASE_URL}/teamName.json`).then(r => r.json()),
  ]).then(([legacyMatrix, legacyRoster, legacyTeamName]) => {
    const seed = {
      ...SEED_EVENT,
      matrix: legacyMatrix || SEED_EVENT.matrix,
      roster: legacyRoster || SEED_EVENT.roster,
      teamName: legacyTeamName || SEED_EVENT.teamName,
    };
    setEvents([seed]);
    fetch(`${FIREBASE_URL}/events/${seed.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seed),
    });
  }).catch(() => {
    setEvents([SEED_EVENT]);
  });
}
```

- [ ] **Step 2: Verify build**

---

### Task 9: Wire up pairing results to round data

**Files:**
- Modify: `src/App.jsx` — update `Pairing` component's `PhaseCycleDone`

- [ ] **Step 1: Pass pairing results back to the round**

When the pairing process completes (all 5 pairings done), save the pairings array to the active round. The `Pairing` component needs an `onComplete` callback that writes the pairings to the round data.

Update the `allDone` branch in `PhaseCycleDone` to call `onComplete(pairings)` which maps to saving:

```js
// In App's return, update Pairing to pass onComplete:
{activeEvent && screen === 'pairing' && <Pairing team={selectedTeam} onBack={()=>setScreen('matchup')}
  onComplete={(pairings) => {
    // Find which round this opponent is assigned to, save pairings
    const roundNum = Object.keys(roundsData).find(k => roundsData[k]?.opponentId === selectedTeam.id);
    if (roundNum) {
      const mappedPairings = pairings.map((p, i) => ({
        table: i + 1,
        usIdx: p.us.id,
        themIdx: teams.indexOf(teams.find(t => t.players.includes(p.them))) !== -1 ? selectedTeam.players.indexOf(p.them) : i,
      }));
      const updated = { ...roundsData, [roundNum]: { ...roundsData[roundNum], pairings: mappedPairings } };
      saveRounds(updated);
    }
  }}
/>}
```

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add standings, migration from legacy data, and pairing-to-round integration"
```

---

### Task 10: Final polish + deploy

- [ ] **Step 1: Remove legacy flat Firebase load/save code**

Remove the old individual `fetch` calls for `/matrix.json`, `/roster.json`, `/teamName.json` that are no longer needed (data now lives under `/events/{id}/`).

- [ ] **Step 2: Clear localStorage**

Add `localStorage.removeItem('ragnarok-teams')` to the migration path since opponent teams now live in events.

- [ ] **Step 3: Full build verification**

Run: `npm run build`
Expected: successful build, no warnings

- [ ] **Step 4: Deploy**

```bash
npm run build && npm run deploy
```

- [ ] **Step 5: Verify on live site**

Open https://mattcopia.github.io/ragnarok-pairing/ and verify:
1. Event list shows (with migrated Kent Teams event)
2. Can create new event
3. Can enter an event and see opponents
4. Can assign opponent to a round
5. Can enter scores (both VP and GP mode)
6. Standings update correctly
7. All existing features (pairing, ratings, etc.) still work within an event

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: events system complete - deploy"
```
