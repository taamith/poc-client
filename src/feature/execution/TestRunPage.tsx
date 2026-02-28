import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Checkbox, TextField, Button, CircularProgress,
    Alert, Skeleton, Chip, LinearProgress, Paper, Collapse, InputAdornment,
} from '@mui/material';
import PlayArrowRoundedIcon   from '@mui/icons-material/PlayArrowRounded';
import ArticleRoundedIcon     from '@mui/icons-material/ArticleRounded';
import RefreshRoundedIcon     from '@mui/icons-material/RefreshRounded';
import NotesRoundedIcon       from '@mui/icons-material/NotesRounded';
import FolderOpenRoundedIcon  from '@mui/icons-material/FolderOpenRounded';
import SearchRoundedIcon      from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon  from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon  from '@mui/icons-material/ExpandLessRounded';
import ChecklistRoundedIcon   from '@mui/icons-material/ChecklistRounded';

// ─── Constants ────────────────────────────────────────────────────────────────

const LIST_PLANS_URL  = '/api-proxy/list-test-plan?fields=name';
const FETCH_PLANS_URL = '/api-proxy/fetch-test-plans';
const STATUS_POLL_MS  = 3 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

type PagePhase = 'loading' | 'idle' | 'fetching' | 'running' | 'fetch-error' | 'run-error';

interface TestPlan {
    file: string;   // "salesforce-poc-user-stories.json"
    name: string;   // "salesforce-poc-user-stories"
}

interface PlanGroup {
    groupName: string;
    plans: TestPlan[];
}

interface FetchedFile {
    key: string;
    name: string;
    content: string;
    bytes: number;
}

