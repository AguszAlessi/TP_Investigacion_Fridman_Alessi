import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Contacts from 'expo-contacts';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields:
            [
              Contacts.Fields.Emails,
              Contacts.Fields.Nombre,
              Contacts.Fields.Apellido,
              Contacts.Fields.Numero
            ]
        });
      }
    })();
  },
  []);

  if (permission == "denied")
  {
     return (
    <View style={styles.container}>
      <Text>Permiso denegado</Text>
    </View>
  );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
