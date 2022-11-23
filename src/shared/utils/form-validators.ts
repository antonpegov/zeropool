import { validateSeed } from 'register/state/helpers/seed.helper'

export const accountIdValidator = {
  required: false,
}

export const accountIdValidatorNEAR = {
  required: 'Required',
  pattern: {
    value: /^(\w|(?<!\.)\.)+(?<!\.)\.(testnet|near)|[a-fA-F0-9]{64}$/,
    message: 'Invalid Near account id'
  },
  minLength:{
    value: 4,
    message: 'Near account id is too short'
  },
  maxLength:{
    value: 64,
    message: 'Near account id is too long'
  }
}

export const passwordValidator = {
  required: 'Required',
  pattern: {
    value: /^(?=.*?\d)(?=.*?[a-zA-Z])[a-zA-Z\d]+$/,
    message: 'Use letters and numbers',
  },
  minLength: {
    value: 8,
    message: 'Use at least 8 characters',
  },
}

export const seedValidator = {
  required: 'Required',
  validate: (value: string) => validateSeed(value.split(' ')),
}

export const confirmValidator = (getValues: () => any) => ({
  required: 'Required',
  validate: (value: string) => value === getValues().password,
})

export const chooseAccountIdValidator = (newtork: string) => {
  switch (newtork) {
    case 'near':
      return accountIdValidatorNEAR
    case 'ethereum':
      return accountIdValidator
    default:
      return accountIdValidator
  }
}
