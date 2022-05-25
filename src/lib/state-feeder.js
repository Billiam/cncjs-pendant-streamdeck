import { useCncStore } from '@/stores/cnc'

export default (socket) => {
  const cnc = useCncStore()

  socket.on('Grbl:state', (data) => {
    const { wpos, mpos } = data.status
    const { modal } = data.parserstate

    cnc.setWpos(wpos)
    cnc.setMpos(mpos)
    cnc.setModal(modal)
  })
}
