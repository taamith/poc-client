import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Button, Chip, Paper, Collapse, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ArrowBackRoundedIcon         from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon       from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon      from '@mui/icons-material/ErrorOutlineRounded';
import WarningAmberRoundedIcon      from '@mui/icons-material/WarningAmberRounded';
import ExpandMoreRoundedIcon        from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon        from '@mui/icons-material/ExpandLessRounded';
import ArticleRoundedIcon           from '@mui/icons-material/ArticleRounded';
import AccessTimeRoundedIcon        from '@mui/icons-material/AccessTimeRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultsSummary { total: number; passed: number; failed: number; errors: number; }
interface ResultItem     { filename: string; status: string; report: string; }
interface FinalResults   { status: string; summary: ResultsSummary; results: ResultItem[]; }
interface RouteState     { results: FinalResults | null; completedAt: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripExt(name: string): string { return name.replace(/\.[^.]+$/, ''); }

function normalizeReportText(report: string): string {
    if (!report) return '';
    let text = report.trim();

    // Handle backends that return escaped newlines as plain text.
    if (text.includes('\\n') && !text.includes('\n')) {
        text = text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }

    return text
        .replace(/\r\n/g, '\n')
        .replace(/^\s*#{1,6}\s+/gm, '') // markdown headings
        .replace(/^\s*[*\u2022]\s+/gm, '- ') // bullets: * or • -> -
        .replace(/\*\*([^*]+)\*\*/g, '$1'); // bold markdown
}

function formatTime(iso: string): string {
    try { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch { return iso; }
}

function formatDate(iso: string): string {
    try { return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return ''; }
}

const palette = (status?: string) => {
    const s = status?.toUpperCase();
    if (s === 'PASS' || s === 'PASSED') return { dot: '#36B37E', bg: '#F0FAF5', headerBg: '#E3F5EC', chip: '#ABF5D1', chipText: '#006644', border: 'rgba(54,179,126,0.28)' };
    if (s === 'FAIL' || s === 'FAILED') return { dot: '#DE350B', bg: '#FFF0F0', headerBg: '#FFE4E1', chip: '#FFBDAD', chipText: '#BF2600', border: 'rgba(222,53,11,0.22)' };
    return                                    { dot: '#97A0AF', bg: '#F4F5F7', headerBg: '#EBECF0', chip: '#EBECF0', chipText: '#42526E', border: '#EBECF0' };
};

// ─── Report Parser ────────────────────────────────────────────────────────────

type ReportBlock =
    | { type: 'title';     text: string }
    | { type: 'meta';      key: string; value: string }
    | { type: 'section';   text: string }
    | { type: 'table';     headers: string[]; rows: string[][] }
    | { type: 'separator' }
    | { type: 'bullet';    items: string[] }
    | { type: 'paragraph'; text: string };

function parseTableRow(line: string): string[] {
    const t = line.trim();
    const normalized = t.endsWith('|') ? t : t + '|';
    return normalized.split('|').slice(1, -1).map(c => c.trim().replace(/\*\*([^*]+)\*\*/g, '$1'));
}

/** Fix a parsed row so it always has exactly numCols cells.
 *  If a cell contained a literal "|", the row has too many cells.
 *  Strategy: keep first (numCols-2) cells untouched, merge all overflow
 *  into one middle cell, preserve the very last cell (e.g. Status). */
function fixRowCols(cells: string[], numCols: number): string[] {
    if (cells.length === numCols) return cells;
    if (cells.length < numCols) return [...cells, ...Array(numCols - cells.length).fill('')];
    // head (n-2) + merged (1) + last (1) = n
    const head   = cells.slice(0, numCols - 2);
    const last   = cells[cells.length - 1];
    const merged = cells.slice(numCols - 2, cells.length - 1).join(' | ');
    return [...head, merged, last];
}

function isTableSep(line: string): boolean {
    // Accept | --- | --- | or |---|---| or |:---:|:---:| etc.
    return /^[\|\s\-:]+$/.test(line) && line.includes('-') && line.includes('|');
}

function parseReport(report: string): ReportBlock[] {
    const lines = normalizeReportText(report).split('\n');
    const blocks: ReportBlock[] = [];
    let i = 0;
    let pendingBullets: string[] = [];

    const flushBullets = () => {
        if (pendingBullets.length) { blocks.push({ type: 'bullet', items: [...pendingBullets] }); pendingBullets = []; }
    };

    while (i < lines.length) {
        const t = lines[i].trim();

        if (!t) { flushBullets(); i++; continue; }

        // Separator  --- / ===
        if (/^[-=]{3,}$/.test(t)) { flushBullets(); blocks.push({ type: 'separator' }); i++; continue; }

        // Title  === TEXT ===
        if (/^===.+===$/.test(t)) {
            flushBullets();
            blocks.push({ type: 'title', text: t.replace(/^={2,}\s*|\s*={2,}$/g, '').trim() });
            i++; continue;
        }

        // Table block
        if (t.startsWith('|')) {
            flushBullets();
            const tLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) { tLines.push(lines[i].trim()); i++; }
            const data = tLines.filter(l => !isTableSep(l));
            if (data.length >= 1) {
                const [hdr, ...rows] = data;
                const headers = parseTableRow(hdr);
                blocks.push({ type: 'table', headers, rows: rows.map(r => fixRowCols(parseTableRow(r), headers.length)) });
            }
            continue;
        }

        // Bullet
        if (t.startsWith('- ')) { pendingBullets.push(t.slice(2)); i++; continue; }

        // Section header ending with colon, no value
        if (/^[A-Za-z][A-Za-z0-9_\s/-]{2,}:$/.test(t)) {
            flushBullets();
            blocks.push({ type: 'section', text: t.slice(0, -1) });
            i++; continue;
        }

        // Key-value  Key: value
        const kv = t.match(/^([A-Za-z][A-Za-z0-9_\s/-]{1,40}):\s+(.+)$/);
        if (kv) { flushBullets(); blocks.push({ type: 'meta', key: kv[1].trim(), value: kv[2].trim() }); i++; continue; }

        // Plain paragraph
        flushBullets();
        blocks.push({ type: 'paragraph', text: t });
        i++;
    }

    flushBullets();
    return blocks;
}

// ─── Status chip helper ───────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
    PASS:    { bg: '#ABF5D1', color: '#006644' },
    PASSED:  { bg: '#ABF5D1', color: '#006644' },
    FAIL:    { bg: '#FFBDAD', color: '#BF2600' },
    FAILED:  { bg: '#FFBDAD', color: '#BF2600' },
    ERROR:   { bg: '#FFBDAD', color: '#BF2600' },
    SKIP:    { bg: '#EBECF0', color: '#42526E' },
    SKIPPED: { bg: '#EBECF0', color: '#42526E' },
};

const isStatusWord = (v: string) => v.toUpperCase() in STATUS_MAP;

const StatusChip: React.FC<{ value: string }> = ({ value }) => {
    const s = STATUS_MAP[value.toUpperCase()];
    return s
        ? <Chip label={value} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', height: 20, letterSpacing: '0.04em' }} />
        : <>{value}</>;
};

// ─── Report Renderer ──────────────────────────────────────────────────────────

const ReportRenderer: React.FC<{ report: string }> = ({ report }) => {
    const blocks = useMemo(() => parseReport(report), [report]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {blocks.map((block, i) => {
                switch (block.type) {

                    case 'title':
                        return (
                            <Box key={i} sx={{ bgcolor: '#EEF4FF', borderRadius: '8px', px: 2, py: 1.25, mt: i > 0 ? 1 : 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0D65D9', letterSpacing: '0.01em' }}>
                                    {block.text}
                                </Typography>
                            </Box>
                        );

                    case 'meta':
                        return (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography sx={{
                                    fontSize: '0.68rem', fontWeight: 700, color: '#97A0AF',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                    minWidth: 130, flexShrink: 0,
                                }}>
                                    {block.key}
                                </Typography>
                                {isStatusWord(block.value)
                                    ? <StatusChip value={block.value} />
                                    : <Typography sx={{ fontSize: '0.82rem', color: '#172B4D', fontWeight: 600 }}>{block.value}</Typography>
                                }
                            </Box>
                        );

                    case 'section':
                        return (
                            <Box key={i} sx={{ mt: 2, mb: 0.25 }}>
                                <Typography sx={{
                                    fontSize: '0.67rem', fontWeight: 700, color: '#6B778C',
                                    textTransform: 'uppercase', letterSpacing: '0.09em',
                                }}>
                                    {block.text}
                                </Typography>
                                <Box sx={{ height: '1.5px', bgcolor: '#EBECF0', mt: 0.75, borderRadius: 1 }} />
                            </Box>
                        );

                    case 'separator':
                        return <Divider key={i} sx={{ borderColor: '#EBECF0', my: 0.75 }} />;

                    case 'paragraph':
                        return (
                            <Typography key={i} sx={{ fontSize: '0.83rem', color: '#42526E', lineHeight: 1.75 }}>
                                {block.text}
                            </Typography>
                        );

                    case 'bullet':
                        return (
                            <Box key={i} component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {block.items.map((item, j) => (
                                    <Typography key={j} component="li" sx={{ fontSize: '0.83rem', color: '#42526E', lineHeight: 1.75 }}>
                                        {item}
                                    </Typography>
                                ))}
                            </Box>
                        );

                    case 'table':
                        return (
                            <TableContainer key={i} component={Paper} elevation={0} sx={{
                                border: '1.5px solid #DFE1E6', borderRadius: '10px',
                                overflowX: 'auto', mt: 0.5,
                            }}>
                                <Table size="small" sx={{ tableLayout: 'auto', borderCollapse: 'collapse', borderSpacing: 0 }}>
                                    <TableHead>
                                        <TableRow>
                                            {block.headers.map((h, j) => (
                                                <TableCell key={j} sx={{
                                                    fontWeight: 700, fontSize: '0.68rem', color: '#fff',
                                                    textTransform: 'uppercase', letterSpacing: '0.07em',
                                                    bgcolor: '#344563',
                                                    border: '1px solid #253858',
                                                    py: 1.25, px: 1.75, whiteSpace: 'nowrap',
                                                }}>
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {block.rows.map((row, j) => (
                                            <TableRow key={j} sx={{
                                                bgcolor: j % 2 === 0 ? '#fff' : '#F8F9FA',
                                                '&:hover': { bgcolor: '#EEF4FF' },
                                                transition: 'background-color 0.1s',
                                            }}>
                                                {row.map((cell, k) => (
                                                    <TableCell key={k} sx={{
                                                        fontSize: '0.8rem', color: '#172B4D',
                                                        py: 1, px: 1.75,
                                                        border: '1px solid #DFE1E6',
                                                        verticalAlign: 'top',
                                                        lineHeight: 1.6,
                                                    }}>
                                                        {isStatusWord(cell) ? <StatusChip value={cell} /> : cell}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        );

                    default: return null;
                }
            })}
        </Box>
    );
};

// ─── Stat Badge ───────────────────────────────────────────────────────────────

const StatBadge: React.FC<{ label: string; value: number; color: string; bg: string }> = ({ label, value, color, bg }) => (
    <Box sx={{ textAlign: 'center', bgcolor: bg, borderRadius: '12px', px: 2.5, py: 1.25, minWidth: 60, border: `1px solid ${color}22` }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', mt: 0.3 }}>{label}</Typography>
    </Box>
);

// ─── Result Card ──────────────────────────────────────────────────────────────

const ResultCard: React.FC<{ result: ResultItem; index: number; total: number }> = ({ result, index, total }) => {
    const [expanded, setExpanded] = useState(true);
    const c = palette(result.status);

    return (
        <Paper elevation={0} sx={{
            borderRadius: '14px',
            border: `1.5px solid ${expanded ? c.border : '#EBECF0'}`,
            overflow: 'hidden',
            transition: 'border-color 0.18s, box-shadow 0.18s',
            boxShadow: expanded ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        }}>
            {/* Card header */}
            <Box onClick={() => setExpanded(v => !v)} sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                px: 2.5, py: 2, cursor: 'pointer',
                bgcolor: expanded ? c.bg : '#fff',
                transition: 'background-color 0.18s',
                '&:hover': { bgcolor: c.bg },
            }}>
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c.dot, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#97A0AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Test {index + 1}/{total}
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#172B4D', letterSpacing: '-0.015em', lineHeight: 1.3, mt: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stripExt(result.filename)}
                    </Typography>
                </Box>
                <Chip label={result.status} size="small" sx={{
                    flexShrink: 0, height: 24, fontSize: '0.68rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    bgcolor: c.chip, color: c.chipText, border: `1px solid ${c.border}`,
                }} />
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.04)' }}>
                    {expanded ? <ExpandLessRoundedIcon sx={{ fontSize: 17, color: '#6B778C' }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 17, color: '#6B778C' }} />}
                </Box>
            </Box>

            {/* Report body */}
            <Collapse in={expanded} timeout={250}>
                <Box sx={{ borderTop: `1px solid ${c.border}` }}>
                    {/* Label bar */}
                    <Box sx={{ px: 2.5, py: 1.25, bgcolor: c.headerBg, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArticleRoundedIcon sx={{ fontSize: 14, color: c.chipText, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: c.chipText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Execution Report
                        </Typography>
                    </Box>

                    {/* Formatted report */}
                    <Box sx={{ p: 2.5 }}>
                        {result.report
                            ? <ReportRenderer report={result.report} />
                            : <Typography sx={{ fontSize: '0.83rem', color: '#97A0AF', fontStyle: 'italic' }}>No report available.</Typography>
                        }
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TestResultsPage: React.FC = () => {
    const navigate   = useNavigate();
    const { state }  = useLocation();
    const routeState = state as RouteState | null;
    const safeSummary: ResultsSummary = routeState?.results?.summary ?? { total: 0, passed: 0, failed: 0, errors: 0 };

    useEffect(() => {
        if (!routeState?.results) navigate('/execution/run', { replace: true });
    }, [navigate, routeState?.results]);

    const statusConfig = useMemo(() => {
        const allPassed = safeSummary.failed === 0 && safeSummary.errors === 0 && safeSummary.passed > 0;
        const hasFailed = safeSummary.failed > 0 || safeSummary.errors > 0;
        const mixed     = !allPassed && hasFailed && safeSummary.passed > 0;

        if (allPassed) return {
            icon: <CheckCircleRoundedIcon sx={{ fontSize: 28, color: '#36B37E' }} />,
            iconBg: 'rgba(54,179,126,0.15)', borderColor: 'rgba(54,179,126,0.3)', bgColor: '#F0FAF5', textColor: '#006644',
            title: safeSummary.total === 1 ? 'Test Passed' : 'All Tests Passed',
            subtitle: `${safeSummary.passed} test${safeSummary.passed > 1 ? 's' : ''} completed successfully`,
        };
        if (mixed) return {
            icon: <WarningAmberRoundedIcon sx={{ fontSize: 28, color: '#FF8B00' }} />,
            iconBg: 'rgba(255,139,0,0.14)', borderColor: 'rgba(255,139,0,0.28)', bgColor: '#FFFBF2', textColor: '#974F0C',
            title: `${safeSummary.passed} of ${safeSummary.total} Tests Passed`,
            subtitle: `${safeSummary.failed} test${safeSummary.failed > 1 ? 's' : ''} failed - review reports below`,
        };
        return {
            icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 28, color: '#DE350B' }} />,
            iconBg: 'rgba(222,53,11,0.12)', borderColor: 'rgba(222,53,11,0.25)', bgColor: '#FFF0F0', textColor: '#BF2600',
            title: safeSummary.total === 1 ? 'Test Failed' : 'Tests Failed',
            subtitle: 'Review the reports below and fix the issues before re-running',
        };
    }, [safeSummary.errors, safeSummary.failed, safeSummary.passed, safeSummary.total]);

    if (!routeState?.results) return null;

    const { results, completedAt } = routeState;
    const { summary } = results;


    const hasFailed = summary.failed > 0 || summary.errors > 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 8, width: '100%' }}>

            {/* ── Page header ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 3px 10px rgba(24,119,242,0.3)',
                        }}>
                            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 19, color: '#fff' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#172B4D', letterSpacing: '-0.02em' }}>
                            Test Results
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, pl: 0.5 }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#97A0AF' }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#97A0AF' }}>
                            {formatDate(completedAt)} at {formatTime(completedAt)}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    startIcon={<ArrowBackRoundedIcon sx={{ fontSize: '18px !important' }} />}
                    onClick={() => navigate('/execution/run')}
                    sx={{
                        textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                        color: '#42526E', borderRadius: '9px',
                        border: '1.5px solid #EBECF0', px: 2, py: 0.9, flexShrink: 0,
                        '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: '#EEF5FF' },
                    }}
                >
                    Back to Plans
                </Button>
            </Box>

            {/* ── Overall status banner ── */}
            <Paper elevation={0} sx={{ borderRadius: '16px', border: `1.5px solid ${statusConfig.borderColor}`, bgcolor: statusConfig.bgColor, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '15px', flexShrink: 0, bgcolor: statusConfig.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {statusConfig.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: statusConfig.textColor, letterSpacing: '-0.015em' }}>
                            {statusConfig.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: '#6B778C', mt: 0.3, lineHeight: 1.5 }}>
                            {statusConfig.subtitle}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <StatBadge label="Total"  value={summary.total}  color="#42526E" bg="rgba(255,255,255,0.7)" />
                        <StatBadge label="Passed" value={summary.passed} color="#006644" bg="rgba(54,179,126,0.12)" />
                        {summary.failed > 0 && <StatBadge label="Failed" value={summary.failed} color="#BF2600" bg="rgba(222,53,11,0.09)" />}
                        {summary.errors > 0 && <StatBadge label="Errors" value={summary.errors} color="#974F0C" bg="rgba(255,139,0,0.09)" />}
                    </Box>
                </Box>
            </Paper>

            {/* ── Result cards ── */}
            {results.results.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#97A0AF', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                            Results
                        </Typography>
                        <Chip label={results.results.length} size="small" sx={{ height: 18, fontSize: '0.63rem', fontWeight: 700, bgcolor: '#EBECF0', color: '#42526E' }} />
                        <Box sx={{ flex: 1, height: 1, bgcolor: '#EBECF0' }} />
                    </Box>

                    {results.results.map((r, i) => (
                        <ResultCard key={r.filename + i} result={r} index={i} total={results.results.length} />
                    ))}
                </Box>
            )}

            {/* ── Footer ── */}
            <Divider sx={{ borderColor: '#EBECF0' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#97A0AF' }}>
                    {hasFailed ? 'Fix the failing tests, then execute again.' : 'All tests ran successfully.'}
                </Typography>
                {hasFailed && (
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/execution/run')}
                        sx={{
                            textTransform: 'none', fontWeight: 600, borderRadius: '10px',
                            borderColor: '#EBECF0', color: '#42526E', px: 2.5,
                            '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: '#EEF5FF' },
                        }}
                    >
                        Back to Plans
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default TestResultsPage;
