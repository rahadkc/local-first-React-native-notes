// import { Pressable } from "react-native";
// import { ThemedText } from "../ThemedText";
// import { ThemedView } from "../ThemedView";

// function NoteList() {
//     const store = useStore(TABLE_NAME);
//     const notes = useTable(TABLE_NAME, store);

//     const toggleComplete = async (id: string) => {
//       const selectedRow = store?.getRow(TABLE_NAME, id);
//       if (!selectedRow) {
//         return;
//       }
//       // store?.setRow(TABLE_NAME, id, {
//       //   ...selectedRow,
//       //   [DONE_CELL]: !selectedRow[DONE_CELL],
//       // });
//       try {
//         await update(ref(db, `${TABLE_NAME}/${id}`), { done: !selectedRow[DONE_CELL] });
//         store?.setCell(TABLE_NAME, id, DONE_CELL, !selectedRow[DONE_CELL]);
//       } catch (_error) {
//         Alert.alert('Error', 'Failed to update note', [{ text: 'OK' }]);
//       }
//     };
//     const onDelete = async (id: string) => {
//       const selectedRow = store?.getRow(TABLE_NAME, id);
//       if (!selectedRow) {
//         return;
//       }
//       try {
//         store?.delRow(TABLE_NAME, id);
//         await remove(ref(db, `${TABLE_NAME}/${id}`));
//       } catch (_error) {
//         Alert.alert('Error', 'Failed to delete note', [{ text: 'OK' }]);
//       }
//     };

//     // Render delete action on swipe
//     const renderRightActions = (id: string) => (
//       <Pressable onPress={() => onDelete(id)} style={styles.delButton}>
//         <ThemedText style={styles.deleteText}>Delete</ThemedText>
//       </Pressable>
//     );

//     console.log({ notes: Object.entries(notes) });
//     const sortedArray = Object.entries(notes).sort(
//       (a, b) => Number(b[0].split('-')[1]) - Number(a[0].split('-')[1]),
//     );

//     return (
//       <View style={styles.listContainer}>
//         <FlatList
//           data={sortedArray}
//           keyExtractor={([id]) => id}
//           ListFooterComponent={<View style={{ height: 20 }} />}
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item: [id, note] }) => {
//             return (
//               <Swipeable
//                 renderRightActions={() => renderRightActions(id)}
//                 // renderLeftActions={() => renderLeftActions(item.id)}
//                 dragOffsetFromLeftEdge={10}
//                 containerStyle={{
//                   flex: 1,
//                   backgroundColor: '#fbfbfb',
//                   marginBottom: 2,
//                 }}
//                 childrenContainerStyle={{
//                   backgroundColor: 'blue',
//                   height: '100%',
//                 }}
//               >
//                 <ThemedView style={styles.listItem}>
//                   <ThemedView>
//                     <Pressable
//                       onPress={() => toggleComplete(id)}
//                       style={styles.titleContainer}
//                     >
//                       <ThemedText
//                         style={[
//                           styles.title,
//                           (note[DONE_CELL] as boolean) && styles.completed,
//                         ]}
//                       >
//                         {note[TEXT_CELL]}
//                       </ThemedText>
//                     </Pressable>
//                     <ThemedText style={styles.time}>
//                       {formatDate(note[DATE_CELL] as string)}
//                     </ThemedText>
//                   </ThemedView>

//                   <Pressable onPress={() => onDelete(id)} style={styles.deleteButton}>
//                     <ThemedText style={styles.deleteIcon}>❌</ThemedText>
//                   </Pressable>
//                 </ThemedView>
//               </Swipeable>
//             );
//           }}
//         />
//       </View>
//     );
//   }
