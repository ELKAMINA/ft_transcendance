import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();
  return (
    <Box sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
        background: 'linear-gradient(180deg, #07457E 0%, rgba(0, 181, 160, 0.69) 97%)',
        [theme.breakpoints.up('lg')]: {
            alignItems: 'center', // center alignment for larger screens
            justifyContent: 'center',
        },
        [theme.breakpoints.up('md')]: {
            alignItems: 'center', // center alignment for larger screens
            justifyContent: 'center',
        },
        [theme.breakpoints.down('sm')]: {
            alignItems: 'center', // left alignment for smaller screens
            justifyContent: 'center', 
        },
        [theme.breakpoints.down('xs')]: {
            alignItems: 'center', // left alignment for smaller screens
            justifyContent: 'center',
        }
    })}>
        <Typography sx={(theme)=> ({
            fontSize: {
                xs: 20,
                sm: 20,
                md: 40,
                lg: 50,
            },
            letterSpacing: 6,
            fontFamily: 'Press Start 2P',
            color: 'white',
            opacity: '0.8',
            margin: 4,
            textShadow:   '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #0ff, 0 0 70px #0ff, 0 0 80px #0ff, 0 0 100px #0ff, 0 0 150px #0ff',
            '&:hover': {
                textShadow: '0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #ff0, 0 0 30px #ff0, 0 0 40px #f0f',
            }})}
            variant="h1"> 404 Not Found</Typography>
        <Typography align='center' sx={(theme)=> ({
            fontSize: {
                xs: 10,
                sm: 20,
                md: 40,
                lg: 50,
            },
            letterSpacing: 6,
            fontFamily: 'Press Start 2P',
            color: 'white',
            opacity: '0.4',
            textShadow:   '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #0ff, 0 0 70px #0ff, 0 0 80px #0ff, 0 0 100px #0ff, 0 0 150px #0ff',
            '&:hover': {
                textShadow: '0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #ff0, 0 0 30px #ff0, 0 0 40px #f0f',
            }})} 
            >The page you are looking for does not exist.</Typography>
            <Button  size='medium' variant='contained'
                sx={{
                    margin: 3,
                }}
                 onClick={() => {navigate('/welcome')}}>
                   Home
            </Button>
    </Box>
  )
}

export default NotFoundPage
