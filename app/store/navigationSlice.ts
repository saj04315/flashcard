import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  subjectId: string;
  subjectTitle: string;
  unitId: string;
  unitTitle: string;
}

const initialState: NavigationState = {
  subjectId: '',
  subjectTitle: '',
  unitId: '',
  unitTitle: '',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setSubject(state, action: PayloadAction<{ id: string; title: string }>) {
      state.subjectId = action.payload.id;
      state.subjectTitle = action.payload.title;
    },
    setUnit(state, action: PayloadAction<{ id: string; title: string }>) {
      state.unitId = action.payload.id;
      state.unitTitle = action.payload.title;
    },
    clearNavigation(state) {
      state.subjectId = '';
      state.subjectTitle = '';
      state.unitId = '';
      state.unitTitle = '';
    },
  },
});

export const { setSubject, setUnit, clearNavigation } = navigationSlice.actions;
export default navigationSlice.reducer;
