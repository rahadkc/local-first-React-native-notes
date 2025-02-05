import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { MultilineTextInput } from '@/components/MultiLineTextInput';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { StyledButton } from '@/components/StyledButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { formatDate } from '@/scripts/utils';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMergeableStore } from 'tinybase/mergeable-store';
import { createExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';
import {
  useCreateMergeableStore,
  useCreatePersister,
  useProvideStore,
  useStore,
  useTable,
} from 'tinybase/ui-react';

const TABLE_NAME = 'notes';
const TEXT_CELL = 'text';
const DATE_CELL = 'createdAt';
const DONE_CELL = 'done';

type NoteType = { id: string; text: string; done: boolean; createdAt: string };

const generatedId = () => `note-${Date.now()}`;

function NoteList() {
  const store = useStore(TABLE_NAME);
  const notes = useTable(TABLE_NAME, store);

  const toggleComplete = (id: string) => {
    const selectedRow = store?.getRow(TABLE_NAME, id);
    if (!selectedRow) {
      return;
    }
    // store?.setRow(TABLE_NAME, id, {
    //   ...selectedRow,
    //   [DONE_CELL]: !selectedRow[DONE_CELL],
    // });

    store?.setCell(TABLE_NAME, id, DONE_CELL, !selectedRow[DONE_CELL]);
  };
  const onDelete = (id: string) => {
    const selectedRow = store?.getRow(TABLE_NAME, id);
    if (!selectedRow) {
      return;
    }
    store?.delRow(TABLE_NAME, id);
  };

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={Object.entries(notes)}
        keyExtractor={([id]) => id}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: [id, note] }) => {
          return (
            <ThemedView style={styles.listItem}>
              <ThemedView>
                <Pressable
                  onPress={() => toggleComplete(id)}
                  style={styles.titleContainer}
                >
                  <ThemedText
                    style={[
                      styles.title,
                      (note[DONE_CELL] as boolean) && styles.completed,
                    ]}
                  >
                    {note[TEXT_CELL]}
                  </ThemedText>
                </Pressable>
                <ThemedText style={styles.time}>
                  {formatDate(note[DATE_CELL] as string)}
                </ThemedText>
              </ThemedView>

              <Pressable onPress={() => onDelete(id)} style={styles.deleteButton}>
                <ThemedText style={styles.deleteIcon}>❌</ThemedText>
              </Pressable>
            </ThemedView>
          );
        }}
      />
    </View>
  );
}

export default function HomeScreen() {
  const [note, setNote] = useState('');
  const store = useCreateMergeableStore(() => createMergeableStore());

  // useCreatePersister(
  //   store,
  //   (store) => createExpoSqlitePersister(store, SQLite.openDatabaseSync('notes.db')),
  //   [],
  //   //@ts-ignore
  //   (persister) => persister.load().then(persister.startAutoSave),
  // );

  useEffect(() => {
    const persister = createExpoSqlitePersister(
      store,
      SQLite.openDatabaseSync(`${TABLE_NAME}.db`),
    );

    persister.load().then(persister.startAutoSave);

    return () => {
      persister.stopAutoSave();
    };
  }, [store]);

  useProvideStore(TABLE_NAME, store);

  const handleAddNote = () => {
    const noteId = generatedId();

    const newNote = {
      [TEXT_CELL]: note.trim(),
      [DATE_CELL]: `${new Date()}`,
      [DONE_CELL]: false,
    };
    store?.setRow(TABLE_NAME, noteId, newNote);
    setNote('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title" style={styles.screenTitle}>
        Notes
      </ThemedText>

      <View style={styles.inputContainer}>
        <MultilineTextInput
          placeholder="Type your note here..."
          value={note}
          onChangeText={setNote}
        />

        <StyledButton
          title="Add Note"
          onPress={handleAddNote}
          disabled={!note.trim()}
          buttonStyle={{
            backgroundColor: '#272727',
          }}
          textStyle={{ fontSize: 18 }}
        />
      </View>

      <NoteList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 0,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    marginTop: 20,
    textAlign: 'left',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    // backgroundColor: '#F5F5F5', // Ensure background color is set
    // Add shadow properties to the view box
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 8,
  },
  screenTitle: {
    textAlign: 'left',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888', // Faded color when completed
  },
  time: {
    fontSize: 12,
    // color: '#666',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  deleteButton: {
    padding: 6,
  },
  deleteIcon: {
    fontSize: 10,
    color: 'maroon',
  },
});
