import { createSlice } from '@reduxjs/toolkit';

export interface AppState {
    mode: 'default' | 'explore';
    selectedPainting: number;
    selectedGroup: string | null;
}

const initialState: AppState = {
  mode: 'default',
  selectedPainting: 0,
  selectedGroup: null,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setSelectedPainting: (state, action) => {
      state.selectedPainting = action.payload;
    },
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    }
  },
});

export const { setMode, setSelectedPainting, setSelectedGroup } = appSlice.actions;
export default appSlice.reducer;
