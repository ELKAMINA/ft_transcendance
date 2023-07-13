import SearchIcon from '@mui/icons-material/Search';
import "./searchBar.css";

import { FetchAllFriends, FetchAllUsers, selectFriends, selectSuggestions} from '../../redux-features/friendship/friendshipSlice';
// import { User } from "../../../../server/src/user/types/user-types.user.ts";
import { UserDetails } from "../../types/users/userType";
import { useAppDispatch, useAppSelector } from "../../utils/redux-hooks";
import { useEffect, useState } from 'react';
import { fetchAllChannelsInDatabase, fetchPrivateChannels, fetchPrivateConvs, fetchPublicChannels, fetchUserPrivateChannels, fetchUserPrivateConvs, fetchUserPublicChannels, selectAllChannels, selectPrivateChannels, selectPrivateConvs, selectPublicChannels, selectUserPrivateChannels, selectUserPrivateConvs, selectUserPublicChannels } from '../../redux-features/chat/channelsSlice';
import { Channel } from '../../types/chat/channelTypes';
import { selectCurrentUser } from '../../redux-features/auth/authSlice';
import { FetchUserByName } from '../../utils/global/global';

function SearchBar({content, setResults }: { content: string; setResults: React.Dispatch<React.SetStateAction<(UserDetails | Channel)[] >> }) {	  

	const [input, setInput] = useState<string>('');
	const dispatch = useAppDispatch();

	const currentUserName : string = useAppSelector(selectCurrentUser);

	useEffect(() => {dispatch(FetchAllFriends())}, [dispatch]); // get the friends
	const friends = useAppSelector(selectFriends) as UserDetails[];

	useEffect(() => {dispatch(fetchAllChannelsInDatabase())}, []); // get the channels
	let channels = useAppSelector((state) => selectAllChannels (state)) as Channel[];
	

	// FOR TEST PURPOSES
	// useEffect(() => {dispatch(fetchUserPrivateChannels())}, []); // get the channels
	// let userPrivateChannels = useAppSelector(selectUserPrivateChannels) as Channel[];
	// console.log(userPrivateChannels);

	// useEffect(() => {dispatch(fetchUserPublicChannels())}, []); // get the channels
	// let userPublicChannels = useAppSelector(selectUserPublicChannels) as Channel[];
	// console.log(userPublicChannels);

	// useEffect(() => {dispatch(fetchUserPrivateConvs())}, []); // get the channels
	// let userPrivateConvs = useAppSelector(selectUserPrivateConvs) as Channel[];
	// console.log('userPrivateConvs = ', userPrivateConvs);

	// useEffect(() => {dispatch(fetchPrivateChannels())}, []); // get the channels
	// let PrivateChannels = useAppSelector(selectPrivateChannels) as Channel[];
	// console.log('PrivateChannels = ', PrivateChannels);

	// useEffect(() => {dispatch(fetchPublicChannels())}, []); // get the channels
	// let PublicChannels = useAppSelector(selectPublicChannels) as Channel[];
	// console.log('PublicChannels = ' , PublicChannels);

	// useEffect(() => {dispatch(fetchPrivateConvs())}, []); // get the channels
	// let PrivateConvs = useAppSelector(selectPrivateConvs) as Channel[];
	// console.log('PublicChannels = ' , PrivateConvs);


	// if the channel is of type 'private'or 'privateConv' and the current user is not a member,
	// we won't display it.
	// so I filter all the private channels and privateConv channels of which I am not a member or
	// a creator.
	channels = channels.filter(channel => (
		(channel.type === 'private' || channel.type === 'privateConv') && 
		!channel.members?.some(user => user.login === currentUserName) && 
		channel.createdBy?.login !== currentUserName
	));
	// console.log('channels = ', channels);
	const usersAndChannels = [...friends, ...channels]; // join friends and channels
	
	function displayResult(value:string) {
		const results = usersAndChannels.filter((item) => {
			// const name = user?.login?.toLowerCase();
			// return value && user && name && name.includes(value);
			if ('login' in item) {
				const name = (item as UserDetails).login?.toLowerCase();
				return value && name && name.includes(value);
			} else if ('name' in item) {
				const name = (item as Channel).name?.toLowerCase();
				return value && name && name.includes(value);
			}
			return false;
		});
		setResults(results);
	}

	function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		setInput(value);
		displayResult(value);
	}

	return (
		<div className="input-wrapper">
			<SearchIcon id="search-icon" />
			<input
				className="input"
				placeholder={content}
				value={input}
				onChange={handleSearch}
			/>
	  	</div>
	);
	};

export default SearchBar;
