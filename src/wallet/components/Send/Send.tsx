import React from 'react';
import { cn } from '@bem-react/classname';

import './Send.scss';

import { testIdBuilder } from 'shared/helpers/test/test-id-builder.helper';

import { Wallet } from 'wallet/state/models/wallet';
import { TextField } from '@material-ui/core';

export const componentId = 'Send';

const css = cn(componentId);
const test = testIdBuilder(componentId);

export interface SendProps { 
  wallet: Wallet,
  onNextClick: (address: string, amount: number) => void,
}

export const Send: React.FC<SendProps> = (props) => {

  return (
    <div className={css()} data-testid={test()}>
      <div className={css('Title')}> 
        Send {props.wallet.address.symbol}
      </div>

      <form className={css('Inputs')} noValidate autoComplete="off">
        <TextField className={css('AddressInput')} id="address" label="Address" />

        <TextField className={css('AmountInput')} id="amount" label="Token amount" />
      </form>

      <div className={css('Next')}>
        <button className={css('NextButton')} onClick={() => props.onNextClick}>
          Next
        </button>
      </div>
    </div>
  )
};      