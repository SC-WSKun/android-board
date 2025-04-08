/**
 * 四元数
 */
type Quaternion = {
  w: number
  x: number
  y: number
  z: number
}

type RobotMap = {
  map_name: string
  map_type: number
  nav_mode: number
}

/**
 * /tiered_nav_state_machine/get_grid_map返回的数据类型
 * 目前只使用了info中的MapInfo信息渲染地图
 */
type GridMap = {
  data: Uint8Array
  header: {
    frame_id: string
    stamp: {
      nanosec: number
      sec: number
    }
  }
  info: MapInfo
}

/**
 * 地图信息
 */
type MapInfo = {
  width: number
  height: number
  resolution: number
  origin: {
    position: {
      x: number
      y: number
      z: number
    }
    orientation: Quaternion
  }
  map_load_time: {
    nanosec: number
    sec: number
  }
}

/**
 * 激光点云
 */
type LaserPoint = {
  angle_min: number
  range_min: number
  range_max: number
  ranges: number[]
  angle_increment: number
}

type Transform = {
  rotation: {
    x: number
    y: number
    z: number
    w: number
  }
  translation: {
    x: number
    y: number
    z: number
  }
}

/**
 * 机器人巡检任务
 */
type RobotTask = {
  patrol_points: any[]
  task_name: string
}

/**
 * ros topic header
 */
type Stamp = {
  nesc: number
  sec: number
}

type Header = {
  frame_id: string
  stamp: Stamp
}
