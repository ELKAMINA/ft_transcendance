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
import { Channel, ChannelModel } from '../types/chat/channelTypes';
import { UserByLogin, UserModel } from '../types/users/userType';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

export default function GiveOwnerShipDialog({openDialog, setOpenDialog} : {openDialog : boolean, setOpenDialog : (arg0 : boolean) => void}) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const selectedChannel : ChannelModel = useAppSelector((state) => selectDisplayedChannel(state));
	const [updatedOwner, setupdatedOwner] = React.useState<UserModel[]>([]);
	const AppDispatch = useAppDispatch();

	async function updateOwner() : Promise<void> {
		await api
			.post('http://localhost:4001/channel/updateOwner', {
				channelName : {name : selectedChannel.name},
				owner : updatedOwner,
			})
			.then((response) => {
				AppDispatch(fetchUserChannels());
				AppDispatch(fetchDisplayedChannel(selectedChannel.name));
			})
			.catch((error) => console.log('error while updating admins : ', error))
	}

	const handleClose = () => {
		updateOwner();
		setOpenDialog(false);
	};

	const handleCancel = () => {
		setOpenDialog(false);
	};

  return (
	<div>
		<Dialog
			fullScreen={fullScreen}
			open={openDialog}
			onClose={handleCancel}
			aria-labelledby="manage-owner-dialog"
		>
		<DialogTitle id="manage-owner-dialog" sx={{color: '#3b0c2b', fontSize: '1.4em'}}>
			{"Pass on the burden of power"}
		</DialogTitle>
		<DialogContent>
			<DialogContentText sx={{fontSize: '1.2em', color: '#8c005e', padding:'5%'}}>
				There can be only one owner. 
				If it's not you, it's someone else.
				Only you can decide.
				Choose wisely.
			</DialogContentText>
			<UserList updatedAdmins={updatedOwner} setUpdatedAdmins={setupdatedOwner}/>
		</DialogContent>
		<DialogActions>
			<Button variant="outlined" size='medium' startIcon={<DeleteIcon />} onClick={handleCancel} autoFocus>
				CANCEL
			</Button>
			<Button variant="contained" size='medium' endIcon={<SendIcon />} onClick={handleClose} autoFocus>
				SUBMIT
			</Button>
		</DialogActions>
		</Dialog>
	</div>
	);
}