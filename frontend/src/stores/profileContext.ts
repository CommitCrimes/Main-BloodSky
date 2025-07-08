import { createContext } from 'react';
import { profileStore } from './profileStore';

export const ProfileContext = createContext(profileStore);