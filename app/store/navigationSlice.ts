import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  subjectId: string;
  subjectName: string;
  unitId: string;
  unitTitle: string;
}

const initialState: NavigationState = {
  subjectId: '',
  subjectName: '',
  unitId: '',
  unitTitle: '',
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setSubject: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.subjectId = action.payload.id;
      state.subjectName = action.payload.name;
      // Reset unit context when subject changes
      state.unitId = '';
      state.unitTitle = '';
    },
    setUnit: (state, action: PayloadAction<{ id: string; title: string }>) => {
      state.unitId = action.payload.id;
      state.unitTitle = action.payload.title;
    },
  },
});

export const { setSubject, setUnit } = navigationSlice.actions;
export default navigationSlice.reducer;
