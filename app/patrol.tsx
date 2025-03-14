import { MapSelectView } from '@/components/MapSelectView'
import { TaskView } from '@/components/TaskView'
import ImageContainer from '@/components/ui/ImageContainer'
import { useRobotTaskContext } from '@/store/task.slice'

export default function TaskScreen() {
  const { taskView, updateTaskView } = useRobotTaskContext()
  const renderView = () => {
    switch (taskView) {
      case 'map-list':
        return (
          <MapSelectView
            nextView={() => {
              updateTaskView('task-list')
            }}
          />
        )
      case 'task-list':
        return <TaskView />
      default:
        return <></>
    }
  }

  return <ImageContainer>{renderView()}</ImageContainer>
}
