import { callService } from '@/store/foxgloveTrunk'
import { AppDispatch } from '@/store/store'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { TextEncoder } from 'text-encoding'

export type PositionLabel = {
  label_name: string
  pose: {
    position: {
      x: number
      y: number
      z: number
    }
    orientation: {
      x: number
      y: number
      z: number
      w: number
    }
  }
}

export function useLabels() {
  const dispatch = useDispatch<AppDispatch>()
  const [goalSeq, setGoalSeq] = useState(0)
  const encoder = new TextEncoder()
  const getLabels = async () => {
    return dispatch(callService('/nav2_extended/get_labels'))
  }

  const navigateToLabel = async (label: PositionLabel) => {
    const newGoalSeq = goalSeq + 1
    const encode_label_name = encoder.encode(label.label_name).toString()
    console.log('encode:', encode_label_name)
    const labelNavData = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() / 1000) * 1000000,
        },
        frame_id: 'map',
      },
      label_name: encode_label_name,
    }
    setGoalSeq(newGoalSeq)
    return dispatch(callService('/nav2_extended/label_goal_pose', labelNavData))
  }
  return {
    getLabels,
    navigateToLabel,
  }
}
