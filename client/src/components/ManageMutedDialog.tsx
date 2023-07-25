import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import UserList, { UserWithTime } from './UserList';
import { useAppDispatch, useAppSelector } from '../utils/redux-hooks';
import { fetchDisplayedChannel, fetchUserChannels, selectDisplayedChannel } from '../redux-features/chat/channelsSlice';
import api from '../utils/Axios-config/Axios';
import { Channel, ChannelModel } from '../types/chat/channelTypes';
import { UserByLogin, UserModel } from '../types/users/userType';
import SendIcon from '@mui/icons-material/Send';

export default function ManageMutedDialog({openDialog, setOpenDialog} : {openDialog : boolean, setOpenDialog : (arg0 : boolean) => void}) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const selectedChannel : ChannelModel = useAppSelector((state) => selectDisplayedChannel(state));
	const [updatedMuted, setUpdatedMuted] = React.useState<UserModel[]>([]);
	const [updatedMutedWithTime, setUpdatedMutedWithTime] = React.useState<UserWithTime[]>([]);
	const AppDispatch = useAppDispatch();

	function setMutedWithTime() {
		// for all the users in updatedMuted with no time associated,
		// add them to the updatedMutedWithTime with a time set to null
		const updatedMutedWithNullTime = updatedMuted.map(user => {
			// Check if the user already exists in updatedMutedWithTime
			const existingUserIndex = updatedMutedWithTime.findIndex(
			  userTime => userTime.user.login === user.login
			);
		
			// If the user is not found in updatedMutedWithTime, add it with time set to null
			if (existingUserIndex === -1) {
				return { user: user, MutedExpiry: null };
			}
		
			// If the user is found, return the existing entry
			return updatedMutedWithTime[existingUserIndex];
		});
		// Update the updatedMutedWithTime state
		setUpdatedMutedWithTime(updatedMutedWithNullTime);
	}

	async function updateMuted() : Promise<void> {
		setMutedWithTime();
		await api
			.post('http://localhost:4001/channel/updateMuted', {
				channelName : {name : selectedChannel.name},
				muted : updatedMutedWithTime,
			})
			.then((response) => {
				// console.log("response = ", response)
				AppDispatch(fetchUserChannels());
				AppDispatch(fetchDisplayedChannel(selectedChannel.name));
			})
			.catch((error) => console.log('error while updating muted : ', error))
	}

	const handleClose = () => {
		updateMuted();
		setOpenDialog(false);
	};

	const handleCancel = () => {
		setOpenDialog(false);
	};

	React.useEffect(() => {

	})

	const membersOptions: UserModel[] = selectedChannel.members.filter((member: UserModel) => {
		// Check if the member is not in the admins array
		const isAdmin = selectedChannel.admins.some(admin => admin.login === member.login);
	  
		// Check if the member's login is different from channel.ownedById
		const isOwnedBy = member.login === selectedChannel.ownedById;
	  
		// Return true if the member is not an admin and their login is different from channel.ownedById
		return !isAdmin && !isOwnedBy;
	});

	// React.useEffect(() => {
	// 	// for all the users in updatedMuted with no time associated,
	// 	// add them to the updatedMutedWithTime with a time set to null
	// 	const updatedMutedWithNullTime = updatedMuted.map(user => {
	// 	  // Check if the user already exists in updatedMutedWithTime
	// 	  const existingUserIndex = updatedMutedWithTime.findIndex(
	// 		userTime => userTime.user.login === user.login
	// 	  );
	  
	// 	  // If the user is not found in updatedMutedWithTime, add it with time set to null
	// 	  if (existingUserIndex === -1) {
	// 		return { user: user, time: null };
	// 	  }
	  
	// 	  // If the user is found, return the existing entry
	// 	  return updatedMutedWithTime[existingUserIndex];
	// 	});
	  
	// 	// Update the updatedMutedWithTime state
	// 	setUpdatedMutedWithTime(updatedMutedWithNullTime);
	// 	console.log('updatedMutedWithTime', updatedMutedWithTime);
	// }, [updatedMuted]);

  	return (
		<div>
			<Dialog
				fullScreen={fullScreen}
				open={openDialog}
				onClose={handleCancel}
				aria-labelledby="manage-muted-dialog"
			>
			<DialogTitle id="manage-muted-dialog">
				{"Manage who is muted in the channel"}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Here you can decide who is muted in the channel.
					A muted member cannot talk in the channel.
					But he is still a member.
				</DialogContentText>
				<UserList 
					usersSet={membersOptions} 
					initialUsers={selectedChannel.muted} 
					setUpdatedUsers={setUpdatedMuted} 
					setTimer={true}
					setUpdatedUsersWithTime={setUpdatedMutedWithTime}
				/>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" size='medium' endIcon={<SendIcon />} onClick={handleClose} autoFocus>
					SUBMIT
				</Button>
			</DialogActions>
			</Dialog>
		</div>
	);
}