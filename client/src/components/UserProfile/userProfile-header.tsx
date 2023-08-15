import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useAppSelector } from '../../utils/redux-hooks';
import { selectCurrentUser } from '../../redux-features/auth/authSlice';

interface myProps {
    name: string | null,
    status: string | null,
    friendship: {
      isMyfriend: boolean,
      myBlockedFriend: boolean,
      thoseWhoBlockedMe: boolean
    }
    srcAvatar: string | undefined,
}



function UserProfileHeader(props: myProps) {
  const [color, setColorBadge] = useState('red');
  const user = useAppSelector(selectCurrentUser)
  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: color,
      color: color,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));
  React.useEffect(() => {
    if (props.status === 'Offline')
      setColorBadge('red');
    else if (props.status === 'Online')
      setColorBadge('green');
    else
      setColorBadge('orange');
  }, [props.status]);
  return (
    <Box textAlign='center' display="flex" flexDirection="row" alignItems="center" p={2} justifyContent="space-around" 
    sx={{
      width: '90vw',
      height: '20vh',
      background: 'linear-gradient(180deg, #07457E 0%, rgba(0, 181, 160, 0.69) 70%)',
      borderRadius:'10px',
    }}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Avatar src={props.srcAvatar} alt="User Avatar"
          sx={(theme) => ({
            width: {
                xs: 70,
                sm: 90,
                md: 100,
                lg: 120,
            },
            height: {
              xs: 70,
              sm: 90,
              md: 100,
              lg: 120,
          },
          margin: 3,
        })}
      />
        <Typography sx={(theme)=> ({
            fontSize: {
                xs: 30,
                sm: 40,
                md: 80,
                lg: 88,
            },
            letterSpacing: 2,
            fontFamily: 'Press Start 2P',
            color: 'white',
            opacity: '0.9',
            textShadow:   '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #0ff, 0 0 70px #0ff, 0 0 80px #0ff, 0 0 100px #0ff, 0 0 150px #0ff',
            '&:hover': {
                textShadow: '0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #ff0, 0 0 30px #ff0, 0 0 40px #f0f',
            },
        })} 
        component='div' variant="h3">{props.name}</Typography>
      </Box>
        <Box  display="flex" flexDirection='row' justifyContent='space-between' flexWrap='wrap'>
          <StyledBadge
            sx={{
              margin: 10,
            }}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
          <Typography 
          sx={{
            margin: 0.5,
          }}
          component='div' variant="body1" color="textSecondary">
              {props.status}
          </Typography>
          </StyledBadge>
        </Box>
        <Box ml={2} display="flex" flexDirection='row' justifyContent='space-between' flexWrap='wrap'>
        {props.friendship.myBlockedFriend && <div className='userprof-header'>Not friends - Blocked by you</div> }
        {props.friendship.thoseWhoBlockedMe && <div className='userprof-header'> Not friends - Blocked you</div> }
        {props.friendship.isMyfriend && <div className='userprof-header'>Friends</div> }
        {!props.friendship.isMyfriend && !props.friendship.thoseWhoBlockedMe && !props.friendship.myBlockedFriend && props.name !== user  && <div className='userprof-header'>Not Friends</div>}
        </Box> 
  </Box>
  )
}

export default UserProfileHeader;
