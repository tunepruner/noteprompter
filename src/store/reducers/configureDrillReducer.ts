import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {
  AllChordQualities,
  AllKeys,
  AllModes,
  AllNoteNames,
  AllScales,
  ChordQuality,
  Key,
  Mode,
  NoteName,
  PromptOrder,
  Scale,
  TonalContext,
} from './ConfigureDrillTypes';

export type DrillConfiguration = {
  drillId?: number;
  drillName: string;
  tempo: number;
  beatsPerPrompt: number;
  noteNames: NoteName[];
  promptOrder: PromptOrder;
  tonalContext: TonalContext;
  chordQualities: ChordQuality[];
  scales: Scale[];
  modes: Mode[];
  keys: Key[];
};

export function areDrillsSimilar(
  first: DrillConfiguration,
  second: DrillConfiguration,
) {
  return (
    first.promptOrder === second.promptOrder &&
    first.tonalContext === second.tonalContext
  );
}

export interface ConfigureDrillState {
  configuration: DrillConfiguration;
  lastSavedConfiguration: DrillConfiguration | null;
  isSaved: boolean;
  hasBeenSavedOnceOrMore: boolean;
  isLoading: boolean;
  saveDrillButtonState: SaveDrillButtonState;
  copyDrillButtonVisible: boolean;
  foundSimilarDrillButtonVisible: boolean;
  deleteDrillButtonVisible: boolean;
  titleError: 'You must choose a name!' | 'That name already exists!' | null;
  playButtonText: 'play' | 'play without saving';
}

interface SaveDrillButtonState {
  text: 'save drill' | 'save changes' | 'saved' | null;
  visible: boolean;
  enabled: boolean | null;
}

const SaveDrillButtonStates = {
  DrillExistsAndNoNewChanges: {
    text: null,
    visible: false,
    enabled: null,
  } as SaveDrillButtonState,
  DrillExistsAndUnsavedChanges: {
    text: 'save changes',
    visible: true,
    enabled: true,
  } as SaveDrillButtonState,
  FreshDrillNotSaved: {
    text: 'save drill',
    visible: true,
    enabled: true,
  } as SaveDrillButtonState,
  DrillJustSavedNoNewChanges: {
    text: 'saved',
    visible: true,
    enabled: false,
  } as SaveDrillButtonState,
};

export const initialState: ConfigureDrillState = {
  configuration: {
    drillName: '',
    tempo: 150,
    beatsPerPrompt: 4,
    noteNames: AllNoteNames,
    promptOrder: 'random',
    tonalContext: 'chord quality',
    chordQualities: AllChordQualities,
    scales: AllScales,
    modes: AllModes,
    keys: AllKeys,
  } as DrillConfiguration,
  lastSavedConfiguration: null,
  isSaved: true,
  hasBeenSavedOnceOrMore: false,
  isLoading: true,
  saveDrillButtonState: SaveDrillButtonStates.FreshDrillNotSaved,
  copyDrillButtonVisible: false,
  foundSimilarDrillButtonVisible: false,
  deleteDrillButtonVisible: false,
  titleError: null,
  playButtonText: 'play',
};

