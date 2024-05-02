import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';
import {
  ConfigureDrillState,
  DrillConfiguration,
  areDrillsSimilar,
  checkedForSimilarDrills,
  initialState,
  loadDrillFailure,
  loadDrillSuccess,
  startLoading,
  writeDrillSuccess,
} from '../store/reducers/configureDrillReducer';
import {AppThunk} from '../store/store';
import {
  Drill,
  deleteDrillFailure,
  deleteDrillSuccess,
  loadFailure,
  loadStart,
  loadSuccess,
} from '../store/reducers/allDrillsSlice';

SQLite.enablePromise(true);

const openDatabase = async (): Promise<SQLite.SQLiteDatabase | undefined> => {
  try {
    const db = (await SQLite.openDatabase({
      name: 'app.db',
      location: 'default',
    })) as SQLiteDatabase;
    await db.executeSql(
      'CREATE TABLE IF NOT EXISTS Drills(drillId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, configuration TEXT)',
    );
    await db.executeSql(
      'CREATE TABLE IF NOT EXISTS Sessions(id INTEGER PRIMARY KEY AUTOINCREMENT, drillId INTEGER, timestamp DATETIME, data TEXT, FOREIGN KEY(drillId) REFERENCES Drills(id))',
    );
    return db;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const addSession = async (
  db: SQLiteDatabase,
  drillId: number,
  data: string,
) => {
  try {
    const timestamp = new Date().toISOString();
    await db.executeSql(
      'INSERT INTO Sessions (id, timestamp, data) VALUES (?, ?, ?)',
      [drillId, timestamp, data],
    );
  } catch (error) {
    console.error(error);
  }
};

export const saveDrill = (): AppThunk => async (dispatch, getState) => {
  try {
    const db = (await openDatabase()) as SQLiteDatabase;
    const drillIdToWrite =
      getState().drillConfigurationState.configuration.drillId;
    const name = getState().drillConfigurationState.configuration.drillName;
    const configurationObject =
      getState().drillConfigurationState.configuration;
    const configurationJson = JSON.stringify(configurationObject);

    let sql = '';
    let params = [];

    if (typeof drillIdToWrite === 'number') {
      // If drillIdToWrite is defined and a number, include it in the query
      sql =
        'REPLACE INTO Drills (drillId, name, configuration) VALUES (?, ?, ?)';
      params = [drillIdToWrite, name, configurationJson];
    } else {
      // If drillIdToWrite is undefined, omit it from the query to trigger auto-increment
      sql = 'INSERT INTO Drills (name, configuration) VALUES (?, ?)';
      params = [name, configurationJson];
    }
    const result = await db.executeSql(sql, params);
    const newId = result[0].insertId
      ? result[0].insertId
      : getState().drillConfigurationState.configuration.drillId;
    const drillWithNewId: DrillConfiguration = {
      ...getState().drillConfigurationState.configuration,
      drillId: newId,
    };
    const stateWithId: ConfigureDrillState = {
      ...getState().drillConfigurationState,
      configuration: drillWithNewId,
    };
    dispatch(writeDrillSuccess(stateWithId));
    dispatch(loadAllDrills(configurationObject));
  } catch (error) {
    dispatch(loadDrillFailure('Failed to save drill'));
  }
};

export const loadAllDrills =
  (drill?: DrillConfiguration): AppThunk =>
  async dispatch => {
    try {
      dispatch(loadStart());
      const db = (await openDatabase()) as SQLiteDatabase;
      const results = await db.executeSql(
        'SELECT drillId, name, configuration FROM Drills',
      );
      let drills: Drill[] = [];
      let rows = results[0].rows;
      for (let i = 0; i < rows.length; i++) {
        const drillConfig: DrillConfiguration = JSON.parse(
          rows.item(i).configuration,
        );

        rows.item(i).drillId &&
          drills.push({
            drillId: rows.item(i).drillId,
            name: rows.item(i).name,
            configuration: drillConfig,
          } as Drill);
      }
      dispatch(loadSuccess(drills));
    } catch (error) {
      dispatch(loadFailure('Failed to load drills'));
    }
  };

export const loadDrillById =
  (drillId: number): AppThunk =>
  async dispatch => {
    dispatch(startLoading());
    try {
      const db = (await openDatabase()) as SQLiteDatabase;
      const results = await db.executeSql(
        'SELECT drillId, name, configuration FROM Drills WHERE drillId = ?',
        [drillId],
      );
      if (results[0].rows.length > 0) {
        const storeData = results[0].rows.item(0);
        const configuration = JSON.parse(storeData.configuration);
        const drillState: ConfigureDrillState = {
          ...initialState,
          configuration: {...configuration, drillId: drillId},
          isSaved: true,
          isLoading: false,
        };
        dispatch(loadDrillSuccess(drillState));
      } else {
        dispatch(loadDrillFailure('No drill found with the given name'));
      }
    } catch (error) {
      dispatch(loadDrillFailure('Failed to load drill'));
    }
  };

export const deleteDrillById =
  (drillId: number): AppThunk =>
  async dispatch => {
    try {
      const db = (await openDatabase()) as SQLiteDatabase;
      const results = await db.executeSql(
        'DELETE FROM Drills WHERE drillId = ?',
        [drillId],
      );
      if (results[0].rows.length > 0) {
        const storeData = results[0].rows.item(0);
        const state: ConfigureDrillState = JSON.parse(storeData.configuration);
        state.configuration.drillId = storeData.drillId;
        dispatch(deleteDrillSuccess(state));
      } else {
        dispatch(deleteDrillFailure('Failed to delete drill'));
      }
    } catch (error) {
      dispatch(deleteDrillFailure('Failed to delete drill'));
    }
  };

export const checkForSimilarDrills =
  (drill: DrillConfiguration): AppThunk =>
  async (dispatch, getState) => {
    const allDrills = getState().allDrillsReducer.drills;
    const similarDrillIds: number[] = [];
    allDrills
      .filter(item => item.drillId !== drill.drillId)
      .forEach(item => {
        if (areDrillsSimilar(drill, item.configuration)) {
          similarDrillIds.push(item.drillId);
          dispatch(checkedForSimilarDrills(similarDrillIds));
        }
      });
    dispatch(checkedForSimilarDrills(similarDrillIds));
  };

  export const saveAndLoadCopy = (): AppThunk => async (dispatch, getState) => {
    const db = (await openDatabase()) as SQLiteDatabase;
    const currentDrill = getState().drillConfigurationState.configuration;
    const newDrill: DrillConfiguration = {
      ...currentDrill,
      drillId: undefined,
      drillName: currentDrill.drillName + ' copy',
    };
    const configurationJson = JSON.stringify(newDrill);

    const result = await db.executeSql(
      'INSERT INTO Drills (name, configuration) VALUES (?, ?)',
      [newDrill.drillName, configurationJson],
    );
    const newId = result[0].insertId
      ? result[0].insertId
      : getState().drillConfigurationState.configuration.drillId;
    newId && dispatch(loadDrillById(newId));
    dispatch(loadAllDrills());
  };
  
export const fetchDrill =
  (drillId: string): AppThunk =>
  async (dispatch, getState) => {};