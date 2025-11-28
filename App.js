import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Platform, FlatList, Pressable, Image, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* -------------------------------------------------
   ⚡ 저장 키
------------------------------------------------- */
const STORAGE_KEY = 'MY_TODO_LIST_1';

export default function App() {

  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 사진
  const [photo, setPhoto] = useState(null);
  const [editingId, setEditingId] = useState(null);

  /* -------------------------------------------------
     로드 함수
  ------------------------------------------------- */
  const loadTodos = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data !== null) {
        const arr = JSON.parse(data);

        const safeArr = arr.map(item => ({
          ...item,
          date: item.date ?? new Date().toISOString().substring(0, 10),
          completed: item.completed ?? false, // 완료 상태 기본값
        }));

        setTodos(safeArr);
      }
    } catch (e) {
      console.log('로딩 오류', e);
    } finally {
      setIsLoaded(true);
    }
  };

  /* -------------------------------------------------
     저장 함수
  ------------------------------------------------- */
  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.log('저장 오류', e);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (isLoaded) saveTodos();
  }, [todos]);

  /* -------------------------------------------------
      날짜 포맷
  ------------------------------------------------- */
  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  /* -------------------------------------------------
      추가
  ------------------------------------------------- */
  const addTodo = () => {
    if (!text.trim()) return;

    const newTodo = {
      id: Date.now().toString(),
      title: text.trim(),
      date: formatDate(date),
      photo,
      completed: false,
    };

    setTodos([newTodo, ...todos]);

    setText('');
    setPhoto(null);
  };

  /* -------------------------------------------------
      수정 시작
  ------------------------------------------------- */
  const startEdit = (item) => {
    setEditingId(item.id);
    setText(item.title);

    if (!item.date) {
      setDate(new Date());
    } else {
      const safeDateStr = item.date.replace(/-/g, '/');
      const parsed = new Date(safeDateStr);
      setDate(isNaN(parsed.getTime()) ? new Date() : parsed);
    }

    setPhoto(item.photo);
  };

  /* -------------------------------------------------
      수정 완료
  ------------------------------------------------- */
  const updateTodo = () => {
    setTodos(
      todos.map(item =>
        item.id === editingId
          ? { ...item, title: text, date: formatDate(date), photo }
          : item
      )
    );

    setEditingId(null);
    setText('');
    setPhoto(null);
  };

  /* -------------------------------------------------
      삭제
  ------------------------------------------------- */
  const removeTodo = (id) => {
    setTodos(todos.filter(item => item.id !== id));
  };

  /* -------------------------------------------------
      완료 토글
  ------------------------------------------------- */
  const toggleComplete = (id) => {
    setTodos(
      todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  /* -------------------------------------------------
      날짜 변경
  ------------------------------------------------- */
  const changeDate = (e, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  };

  /* -------------------------------------------------
      사진 촬영
  ------------------------------------------------- */
  const getPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  /* -------------------------------------------------
      갤러리 사진 선택
  ------------------------------------------------- */
  const getGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  /* -------------------------------------------------
      미완료 / 완료 리스트 분리
  ------------------------------------------------- */
  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  /* -------------------------------------------------
      렌더링
  ------------------------------------------------- */
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Todo List</Text>

      <View style={styles.inputR}>

        <TextInput
          style={styles.in}
          placeholder="할 일 입력"
          value={text}
          onChangeText={setText}
        />

        <Pressable onPress={() => setShowPicker(true)} style={styles.dateBtn}>
          <Text>{formatDate(date)}</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRow}>
          
          <Pressable style={styles.actionMainBtn} onPress={editingId ? updateTodo : addTodo}>
            <Text style={styles.actionMainText}>
              {editingId ? "수정완료" : "추가"}
            </Text>
          </Pressable>

          <Pressable style={styles.actionSubBtn} onPress={getPhoto}>
            <Text style={styles.actionSubText}>사진 촬영</Text>
          </Pressable>

          <Pressable style={styles.actionSubBtn} onPress={getGallery}>
            <Text style={styles.actionSubText}>사진 선택</Text>
          </Pressable>

        </ScrollView>

      </View>

      {/* 수정 모드 사진 크게보기 */}
      {editingId && photo && (
        <View style={styles.bigImageWrap}>
          <Image source={{ uri: photo }} style={styles.bigImage} />
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={changeDate}
        />
      )}

      {/* 🔥 미완료 리스트 */}
      <FlatList
        data={pendingTodos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          pendingTodos.length > 0 ? 
            <Text style={styles.sectionTitle}>할 일</Text> 
            : null
        }
        renderItem={({ item, index }) => (
          <View style={styles.list}>
            
            {/* 체크박스 */}
            <Pressable 
              onPress={() => toggleComplete(item.id)} 
              style={styles.checkBox}
            >
              <Text style={styles.checkText}>
                {item.completed ? "✓" : ""}
              </Text>
            </Pressable>

            {/* 텍스트 */}
            <View style={styles.centerCol}>
              <Text style={[
                styles.todoTitle, 
                item.completed && styles.completedText
              ]}>
                {item.title}
              </Text>

              <Text style={[
                styles.date,
                item.completed && styles.completedDate
              ]}>
                {item.date}
              </Text>
            </View>

            {/* 사진 */}
            {item.photo && (
              <Image 
                source={{ uri: item.photo }} 
                style={[
                  styles.thumbnail,
                  item.completed && { opacity: 0.5 }
                ]}
              />
            )}

            {/* 수정 */}
            <Pressable onPress={() => startEdit(item)}>
              <Text style={styles.editBtn}>수정</Text>
            </Pressable>

            {/* 삭제 */}
            <Pressable onPress={() => setDeleteTargetId(item.id)}>
              <Text style={styles.deleteBtn}>삭제</Text>
            </Pressable>

          </View>
        )}
      />

      {/* 🔥 완료 리스트 */}
      {completedTodos.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>완료된 항목</Text>

          {completedTodos.map(item => (
            <View key={item.id} style={styles.completedItem}>
              <Text style={styles.completedTextItem}>✓ {item.title}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 삭제 모달 */}
      {deleteTargetId && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>정말 삭제할까요?</Text>

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setDeleteTargetId(null)}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.modalDelete}
                onPress={() => {
                  removeTodo(deleteTargetId);
                  setDeleteTargetId(null);
                }}
              >
                <Text style={styles.modalDeleteText}>삭제</Text>
              </Pressable>
            </View>

          </View>
        </View>
      )}

    </View>
  );
}


