import {StyleSheet} from 'react-native';
import {Themes} from './Theme';
import {ThemeProvider} from '@react-navigation/native';

export const globalStyles = StyleSheet.create({
  shadowStyle: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0, // Adjust as needed
      height: 4, // Adjust as needed
    },
    shadowOpacity: 0.3, // Adjust as needed
    shadowRadius: 5, // Adjust as needed

    // Important for Android
    elevation: 8, // Adjust as needed
  },
  modalOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Themes.dark.scrimColor,
    flex: 1,
  },
  modalInner: {
    margin: 16,
    padding: 16,
    backgroundColor: Themes.dark.background,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    padding: 24,
    flex: 1,
    backgroundColor: Themes.dark.background,
  },
  title: {
    marginTop: 8,
    fontSize: 40,
    color: Themes.dark.lightText,
    fontWeight: '600',
    fontFamily: 'arciform',
  },
  fieldHeader: {
    marginTop: 16,
    fontSize: 25,
    color: Themes.dark.lightText,
    fontWeight: '600',
    fontFamily: 'arciform',
  },
  mediumText: {
    fontSize: 20,
    color: Themes.dark.lightText,
    fontFamily: 'arciform',
  },
  textInputArea: {
    height: 40,
    marginTop: 8,
    color: Themes.dark.lightText,
    borderColor: 'gray',
    borderWidth: 1,
  },
  loginButtonStyle: {
    marginTop: 20,
  },
  validationErrorText: {
    color: Themes.dark.errorRed,
    fontFamily: 'arciform',
    fontSize: 16,
  },
  button: {
    backgroundColor: Themes.dark.buttonSurface,
    padding: 16,
    borderRadius: 5,
  },
  chipStyle: {
    height: 40,
    width: 70,
    margin: 10,
    backgroundColor: Themes.dark.buttonSurface,
    borderColor: 'white',
    borderWidth: 0,
    borderRadius: 20,
    justifyContent: 'center',
  },
  selectedChipStyle: {
    height: 40,
    width: 70,
    margin: 10,
    backgroundColor: Themes.dark.buttonSurface,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
  },
  modalErrorText: {
    color: Themes.dark.errorYellowText,
    textAlign: 'center',
    fontFamily: 'arciform',
    fontSize: 16,
  },
  actionButtonText: {
    color: Themes.dark.actionText,
    fontFamily: 'arciform',
    fontSize: 16,
  },
  infoText: {
    color: Themes.dark.infoText,
    fontFamily: 'arciform',
    fontSize: 16,
  },
  buttonText: {
    color: Themes.dark.lightText,
    textAlign: 'center',
    fontFamily: 'arciform',
    fontSize: 20,
  },
  smallText: {
    marginTop: 16,
    fontSize: 16,
    color: Themes.dark.lightText,
    fontWeight: '400',
    fontFamily: 'arciform',
  },
});