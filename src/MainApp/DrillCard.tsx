import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Themes} from '../ui/theme/Theme';
import {globalStyles} from '../ui/theme/styles';
import CheckBox from '@react-native-community/checkbox';

interface DrillCardProps {
  drill: {
    name: string;
    id: number;
  };
  onPress: () => void;
  onSelect: (drillId: number) => void;
}

const DrillCard: React.FC<DrillCardProps> = props => {
  const drill = props.drill;
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  return (
    <View
      style={[
        styles.card,
        {
          flexDirection: 'row',
          alignItems: 'center',
        },
      ]}>
      <TouchableOpacity style={{flex: 1}} onPress={props.onPress}>
        <View>
          <Text style={globalStyles.fieldHeader}>{drill.name}</Text>
          <Text style={globalStyles.validationErrorText}>Details here</Text>
        </View>
      </TouchableOpacity>
      <CheckBox
        style={{margin: 16}}
        disabled={false}
        value={toggleCheckBox}
        onValueChange={newValue => {
          setToggleCheckBox(newValue);
          props.onSelect(drill.id);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Themes.dark.buttonSurface,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowOffset: {width: 1, height: 1},
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default DrillCard;