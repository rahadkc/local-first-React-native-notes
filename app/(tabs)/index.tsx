import {
  Alert,
  FlatList,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';

import { MultilineTextInput } from '@/components/MultiLineTextInput';
import { StyledButton } from '@/components/StyledButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/databases/firebase-config';
import { formatDate } from '@/scripts/utils';
import * as SQLite from 'expo-sqlite';
import { onValue, ref, remove, set, update } from 'firebase/database';
import { memo, useEffect, useState } from 'react';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMergeableStore } from 'tinybase/mergeable-store';
import { createExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

const generatedId = () => `note-${Date.now()}`;

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

  useEffect(() => {
    const notesRef = ref(db, TABLE_NAME);

    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        store?.setTable(TABLE_NAME, data);
        return;
      }
      store?.delTable(TABLE_NAME);
    });

    return () => unsubscribe();
  }, [store]);

  useProvideStore(TABLE_NAME, store);

  const handleAddNote = async () => {
    const noteId = generatedId();

    const newNote = {
      [TEXT_CELL]: note.trim(),
      [DATE_CELL]: `${new Date()}`,
      [DONE_CELL]: false,
    };

    try {
      await set(ref(db, `${TABLE_NAME}/${noteId}`), newNote);
      store?.setRow(TABLE_NAME, noteId, newNote);
      setNote('');
    } catch (_error) {
      Alert.alert('Error', 'Failed to add note', [{ text: 'OK' }]);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      handleAddNote();
    }
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
          // onKeyPress={handleKeyPress}
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

      <GestureHandlerRootView>
        {/* <NoteList /> */}
        <MemorizedNoteList />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const MemorizedNoteList = memo(function NoteList() {
  const store = useStore(TABLE_NAME);
  const notes = useTable(TABLE_NAME, store);

  const toggleComplete = async (id: string) => {
    const selectedRow = store?.getRow(TABLE_NAME, id);
    if (!selectedRow) {
      return;
    }
    // store?.setRow(TABLE_NAME, id, {
    //   ...selectedRow,
    //   [DONE_CELL]: !selectedRow[DONE_CELL],
    // });
    try {
      await update(ref(db, `${TABLE_NAME}/${id}`), { done: !selectedRow[DONE_CELL] });
      store?.setCell(TABLE_NAME, id, DONE_CELL, !selectedRow[DONE_CELL]);
    } catch (_error) {
      Alert.alert('Error', 'Failed to update note', [{ text: 'OK' }]);
    }
  };
  const onDelete = async (id: string) => {
    const selectedRow = store?.getRow(TABLE_NAME, id);
    if (!selectedRow) {
      return;
    }
    try {
      store?.delRow(TABLE_NAME, id);
      await remove(ref(db, `${TABLE_NAME}/${id}`));
    } catch (_error) {
      Alert.alert('Error', 'Failed to delete note', [{ text: 'OK' }]);
    }
  };

  // Render delete action on swipe
  const renderRightActions = (id: string) => (
    <Pressable onPress={() => onDelete(id)} style={styles.delButton}>
      <ThemedText style={styles.deleteText}>Delete</ThemedText>
    </Pressable>
  );

  const sortedArray = Object.entries(notes).sort(
    (a, b) => Number(b[0].split('-')[1]) - Number(a[0].split('-')[1]),
  );

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={sortedArray}
        keyExtractor={([id]) => id}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: [id, note] }) => {
          return (
            <Swipeable
              renderRightActions={() => renderRightActions(id)}
              // renderLeftActions={() => renderLeftActions(item.id)}
              dragOffsetFromLeftEdge={10}
              containerStyle={{
                flex: 1,
                backgroundColor: '#fbfbfb',
                marginBottom: 2,
              }}
              childrenContainerStyle={{
                backgroundColor: 'blue',
                height: '100%',
              }}
            >
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
            </Swipeable>
          );
        }}
      />
    </View>
  );
});

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
    columnGap: 10,
    // gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    // marginBottom: 10,
    // backgroundColor: 'pink', // Ensure background color is set
    // Add shadow properties to the view box
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    // height: 80,
    // height: '100%',
    // position: 'relative',
    // borderRadius: 8,
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
  delButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  bookmarkButton: {
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
