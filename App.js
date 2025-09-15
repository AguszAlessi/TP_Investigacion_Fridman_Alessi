import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import * as Contacts from "expo-contacts";


export default function App() {
  const [permission, setPermission] = useState(null);
  const [allContacts, setAllContacts] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermission(status);
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields:
            [
              Contacts.Fields.Emails,
              Contacts.Fields.Name,
              Contacts.Fields.FirstName,
              Contacts.Fields.LastName,
              Contacts.Fields.PhoneNumbers
            ]
        });
        
        const normalized = (data || []).map(c => ({
          id: c.id,
          name: c.name || buildName(c),
          phones: c.phoneNumbers?.map(p => p.number).filter(Boolean) || [],
          emails: c.emails?.map(e => e.email).filter(Boolean) || []
        }));
        setAllContacts(normalized);
      }
    })();
  },
  []);

  const filtered = useMemo(()=> {

    const q = query.trim().toLowerCase();
    if(!q) return allContacts;
    const qDigits = q.replace(/\D/g, "");
    return allContacts.filter(c => {
      const inName = (c.name || "").toLowerCase().includes(q);
      const inPhones =
        c.phones.some(p => p.replace(/\D/g, "").includes(qDigits)) ||
        c.phones.join(" ").toLowerCase().includes(q);
      return inName || inPhones;
    });
  }, [query, allContacts]);


  if (permission == "denied")
  {
     return (
    <View style={styles.container}>
      <Text>Permiso denegado</Text>
    </View>
  );
  }


return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.header}>Contactos</Text>

    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder="Buscar por nombre o numero"
      style={styles.search}
    />

    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name || "(Sin nombre)"}</Text>
            <Text style={styles.meta}>{item.phones[0] || "—"}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.subtitle}>No hay resultados</Text>
        </View>
      }
    />

    {selected && (
      <View style={styles.detail}>
        <Text style={styles.detailTitle}>{selected.name}</Text>
        <Text style={styles.section}>Teléfonos</Text>
        {selected.phones.length ? selected.phones.map((p, i) => (
          <Text key={i} style={styles.itemLine}>{p}</Text>
        )) : <Text style={styles.itemLine}>—</Text>}

        <Text style={[styles.section, { marginTop: 12 }]}>Emails</Text>
        {selected.emails.length ? selected.emails.map((e, i) => (
          <Text key={i} style={styles.itemLine}>{e}</Text>
        )) : <Text style={styles.itemLine}>—</Text>}

        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    )}
  </SafeAreaView>
);

}
function buildName(c) {
const parts = [c.firstName, c.lastName].filter(Boolean);
return parts.join(" ").trim();
}

function getInitials(name) {
if (!name) return "?";
const parts = name.trim().split(/\s+/).slice(0, 2);
return parts.map(p => p[0]).join("").toUpperCase();
}

const styles = StyleSheet.create({
container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, backgroundColor: "#fff" },
header: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
search: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12, backgroundColor: "#eee" },
avatarText: { fontWeight: "700" },
name: { fontSize: 16, fontWeight: "600" },
meta: { color: "#666", marginTop: 2 },
empty: { padding: 24, alignItems: "center" },
subtitle: { color: "#666" },
center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
detail: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 10 },
detailTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
section: { fontWeight: "700", marginTop: 4 },
itemLine: { marginTop: 4 },
closeBtn: { marginTop: 16, alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#111", borderRadius: 10 },
closeText: { color: "#fff", fontWeight: "600" }
});