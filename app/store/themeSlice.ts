import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  accentColor: string;
}

const initialState: ThemeState = {
  // We can default to our general teal color or transparent
  accentColor: '#6BA898',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    },
  },
});

export const { setAccentColor } = themeSlice.actions;
export default themeSlice.reducer;