export const configureDrillSlice = createSlice({
  name: 'featureFlags',
  initialState: initialState,
  reducers: {
    setDrillName: (state, action: PayloadAction<string>) => {
      state.configuration.drillName = action.payload;
    },
    setTempo: (state, action: PayloadAction<number>) => {
      state.configuration.tempo = action.payload;
    },
    setBeatsPerChord: (state, action: PayloadAction<number>) => {
      state.configuration.beatsPerPrompt = action.payload;
    },
    setNoteNames: (state, action: PayloadAction<NoteName[]>) => {
      state.configuration.noteNames = action.payload;
    },
    setPromptOrder: (state, action: PayloadAction<PromptOrder>) => {
      state.configuration.promptOrder = action.payload;
    },
    setTonalContext: (state, action: PayloadAction<TonalContext>) => {
      state.configuration.tonalContext = action.payload;
    },
    setChordQualities: (state, action: PayloadAction<ChordQuality[]>) => {
      state.configuration.chordQualities = action.payload;
    },
    setScales: (state, action: PayloadAction<Scale[]>) => {
      state.configuration.scales = action.payload;
    },
    setModes: (state, action: PayloadAction<Mode[]>) => {
      state.configuration.modes = action.payload;
    },
    setKeys: (state, action: PayloadAction<Key[]>) => {
      state.configuration.keys = action.payload;
    },
    writeDrillSuccess: (state, action: PayloadAction<ConfigureDrillState>) => {
      Object.assign(state, {...action.payload, isSaved: true});
      state.lastSavedConfiguration = action.payload.configuration;
      state.hasBeenSavedOnceOrMore = true;
      state.copyDrillButtonVisible = true;
      state.deleteDrillButtonVisible = true;
    },
    startLoading: state => {
      state.isLoading = true;
    },
    loadDrillSuccess: (state, action: PayloadAction<ConfigureDrillState>) => {
      Object.assign(state, {
        ...initialState,
        ...action.payload,
        isLoading: false,
        saveDrillButtonState: action.payload.configuration
          .drillId /* In other words, is it from the DB?*/
          ? SaveDrillButtonStates.DrillExistsAndNoNewChanges
          : SaveDrillButtonStates.FreshDrillNotSaved,
      });
      if (typeof action.payload.configuration.drillId === 'number') {
        state.lastSavedConfiguration = action.payload.configuration;
        state.copyDrillButtonVisible = true;
        state.deleteDrillButtonVisible = true;
      }
    },
    loadDrillFailure: (state, action: PayloadAction<string>) => {
      state = initialState;
      state.isLoading = false;
    },
    clearDrill: state => {
      Object.assign(state, {...initialState, drillId: undefined});
    },
    onDrillEdit: (state, action: PayloadAction<ConfigureDrillState>) => {
      const _ = require('lodash');
      const drillsAreEqual = _.isEqual(
        state.lastSavedConfiguration,
        action.payload.configuration,
      );

      state.isSaved = false;
      if (state.configuration.drillId) {
        // If there's an id, then this drill exists in the db
        if (drillsAreEqual) {
          // If they're the same, then the user changed the drill, then reverted to how it was.
          if (state.hasBeenSavedOnceOrMore) {
            // If the user has already saved at least once during this viewing of the drill...
            state.saveDrillButtonState =
              SaveDrillButtonStates.DrillJustSavedNoNewChanges;
          } else {
            state.saveDrillButtonState =
              SaveDrillButtonStates.DrillExistsAndNoNewChanges;
          }
          state.playButtonText = 'play';
        } else {
          // If they're not the same, then the user just made an edit
          state.saveDrillButtonState =
            SaveDrillButtonStates.DrillExistsAndUnsavedChanges;
          state.playButtonText = 'play without saving';
        }
      } else {
        // No id on this drill means it has never been saved to db before.
        state.saveDrillButtonState = SaveDrillButtonStates.FreshDrillNotSaved;
        state.playButtonText = 'play without saving';
      }

      if (state.configuration.drillName.length > 0) state.titleError = null;
    },
    checkedForSimilarDrills: (state, action: PayloadAction<number[]>) => {
      state.foundSimilarDrillButtonVisible = action.payload.length > 0;
    },
    drillNameEmptyError: state => {
      state.titleError = 'You must choose a name!';
    },
    drillNameNotUniqueError: state => {
      state.titleError = 'That name already exists!';
    },
  },
});

export default configureDrillSlice.reducer;

export const selectConfigureDrill: (state: RootState) => ConfigureDrillState = state =>
  state.drillConfigurationState;

export const {
  setDrillName,
  setTempo,
  setBeatsPerChord,
  setNoteNames,
  setPromptOrder,
  setTonalContext,
  setChordQualities,
  setScales,
  setModes,
  setKeys,
  writeDrillSuccess,
  startLoading,
  loadDrillSuccess,
  loadDrillFailure,
  clearDrill,
  onDrillEdit,
  checkedForSimilarDrills,
  drillNameEmptyError,
  drillNameNotUniqueError,
} = configureDrillSlice.actions;
