// tslint:disable: prettier max-line-length
import { AppBar, Backdrop, CircularProgress, IconButton, Toolbar, Tooltip } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { Button, Input } from '@mui/material'
import { Refresh, Menu } from '@mui/icons-material'
import { testIdBuilder } from 'shared/helpers/test'
import { useNavigate } from 'react-router-dom'
import { cn } from '@bem-react/classname'

import './DemoPage.scss'
import logo from 'assets/images/logo1.svg'

import { selectBackdrop, selectMinting, selectPrivateAmount, selectTokenAmount, selectWalletAddress } from 'wallet/state/demo.selectors'
import { demoActions } from 'wallet/state/demo.reducer'
import { DemoHeader } from 'wallet/components/DemoHeader/DemoHeader'
import { selectSeed } from 'wallet/state/wallet.selectors'
// tslint:enable: prettier max-line-length

export const componentId = 'DemoPage'

const css = cn(componentId)
const test = testIdBuilder(componentId)

export const DemoPage: React.FC<{}> = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const backdrop = useSelector(selectBackdrop)
  const minting = useSelector(selectMinting)
  const privateBalance = useSelector(selectPrivateAmount)
  const seed = useSelector(selectSeed)
  const tokenAmount = useSelector(selectTokenAmount)
  const walletAddress = useSelector(selectWalletAddress)

  const [mintAmount, setMintAmount] = useState('0')

  useEffect(() => {
    if (!seed) {
      navigate('/register')
      // navigate(0)
    } else {
      dispatch(demoActions.initApi(null))
    }
  }, [dispatch, seed])

  return (
    <div className={css('')} data-testid={test()} id={componentId}>
      <AppBar position="static" className={css('AppBar')}>
        <Toolbar className={css('Toolbar')}>
          <div className={css('ToolbarHeader')}>
            <IconButton
              color="inherit"
              aria-label="menu"
              edge="start"
              sx={{ padding: '12px' }}
            >
              <Menu />
            </IconButton>

            <div className={css('ToolbarHeaderItems')}>
              <Tooltip title="Update balances" placement="bottom">
                <IconButton
                  color="inherit"
                  onClick={() => dispatch(demoActions.updateBalances(null))}
                  sx={{ padding: '12px' }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <div className={css('ToolbarBody')}>
            <DemoHeader
              tokenAmount={tokenAmount}
              privateBalance={privateBalance}
              walletAddress={walletAddress}
            />
          </div>
        </Toolbar>
      </AppBar>

      <div className={css('Wrapper')}>
        <div>
          <Input
            id="mint-amount"
            className={css('Password')}
            sx={{ color: 'black' }}
            color="primary"
            classes={{ input: css('PasswordInput') }}
            inputProps={{ 'data-testid': test('Password'), maxLength: 20 }}
            onChange={(event) => setMintAmount(event.target.value)}
          />

          <Button
            color="primary"
            variant="contained"
            className={css('Button')}
            data-testid={test('Import')}
            disabled={minting === true || mintAmount === '0' || isNaN(+mintAmount)}
            onClick={() => dispatch(demoActions.mint(mintAmount))}
          >
            Mint
          </Button>
        </div>
      </div>

      <div className={css('Footer')}>
        <img src={logo} alt="ZeroPool" style={{ margin: 'auto' }} />
      </div>

      <Backdrop sx={{ color: '#fff', zIndex: 1000 }} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}
