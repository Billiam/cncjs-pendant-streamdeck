import { useUiStore } from '@/stores/ui'
import { defineStore } from 'pinia'
import { parse } from '@/vendor/gcodetogeometry/gcodetogeometry'
import { useCncStore } from './cnc'
const lazyStore = {
  get cnc() {
    delete this.cnc
    return (this.cnc = useCncStore())
  },
}
export const useGcodeStore = defineStore({
  id: 'gcode',
  state: () => ({
    name: null,
    gcode: null,
  }),
  getters: {
    geometry() {
      if (this.gcode) {
        return Object.freeze(parse(this.gcode.replace(/^%.*/gm, '')))
      }
    },
    dimensions() {
      // translate default size information to mm
      if (!this.geometry) {
        return
      }
      const unit = lazyStore.cnc.distanceUnit

      if (unit === 'in') {
        return this.geometry.size
      }

      const res = {}
      ;['min', 'max'].forEach((dimKey) => {
        res[dimKey] = Object.entries(this.geometry.size[dimKey]).reduce(
          (res, [k, v]) => {
            res[k] = v * 25.4
            return res
          },
          {}
        )
      })
      console.log({ res })
      return Object.freeze(res)
    },
    displayRange() {
      if (!this.dimensions) {
        return
      }
      console.log({ dim: this.dimensions })
      const res = {}
      ;['min', 'max'].forEach((dimKey) => {
        res[dimKey] = Object.entries(this.dimensions[dimKey]).reduce(
          (res, [k, v]) => {
            res[k] = v.toFixed(3)
            return res
          },
          {}
        )
      })
      return Object.freeze(res)
    },
    displayDimensions() {
      if (!this.dimensions) {
        return
      }
      const dimensions = {
        width: (this.dimensions.max.x - this.dimensions.min.x).toFixed(3),
        depth: (this.dimensions.max.y - this.dimensions.min.y).toFixed(3),
        height: (this.dimensions.max.z - this.dimensions.min.z).toFixed(3),
      }
      return Object.freeze(dimensions)
    },
  },
  actions: {
    setLoaded(filename, code) {
      this.name = filename
      this.gcode = code
    },
  },
})