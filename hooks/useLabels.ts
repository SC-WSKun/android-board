import { useGlobal } from '@/store/globalContext'
import { useState } from 'react'
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
  const [goalSeq, setGoalSeq] = useState(0)
  const global = useGlobal()
  const encoder = new TextEncoder()
  const getLabels = async () => {
    return global.callService('/nav2_extended/get_labels')
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
    return global.callService('/nav2_extended/label_goal_pose', labelNavData)
  }
  return {
    getLabels,
    navigateToLabel,
  }
}
