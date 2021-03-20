import { push } from 'connected-react-router'
import { CoinType } from 'zeropool-api-js'
import { Epic, combineEpics } from 'redux-observable'
import { iif, Observable, of } from 'rxjs'
import { ActionType, isActionOf } from 'typesafe-actions'
import {
  switchMapTo,
  map,
  withLatestFrom,
  filter,
  switchMap,
  mergeMap,
  ignoreElements,
  tap,
  mapTo,
} from 'rxjs/operators'

import { Token, Rate } from 'shared/models'
import { handleEpicError } from 'shared/operators/handle-epic-error.operator'
import { filterActions } from 'shared/operators/filter-actions.operator'
import toast from 'shared/helpers/toast.helper'

import {
  getActiveToken,
  getActiveWallet,
  getPollSettings,
  getSeed,
  getSendData,
  getSupportedTokens,
  getWallets,
} from 'wallet/state/wallet.selectors'
import {
  getAllBalances,
  getNetworkFee,
  getWalletBalance,
  hdWallet,
  initHDWallet,
  transfer,
} from 'wallet/api/zeropool.api'
import { SendData, Wallet, WalletRecord, WalletView } from 'wallet/state/models'
import { mapRatesToTokens } from 'wallet/state/helpers/map-rates-to-tokens'
import { updateBalances } from 'wallet/state/helpers/update-balances.helper'
import { walletActions } from 'wallet/state/wallet.actions'
import { RatesApi } from 'wallet/api/rates.api'

import { RootState } from 'state'
import { getPayload } from 'shared/operators/get-payload.operator'
import { initBalances } from './helpers/init-balances.helper'

type Actions = ActionType<typeof walletActions>

const debug = false
const defaultAccount = 0
const nextWalletId = (wallets: WalletRecord, token: Token) =>
  wallets[token.symbol][wallets[token.symbol].length - 1].id + 1

const getRates$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filter(isActionOf(walletActions.getRates)),
    switchMapTo(
      (RatesApi.getRates() as Observable<Rate<Token>[]>).pipe(
        withLatestFrom(state$.pipe(map(getSupportedTokens))),
        map(([ratesData, tokens]) => mapRatesToTokens(ratesData, tokens)),
        map((rates) => walletActions.getRatesSuccess(rates))
      )
    ),
    handleEpicError(walletActions.getRatesError, debug)
  )

const redirectToTheWalletOnSetSeed$: Epic = (
  action$: Observable<Actions>,
  state$: Observable<RootState>
) => action$.pipe(filter(isActionOf(walletActions.setSeed)), switchMapTo(of(push('/wallet'))))

const resetAccount$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filter(isActionOf(walletActions.menu)),
    filter((action) => action.payload === WalletView.Reset),
    tap(() => toast.success('Wallet reseted and data cleared')),
    mergeMap(() => of(push('/welcome'), walletActions.resetAccount()))
  )

const initApi$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filterActions(walletActions.openBalanceView),
    withLatestFrom(state$.pipe(map(getSeed)), state$.pipe(map(getWallets))),
    switchMap(([, _seed, wallets]) =>
      iif(
        () => !!_seed,
        of(_seed).pipe(
          filter((seed): seed is string => typeof seed === 'string'),
          tap((seed) => initHDWallet(seed, [CoinType.ethereum, CoinType.near])), // TODO: take from supported tokens
          map(() => (!wallets ? walletActions.initWallets() : walletActions.updateWallets()))
        ),
        of(false).pipe(
          mergeMap(() => of(push('/welcome'), walletActions.setSeedError('Seed phrase not set')))
        )
      )
    ),
    handleEpicError(walletActions.setSeedError, debug)
  )

