import { BaseQueryApi, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setSignCredentials, logOut, setTokens } from '../../features/auth/authSlice';
import { RootState } from '../store';
import userEvent from '@testing-library/user-event';



const baseQuery = fetchBaseQuery({
    baseUrl: 'http://0.0.0.0:4001',
    credentials: 'include', // Credentials = include => to send the cookie with every query
    mode: 'cors',
    prepareHeaders: (headers, { getState, endpoint }) => {
        const user = (getState() as RootState).auth.access_token;
        if (user && endpoint !== 'refresh') {
            headers.set("authorization", `Bearer ${user}`)
        }
        return headers
    }
})

// Wrapper Query around the baseQuery to get a refresh token if access token has expired
const baseQueryWithReauth = async (args: any, api: BaseQueryApi, extraOptions: object) => {
    let queryResponse = await baseQuery(args, api, extraOptions)
    // console.log("queryResponse ", queryResponse);
    if (queryResponse?.error?.status === 401) {
        // send refresh token to get new access token
        const refreshResult = await baseQuery({url: "/auth/refresh", method: "POST", body: args, headers: {authorization: `Bearer ${args.body.refresh_token}`}}, {...api, endpoint: 'refresh'}, extraOptions)
        const user = (api.getState() as RootState).auth.nickname
        if (refreshResult?.data) {
            // store the new token 
            api.dispatch(setTokens({ ...refreshResult.data}))
            // retry the original query with new access token 
            queryResponse = await baseQuery(args, api, extraOptions)
        } else {
            console.log("ici 100? ");
            api.dispatch(logOut(user))
        }
    }
    return queryResponse
}

// fetchBaseQuery = can be compared to Axios
export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({}) 
})