import React, {useEffect, useState} from 'react';
import {Text, View, TextInput} from 'react-native';
import {
  SignupActions,
  SignupAction,
  PasswordErrorMessages,
  SignupUiState,
} from '../../reducers/SignupUiState';
import {globalStyles} from '../../../ui/theme/styles';
import {ExpandableText} from '../ExpandableText';
import {PasswordError, PasswordErrors} from '../../reducers/SignupUiState';

type PasswordErrorWithState = {
  error: PasswordError;
  isCurrent: boolean;
};

interface PasswordFieldAndErrorsProps {
  dispatch: React.Dispatch<SignupAction>;
  uiState: SignupUiState;
}

export function PasswordFieldAndErrors({
  dispatch,
  uiState,
}: PasswordFieldAndErrorsProps) {
  const currentErrors = uiState.passwordErrors ? uiState.passwordErrors : [];

  const [errorsWithState, resetCurrentErrorsWithState] = useState<
    PasswordErrorWithState[]
  >([]);

  useEffect(() => {
    resetCurrentErrorsWithState(
      (Object.keys(PasswordErrors) as PasswordError[]).map(error => ({
        error,
        isCurrent: currentErrors.includes(error),
      })),
    );
  }, [uiState.passwordErrors]);

  return (
    <View>
      <Text style={globalStyles.fieldHeader}>Password</Text>
      <TextInput
        autoCapitalize="none"
        secureTextEntry={true}
        style={globalStyles.textInputArea}
        onChangeText={text =>
          dispatch(
            SignupActions.fieldValueChanged(
              uiState.emailText,
              uiState.usernameText,
              text,
            ),
          )
        }
        value={uiState.passwordText}
        placeholder="Type password here"
      />

      {/* Password field errors */}

      {errorsWithState.map((error, index) => (
        <ExpandableText
          key={error.error}
          error={PasswordErrorMessages[error.error]}
          isCurrent={error.isCurrent}
        />
      ))}
    </View>
  );
}
