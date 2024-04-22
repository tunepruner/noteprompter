import {
  Image,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import {Themes} from '../ui/theme/Theme';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectConfigureDrill} from '../store/reducers/configureDrillReducer';
import {globalStyles} from '../ui/theme/styles';
import {Divider} from 'react-native-paper';
import {useEffect, useState} from 'react';
import {
  getRandomChordQuality,
  getRandomKey,
  getRandomMode,
  getRandomNoteName,
  getRandomScale,
} from '../store/reducers/ConfigureDrillTypes';
import {useOrientation} from '../util/useOrientation';
import {LogBox} from 'react-native';

export function DrillScreen(): React.JSX.Element {
  const drill = useAppSelector(selectConfigureDrill);
  const dispatch = useAppDispatch();

  const getRandomTonalContextValue = () => {
    switch (drill.tonalContext) {
      case 'chord quality':
        return getRandomChordQuality();
      case 'key':
        return getRandomKey();
      case 'mode':
        return getRandomMode();
      case 'scale':
        return getRandomScale();
      default:
        return null;
    }
  };
  const [currentTonalContextValue, setCurrentTonalContextValue] = useState<
    string | null
  >(getRandomTonalContextValue());
  const [nextTonalContextValue, setNextTonalContextValue] = useState<
    string | null
  >(getRandomTonalContextValue());

  const [isPlaying, setIsPlaying] = useState(false);
  const pauseButton = require('../assets/pause_button.png');
  const playButton = require('../assets/play_button.png');
  const imageSource = isPlaying ? pauseButton : playButton;
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentNote, setCurrentNote] = useState(
    getRandomNoteName(drill.noteNames),
  );
  const [nextNote, setNextNote] = useState(getRandomNoteName(drill.noteNames));

  const {MetronomeModule} = NativeModules;
  const clickEventEmitter = new NativeEventEmitter(MetronomeModule);

  useEffect(() => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);

    MetronomeModule.initializeMetronomeService();
    MetronomeModule.setTempo(drill.tempo);
    MetronomeModule.setBeatsPerPrompt(drill.beatsPerPrompt);

    const subscription = clickEventEmitter.addListener('ClickEvent', data => {
      console.log('12345 Event received', data);
      const beatData = JSON.parse(data);
      const beat = (beatData.currentBeat % drill.beatsPerPrompt) + 1;
      setCurrentBeat(beat);
    });
    return () => {
      subscription.remove();
      MetronomeModule.stop();
      MetronomeModule.cleanup();
      MetronomeModule.unbindService();
    };
  }, []);

  useEffect(() => {
    if (currentBeat === 1) {
      setCurrentNote(nextNote);
      setNextNote(getRandomNoteName(drill.noteNames));
      setCurrentTonalContextValue(nextTonalContextValue);
      setNextTonalContextValue(getRandomTonalContextValue());
    }
  }, [currentBeat]);

  const orientation = useOrientation();
  const divider = (
    <View
      style={
        orientation === 'PORTRAIT'
          ? {
              backgroundColor: 'white',
              height: 1,
              marginHorizontal: 30,
            }
          : {
              backgroundColor: 'white',
              width: 1,
              marginVertical: 30,
            }
      }
    />
  );

  return (
    <View
      style={{
        flex: 1,
        flexDirection: orientation === 'PORTRAIT' ? 'column' : 'row',
        backgroundColor: Themes.dark.background,
      }}>
      {/* Half of screen dedicated to current prompt*/}
      <View
        style={{
          flexDirection: orientation === 'PORTRAIT' ? 'column' : 'row',
          flex: 3,
        }}>
        <Text
          style={[
            globalStyles.smallText,
            {marginHorizontal: 30, marginVertical: 10},
          ]}>
          {drill.drillName}
        </Text>

        {divider}

        {/* Prompt for current value */}
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={localStyles.promptText}>{currentNote}</Text>
          <Text style={localStyles.promptSubtitleText}>
            {currentTonalContextValue}
          </Text>
        </View>
      </View>

      {/* Half of screen dedicated to next prompt*/}
      <View
        style={{
          flexDirection: orientation === 'PORTRAIT' ? 'column' : 'row',
          flex: 3,
        }}>
        {divider}

        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={[localStyles.promptText, {color: 'grey'}]}>
            {nextNote}
          </Text>
          <Text style={[localStyles.promptSubtitleText, {color: 'grey'}]}>
            {nextTonalContextValue}
          </Text>
        </View>
      </View>

      {/* Area of screen for controls */}
      <View
        style={{flexDirection: orientation === 'PORTRAIT' ? 'column' : 'row'}}>
        {divider}
        <View
          style={[
            orientation === 'PORTRAIT'
              ? {
                  height: 200,
                  flexDirection: 'row',
                }
              : {
                  width: 200,
                  flexDirection: 'column',
                },
            {justifyContent: 'space-around', padding: 16},
          ]}>
          <TouchableOpacity
            onPress={() => {
              if (isPlaying) {
                MetronomeModule.stop();
                setCurrentBeat(1);
              } else {
                MetronomeModule.start();
              }
              setIsPlaying(!isPlaying);
            }}
            style={{alignSelf: 'center', margin: 20}}>
            <Image
              style={{
                height: 70,
                width: 70,
              }}
              source={imageSource}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={{height: 100, width: 50}} />
          <Text style={[localStyles.metronomeText, {alignSelf: 'center'}]}>
            {currentBeat}
          </Text>
          <Text style={[localStyles.metronomeText, {alignSelf: 'center'}]}>
            {' - '}
          </Text>
          <Text style={[localStyles.metronomeText, {alignSelf: 'center'}]}>
            {drill.beatsPerPrompt}
          </Text>
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  promptText: {
    ...globalStyles.title,
    fontSize: 80,
    textAlign: 'center',
  },
  promptSubtitleText: {
    ...globalStyles.title,
    fontSize: 35,
    textAlign: 'center',
  },
  metronomeText: {
    ...globalStyles.title,
    fontSize: 60,
    color: Themes.dark.errorYellowText,
    marginTop: 0,
  },
});
