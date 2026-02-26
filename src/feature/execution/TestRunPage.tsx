import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Checkbox, TextField, Button, CircularProgress,
    Alert, Skeleton, Chip, LinearProgress, Paper, Collapse, InputAdornment,
} from '@mui/material';
import PlayArrowRoundedIcon    from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon  from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ArticleRoundedIcon      from '@mui/icons-material/ArticleRounded';
import AccessTimeRoundedIcon   from '@mui/icons-material/AccessTimeRounded';
import RefreshRoundedIcon      from '@mui/icons-material/RefreshRounded';
import NotesRoundedIcon        from '@mui/icons-material/NotesRounded';
import FolderOpenRoundedIcon   from '@mui/icons-material/FolderOpenRounded';
import SearchRoundedIcon        from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon    from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon    from '@mui/icons-material/ExpandLessRounded';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE           = 'http://13.221.139.39/api';
const STATUS_POLL_MS = 3 * 1000; // 3 seconds

// TODO: remove once API returns full plan list
const MOCK_EXTRA_PLANS: PlanGroup[] = [
    {
        groupName: 'salesforce',
        plans: [
            { file: 'salesforce/us2.txt', name: 'US2' },
            { file: 'salesforce/us3.txt', name: 'US3' },
            { file: 'salesforce/us4.txt', name: 'US4' },
            { file: 'salesforce/us5.txt', name: 'US5' },
            { file: 'salesforce/us6.txt', name: 'US6' },
        ],
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type PagePhase = 'loading' | 'idle' | 'running' | 'done' | 'fetch-error' | 'run-error';

interface TestPlan {
    file: string;   // "salesforce/us1.txt"
    name: string;   // "US1"
}

interface PlanGroup {
    groupName: string;
    plans: TestPlan[];
}

interface TestResult {
    file?:    string;
    status?:  string;
    message?: string;
}

interface TestStatusResponse {
    status:    string;
    progress?: number;
    message?:  string;
    results?:  TestResult[];
    error?:    string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPlanName(filePath: string): string {
    const fileName = filePath.split('/').pop() ?? filePath;
    return fileName.replace(/\.[^.]+$/, '').toUpperCase();
}

function formatGroupName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function normalizePlanGroups(raw: unknown): PlanGroup[] {
    if (!raw || typeof raw !== 'object') return [];
    const root     = raw as Record<string, unknown>;
    const plansObj = ('plans' in root ? root.plans : root) as unknown;

    if (Array.isArray(plansObj)) {
        return [{
            groupName: 'Tests',
            plans: (plansObj as string[]).map(f => ({ file: f, name: formatPlanName(f) })),
        }];
    }
    if (!plansObj || typeof plansObj !== 'object') return [];

    return Object.entries(plansObj as Record<string, unknown>)
        .filter(([, v]) => Array.isArray(v) && (v as unknown[]).length > 0)
        .map(([groupName, files]) => ({
            groupName,
            plans: (files as string[]).map(f => ({ file: f, name: formatPlanName(f) })),
        }));
}

function allPlans(groups: PlanGroup[]): TestPlan[] {
    return groups.flatMap(g => g.plans);
}

const TERMINAL = new Set(['completed', 'done', 'finished', 'failed', 'error']);

const resultPalette = (status?: string) => {
    if (status === 'passed') return { dot: '#36B37E', bg: '#F0FAF5', chip: '#ABF5D1', label: '#006644' };
    if (status === 'failed') return { dot: '#DE350B', bg: '#FFF0F0', chip: '#FFBDAD', label: '#BF2600' };
    return                        { dot: '#97A0AF', bg: '#F4F5F7', chip: '#EBECF0', label: '#42526E' };
};

// ─── Plan Row (expandable) ────────────────────────────────────────────────────

interface PlanRowProps {
    plan:      TestPlan;
    selected:  boolean;
    prompt:    string;
    disabled:  boolean;
    onToggle:  () => void;
    onPrompt:  (v: string) => void;
}

const PlanRow: React.FC<PlanRowProps> = ({ plan, selected, prompt, disabled, onToggle, onPrompt }) => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: '12px',
            border: `1.5px solid ${selected ? '#1877F2' : '#EBECF0'}`,
            bgcolor: selected ? '#EEF5FF' : '#FAFBFC',
            transition: 'border-color 0.13s, background-color 0.13s',
            overflow: 'hidden',
        }}
    >
        {/* ── Header row ── */}
        <Box
            onClick={() => !disabled && onToggle()}
            sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.5,
                cursor: disabled ? 'default' : 'pointer',
                '&:hover': !disabled ? {
                    bgcolor: selected ? 'rgba(24,119,242,0.06)' : 'rgba(0,0,0,0.03)',
                } : {},
            }}
        >
            {/* Checkbox */}
            <Checkbox
                checked={selected}
                disabled={disabled}
                size="small"
                sx={{ p: 0, flexShrink: 0, color: '#C1C7D0', '&.Mui-checked': { color: '#1877F2' } }}
                onClick={e => e.stopPropagation()}
                onChange={onToggle}
            />

            {/* Icon */}
            <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: selected ? 'rgba(24,119,242,0.12)' : '#EBECF0',
                transition: 'background-color 0.13s',
            }}>
                <ArticleRoundedIcon sx={{ fontSize: 17, color: selected ? '#1877F2' : '#6B778C' }} />
            </Box>

            {/* Labels */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                    fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.25,
                    color: selected ? '#1877F2' : '#172B4D',
                    letterSpacing: '-0.01em',
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

            {/* Prompt indicator (when collapsed + has text) */}
            {selected && prompt.trim() && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                    <NotesRoundedIcon sx={{ fontSize: 13, color: '#1877F2' }} />
                    <Typography sx={{ fontSize: '0.68rem', color: '#1877F2', fontWeight: 600 }}>
                        Prompt added
                    </Typography>
                </Box>
            )}
        </Box>

        {/* ── Expandable prompt area ── */}
        <Collapse in={selected} timeout={180} unmountOnExit>
            <Box sx={{
                px: 2, pb: 2,
                borderTop: '1px dashed rgba(24,119,242,0.20)',
                pt: 1.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
                    <NotesRoundedIcon sx={{ fontSize: 13, color: '#97A0AF' }} />
                    <Typography sx={{
                        fontSize: '0.67rem', fontWeight: 700, color: '#97A0AF',
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                    }}>
                        Custom Prompt
                    </Typography>
                    <Typography sx={{ fontSize: '0.67rem', color: '#C1C7D0' }}>— optional</Typography>
                </Box>
                <TextField
                    multiline minRows={2} maxRows={5}
                    fullWidth
                    size="small"
                    disabled={disabled}
                    value={prompt}
                    onChange={e => onPrompt(e.target.value)}
                    placeholder={`Describe specific instructions for ${plan.name}…`}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: '#fff',
                            fontSize: '0.83rem',
                            lineHeight: 1.6,
                            '&:hover fieldset':   { borderColor: '#1877F2' },
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
    const [phase, setPhase]                   = useState<PagePhase>('loading');
    const [groups, setGroups]                 = useState<PlanGroup[]>([]);
    const [selected, setSelected]             = useState<Set<string>>(new Set());
    const [prompts, setPrompts]               = useState<Record<string, string>>({});
    const [search, setSearch]                 = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [errorMsg, setErrorMsg]             = useState('');
    const [runStatus, setRunStatus]           = useState<TestStatusResponse | null>(null);
    const [lastPolled, setLastPolled]         = useState<Date | null>(null);
    const [countdown, setCountdown]           = useState<number | null>(null);

    const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopAll = useCallback(() => {
        if (pollRef.current)      { clearInterval(pollRef.current);      pollRef.current = null; }
        if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
        setCountdown(null);
    }, []);

    useEffect(() => { loadPlans(); return () => stopAll(); }, [stopAll]);

    // ── Fetch plans ────────────────────────────────────────────────────────────

    const loadPlans = async () => {
        setPhase('loading');
        setSelected(new Set());
        setPrompts({});
        setErrorMsg('');
        try {
            const res = await fetch(`${BASE}/test-plans`);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const apiGroups = normalizePlanGroups(await res.json());
            // TODO: remove MOCK_EXTRA_PLANS once API returns full list
            const merged = [...apiGroups];
            for (const mock of MOCK_EXTRA_PLANS) {
                const existing = merged.find(g => g.groupName === mock.groupName);
                if (existing) {
                    const existingFiles = new Set(existing.plans.map(p => p.file));
                    existing.plans.push(...mock.plans.filter(p => !existingFiles.has(p.file)));
                } else {
                    merged.push(mock);
                }
            }
            setGroups(merged);
            setExpandedGroups(new Set(merged.map(g => g.groupName)));
            setPhase('idle');
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to load test plans.');
            setPhase('fetch-error');
        }
    };

    // ── Status polling ─────────────────────────────────────────────────────────

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${BASE}/test-status`);
            if (!res.ok) return;
            const data: TestStatusResponse = await res.json();
            setRunStatus(data);
            setLastPolled(new Date());
            if (TERMINAL.has(data.status)) { stopAll(); setPhase('done'); }
        } catch { /* transient — keep polling */ }
    }, [stopAll]);

    const startCountdown = useCallback(() => {
        setCountdown(STATUS_POLL_MS / 1000);
        countdownRef.current = setInterval(() =>
            setCountdown(prev => (prev === null || prev <= 1) ? STATUS_POLL_MS / 1000 : prev - 1),
        1000);
    }, []);

    // ── Execute — one POST per selected test with its own prompt ───────────────

    const handleExecute = async () => {
        setPhase('running');
        setRunStatus({ status: 'Starting…' });
        setLastPolled(null);
        setErrorMsg('');
        stopAll();

        const files = Array.from(selected);
        try {
            for (const file of files) {
                const res = await fetch(`${BASE}/run-tests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        test_files:    [file],
                        custom_prompt: prompts[file]?.trim() ?? '',
                    }),
                });
                if (!res.ok) {
                    const d = await res.json().catch(() => ({}));
                    throw new Error((d as { error?: string }).error ?? `Server returned ${res.status} for ${file}`);
                }
            }
            await fetchStatus();
            pollRef.current = setInterval(fetchStatus, STATUS_POLL_MS);
            startCountdown();
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to start test execution.');
            setPhase('run-error');
        }
    };

    // ── Selection ──────────────────────────────────────────────────────────────

    const toggle = (file: string) =>
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(file)) {
                next.delete(file);
                // Clear prompt when deselecting
                setPrompts(p => { const n = { ...p }; delete n[file]; return n; });
            } else {
                next.add(file);
            }
            return next;
        });

    const setPromptFor = (file: string, value: string) =>
        setPrompts(prev => ({ ...prev, [file]: value }));

    const all = allPlans(groups);

    const filteredGroups = search.trim()
        ? groups
            .map(g => ({
                ...g,
                plans: g.plans.filter(p =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.file.toLowerCase().includes(search.toLowerCase())
                ),
            }))
            .filter(g => g.plans.length > 0)
        : groups;

    const toggleAll = () => {
        if (selected.size === all.length) {
            setSelected(new Set());
            setPrompts({});
        } else {
            setSelected(new Set(all.map(p => p.file)));
        }
    };

    const toggleGroup = (groupName: string) =>
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) next.delete(groupName);
            else next.add(groupName);
            return next;
        });

    const toggleGroupAll = (group: PlanGroup) => {
        const files = group.plans.map(p => p.file);
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
    const isRunning    = phase === 'running';
    const isDone       = phase === 'done';
    const runFailed    = runStatus?.status === 'failed' || runStatus?.status === 'error';
    const showPlans    = phase !== 'loading' && phase !== 'fetch-error';

    const fmtCountdown = (s: number) => {
        const m = Math.floor(s / 60), sec = s % 60;
        return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>

            {/* ── Page header ── */}
            <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#172B4D', letterSpacing: '-0.02em' }}>
                    Test Execution
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#6B778C', mt: 0.4 }}>
                    Select test plans, add a prompt for each, and run your automated tests.
                </Typography>
            </Box>

            {/* ── Loading ── */}
            {phase === 'loading' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="text" width={140} height={20} />
                    {[1, 2, 3].map(i =>
                        <Skeleton key={i} variant="rounded" height={62} sx={{ borderRadius: '12px' }} />
                    )}
                </Box>
            )}

            {/* ── Fetch error ── */}
            {phase === 'fetch-error' && (
                <Alert
                    severity="error" sx={{ borderRadius: '10px' }}
                    action={
                        <Button size="small" color="error" startIcon={<RefreshRoundedIcon />}
                            onClick={loadPlans} sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Retry
                        </Button>
                    }
                >
                    {errorMsg}
                </Alert>
            )}

            {/* ── Plan groups ── */}
            {showPlans && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{
                                fontSize: '0.68rem', fontWeight: 700, color: '#97A0AF',
                                letterSpacing: '0.09em', textTransform: 'uppercase',
                            }}>
                                Test Plans
                            </Typography>
                            {hasSelection && (
                                <Chip
                                    label={`${selected.size} selected`}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.63rem', fontWeight: 700, bgcolor: '#E7F0FD', color: '#1877F2' }}
                                />
                            )}
                        </Box>
                        {all.length > 0 && !isRunning && (
                            <Button
                                size="small" onClick={toggleAll}
                                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#1877F2', px: 1, py: 0.25, minWidth: 0 }}
                            >
                                {selected.size === all.length ? 'Deselect all' : 'Select all'}
                            </Button>
                        )}
                    </Box>

                    {/* Search */}
                    <TextField
                        fullWidth size="small"
                        placeholder="Search test plans…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{ fontSize: 17, color: '#A5ADBA' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', bgcolor: '#fff', fontSize: '0.85rem',
                                '&:hover fieldset': { borderColor: '#1877F2' },
                                '&.Mui-focused fieldset': { borderColor: '#1877F2' },
                            },
                        }}
                    />

                    {/* Empty */}
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
                            <Typography sx={{ color: '#6B778C', fontSize: '0.88rem' }}>
                                No test plans match "{search}"
                            </Typography>
                        </Box>
                    )}

                    {/* Groups */}
                    {filteredGroups.map(group => {
                        const isExpanded      = expandedGroups.has(group.groupName);
                        const groupFiles      = group.plans.map(p => p.file);
                        const selectedInGroup = groupFiles.filter(f => selected.has(f)).length;
                        const allGroupSel     = selectedInGroup === group.plans.length;
                        const someGroupSel    = selectedInGroup > 0 && !allGroupSel;
                        return (
                            <Box key={group.groupName}>
                                {/* Group header — click to collapse/expand */}
                                <Box
                                    onClick={() => toggleGroup(group.groupName)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        mb: isExpanded ? 1.25 : 0,
                                        cursor: 'pointer',
                                        '&:hover .grp-label': { color: '#1877F2' },
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={allGroupSel}
                                        indeterminate={someGroupSel}
                                        disabled={isRunning}
                                        sx={{ p: 0, flexShrink: 0, color: '#C1C7D0', '&.Mui-checked': { color: '#1877F2' }, '&.MuiCheckbox-indeterminate': { color: '#1877F2' } }}
                                        onClick={e => e.stopPropagation()}
                                        onChange={() => toggleGroupAll(group)}
                                    />
                                    <FolderOpenRoundedIcon sx={{ fontSize: 15, color: '#6B778C', flexShrink: 0 }} />
                                    <Typography className="grp-label" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#42526E', letterSpacing: '-0.01em', transition: 'color 0.12s' }}>
                                        {formatGroupName(group.groupName)}
                                    </Typography>
                                    <Box sx={{ height: 1, flex: 1, bgcolor: '#EBECF0' }} />
                                    <Typography sx={{ fontSize: '0.68rem', color: '#97A0AF', fontWeight: 500 }}>
                                        {selectedInGroup > 0 ? `${selectedInGroup}/` : ''}{group.plans.length} {group.plans.length === 1 ? 'plan' : 'plans'}
                                    </Typography>
                                    {isExpanded
                                        ? <ExpandLessRoundedIcon sx={{ fontSize: 16, color: '#97A0AF', flexShrink: 0 }} />
                                        : <ExpandMoreRoundedIcon sx={{ fontSize: 16, color: '#97A0AF', flexShrink: 0 }} />
                                    }
                                </Box>

                                {/* Plan rows */}
                                <Collapse in={isExpanded} timeout={150}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {group.plans.map(plan => (
                                            <PlanRow
                                                key={plan.file}
                                                plan={plan}
                                                selected={selected.has(plan.file)}
                                                prompt={prompts[plan.file] ?? ''}
                                                disabled={isRunning}
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

            {/* ── Run error ── */}
            {phase === 'run-error' && (
                <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.83rem' }}>
                    {errorMsg}
                </Alert>
            )}

            {/* ── Execute button ── */}
            {showPlans && !isDone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleExecute}
                        disabled={!hasSelection || isRunning}
                        startIcon={
                            isRunning
                                ? <CircularProgress size={16} sx={{ color: 'inherit' }} />
                                : <PlayArrowRoundedIcon />
                        }
                        sx={{
                            px: 3.5, py: 1.15, borderRadius: '10px',
                            background: hasSelection && !isRunning
                                ? 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)'
                                : undefined,
                            fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
                            boxShadow: hasSelection && !isRunning ? '0 4px 14px rgba(24,119,242,0.28)' : 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)',
                                boxShadow: '0 6px 20px rgba(24,119,242,0.38)',
                            },
                        }}
                    >
                        {isRunning ? `Running ${selected.size} test${selected.size > 1 ? 's' : ''}…` : 'Execute Tests'}
                    </Button>

                    {isRunning && countdown !== null && (
                        <Typography sx={{
                            fontSize: '0.76rem', color: '#97A0AF',
                            display: 'flex', alignItems: 'center', gap: 0.5,
                        }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
                            Next status check in {fmtCountdown(countdown)}
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── Status panel ── */}
            {(isRunning || isDone) && runStatus && (
                <Paper elevation={0} sx={{ border: '1px solid #EBECF0', borderRadius: '14px', overflow: 'hidden' }}>

                    {/* Header */}
                    <Box sx={{
                        px: 2.5, py: 2,
                        bgcolor: isDone ? (runFailed ? '#FFF4F4' : '#F0FAF5') : '#EEF5FF',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        borderBottom: runStatus.results?.length ? '1px solid #EBECF0' : 'none',
                    }}>
                        {isRunning && <CircularProgress size={18} thickness={5} sx={{ color: '#1877F2', flexShrink: 0 }} />}
                        {isDone && runFailed  && <ErrorOutlineRoundedIcon sx={{ color: '#DE350B', fontSize: 20, flexShrink: 0 }} />}
                        {isDone && !runFailed && <CheckCircleRoundedIcon  sx={{ color: '#36B37E', fontSize: 20, flexShrink: 0 }} />}

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{
                                fontSize: '0.85rem', fontWeight: 700,
                                color: isDone ? (runFailed ? '#BF2600' : '#006644') : '#1877F2',
                            }}>
                                {runStatus.message ?? runStatus.status}
                            </Typography>
                            {lastPolled && (
                                <Typography sx={{
                                    fontSize: '0.7rem', color: '#97A0AF', mt: 0.2,
                                    display: 'flex', alignItems: 'center', gap: 0.4,
                                }}>
                                    <AccessTimeRoundedIcon sx={{ fontSize: 11 }} />
                                    Updated {lastPolled.toLocaleTimeString()}
                                </Typography>
                            )}
                        </Box>

                        {runStatus.progress !== undefined && (
                            <Chip
                                label={`${runStatus.progress}%`}
                                size="small"
                                sx={{
                                    flexShrink: 0, fontWeight: 700, fontSize: '0.72rem',
                                    bgcolor: isDone ? (runFailed ? '#FFBDAD' : '#ABF5D1') : '#C2D9FF',
                                    color:   isDone ? (runFailed ? '#BF2600'  : '#006644') : '#0D65D9',
                                }}
                            />
                        )}
                    </Box>

                    {/* Progress bar */}
                    {isRunning && (
                        <LinearProgress
                            variant={runStatus.progress !== undefined ? 'determinate' : 'indeterminate'}
                            value={runStatus.progress}
                            sx={{ height: 3, bgcolor: '#E7F0FD', '& .MuiLinearProgress-bar': { bgcolor: '#1877F2' } }}
                        />
                    )}

                    {/* Per-test results */}
                    {runStatus.results && runStatus.results.length > 0 && (
                        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{
                                fontSize: '0.68rem', fontWeight: 700, color: '#97A0AF',
                                letterSpacing: '0.09em', textTransform: 'uppercase', mb: 0.5,
                            }}>
                                Results
                            </Typography>
                            {runStatus.results.map((r, i) => {
                                const c = resultPalette(r.status);
                                return (
                                    <Box key={i} sx={{
                                        display: 'flex', alignItems: 'flex-start', gap: 1.5,
                                        p: '10px 14px', borderRadius: '10px', bgcolor: c.bg,
                                    }}>
                                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', mt: 0.65, flexShrink: 0, bgcolor: c.dot }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B4D' }}>
                                                {r.file ? formatPlanName(r.file) : `Test ${i + 1}`}
                                            </Typography>
                                            {r.file && (
                                                <Typography sx={{ fontSize: '0.7rem', color: '#97A0AF', mt: 0.15 }}>
                                                    {r.file}
                                                </Typography>
                                            )}
                                            {r.message && (
                                                <Typography sx={{ fontSize: '0.75rem', color: '#6B778C', mt: 0.3 }}>
                                                    {r.message}
                                                </Typography>
                                            )}
                                        </Box>
                                        {r.status && (
                                            <Chip
                                                label={r.status}
                                                size="small"
                                                sx={{
                                                    flexShrink: 0, height: 20,
                                                    fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
                                                    bgcolor: c.chip, color: c.label,
                                                }}
                                            />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                    {/* Run-again */}
                    {isDone && (
                        <Box sx={{ px: 2.5, pb: 2.5, pt: runStatus.results?.length ? 0 : 2 }}>
                            <Button
                                variant="outlined" size="small"
                                startIcon={<RefreshRoundedIcon />}
                                onClick={() => { setPhase('idle'); setRunStatus(null); setLastPolled(null); }}
                                sx={{
                                    textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                                    borderColor: '#EBECF0', color: '#42526E',
                                    '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: '#EEF5FF' },
                                }}
                            >
                                Run again
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default TestRunPage;
