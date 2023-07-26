import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import UserList from './UserList';
import { useAppDispatch, useAppSelector } from '../utils/redux-hooks';
import { fetchDisplayedChannel, fetchUserChannels, selectDisplayedChannel } from '../redux-features/chat/channelsSlice';
import api from '../utils/Axios-config/Axios';
import { ChannelModel } from '../types/chat/channelTypes';
import { UserByLogin } from '../types/users/userType';
import SendIcon from '@mui/icons-material/Send';

export default function ManageAdminDialog({openDialog, setOpenDialog} : {openDialog : boolean, setOpenDialog : (arg0 : boolean) => void}) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const selectedChannel : ChannelModel = useAppSelector((state) => selectDisplayedChannel(state));
	const [updatedAdmins, setUpdatedAdmins] = React.useState<UserByLogin[]>([]);
	const AppDispatch = useAppDispatch();

	async function updateAdmins() : Promise<void> {
		// just send users as UserByLogin object to prevent 'avatar linked payload too large' error 
		const simplifiedAdmins: UserByLogin[] = updatedAdmins.map(({ login }) => ({ login })); // converting UserModel to UserByLogin to keep only login property
		await api
			.post('http://localhost:4001/channel/updateAdmins', {
				channelName : {name : selectedChannel.name},
				admins : simplifiedAdmins,
			})
			.then((response) => {
				// console.log("response = ", response)
				AppDispatch(fetchUserChannels());
				AppDispatch(fetchDisplayedChannel(selectedChannel.name));
			})
			.catch((error) => console.log('error while updating admins : ', error))
	}

	const handleClose = () => {
		updateAdmins();
		setOpenDialog(false);
	};

	const handleCancel = () => {
		setOpenDialog(false);
	};

	// filter the owner from available options because the owner cannot be destituted from its admin status
	const channelMembersOptions = selectedChannel.members.filter(member => member.login != selectedChannel.ownedById)
	const channelAdminsOptions = selectedChannel.admins.filter(admin => admin.login != selectedChannel.ownedById)

  	return (
		<div>
			<Dialog
				fullScreen={fullScreen}
				open={openDialog}
				onClose={handleCancel}
				aria-labelledby="manage-admin-dialog"
			>
			<DialogTitle id="manage-admin-dialog">
				{"Manage who has admin rights"}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Here you can decide who has administrator privileges.
					An administrator can kick, ban or mute another
					member of the channel, except the other admins. 
				</DialogContentText>
				<UserList usersSet={channelMembersOptions} initialUsers={channelAdminsOptions} setUpdatedUsers={setUpdatedAdmins}/>
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