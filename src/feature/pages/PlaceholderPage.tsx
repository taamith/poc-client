import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';

interface PlaceholderPageProps {
    title: string;
    subtitle: string;
    Icon: React.ComponentType<SvgIconProps>;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle, Icon }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 200px)',
                gap: 2,
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    bgcolor: '#E8F0FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon sx={{ fontSize: 32, color: '#1877F2' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#172B4D' }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B778C', maxWidth: 400, textAlign: 'center' }}>
                {subtitle}
            </Typography>
        </Box>
    );
};

export default PlaceholderPage;
