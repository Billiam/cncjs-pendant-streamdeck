import { useButtonStore } from '@/stores/buttons'
import { useCncStore } from '@/stores/cnc'
import { useFileListStore } from '@/stores/file-list'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'
import { computed } from 'vue'

export const useFileList = () => {
  const ui = useUiStore()
  const cnc = useCncStore()
  const gcode = useGcodeStore()
  const { buttons: buttonConfig } = useButtonStore()
  const fileList = useFileListStore()

  const rows = ui.rows
  const columns = ui.columns

  const fileButton = (filename, file) => {
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
      text: filename,
      textAlignment: 'bottom center',
      bgColor: selected || !cnc.idle ? 8 : 5,
      icon: 'default/small_document.png',
      actions: [
        {
          action: 'fileDetails',
          arguments: [fullPath, file],
          event: 'hold',
        },
        ...activeActions,
      ],
    }
    return Object.assign(defaultButton, configButton, {
      actions: defaultButton.actions,
    })
  }
  const folderButton = (path) => {
    const configButton = buttonConfig.fileListFolder ?? {}

    const defaultButton = {
      text: path,
      icon: 'default/small_folder.png',
      textAlignment: 'bottom center',
      bgColor: 4,
      actions: [
        {
          action: 'loadFolder',
          arguments: [path],
          event: 'up',
        },
      ],
    }
    return Object.assign(defaultButton, configButton, {
      actions: defaultButton.actions,
    })
  }
  const previousFolder = () => {
    const configButton = buttonConfig.fileListPreviousFolder ?? {}
    const defaultButton = {
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
    return Object.assign(defaultButton, configButton, {
      actions: defaultButton.actions,
    })
  }
  const upArrow = () => {
    const configButton = buttonConfig.fileListUpArrow ?? {}

    const defaultButton = {
      icon: 'fluent-ui/caret_up.png',
      bgColor: 7,
      actions: [{ action: 'fileListScrollUp' }],
      disabled: (fileList.rowOffset === 0).toString(),
    }
    return Object.assign(defaultButton, configButton)
  }

  const downArrow = () => {
    const configButton = buttonConfig.fileListUpArrow ?? {}
    const firstRowColumnsReserved = 3
    const columnsReserved = 1
    const pages =
      1 +
      (fileList.files.length - (columns - firstRowColumnsReserved)) /
        (columns - columnsReserved)
    const defaultButton = {
      icon: 'fluent-ui/caret_down.png',
      bgColor: 7,
      actions: [{ action: 'fileListScrollDown' }],
      disabled: (fileList.rowOffset + columns >= pages).toString(),
    }
    return Object.assign(defaultButton, configButton)
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
        return folderButton(file.name)
      } else {
        return fileButton(file.name, file)
      }
    })

    const list = [[null]]
    list[0].push(previousFolder())
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
    pagedList[0][columns - 1] = upArrow()
    if (rows > 2) {
      pagedList[1] = pagedList.length > 1 ? [...pagedList[1]] : []
      pagedList[1][columns - 1] = buttonConfig.sortScene
    }
    pagedList[rows - 1] =
      pagedList.length === rows ? [...pagedList[rows - 1]] : []
    pagedList[rows - 1][columns - 1] = downArrow()
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
