import React from 'react'
import { render } from '@testing-library/react'

import { Balance, componentId, BalanceProps } from './Balance'

jest.mock('wallet/components/TokenRow/TokenRow', () => ({ TokenRow: () => <div/> }))

describe('Balance', () => {
  let outputSpy: jest.Mock
  let component: React.ReactElement<BalanceProps>

  beforeEach(() => {
    outputSpy = jest.fn()
    component = (
      <Balance
        amounts={{ NEAR: 2 }}
        rates={{ NEAR: 1 }}
        tokens={['NEAR']}
        tokensRecord={{ NEAR: { id: 1, name: 'test', symbol: 'TST' } }}
        onSelectToken={jest.fn()}
      />
    )
  })

  it('should render component', () => {
    const { getByTestId } = render(component)

    expect(getByTestId(componentId)).toBeInTheDocument()
  })
})
