import { callService } from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { useRobotTaskContext } from '@/store/task.slice'
import { useEffect } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useDispatch } from 'react-redux'
export function TaskView() {
  const dispatch = useDispatch<AppDispatch>()
  const { taskList, updateTaskList } = useRobotTaskContext()

  const handleSelectTask = (task: RobotTask) => {
    console.log('Selected task:', task)
  }

  // 渲染地图卡片
  const renderItem = (task: RobotTask) => (
    <TouchableOpacity
      key={task.task_name}
      style={[styles.card]}
      onPress={() => {
        handleSelectTask(task)
      }}
    >
      <Icon
        name='map-marker'
        size={30}
        color='#007bff'
        style={styles.cardIcon}
      />
      <Text style={styles.cardTitle}>{task.task_name}</Text>
    </TouchableOpacity>
  )

  const getTaskList = async () => {
    try {
      const res: any = await dispatch(
        callService('/nav2_extended/get_patrol_tasks', {}),
      )
      if (res?.result === true) {
        updateTaskList(res.tasks ?? [])
      } else {
        throw new Error('获取任务列表失败')
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    getTaskList()
  }, [])

  return (
    <View style={styles.taskView}>
      <Text style={styles.title}>请选择您想执行的巡检任务</Text>
      <View style={styles.gridContainer}>
        {taskList.map(item => renderItem(item))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  taskView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    gap: '5%',
    padding: 48,
  },
  card: {
    width: '30%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 30,
    marginBottom: 30,
    elevation: 3, // 添加阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#e0e0e0', // 图标的背景颜色
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
})
