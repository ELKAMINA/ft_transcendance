import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import  api  from '../../utils/Axios-config/Axios';
import { RootState } from '../../app/store';
import { setAvatar } from "../auth/authSlice";


export interface friendshipState {
    friendshipNamespace: string,
    suggestions: object [], // all users existing in the server except the user itself and the one's from which a response to a friend request is pending
    friends: object [], // all friends that accepted invitation
    friendRequests: object [], // people asking me to join 
    blockedFriends: object [],
    selectedItems: string,
    user: Record<string, any>,
}

const initialState: friendshipState = {
    friendshipNamespace: 'friendship',
    suggestions: [],
    friends: [],
    friendRequests: [],
    blockedFriends: [],
    selectedItems: '',
    user: {},
    // socket: {} as unknown as Socket ,
}
// // Create slice makes us create action objects/types and creators (see actions as event handler and reducer as event listener)
export const friendshipSlice = createSlice({
    name: 'friendship',
    initialState,
    reducers: { // function that has for first param the actual state, and the 2nd param, the action that we want to apply to this state. Hence, the reducer will reduce this 2 params in one final state
        updateAllSuggestions: (state, action: PayloadAction<[{}]>) => {
            state.suggestions = action.payload;
        },
        updateAllRequests: (state, action: PayloadAction<[{}]>) => {
            state.friendRequests = action.payload;
        },
        updateAllFriends: (state, action: PayloadAction<[{}]>) => {
            state.friends = action.payload;
        },
        updateBlockedFriends: (state, action: PayloadAction<[{}]>) => {
            state.blockedFriends = action.payload;
        },
        setSelectedItem: (state, action) => {
            state.selectedItems = action.payload;
        },
        getActualUser: (state, action) => {
            state.user = action.payload;
        },
    },
})



// // action need the name of the task/thing, i want to apply to the state and the data to do that (which is the payload)
export const { updateAllSuggestions, updateAllRequests, updateAllFriends, updateBlockedFriends, setSelectedItem, getActualUser} = friendshipSlice.actions
export const selectSuggestions = (state: RootState) => state.persistedReducer.friendship.suggestions
export const selectFriends = (state: RootState) => state.persistedReducer.friendship.friends
export const selectFrRequests = (state: RootState) => state.persistedReducer.friendship.friendRequests
export const selectBlockedFriends = (state: RootState) => state.persistedReducer.friendship.blockedFriends
export const selectItems = (state: RootState) => state.persistedReducer.friendship.selectedItems
export const selectActualUser = (state: RootState) => state.persistedReducer.friendship.user



export function FetchAllFriendRequests() {
return async (dispatch:any, getState: any) => {
    await api
    .post("http://0.0.0.0:4001/friendship/receivedRequests", {nickname: getState().persistedReducer.auth.nickname})
    .then((res) => {
        // console.log('je rentre ici ', res.data);
        dispatch(updateAllRequests(res.data))})
        .catch((e) => {console.log("error ", e)});
    }
}

export function FetchActualUser() {
    return async (dispatch:any, getState: any) => {
        await api
        .post("http://localhost:4001/user/me", {nickname: getState().persistedReducer.auth.nickname})
        .then((res) => {
            dispatch(getActualUser(res.data))
            // console.log('lavatarr ', (res.data).avatar)
            dispatch(setAvatar((res.data).avatar))
        })
        .catch((e) => {console.log("error ", e)});
    }
}

export function FetchSuggestions() {
    return async (dispatch:any, getState: any) => {
        // console.log('Hiho ')
        await api
        .post("http://0.0.0.0:4001/friendship/suggestions", {nickname: getState().persistedReducer.auth.nickname})
        .then((res) => {
            console.log(`Les suggestions d'amis pour ${getState().persistedReducer.auth.nickname} sont : `)
            res.data.forEach((item: any, index: any) => {
                console.log(`Friend ${index + 1}:`, item.login);
              });
            dispatch(updateAllSuggestions(res.data))
        })
        .catch((e) => { console.log('cest lerreur de ta vie ', e)})
        }
    } 
    
    export function FetchAllFriends() {
        return async (dispatch:any, getState: any) => {
            await api
            .post("http://0.0.0.0:4001/friendship/allFriends", {nickname: getState().persistedReducer.auth.nickname})
            .then((res) => {
                dispatch(updateAllFriends(res.data))})
                .catch((e) => {console.log("error ", e)});
            }
        }
            
            
            // // dispatch is for communicating with redux and tell him to trigger an action so when we write dispatch(setConnected(true) => we tell redux to call the reducer socket/setConnected with the action.payload = true which changes the state "isConnected to TRUE")
            
export default friendshipSlice.reducer
