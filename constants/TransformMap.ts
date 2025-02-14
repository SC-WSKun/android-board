import { TransformState } from '@/store/transformSlice'

export const TRANSFORM_MAP: { [key: string]: keyof TransformState } = {
  imu_link: 'imuLinkToBaseLink',
  laser_link: 'laserLinkToBaseLink',
  left_wheel: 'leftWheelToBaseLink',
  right_wheel: 'rightWheelToBaseLink',
  base_scan: 'baseScanToBaseLink',
  base_link: 'baseLinkToBaseFootprint',
  base_footprint: 'baseFootprintToOdom',
  odom: 'odomToMap',
}