const initWallets$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filterActions(walletActions.initWallets),
    withLatestFrom(state$.pipe(map(getPollSettings)), state$.pipe(map(getSupportedTokens))),
    switchMap(([, settings, tokens]) =>
      getAllBalances(settings.amount).pipe(
        map((balances) => initBalances(hdWallet as any, balances, tokens)),
        mergeMap((wallets) =>
          of(walletActions.getRates(), walletActions.updateWalletsSuccess({ wallets }))
        )
      )
    ),
    handleEpicError(walletActions.updateWalletsError, debug)
  )

const updateWallets$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filterActions(walletActions.updateWallets),
    withLatestFrom(state$.pipe(map(getWallets)), state$.pipe(map(getSupportedTokens))),
    map(([, wallets, tokens]) => ({ wallets, tokens })),
    filter((value): value is { wallets: WalletRecord; tokens: Token[] } => !!value.wallets),
    switchMap(({ wallets, tokens }) => updateBalances(hdWallet as any, wallets, tokens)),
    tap(() => toast.success('Balances updated')),
    mergeMap((wallets) =>
      of(walletActions.getRates(), walletActions.updateWalletsSuccess({ wallets }))
    ),
    handleEpicError(walletActions.updateWalletsError, debug)
  )

// tslint:disable-next-line: one-variable-per-declaration
const addWallet$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filterActions(walletActions.addWallet),
    withLatestFrom(state$.pipe(map(getWallets)), state$.pipe(map(getActiveToken))),
    map(([, wallets, token]) => ({ wallets, token })),
    filter(
      (value): value is { wallets: WalletRecord; token: Token } => !!value.wallets && !!value.token
    ),
    switchMap(({ wallets, token }) =>
      getWalletBalance(token, nextWalletId(wallets, token)).pipe(
        map((balance) =>
          walletActions.addWalletSuccess({
            wallets: {
              ...wallets,
              [token.symbol]: [
                ...wallets[token.symbol],
                {
                  account: defaultAccount,
                  address: balance.address,
                  token: { ...token },
                  id: nextWalletId(wallets, token),
                  amount: +balance.balance,
                  name: `Wallet${token.symbol}${nextWalletId(wallets, token)}`,
                  private: false,
                },
              ],
            },
          })
        )
      )
    ),
    handleEpicError(walletActions.addWalletError, debug)
  )

const refreshAmounts$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filterActions(walletActions.updateWalletsSuccess),
    map(() => walletActions.refreshAmounts())
  )

const openSendConfirmView$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filter(isActionOf(walletActions.prepareSendConfirmView)),
    getPayload(),
    switchMap((payload) =>
      getNetworkFee(payload.wallet.token).pipe(
        map((fee) =>
          walletActions.openSendConfirmView({
            ...payload,
            fee: +fee.fee,
          })
        )
      )
    ),
    handleEpicError(walletActions.apiError, debug)
  )

const sendTransaction$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filterActions(walletActions.send),
    withLatestFrom(state$.pipe(map(getSendData)), state$.pipe(map(getActiveWallet))),
    map(([, sendData, wallet]) => ({ sendData, wallet })),
    filter(
      (value): value is { sendData: SendData; wallet: Wallet } => !!value.sendData && !!value.wallet
    ),
    switchMap(({ sendData, wallet }) =>
      transfer(wallet.id, sendData.address, sendData.amount, wallet.token).pipe(
        tap(() => toast.success('Transaction completed successfully')),
        mapTo(walletActions.openLogView(wallet))
      )
    ),
    handleEpicError(walletActions.apiError, debug)
  )

const handleErrorActions$: Epic = (action$: Observable<Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    filter(
      isActionOf([
        walletActions.addWalletError,
        walletActions.setSeedError,
        walletActions.updateWalletsError,
        walletActions.apiError,
      ])
    ),
    tap(({ payload }) => toast.error(payload)),
    ignoreElements()
  )

export const walletEpics: Epic = combineEpics(
  addWallet$,
  getRates$,
  initApi$,
  resetAccount$,
  redirectToTheWalletOnSetSeed$,
  initWallets$,
  updateWallets$,
  handleErrorActions$,
  refreshAmounts$,
  openSendConfirmView$,
  sendTransaction$
)
