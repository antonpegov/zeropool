import React from 'react'
import { cn } from '@bem-react/classname'
import { Button, Tooltip } from '@mui/material'
import { useSnackbar } from 'notistack'

import './Receive.scss'

import { testIdBuilder } from 'shared/helpers/test/test-id-builder.helper'
import { Token } from 'shared/models'

export const componentId = 'Receive'

const css = cn(componentId)
const test = testIdBuilder(componentId)

export type ReceiveProps = {
  address: string
  privateAddress: string | null
  token: Token
  getPrivateAddress: (_token: Token) => void
}

export const Receive: React.FC<ReceiveProps> = ({
  address,
  token,
  getPrivateAddress,
  privateAddress,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const QRCode = require('qrcode.react')
  const getAddress = () => address || privateAddress || ''
  const handleCodeClick = (): void => {
    if (getAddress()) {
      navigator.clipboard.writeText(getAddress()).then(
        () => {
          enqueueSnackbar('Address copied to the clipboard', {
            variant: 'success',
          })
        },
        (err) => {
          enqueueSnackbar(`Can't access clipboard`, { variant: 'error' })
        },
      )
    }
  }

  return (
    <div className={css()} data-testid={test()}>
      <div className={css('Title')}>Receive {token.symbol}</div>

      <Tooltip title={address || privateAddress || ''} placement="bottom">
        <div className={css('Code')} onClick={handleCodeClick}>
          {address || privateAddress ? (
            <QRCode value={address || privateAddress} data-testid={test('Code')} />
          ) : (
            <Button
              className={css('Button')}
              data-testid={test('Button')}
              onClick={() => getPrivateAddress(token)}
              color="primary"
              variant="contained"
            >
              Generate
            </Button>
          )}
        </div>
      </Tooltip>
    </div>
  )
}
