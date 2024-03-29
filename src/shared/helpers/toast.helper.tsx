import React from 'react'
import { useSnackbar, VariantType, WithSnackbarProps } from 'notistack'

interface IProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void
}

type OptionsObject = {
  key?: string
  persist?: boolean
  variant?: VariantType
}

const InnerSnackbarUtilsConfigurator: React.FC<IProps> = (props: IProps) => {
  props.setUseSnackbarRef(useSnackbar())
  return null
}

let useSnackbarRef: WithSnackbarProps
const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps) => {
  useSnackbarRef = useSnackbarRefProp
}

export const toast = {
  success(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'success' })
  },
  warning(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'warning' })
  },
  info(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'info' })
  },
  error(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'error' })
  },
  toast(msg: string, options: OptionsObject = {}) {
    useSnackbarRef.enqueueSnackbar(msg, options)
  },
  close(key: string) {
    useSnackbarRef.closeSnackbar(key)
  }
}

export const SnackbarUtilsConfigurator = () => {
  return <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />
}
