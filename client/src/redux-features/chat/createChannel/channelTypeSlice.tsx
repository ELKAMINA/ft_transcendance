import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store";

export interface ChannelTypeState {
	type: string;
	protected_by_password: boolean;
	password: string
  }
  
const initialState: ChannelTypeState = {
	type: 'public',
	protected_by_password: false,
	password: '',
};

// this an object with 2 attributes : 
// type,
// protected_by_password
// it represents the type of a channel
export const channelType = createSlice({
	name: "channelType",
	initialState,
	reducers: {
		// addChannelType: (state, action: PayloadAction<string>) => {
		// 	return { ...state, type: action.payload };
		//   },
		//   isProtectedByPassword: (state, action: PayloadAction<boolean>) => {
		// 	return { ...state, protected_by_password: action.payload };
		//   },
		//   addPassword: (state, action: PayloadAction<string>) => {
		// 	return { ...state, password: action.payload };
		//   },
		addChannelType: (state, action) => {
			const newType = action.payload;
			state.type = newType;
			// console.log("new type is : " + state.type);
		},
		isProtectedByPassword: (state, action) => {
			const pwd = action.payload;
			state.protected_by_password = pwd;
			// console.log("is protected by password? " + state.protected_by_password);
		},
		addPassword: (state, action) => {
			const pwd = action.payload;
			state.password = pwd;
			// console.log("password is " + state.password);
		},
		resetChannelType: (state) => {
			state.type = initialState.type;
			state.protected_by_password = initialState.protected_by_password;
			state.password = initialState.password;
		},
		  
	}
})

export const { addChannelType, isProtectedByPassword, addPassword, resetChannelType } = channelType.actions

export default channelType.reducer

export const selectType = (state: RootState) => state.persistedReducer.channelType.type
