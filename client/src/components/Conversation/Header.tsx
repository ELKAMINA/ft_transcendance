import { useState } from 'react';
import styled from '@emotion/styled';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Box, Stack, Typography, Avatar, Badge, IconButton, Divider, Button, Tooltip } from '@mui/material'

import BlockUser from './BlockUser';
import AdminMenu from '../AdminMenu';
import ChannelMenu from '../ChannelMenu';
import api from '../../utils/Axios-config/Axios';
import GiveOwnership from '../GiveOwnership';
import { emptyChannel } from '../../data/emptyChannel';
import { useAppSelector } from '../../utils/redux-hooks';
import { ChannelModel } from '../../types/chat/channelTypes';
import { selectDisplayedChannel, } from '../../redux-features/chat/channelsSlice';
import { selectCurrentUser } from '../../redux-features/auth/authSlice';

const StyledBadge = styled(Badge)(({ theme }) => ({
	"& .MuiBadge-badge": {
	  backgroundColor: "#44b700",
	  color: "#44b700",
	  boxShadow: `0 0 0 2px ${"white"}`,
	  "&::after": {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		borderRadius: "50%",
		animation: "ripple 1.2s infinite ease-in-out",
		border: "1px solid currentColor",
		content: '""',
	  },
	},
	"@keyframes ripple": {
	  "0%": {
		transform: "scale(.8)",
		opacity: 1,
	  },
	  "100%": {
		transform: "scale(2.4)",
		opacity: 0,
	  },
	},
  }));

  type HeaderProps = {
	socketRef: React.MutableRefObject<Socket | undefined>;
  };
  
  function Header({ socketRef }: HeaderProps) {
	const navigate = useNavigate();
	const currentUser : string = useAppSelector(selectCurrentUser);
	let channelName : string = 'error';
	let channelAvatar : string | undefined = 'error';

	const channel: ChannelModel = useAppSelector(selectDisplayedChannel) || emptyChannel;
	const isPrivateConv : boolean = channel.members?.length === 2 && channel.type === 'privateConv' ? true : false;

	const isAdmin : boolean = channel.admins.some(admin => admin.login === currentUser) || currentUser === channel.ownedById;
	const isOwner : boolean = currentUser === channel.ownedById;

	// if the conversation is private, 
	// the name of the channel should be the name of 
	// the channel member that is not the current user
	if (isPrivateConv) {
		if (channel.members[0].login === currentUser) {
			channelName = channel.createdBy.login;
			channelAvatar = channel.createdBy.avatar
		}
		else {
			channelName = channel.members[0].login;
			channelAvatar = channel.members[0].avatar;
		}
	} else {
		channelName = channel.name;
		channelAvatar = channel.avatar;
	}

	const [openBlock, setOpenBlock] = useState<boolean>(false);

	const handleCloseBlock = () => {
		setOpenBlock(false);
	}

	const handleProfile = async (name: string) => {
		await api
		.get('http://localhost:4001/user/userprofile', {
				params: {
						ProfileName: name,
					}
				})
		.then((res) => {
			navigate(`/userprofile?data`, { state: { data: res.data } })
		})
		.catch((e) => {
			console.log('ERROR from request with params ', e)
		})
	}
	
	return (Con	
		<Box 
			p={2}
			sx={{
				width: '100%',
				backgroundColor: '#F8FAFF',
				boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
			}}
		>
			<Stack alignItems={'center'} direction={'row'} justifyContent={'space-between'} sx={{width: '100%', height: '100%',}}>
				<Stack direction={'row'} spacing={2}>
					<Box>
						<StyledBadge
							overlap="circular"
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "right",
							}}
							variant="dot"
						>
							<Button onClick={() => handleProfile(channelName)}>
							<Avatar
								alt={channelName}
								src={channelAvatar}
								sx={{ bgcolor: '#fcba03' }}
							/>
							</Button>
						</StyledBadge>
					</Box>
					<Stack spacing={0.2}>
							<Typography variant="subtitle2">{channelName}</Typography>
							<Typography variant="caption">online</Typography>
					</Stack>
				</Stack>
				<Stack direction={'row'} alignItems={'center'} spacing={3}>
					<IconButton sx={{color: '#07457E'}}>
						<SportsEsportsIcon />
					</IconButton>
					{isPrivateConv &&
						<Tooltip title='block user'>
							<IconButton sx={{color: '#4DC8BC'}} onClick={() => {setOpenBlock(true)}}>
								<RemoveCircleIcon />
							</IconButton>
						</Tooltip>
					}
					{isPrivateConv === false &&
						<Stack direction={'row'} spacing={2}>
							<Divider orientation="vertical" flexItem />
							<ChannelMenu socketRef={socketRef}/>
							{isAdmin && <AdminMenu socketRef={socketRef}/>}
							{isOwner && <GiveOwnership />}
						</Stack>
					}
				</Stack>
			</Stack>
			{openBlock && <BlockUser open={openBlock} handleClose={handleCloseBlock} socketRef={socketRef} sender={currentUser} receiver={channel.name}/>}
		</Box>
		)
}

export default Header
