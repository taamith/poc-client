import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { issueStore } from '../../app/store/issueStore';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const SpacesFilterBar: React.FC = observer(() => {
    const [pendingKeys, setPendingKeys] = React.useState<string[]>(issueStore.selectedSpaceKeys);
    const [isApplying, setIsApplying] = React.useState(false);
    const isFirstAutoApplyRef = React.useRef(true);

    React.useEffect(() => {
        let cancelled = false;

        const init = async () => {
            const success = await issueStore.fetchSpaces();
            if (cancelled) return;

            setPendingKeys(issueStore.selectedSpaceKeys);

            if (success && issueStore.selectedSpaceKeys.length > 0) {
                await issueStore.fetchIssues();
            }
        };

        if (issueStore.spaces.length === 0 && !issueStore.spacesLoading) {
            init();
        } else {
            setPendingKeys(issueStore.selectedSpaceKeys);
            if (issueStore.selectedSpaceKeys.length > 0) {
                void issueStore.fetchIssues();
            }
        }

        return () => { cancelled = true; };
    }, []);

    React.useEffect(() => {
        setPendingKeys(issueStore.selectedSpaceKeys);
    }, [issueStore.selectedSpaceKeys.join('|')]);

    React.useEffect(() => {
        // Skip until spaces are loaded and ignore the first sync to avoid duplicate initial requests.
        if (issueStore.spaces.length === 0) return;
        if (isFirstAutoApplyRef.current) {
            isFirstAutoApplyRef.current = false;
            return;
        }

        const current = [...issueStore.selectedSpaceKeys].sort().join('|');
        const pending = [...pendingKeys].sort().join('|');
        if (current === pending) return;

        const timer = setTimeout(async () => {
            issueStore.clearSelection();
            issueStore.setSelectedSpaces(pendingKeys);
            setIsApplying(true);
            try {
                await issueStore.fetchIssues();
            } finally {
                setIsApplying(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [pendingKeys.join('|'), issueStore.spaces.length]);

    const options = issueStore.spaces;
    const selectedOptions = options.filter((space) => pendingKeys.includes(space.key));

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: '14px',
                border: '1px solid #EBECF0',
                bgcolor: '#fff',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FilterListRoundedIcon sx={{ fontSize: 18, color: '#1877F2' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, color: '#172B4D', fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
                            Spaces
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: '#97A0AF' }}>
                            Select one or more spaces to load issues
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        size="small"
                        label={`${pendingKeys.length} selected`}
                        sx={{
                            height: 24,
                            bgcolor: '#F4F5F7',
                            border: '1px solid #EBECF0',
                            color: '#42526E',
                            fontWeight: 700,
                        }}
                    />
                    {isApplying && (
                        <Chip
                            size="small"
                            label="Loading issues..."
                            sx={{
                                height: 24,
                                bgcolor: 'rgba(24,119,242,0.08)',
                                border: '1px solid rgba(24,119,242,0.12)',
                                color: '#1877F2',
                                fontWeight: 700,
                            }}
                        />
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
                <Button
                    size="small"
                    variant="text"
                    onClick={() => setPendingKeys(options.map((space) => space.key))}
                    disabled={options.length === 0}
                    sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                >
                    Select All
                </Button>
                <Button
                    size="small"
                    variant="text"
                    onClick={() => setPendingKeys([])}
                    disabled={pendingKeys.length === 0}
                    sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1, fontSize: '0.75rem', color: '#DE350B' }}
                >
                    Clear
                </Button>
            </Box>

            <Autocomplete
                multiple
                disableCloseOnSelect
                options={options}
                loading={issueStore.spacesLoading}
                value={selectedOptions}
                isOptionEqualToValue={(option, value) => option.key === value.key}
                getOptionLabel={(option) => `${option.name} (${option.key})`}
                onChange={(_, values) => setPendingKeys(values.map((space) => space.key))}
                renderOption={(props, option, { selected }) => {
                    return (
                        <Box component="li" {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                sx={{ mr: 1 }}
                                checked={selected}
                            />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#172B4D', lineHeight: 1.2 }}>
                                    {option.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#97A0AF' }}>
                                    {option.key}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={option.key}
                            label={option.key}
                            size="small"
                            sx={{
                                height: 24,
                                borderRadius: '7px',
                                bgcolor: '#EAF2FF',
                                color: '#1877F2',
                                fontWeight: 700,
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        placeholder={issueStore.spacesLoading ? 'Loading spaces...' : 'Select spaces'}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                alignItems: 'flex-start',
                                minHeight: 44,
                                '&:hover fieldset': { borderColor: '#1877F2' },
                                '&.Mui-focused fieldset': { borderColor: '#1877F2' },
                            },
                        }}
                    />
                )}
                noOptionsText={issueStore.spacesLoading ? 'Loading...' : 'No spaces found'}
            />
        </Paper>
    );
});

export default SpacesFilterBar;
