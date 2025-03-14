import { createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'
import { callService } from './foxglove.trunk'

type TaskView = 'map-list' | 'task-list' | 'edit-task'

export interface TaskState {
  taskView: TaskView
  taskList: RobotTask[]
}

const initialState: TaskState = {
  taskView: 'map-list',
  taskList: [],
}

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    addTask(state, action) {
      state.taskList.push(action.payload)
    },
    updateTask(state, action) {
      const index = state.taskList.findIndex(
        task => task.task_name === action.payload.task_name,
      )
      if (index !== -1) {
        state.taskList[index] = action.payload
      }
    },
    deleteTask(state, action) {
      state.taskList = state.taskList.filter(
        task => task.task_name !== action.payload.task_name,
      )
    },
    updateTaskView(state, action) {
      state.taskView = action.payload
    },
    updateTaskList(state, action) {
      state.taskList = action.payload
    },
  },
})

export const {
  addTask,
  updateTask,
  deleteTask,
  updateTaskView,
  updateTaskList,
} = taskSlice.actions
export default taskSlice.reducer

export function useRobotTaskContext() {
  const dispatch = useDispatch()
  const taskView = useSelector((state: RootState) => state.task.taskView)
  const taskList = useSelector((state: RootState) => state.task.taskList)

  return {
    taskView,
    taskList,
    addTask: (task: any) => dispatch(addTask(task)),
    updateTask: (task: any) => dispatch(updateTask(task)),
    deleteTask: (task: any) => dispatch(deleteTask(task)),
    updateTaskView: (view: TaskView) => dispatch(updateTaskView(view)),
    updateTaskList: (taskList: any) => dispatch(updateTaskList(taskList)),
  }
}
