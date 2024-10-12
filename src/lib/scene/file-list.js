import SparkMD5 from 'spark-md5'
import { computed } from 'vue'

import {
  downArrow,
  fileButton,
  folderButton,
  previousFolder,
  upArrow,
} from '@/lib/scene/file-list-buttons'
import { useButtonStore } from '@/stores/buttons'
import { useCncStore } from '@/stores/cnc'
import { useFileListStore } from '@/stores/file-list'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'

const mergeConfigs = (...configs) => {
  const config = Object.assign(...configs)
  addKey(config)
  return config
}

const addKey = (config) => {
  config['key'] = SparkMD5.hash(JSON.stringify(config))
  return config
}

export const useFileList = () => {
  const ui = useUiStore()
  const cnc = useCncStore()
  const gcode = useGcodeStore()
  const { buttons: buttonConfig } = useButtonStore()
  const fileList = useFileListStore()

  const rows = ui.rows
  const columns = ui.columns

  const buildFileButton = (filename, file) => {
    const fullPath = [fileList.path, filename].filter(Boolean).join('/')
    const selected = fullPath === gcode.name
    const configButton = buttonConfig.fileListFile ?? {}
    const activeActions = cnc.idle
      ? [
          {
            action: 'loadFile',
            arguments: [fullPath],
            event: 'up',
          },
          {
            action: 'backScene',
            event: 'up',
          },
        ]
      : []

    const defaultButton = {
      ...fileButton,
      text: filename,
      bgColor: selected || !cnc.idle ? 8 : 5,
      actions: [
        {
          action: 'fileDetails',
          arguments: [fullPath, file],
          event: 'hold',
        },
        ...activeActions,
      ],
    }
    return mergeConfigs(defaultButton, configButton, {
      text: defaultButton.text,
      actions: defaultButton.actions,
      name: 'fileListFile',
    })
  }
  const buildFolderButton = (path) => {
    const configButton = buttonConfig.fileListFolder ?? {}

    const defaultButton = {
      ...folderButton,
      text: path,
      actions: [
        {
          action: 'loadFolder',
          arguments: [path],
          event: 'up',
        },
      ],
    }
    return mergeConfigs(defaultButton, configButton, {
      text: defaultButton.text,
      actions: defaultButton.actions,
      name: 'fileListFolder',
    })
  }

  const buildPreviousFolder = () => {
    const configButton = buttonConfig.fileListPreviousFolder ?? {}
    const defaultButton = {
      ...previousFolder,
      text: '..',
      icon: 'default/small_folder_open_back.png',
      textAlignment: 'bottom center',
      bgColor: 4,
      disabled: (!fileList.path).toString(),
      actions: [
        {
          action: 'previousFolder',
          event: 'up',
        },
      ],
    }
    return mergeConfigs(defaultButton, configButton, {
      text: defaultButton.text,
      actions: defaultButton.actions,
      name: 'fileListPreviousFolder',
    })
  }
  const buildUpArrow = () => {
    const configButton = buttonConfig.fileListUpArrow ?? {}

    const defaultButton = {
      ...upArrow,
      actions: [{ action: 'fileListScrollUp' }],
      disabled: (fileList.rowOffset === 0).toString(),
    }
    return mergeConfigs(defaultButton, configButton, {
      actions: defaultButton.actions,
      name: 'fileListUpArrow',
    })
  }

  const buildDownArrow = () => {
    const configButton = buttonConfig.fileListDownArrow ?? {}
    const firstRowColumnsReserved = 3
    const columnsReserved = 1
    const visibleColumns = columns - columnsReserved

    const pages =
      1 +
      Math.ceil(
        (fileList.files.length - (columns - firstRowColumnsReserved)) /
          visibleColumns,
      )

    const defaultButton = {
      ...downArrow,
      actions: [{ action: 'fileListScrollDown' }],
      disabled: (fileList.rowOffset + rows >= pages).toString(),
    }
    return mergeConfigs(defaultButton, configButton, {
      name: 'fileListDownArrow',
      actions: defaultButton.actions,
    })
  }

  const sortMethod = computed(() => {
    let comparitor

    const defaultSort = (a, b) => a.name.localeCompare(b.name)

    switch (ui.fileDetailsSort) {
      case 'alpha_asc':
        comparitor = defaultSort
        break
      case 'alpha_desc':
        comparitor = (a, b) => b.name.localeCompare(a.name)
        break
      case 'modified_desc':
        comparitor = (a, b) => Date.parse(b.mtime) - Date.parse(a.mtime)
        break
      case 'created_desc':
        comparitor = (a, b) => Date.parse(b.ctime) - Date.parse(a.ctime)
        break
      default:
        comparitor = defaultSort
    }

    return (a, b) =>
      (a.type === 'd' ? -1 : 1) - (b.type === 'd' ? -1 : 1) || comparitor(a, b)
  })

  const allButtons = computed(() => {
    const sortedFiles = [...fileList.files]
    sortedFiles.sort(sortMethod.value)
    const files = sortedFiles.map((file) => {
      if (file.type === 'd') {
        return buildFolderButton(file.name)
      } else {
        return buildFileButton(file.name, file)
      }
    })

    const list = [[null]]
    list[0].push(buildPreviousFolder())
    let reserved = 3
    let row = 0

    while (files.length) {
      list[row] ??= []
      const existing = list[row].length
      list[row].splice(existing, 0, ...files.splice(0, columns - reserved))
      row++
      reserved = 1
    }

    return list
  })

  const buttons = computed(() => {
    if (!allButtons) {
      return []
    }

    const pagedList =
      allButtons.value.slice(fileList.rowOffset, fileList.rowOffset + rows) ||
      []
    pagedList[0] = [...pagedList[0]]
    pagedList[0][0] = buttonConfig.back
    pagedList[0][columns - 1] = buildUpArrow()
    if (rows > 2) {
      pagedList[1] = pagedList.length > 1 ? [...pagedList[1]] : []
      pagedList[1][columns - 1] = buttonConfig.sortScene
    }
    pagedList[rows - 1] =
      pagedList.length === rows ? [...pagedList[rows - 1]] : []
    pagedList[rows - 1][columns - 1] = buildDownArrow()
    return pagedList
  })

  const loadFiles = () => {
    if (!fileList.loaded) {
      fileList.loadFiles()
    }
  }

  return {
    buttons,
    loadFiles,
  }
}