/* -------------------------------------------------
   스타일
------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40, backgroundColor: 'white' },
  title: { fontSize: 40, marginBottom: 20, textAlign: 'center' },

  inputR: {
    width: '90%', paddingHorizontal: 16, alignItems: 'center',
  },

  in: {
    height: 46,
    width: '100%',
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    borderRadius: 12,
    color: 'black',
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },

  dateBtn: {
    padding: 8, backgroundColor: '#eee', borderRadius: 8,
    marginTop: 10, alignItems: 'center', width: '100%',
  },

  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },

  actionMainBtn: {
    backgroundColor: 'skyblue',
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 8, marginRight: 8,
  },

  actionMainText: { color: 'white', fontSize: 15, fontWeight: '600' },

  actionSubBtn: {
    backgroundColor: '#f3f3f3', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginRight: 8,
  },

  actionSubText: { fontSize: 14, color: '#333' },

  list: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 12,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  checkText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },

  centerCol: {
    flex: 1,
  },

  todoTitle: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  date: { 
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#f3f3f3',
    alignSelf: 'flex-start',
    borderRadius: 12,
  },

  completedDate: {
    backgroundColor: '#eaeaea',
    color: '#aaa',
  },

  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: 10,
    backgroundColor: '#eee',
  },

  editBtn: {
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 12,
    fontSize: 14,
  },

  deleteBtn: {
    color: '#FF4D4D',
    fontWeight: '600',
    marginLeft: 12,
    fontSize: 14,
  },

  bigImageWrap: {
    width: '90%',
    height: 250,
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee'
  },

  bigImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 20,
    color: '#444',
  },

  completedSection: {
    marginTop: 25,
    width: '90%',
    alignSelf: 'center',
    paddingBottom: 40,
  },

  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },

  completedItem: {
    paddingVertical: 8,
  },

  completedTextItem: {
    fontSize: 15,
    color: '#777',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '75%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },

  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginRight: 8,
  },

  modalCancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },

  modalDelete: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FF4D4D',
    borderRadius: 10,
    marginLeft: 8,
  },

  modalDeleteText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
});
