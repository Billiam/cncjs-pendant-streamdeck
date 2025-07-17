<script>
import { storeToRefs } from 'pinia'
import { computed, inject, watch } from 'vue'

import { useConnectionStore } from '@/stores/connection'

import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
</script>

<script setup>
import { useCncStore } from '@/stores/cnc'

const connection = useConnectionStore()
const cnc = useCncStore()

const baudOptions = [250000, 115200, 76800, 57600, 38400, 19200, 9600, 2400]
const {
  accessTokenExpiration,
  baudRate,
  controllerType,
  port,
  secure,
  socketAddress,
  socketPort,
  _ports: ports,
} = storeToRefs(connection)

const container = inject('container')

const { connecting, connected, socketConnected } = storeToRefs(cnc)

watch(
  [socketAddress, socketPort, secure],
  async ([addressValue, portValue, secureValue]) => {
    const currentConfig = await container.get('connectionConfig')
    const bootstrap = await container.get('bootstrap')

    currentConfig.socketAddress = addressValue
    currentConfig.socketPort = portValue
    currentConfig.secure = secureValue

    container.remove('connectionConfig')
    container.register('connectionConfig', currentConfig, { type: 'static' })

    const connection = await container.get('connection')
    connection.updateConfig(currentConfig)

    await bootstrap.linkCncApi()

    connection.reconnect()
  },
)
watch(
  [port, baudRate, controllerType],
  async ([portValue, baudRateValue, controllerTypeValue]) => {
    const currentConfig = await container.get('connectionConfig')
    currentConfig.port = portValue
    currentConfig.baudRate = baudRateValue
    currentConfig.controllerType = controllerTypeValue

    container.remove('connectionConfig')
    container.register('connectionConfig', currentConfig, { type: 'static' })

    const connection = await container.get('connection')
    connection.closeSerialPort()

    connection.updateConfig(currentConfig)

    connection.openSerialPort()
  },
)

const socketUrl = computed(() => {
  return `ws${secure.value ? 's' : ''}://${socketAddress.value}:${
    socketPort.value
  }`
})
const booleanOptions = [
  { value: true, label: 'true' },
  { value: false, label: 'false' },
]

const expirationOptions = [
  { label: 'hours', value: 'h' },
  { label: 'days', value: 'd' },
  { label: 'years', value: 'y' },
]
const expirationType = computed({
  get() {
    const type = accessTokenExpiration.value.match(/[dhy]$/)
    return type ? type[0] : 'd'
  },
  set(value) {
    accessTokenExpiration.value = `${expirationQuantity.value}${value}`
  },
})
const expirationQuantity = computed({
  get() {
    return parseInt(accessTokenExpiration.value)
  },
  set(value) {
    accessTokenExpiration.value = `${value}${expirationType.value}`
  },
})
</script>

<template>
  <Fieldset legend="Server">
    <div class="flex-row form-columns">
      <div>
        <div class="flex-row">
          <label for="cnc_socketPort" class="label">Socket address</label>
          <div class="current-url">
            {{ socketUrl }}
          </div>
        </div>
        <InputText
          :value="socketAddress"
          @change="(event) => (socketAddress = event.target.value)"
        ></InputText>

        <label for="cnc_socketPort" class="label">Socket port</label>
        <InputNumber
          :useGrouping="false"
          :min="0"
          v-model="socketPort"
        ></InputNumber>

        <label for="cnc_secure" class="label">Use SSL</label>
        <SelectButton
          :options="booleanOptions"
          optionValue="value"
          optionLabel="label"
          v-model="secure"
        ></SelectButton>

        <label for="cnc_secure" class="label">Access token expiration</label>
        <InputGroup>
          <InputNumber
            :useGrouping="false"
            :min="0"
            v-model="expirationQuantity"
          ></InputNumber>

          <SelectButton
            :options="expirationOptions"
            optionValue="value"
            optionLabel="label"
            v-model="expirationType"
          ></SelectButton>
        </InputGroup>
      </div>

      <div class="status">
        <img
          v-if="!socketConnected"
          class="status-icon icon-bad"
          src="icons/fluent-ui/plug_disconnected.png "
        />

        <img
          v-if="socketConnected"
          class="status-icon icon-ok"
          src="icons/system-uicons/lightning.png"
        />
      </div>
    </div>
  </Fieldset>

  <Fieldset legend="Serial connection">
    <div class="flex-row form-columns">
      <div>
        <label for="cnc_port" class="label">Serial port</label>
        <Select
          id="cnc_port"
          :options="ports"
          optionValue="port"
          optionLabel="port"
          filterable
          editable
          v-model="port"
        >
          <template #option="slotProps">
            <div>
              <div>{{ slotProps.option.port }}</div>
              <div v-if="slotProps.option.manufacturer" class="manufacturer">
                Manufacturer: {{ slotProps.option.manufacturer }}
              </div>
            </div>
          </template>
        </Select>

        <label for="cnc_baudRate" class="label">Baud rate</label>
        <Select :options="baudOptions" v-model="baudRate"></Select>
      </div>

      <div class="status">
        <img
          v-if="!connected"
          class="status-icon icon-bad"
          src="icons/fluent-ui/plug_disconnected.png "
        />

        <img
          v-if="connected"
          class="status-icon icon-ok"
          src="icons/system-uicons/lightning.png"
        />
      </div>
    </div>
  </Fieldset>
</template>

<style scoped>
.current-url {
  margin-left: 1rem;
}
.status-icon {
  max-width: 100px;
  border-radius: 50%;
}
.icon-bad {
  background-color: #b71138;
}
.icon-ok {
  background-color: #06d6a0;
}
.status {
}
.form-columns {
  justify-content: space-between;
}
.manufacturer {
  font-style: italic;
}
</style>
