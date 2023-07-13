import './chat.css'

import Navbar from '../components/NavBar';
import SideBar from './sideBar';
import Conversation from '../components/Conversation/Conversation';

import { Provider } from 'react-redux';
import { store } from '../app/store';
import { useAppDispatch, useAppSelector } from "../utils/redux-hooks";
import { useEffect, useState } from "react";
import { fetchDisplayedChannel, fetchUserChannels, selectDisplayedChannel, selectUserChannels } from '../redux-features/chat/channelsSlice';
import { Channel } from '../types/chat/channelTypes';
import { selectCurrentUser } from '../redux-features/auth/authSlice';
import { emptyChannel } from '../data/emptyChannel';

function Chat () {
	const currentRoute = window.location.pathname;
	const AppDispatch = useAppDispatch();
	const channels = useAppSelector((state) => selectUserChannels(state)) as Channel[];
	const displayedChannel : Channel = useAppSelector(selectDisplayedChannel);
	console.log('displayedChannel = ', displayedChannel);
	
	const currentUser = useAppSelector(selectCurrentUser);

	const [selectedChannel, setSelectedChannel] = useState<string>(() => {
		if (channels.length === 0) {
			return 'WelcomeChannel';
		} else {
			return displayedChannel.name;
		}
	})

	// useEffect(() => {
	// 	AppDispatch(fetchUserChannels());
	// 	if (channels.length === 0) {
	// 		AppDispatch(fetchDisplayedChannel('WelcomeChannel'));
	// 	} else {
	// 		console.log('selectedChannel = ', selectedChannel);
	// 		AppDispatch(fetchDisplayedChannel(selectedChannel));
	// 	}
	// }, []);
	
	useEffect(() => {
		console.log('I am triggered and selectedChannel = ', selectedChannel);
		if (selectedChannel !== '') {
			// // localStorage.setItem('selectedChannel', selectedChannel);
			// localStorage.setItem('user', currentUser);
			AppDispatch(fetchDisplayedChannel(selectedChannel));
			AppDispatch(fetchUserChannels());
		}
	}, [selectedChannel]);

	function handleSelectChannel (channelName : string) {
		setSelectedChannel(channelName);
	}

	// clean up the local storage when the window / tab is closed
	// useEffect(() => {
	// 	const clearLocalStorage = () => {
	// 		localStorage.clear();
	// 	};

	// 	window.addEventListener('beforeunload', clearLocalStorage);

	// 	return () => {
	// 		window.removeEventListener('beforeunload', clearLocalStorage);
	// 	};
	// }, []);

	return (
		<Provider store={store}>
			<div className='chat-container'>
				<Navbar currentRoute={currentRoute} />
				<div className='chat-wrapper'>
				<SideBar handleSelectItem={handleSelectChannel} />
				<div className='chat'>
					<Conversation />
				</div>
				</div>
			</div>
		</Provider>
	)
}

export default Chat;