// Shared with TestResultsPage (passed via router state)
export interface ResultsSummary {
    total: number; passed: number; failed: number; errors: number;
}
export interface ResultItem {
    filename: string; status: string; report: string;
}
export interface FinalResults {
    status: string; summary: ResultsSummary; results: ResultItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripExt(name: string): string { return name.replace(/\.[^.]+$/, ''); }

function allPlans(groups: PlanGroup[]): TestPlan[] { return groups.flatMap(g => g.plans); }

const TERMINAL = new Set(['completed', 'done', 'finished', 'failed', 'error']);

// ─── Plan Row ─────────────────────────────────────────────────────────────────

interface PlanRowProps {
    plan: TestPlan; selected: boolean; prompt: string;
    disabled: boolean; onToggle: () => void; onPrompt: (v: string) => void;
}

const PlanRow: React.FC<PlanRowProps> = ({ plan, selected, prompt, disabled, onToggle, onPrompt }) => (
    <Paper elevation={0} sx={{
        borderRadius: '12px',
        border: `1.5px solid ${selected ? '#1877F2' : '#EBECF0'}`,
        bgcolor: selected ? '#EEF5FF' : '#FAFBFC',
        transition: 'border-color 0.13s, background-color 0.13s',
        overflow: 'hidden',
    }}>
        <Box onClick={() => !disabled && onToggle()} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: 1.5,
            cursor: disabled ? 'default' : 'pointer',
            '&:hover': !disabled ? { bgcolor: selected ? 'rgba(24,119,242,0.06)' : 'rgba(0,0,0,0.03)' } : {},
        }}>
            <Checkbox
                checked={selected} disabled={disabled} size="small"
                sx={{ p: 0, flexShrink: 0, color: '#C1C7D0', '&.Mui-checked': { color: '#1877F2' } }}
                onClick={e => e.stopPropagation()} onChange={onToggle}
            />
            <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: selected ? 'rgba(24,119,242,0.12)' : '#EBECF0',
                transition: 'background-color 0.13s',
            }}>
                <ArticleRoundedIcon sx={{ fontSize: 17, color: selected ? '#1877F2' : '#6B778C' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                    fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.25,
                    color: selected ? '#1877F2' : '#172B4D', letterSpacing: '-0.01em',
                }}>
                    {plan.name}
                </Typography>
                <Typography sx={{
                    fontSize: '0.7rem', color: '#97A0AF', mt: 0.2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {plan.file}
                </Typography>
            </Box>
            {selected && prompt.trim() && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                    <NotesRoundedIcon sx={{ fontSize: 13, color: '#1877F2' }} />
                    <Typography sx={{ fontSize: '0.68rem', color: '#1877F2', fontWeight: 600 }}>
                        Prompt added
                    </Typography>
                </Box>
            )}
        </Box>

        <Collapse in={selected} timeout={180} unmountOnExit>
            <Box sx={{ px: 2, pb: 2, borderTop: '1px dashed rgba(24,119,242,0.20)', pt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
                    <NotesRoundedIcon sx={{ fontSize: 13, color: '#97A0AF' }} />
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#97A0AF', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                        Custom Prompt
                    </Typography>
                    <Typography sx={{ fontSize: '0.67rem', color: '#C1C7D0' }}>— optional</Typography>
                </Box>
                <TextField
                    multiline minRows={2} maxRows={5} fullWidth size="small"
                    disabled={disabled} value={prompt}
                    onChange={e => onPrompt(e.target.value)}
                    placeholder={`Describe specific instructions for ${plan.name}…`}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px', bgcolor: '#fff', fontSize: '0.83rem', lineHeight: 1.6,
                            '&:hover fieldset': { borderColor: '#1877F2' },
                            '&.Mui-focused fieldset': { borderColor: '#1877F2' },
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(24,119,242,0.25)' },
                    }}
                />
            </Box>
        </Collapse>
    </Paper>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TestRunPage: React.FC = () => {
    const navigate = useNavigate();

    const [phase, setPhase]                   = useState<PagePhase>('loading');
    const [groups, setGroups]                 = useState<PlanGroup[]>([]);
    const [selected, setSelected]             = useState<Set<string>>(new Set());
    const [prompts, setPrompts]               = useState<Record<string, string>>({});
    const [search, setSearch]                 = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [errorMsg, setErrorMsg]             = useState('');
    const [statusLabel, setStatusLabel]       = useState('');
    const [elapsed, setElapsed]           = useState(0);
    const [runningCount, setRunningCount] = useState(0);

    const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
    const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopAll = useCallback(() => {
        if (pollRef.current)    { clearInterval(pollRef.current);    pollRef.current = null; }
        if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null; }
        setElapsed(0);
    }, []);

    useEffect(() => { loadPlans(); return () => stopAll(); }, [stopAll]);

    // ── Load plan list ─────────────────────────────────────────────────────────

    const loadPlans = async () => {
        setPhase('loading');
        setSelected(new Set());
        setPrompts({});
        setErrorMsg('');
        try {
            const res = await fetch(LIST_PLANS_URL);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json() as { items?: string[] };
            const plans: TestPlan[] = (data.items ?? []).map(f => ({ file: f, name: stripExt(f) }));
            setGroups([{ groupName: 'Test Plans', plans }]);
            setExpandedGroups(new Set(['Test Plans']));
            setPhase('idle');
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to load test plans.');
            setPhase('fetch-error');
        }
    };

    // ── Status polling → navigates to results page on completion ───────────────

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/exec-api/test-status');
            if (!res.ok) return;
            const data = await res.json() as { status: string };
            setStatusLabel(data.status);

            if (TERMINAL.has(data.status?.toLowerCase())) {
                stopAll();
                let finalResults: FinalResults | null = null;
                try {
                    const rRes = await fetch('/exec-api/results');
                    if (rRes.ok) finalResults = await rRes.json() as FinalResults;
                } catch { /* proceed even without results */ }

                navigate('/execution/results', {
                    state: { results: finalResults, completedAt: new Date().toISOString() },
                });
            }
        } catch { /* transient — keep polling */ }
    }, [stopAll, navigate]);

    const startElapsed = useCallback(() => {
        setElapsed(0);
        elapsedRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }, []);

    // ── Execute ────────────────────────────────────────────────────────────────

    const handleExecute = async () => {
        const count = selected.size;
        setRunningCount(count);
        setPhase('fetching');
        setStatusLabel('Fetching test plan contents…');
        setErrorMsg('');
        stopAll();
        startElapsed();

        const selectedNames = Array.from(selected);
        try {
            // 1. Fetch plan contents
            const fetchRes = await fetch(FETCH_PLANS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ names: selectedNames }),
            });
            if (!fetchRes.ok) {
                const d = await fetchRes.json().catch(() => ({}));
                throw new Error((d as { error?: string }).error ?? `Fetch plans failed: ${fetchRes.status}`);
            }
            const { files = [] } = await fetchRes.json() as { files: FetchedFile[] };

            // 2. Submit each test
            setPhase('running');
            setStatusLabel('Starting test execution…');
            for (const file of files) {
                const runRes = await fetch('/exec-api/run-tests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        test_name:     stripExt(file.name),
                        content:       file.content,
                        custom_prompt: prompts[file.name]?.trim() || null,
                    }),
                });
                if (!runRes.ok) {
                    const d = await runRes.json().catch(() => ({}));
                    throw new Error((d as { error?: string }).error ?? `Run failed for ${stripExt(file.name)}: ${runRes.status}`);
                }
            }

            // 3. Start polling
            await fetchStatus();
            pollRef.current = setInterval(fetchStatus, STATUS_POLL_MS);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to execute tests.');
            setPhase('run-error');
        }
    };

    // ── Selection helpers ──────────────────────────────────────────────────────

    const toggle = (file: string) =>
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(file)) { next.delete(file); setPrompts(p => { const n = { ...p }; delete n[file]; return n; }); }
            else next.add(file);
            return next;
        });

    const setPromptFor = (file: string, v: string) => setPrompts(p => ({ ...p, [file]: v }));

    const all = allPlans(groups);

    const filteredGroups = search.trim()
        ? groups.map(g => ({ ...g, plans: g.plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.file.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.plans.length > 0)
        : groups;

    const toggleAll = () => {
        if (selected.size === all.length) { setSelected(new Set()); setPrompts({}); }
        else setSelected(new Set(all.map(p => p.file)));
    };

    const toggleGroup = (name: string) => setExpandedGroups(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

    const toggleGroupAll = (g: PlanGroup) => {
        const files = g.plans.map(p => p.file);
        const allSel = files.every(f => selected.has(f));
        if (allSel) {
            setSelected(prev => { const n = new Set(prev); files.forEach(f => n.delete(f)); return n; });
            setPrompts(prev => { const n = { ...prev }; files.forEach(f => delete n[f]); return n; });
        } else {
            setSelected(prev => { const n = new Set(prev); files.forEach(f => n.add(f)); return n; });
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────────

    const hasSelection = selected.size > 0;
    const isFetching   = phase === 'fetching';
    const isRunning    = phase === 'running';
    const isActive     = isFetching || isRunning;
    const showPlans    = phase !== 'loading' && phase !== 'fetch-error';

    const fmtElapsed = (s: number) => { const m = Math.floor(s / 60), sec = s % 60; return m > 0 ? `${m}m ${String(sec).padStart(2, '0')}s` : `${s}s`; };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>

            {/* ── 1. STATUS BAR — always rendered first, visible only when active ── */}
            <Collapse in={isActive} timeout={300} unmountOnExit>
                <Paper elevation={0} sx={{
                    borderRadius: '16px',
                    border: '1.5px solid rgba(24,119,242,0.28)',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #EBF2FF 0%, #F0F6FF 100%)',
                }}>
                    <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        {/* Spinner icon badge */}
                        <Box sx={{
                            width: 48, height: 48, borderRadius: '13px', flexShrink: 0,
                            bgcolor: 'rgba(24,119,242,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CircularProgress size={22} thickness={4.5} sx={{ color: '#1877F2' }} />
                        </Box>

                        {/* Text block */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0D65D9', letterSpacing: '-0.015em' }}>
                                {isFetching
                                    ? 'Fetching test plan contents…'
                                    : `Running ${runningCount} test${runningCount > 1 ? 's' : ''}…`}
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: '#5C82BF', mt: 0.3 }}>
                                {isFetching
                                    ? 'Downloading selected test plans from storage'
                                    : (statusLabel || 'Executing — please keep this tab open')}
                            </Typography>
                        </Box>

                        {/* Elapsed timer badge */}
                        {isActive && (
                            <Box sx={{
                                textAlign: 'center', flexShrink: 0,
                                bgcolor: 'rgba(24,119,242,0.1)', borderRadius: '12px',
                                px: 2.5, py: 1.25,
                                border: '1px solid rgba(24,119,242,0.18)',
                            }}>
                                <Typography sx={{
                                    fontSize: '0.6rem', fontWeight: 700, color: '#6B9FD4',
                                    letterSpacing: '0.07em', textTransform: 'uppercase', mb: 0.25,
                                }}>
                                    Elapsed
                                </Typography>
                                <Typography sx={{
                                    fontSize: '1.5rem', fontWeight: 800, color: '#1877F2',
                                    lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                                }}>
                                    {fmtElapsed(elapsed)}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Progress bar */}
                    <LinearProgress
                        variant="indeterminate"
                        sx={{ height: 3, bgcolor: 'rgba(24,119,242,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#1877F2' } }}
                    />
                </Paper>
            </Collapse>

            {/* ── 2. Page header ── */}
            <Box sx={{ opacity: isActive ? 0.4 : 1, transition: 'opacity 0.3s', pointerEvents: isActive ? 'none' : 'auto' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#172B4D', letterSpacing: '-0.02em' }}>
                    Test Execution
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#6B778C', mt: 0.4 }}>
                    Select test plans and run your automated tests.
                </Typography>
            </Box>

            {/* ── 3. Loading skeletons ── */}
            {phase === 'loading' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="text" width={140} height={20} />
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={58} sx={{ borderRadius: '12px' }} />)}
                </Box>
            )}

            {/* ── 4. Fetch error ── */}
            {phase === 'fetch-error' && (
                <Alert severity="error" sx={{ borderRadius: '10px' }}
                    action={
                        <Button size="small" color="error" startIcon={<RefreshRoundedIcon />}
                            onClick={loadPlans} sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Retry
                        </Button>
                    }>
                    {errorMsg}
                </Alert>
            )}

            {/* ── 5. Plans section ── */}
            {showPlans && (
                <Box sx={{
                    display: 'flex', flexDirection: 'column', gap: 2.5,
                    opacity: isActive ? 0.4 : 1,
                    transition: 'opacity 0.3s',
                    pointerEvents: isActive ? 'none' : 'auto',
                }}>
                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#97A0AF', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                                Test Plans
                            </Typography>
                            {hasSelection && (
                                <Chip
                                    label={`${selected.size} selected`} size="small"
                                    sx={{ height: 18, fontSize: '0.63rem', fontWeight: 700, bgcolor: '#E7F0FD', color: '#1877F2' }}
                                />
                            )}
                        </Box>
                        {all.length > 0 && !isActive && (
                            <Button size="small" onClick={toggleAll}
                                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#1877F2', px: 1, py: 0.25, minWidth: 0 }}>
                                {selected.size === all.length ? 'Deselect all' : 'Select all'}
                            </Button>
                        )}
                    </Box>

                    {/* Search */}
                    <TextField fullWidth size="small" placeholder="Search test plans…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 17, color: '#A5ADBA' }} /></InputAdornment> } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: '0.85rem', '&:hover fieldset': { borderColor: '#1877F2' }, '&.Mui-focused fieldset': { borderColor: '#1877F2' } } }}
                    />

                    {/* Empty state */}
                    {groups.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <ArticleRoundedIcon sx={{ fontSize: 36, color: '#C1C7D0', mb: 1 }} />
                            <Typography sx={{ color: '#6B778C', fontSize: '0.88rem' }}>No test plans available.</Typography>
                        </Box>
                    )}

                    {/* No search results */}
                    {search.trim() && filteredGroups.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <SearchRoundedIcon sx={{ fontSize: 32, color: '#C1C7D0', mb: 0.5 }} />
                            <Typography sx={{ color: '#6B778C', fontSize: '0.88rem' }}>No plans match "{search}"</Typography>
                        </Box>
                    )}

                    {/* Groups */}
                    {filteredGroups.map(group => {
                        const isExpanded      = expandedGroups.has(group.groupName);
                        const groupFiles      = group.plans.map(p => p.file);
                        const selInGroup      = groupFiles.filter(f => selected.has(f)).length;
                        const allGroupSel     = selInGroup === group.plans.length && group.plans.length > 0;
                        const someGroupSel    = selInGroup > 0 && !allGroupSel;
                        return (
                            <Box key={group.groupName}>
                                <Box onClick={() => toggleGroup(group.groupName)} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    mb: isExpanded ? 1.25 : 0, cursor: 'pointer',
                                    '&:hover .grp-label': { color: '#1877F2' },
                                }}>
                                    <Checkbox size="small" checked={allGroupSel} indeterminate={someGroupSel} disabled={isActive}
                                        sx={{ p: 0, flexShrink: 0, color: '#C1C7D0', '&.Mui-checked': { color: '#1877F2' }, '&.MuiCheckbox-indeterminate': { color: '#1877F2' } }}
                                        onClick={e => e.stopPropagation()} onChange={() => toggleGroupAll(group)}
                                    />
                                    <FolderOpenRoundedIcon sx={{ fontSize: 15, color: '#6B778C', flexShrink: 0 }} />
                                    <Typography className="grp-label" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#42526E', letterSpacing: '-0.01em', transition: 'color 0.12s' }}>
                                        {group.groupName}
                                    </Typography>
                                    <Box sx={{ height: 1, flex: 1, bgcolor: '#EBECF0' }} />
                                    <Typography sx={{ fontSize: '0.68rem', color: '#97A0AF', fontWeight: 500 }}>
                                        {selInGroup > 0 ? `${selInGroup}/` : ''}{group.plans.length} {group.plans.length === 1 ? 'plan' : 'plans'}
                                    </Typography>
                                    {isExpanded
                                        ? <ExpandLessRoundedIcon sx={{ fontSize: 16, color: '#97A0AF', flexShrink: 0 }} />
                                        : <ExpandMoreRoundedIcon sx={{ fontSize: 16, color: '#97A0AF', flexShrink: 0 }} />
                                    }
                                </Box>

                                <Collapse in={isExpanded} timeout={150}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {group.plans.map(plan => (
                                            <PlanRow key={plan.file} plan={plan}
                                                selected={selected.has(plan.file)}
                                                prompt={prompts[plan.file] ?? ''}
                                                disabled={isActive}
                                                onToggle={() => toggle(plan.file)}
                                                onPrompt={v => setPromptFor(plan.file, v)}
                                            />
                                        ))}
                                    </Box>
                                </Collapse>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* ── 6. Run error ── */}
            {phase === 'run-error' && (
                <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.83rem' }}>{errorMsg}</Alert>
            )}

            {/* ── 7. Execute button — hidden while active ── */}
            {showPlans && !isActive && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleExecute}
                        disabled={!hasSelection}
                        startIcon={<ChecklistRoundedIcon />}
                        sx={{
                            px: 3.5, py: 1.2, borderRadius: '10px',
                            background: hasSelection
                                ? 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)'
                                : undefined,
                            fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
                            boxShadow: hasSelection ? '0 4px 14px rgba(24,119,242,0.28)' : 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)',
                                boxShadow: '0 6px 20px rgba(24,119,242,0.38)',
                            },
                        }}
                    >
                        {hasSelection
                            ? `Execute ${selected.size} Test Plan${selected.size > 1 ? 's' : ''}`
                            : 'Execute Test Plans'}
                    </Button>

                    {!hasSelection && phase === 'idle' && all.length > 0 && (
                        <Typography sx={{ fontSize: '0.78rem', color: '#97A0AF' }}>
                            Select at least one plan to continue
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default TestRunPage;
