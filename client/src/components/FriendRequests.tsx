import React from "react";
import {
  Box,
  Stack,
  Avatar,
  Grid,
  Typography,
  CssBaseline
} from "@mui/material";
import { useState } from "react";
import { Button } from "@mui/material";
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import BlockIcon from '@mui/icons-material/Block';
import CloseIcon from '@mui/icons-material/Close';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import {socket} from '../components/AllFriendship'
import { selectCurrentUser } from "../redux-features/auth/authSlice";
import { useAppSelector, useAppDispatch } from "../utils/redux-hooks";

type FriendshipProps = {
    id: string,
    login: string,
    avatar: string,
    type: string,
    bgColor: string,
  };


  const Img = styled('img')({
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
});

export const FriendSuggestion : React.FC<FriendshipProps> = ({id, login, avatar, type, bgColor}) => {
    // const [avt, setAvtr] = useState('')
    const sender = useAppSelector(selectCurrentUser);
    const [buttonColor, setButtonColor] = useState('red'); // State to track the button color
    const [blockBgColor, setBlockBgColor] = useState('yellowgreen');
    const dispatch = useAppDispatch();

    const receiver = {
        nickname: login,
        avatar: avatar,
    }
    const addFriend = () => {
        socket.emit('friendReq', {
            sender: sender,
            receiver: receiver,
        })
    }
    const accept = () => {
        socket.emit('acceptFriend', {
            sender: sender,
            receiver: receiver,
        })
    }
    const deny = () => {
        socket.emit('denyFriend', {
            sender: receiver,
            receiver: sender,
        })
    }
    const block = () => {
        // console.log('je bloque ??')
        socket.emit('blockFriend', {
            sender: sender,
            receiver: receiver,
        })
        setButtonColor('grey')
        setBlockBgColor('grey')
    }

    return (
        <>
            <CssBaseline/>
            <Paper
                sx={{
                    p: 2,
                    borderRadius: '6%',
                    backgroundColor: blockBgColor === 'yellowgreen' ? bgColor : blockBgColor,
                    '&:hover': {
                        background: 'linear-gradient(180deg, #07457E 0%, rgba(0, 181, 160, 0.69) 97%)',
                    },
                    // opacity: 0.6,
                }}
                elevation={3}
            >
                <Grid item container direction='row'  rowSpacing={1} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '3%',
                    flexWrap: 'nowrap',
                    // backgroundColor: 'yellow',
                }}>
                    <Grid container direction="column" item spacing={1} xs={4} sm={6} md={6} lg={6} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                    }}
                    zeroMinWidth
                    >
                        <Grid item>
                            <Avatar src={avatar} sx={{ width: 40, height: 40 }}/>
                        </Grid>
                        <Grid item>
                            <Typography gutterBottom variant="h5" component="div" noWrap>
                                {login}
                            </Typography>
                        </Grid>
                    </Grid>
                    {type === "request" &&  
                        (
                            <Grid container item xs={6} sm={6} md={6} lg={6} sx={{
                                display: 'flex',
                                // alignContent: 'center',
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end',
                                p:1,
                            }}>
                                <Grid item>
                                    <Button variant="contained" size="small" onClick={addFriend}>Ajouter</Button>
                                </Grid>
                            </Grid>
                        )}

                        {type === "requestReception" && (
                            <>
                                <Grid container direction='row' spacing={5}>
                                    <Grid item xs={3} sm={3} md={3} lg={3} >
                                        <IconButton aria-label="add"  onClick={accept}>
                                            <CheckCircleRoundedIcon sx={{
                                                color:"#99e000",
                                            }} fontSize="large"/>
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={3} sm={3} md={3} lg={3}>
                                        <IconButton aria-label="delete" color="error" onClick={deny}>
                                            <CloseIcon fontSize="large"/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                        {(type === 'myFriends') && (
                                <>
                                    <Grid container direction='row' item xs={3} sm={3} md={3} lg={3}spacing={5}>
                                        <Grid item xs={3} sm={3} md={3} lg={3} sx={{
                                            margin: "20%",
                                        }}>
                                            <IconButton aria-label="block" color="error" onClick={block}>
                                                <BlockIcon sx={{ color: buttonColor}}  fontSize="medium"/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                            {(type === 'blockedFriends') && (
                                <>
                                    <Grid container direction='row' item xs={3} sm={3} md={3} lg={3}spacing={5}>
                                        <Grid item xs={3} sm={3} md={3} lg={3} sx={{
                                            margin: "20%",
                                        }}>
                                            <IconButton aria-label="block" color="error" onClick={block}>
                                                <BlockIcon sx={{ color: 'grey'}} fontSize="medium"/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                    </Grid>
            </Paper>
        </> 
    );
}