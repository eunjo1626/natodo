import React, {useState} from 'react'
import { StyleSheet, Text, View, TextInput,
    Platform, FlatList, Pressable,
 } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState( new Date()) // 현재날짜 기초값 
  const [showPicker, setShowPicker] = useState(false) // 피커보여주기

  // 날짜 형식 만들기
  const formatDate = (d) =>{
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` // 날짜 형식 맞추어서 리턴
  }

  // 추가 버튼 구현
  const addTodo = () =>{
    if (!text.trim()) return

    const newTodo = {
      id : Date.now().toString(),
      title : text.trim(),
      date : formatDate(date)
    }
    setTodos([newTodo, ...todos])
    setText('')
  }

  // 삭제 버튼 구현
  const removeTodo = (id)=>{
      setTodos( todos.filter( (item) => item.id !== id) )
  }

  // 날짜 변경시 이벤트 함수
  const changeDate = (e, chdate ) =>{
    if (Platform.OS === 'android' ){
      setShowPicker(false)
    }
    if (chdate) {
      setDate(chdate)
    }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputR}>

        {/* 할일 입력상자 */}
        <TextInput style={styles.in} placeholder='할일 입력'
          value={text}
          onChangeText={setText}
        />

        {/* 날짜 버튼 만들기*/}
        <Pressable onPress={ () => setShowPicker(true)} style={styles.dateBtn}> 
          <Text>{formatDate(date)}</Text>
        </Pressable>

        {/* 추가버튼 만들기 */}
        <Pressable  style={styles.addbtn} onPress={addTodo}>
          <Text style={styles.addtext}>추가</Text>
        </Pressable>
      </View>

      { 
        //  showpicker가 참(true)값이면 데이트피커를 호출해서 보여주기
          showPicker && (
            <DateTimePicker 
                value={date} 
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={changeDate}
            />

          )
      }


      {/* 할일 목록 리스트  */}
      <FlatList 
         data = {todos}
         keyExtractor={ (item) => item.id }
         ListEmptyComponent={
           <Text>할일이 없어요</Text>
         }
         renderItem={ ({item, index}) => (
            <Pressable onLongPress={ () => removeTodo(item.id)} style={styles.list} >
               <Text style={styles.num}>{index + 1}</Text>
               <Text style={styles.todoTitle}>{item.title}</Text>
               <Text style={styles.date}>{item.date}</Text>
               <Text style={styles.hint}> 길게 눌러서 삭제</Text>
            </Pressable>
         )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop : 40,
    backgroundColor: 'white',
  },
  title : {
    fontSize : 30,
    marginBottom : 20,
    textAlign : 'center'
  },
  inputR : {
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'center',
    paddingHorizontal : 16,
    marginBottom : 20,
  },

  in : {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: "lightGray",
      paddingHorizontal: 12,
      borderRadius: 10,
      marginRight: 10,
  },

  dateBtn: {
  paddingHorizontal: 10,
  paddingVertical: 8,
  backgroundColor: '#eee',
  borderRadius: 8,
  marginRight: 10,
},

  addbtn : {
    width : 80,
    height : 40,
    backgroundColor : "green",
    color : "white",
    justifyContent : 'center',
    alignItems : 'center',
    borderRadius : 7,
  },

  addtext : {
    fontSize : 20,
    color : 'white',
  },
  list: {
   width: '90%',     // 이제 정상 작동
  alignSelf: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  marginBottom: 10,
  backgroundColor: 'white',
  borderRadius: 8,
},

num: {
  width: 30,
  textAlign: 'center',
  fontSize: 16,
  fontWeight: 'bold',
},

todoTitle: {
  flex: 1,
  fontSize: 16,
  marginHorizontal: 8,
  
},

date: {
  width: 90,
  fontSize: 12,
  textAlign: 'right',
},

hint: {
  fontSize: 10,
  marginLeft: 10,
  color: '#888',
},
});