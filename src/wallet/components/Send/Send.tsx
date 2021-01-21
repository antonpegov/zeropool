import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { cn } from '@bem-react/classname';

import './Send.scss';

import { testIdBuilder } from 'shared/helpers/test/test-id-builder.helper';

import { Wallet } from 'wallet/state/models/wallet';

export const componentId = 'Send';

const css = cn(componentId);
const test = testIdBuilder(componentId);

export type SendProps = { 
  rate: number
  wallet: Wallet
  onNextClick: (address: string, amount: number) => void
}

export const Send: React.FC<SendProps> = ({rate, wallet, onNextClick}) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  }

  const handleAddressPaste = async (event: React.MouseEvent) => {
    const text = await navigator.clipboard.readText();
    setAddress(text);
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  }

  const handleAmountMaximise = (event: React.MouseEvent) => {
    setAmount(wallet.amount);
  }

  return (
    <div className={css()} data-testid={test()}>
      <div className={css('Title')}> 
        Send {wallet.address.symbol}
      </div>

      <form className={css('Inputs')} noValidate autoComplete="off">
        <TextField 
          className={css('AddressInput')} 
          id="address" 
          label="Address" 
          value={address} 
          onChange={handleAddressChange}
        />
        
        <span 
          className={css('AddressInputPaste')} 
          onClick={handleAddressPaste}
        >
            Paste
        </span>

        <TextField 
          className={css('AmountInput')} 
          id="amount" 
          label="Token amount" 
          value={amount} 
          onChange={handleAmountChange}
        />

        <span 
          className={css('AmountInputMax')} 
          onClick={handleAmountMaximise}
        >
          Max
        </span>
      
        <NumberFormat
          className={css('FiatAmount')}
          data-testid={test('FiatAmount')}
          value={amount*rate}
          displayType={'text'}
          thousandSeparator={true}
          prefix={'(= '}
          suffix={' $)'}
          decimalScale={2}
        />
      </form>

      <div className={css('Next')}>
        <button 
          className={css('NextButton')} 
          data-testid={test('Next')}
          onClick={() => onNextClick(address, amount)}
        >
          Next
        </button>
      </div>
    </div>
  )
};      