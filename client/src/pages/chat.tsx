import './chat.css'

import Navbar from '../components/NavBar';
import SideBar from './sideBar';
import Conversation from '../components/Conversation/Conversation';

import { Provider } from 'react-redux';
import { store } from '../app/store';
import { useAppDispatch, useAppSelector } from "../utils/redux-hooks";
import { useEffect, useState } from "react";
import { fetchDisplayedChannel, fetchUserChannels, selectDisplayedChannel, selectUserChannels } from '../redux-features/chat/channelsSlice';
import { Channel, ChannelModel } from '../types/chat/channelTypes';
import { selectCurrentUser } from '../redux-features/auth/authSlice';
import { emptyChannel } from '../data/emptyChannel';
import { UserModel } from '../types/users/userType';
import Banned from '../components/Conversation/Banned';

function Chat () {
	const currentRoute = window.location.pathname;
	const AppDispatch = useAppDispatch();

	const channels = useAppSelector((state) => selectUserChannels(state)) as Channel[];
	const displayedChannel : ChannelModel = useAppSelector(selectDisplayedChannel);
	const currentUser : string = useAppSelector(selectCurrentUser);

	const [selectedChannel, setSelectedChannel] = useState<string>(() => {
		if (channels.length === 0) {
			return 'WelcomeChannel';
		} else {
			return displayedChannel.name;
		}
	})
	
	useEffect(() => {
		if (selectedChannel !== '') {
			AppDispatch(fetchDisplayedChannel(selectedChannel));
			AppDispatch(fetchUserChannels());
		}
	}, [selectedChannel]);

	function handleSelectChannel (channelName : string) {
		setSelectedChannel(channelName);
	}

	const isBanned = displayedChannel.banned.some(banned => currentUser === banned.login) // if user is part of the banned user list 

	return (
		<Provider store={store}>
			<div className='chat-container'>
				<Navbar currentRoute={currentRoute} />
				<div className='chat-wrapper'>
				<SideBar handleSelectItem={handleSelectChannel} />
				<div className='chat'>
					{isBanned === false && <Conversation />}
					{isBanned === true && <Banned />}
				</div>
				</div>
			</div>
		</Provider>
	)
}

export default Chat;