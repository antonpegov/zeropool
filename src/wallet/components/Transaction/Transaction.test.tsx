import React from 'react'
import { render } from '@testing-library/react'
import { useSnackbar } from 'notistack'

import { Transaction, componentId, TransactionProps } from './Transaction'

jest.mock('notistack', () => ({ useSnackbar: jest.fn() }))
jest.mock('shared/helpers/address.helper', () => {
  return {
    beautifyAmount: jest.fn(),
    beautifyAddress: jest.fn(),
  }
})

const useSnackbarMock = useSnackbar as jest.Mock
const tr1: any = {
  status: 0,
  amount: '0.21',
  from: '0xA646dc3DD68338Ee960eA131cfc798D9bF66070d',
  to: '0xedd09e322B0b741508f72A5d2613B17C2f96891d',
  timestamp: 1616329084,
  blockHash: '0x36ee558c0e10023ad3c2de8ee5fc6ee369809920edbe3fbbd7009a2f25d4c5a3',
  hash: '0x084d420dbc7cce7c756b19213f5b4b42b2b179c495d50a45514d0c0219d8b879',
}
const wallet = {
  address: '123',
  token: {
    symbol: 'BTC',
  },
}

describe('Transaction', () => {
  let outputSpy: jest.Mock
  let component: React.ReactElement<TransactionProps>

  beforeEach(() => {
    outputSpy = jest.fn()
    useSnackbarMock.mockImplementation(() => ({ enqueueSnackbar: jest.fn() }))
    component = <Transaction transaction={tr1} address={wallet.address as any} />
  })

  it('should render component', () => {
    const { getByTestId } = render(component)

    expect(getByTestId(componentId)).toBeInTheDocument()
  })
})
