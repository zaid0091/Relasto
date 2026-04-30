import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, profilesAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  LOAD_USER_COMPLETE: 'LOAD_USER_COMPLETE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: {
          ...action.payload.user,
          profile: action.payload.user.profile || action.payload.user
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          const response = await authAPI.getProfile();
          
          const responseData = response.data?.data || response.data;
          const user = responseData?.user || responseData?.user;
          
          // Also fetch profile details to get profile_image
          let profileData = null;
          try {
            const myProfileResponse = await profilesAPI.getMyProfile();
            profileData = myProfileResponse.data?.data?.profile || myProfileResponse.data?.profile;
          } catch (e) {
            console.log('Could not fetch profile details');
          }
          
          // Merge profile data into user object
          if (profileData) {
            user.profile = profileData;
          }
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: { user },
          });
        } catch (_err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authAPI.login(credentials);
      
      const responseData = response.data?.data || response.data;
      const tokens = responseData?.tokens || responseData?.tokens;
      
      if (!tokens) {
        throw new Error('Invalid response format from server');
      }
      
localStorage.setItem('access_token', tokens.access || tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh || tokens.refresh_token);
        
        // Fetch full user profile including is_agent
        const profileResponse = await authAPI.getProfile();
        const userData = profileResponse.data?.data?.user || profileResponse.data?.data || profileResponse.data;
        
        // Also fetch profile details to get profile_image
        let profileData = null;
        try {
          const myProfileResponse = await profilesAPI.getMyProfile();
          profileData = myProfileResponse.data?.data?.profile || myProfileResponse.data?.profile;
        } catch (e) {
          console.log('Could not fetch profile details');
        }
        
        // Merge profile data into user object
        if (profileData) {
          userData.profile = profileData;
        }
        
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: { user: userData },
        });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await authAPI.register(userData);
      
      const responseData = response.data?.data || response.data;
      const tokens = responseData?.tokens || responseData?.tokens;
      
      if (!tokens) {
        throw new Error('Invalid response format from server');
      }
      
      localStorage.setItem('access_token', tokens.access || tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh || tokens.refresh_token);
      
      // Fetch full user profile including is_agent
      const profileResponse = await authAPI.getProfile();
      const user = profileResponse.data?.data?.user || profileResponse.data?.data || profileResponse.data;
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user },
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Google login function
  const googleLogin = async (credential) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authAPI.googleLogin(credential);

      const responseData = response.data?.data || response.data;
      const tokens = responseData?.tokens;

      if (!tokens) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('access_token', tokens.access || tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh || tokens.refresh_token);

      const profileResponse = await authAPI.getProfile();
      const userData = profileResponse.data?.data?.user || profileResponse.data?.data || profileResponse.data;

      let profileData = null;
      try {
        const myProfileResponse = await profilesAPI.getMyProfile();
        profileData = myProfileResponse.data?.data?.profile || myProfileResponse.data?.profile;
      } catch (e) {
        console.log('Could not fetch profile details');
      }

      if (profileData) {
        userData.profile = profileData;
      }

      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: { user: userData },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Google login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function - pure React state, no page reload
  const logout = () => {
    // Clear storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Update state to logged out
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    googleLogin,
    updateProfile,
    clearError,
    dispatch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
