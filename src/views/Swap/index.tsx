/* eslint-disable spaced-comment */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-useless-concat */
/* eslint-disable react/button-has-type */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-alert */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
// import styled from 'styled-components'
import { /*CurrencyAmount,*/ JSBI, Token, Trade } from '@pancakeswap/sdk'
import { Button, Text, Box, useModal } from '@pancakeswap/uikit'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import SwapWarningTokens from 'config/constants/swapWarningTokens'
import { GreyCard } from '../../components/Card'
import Column from '../../components/Layout/Column'
import ConfirmSwapModal from './components/ConfirmSwapModal'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
import { SwapCallbackError } from './components/styleds'
import TradePrice from './components/TradePrice'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
import ProgressSteps from './components/ProgressSteps'
import ConnectWalletButton from '../../components/ConnectWalletButton'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance, useUserSingleHopOnly, useThemeManager } from '../../state/user/hooks'
// import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import CircleLoader from '../../components/Loader/CircleLoader'
import Page from '../Page'
import SwapWarningModal from './components/SwapWarningModal'
import './styles.css'
import { ColorProvider } from './components/CustomComponent'
import CurrencyInput from './components/CurrencyInput'
import Carousel from './components/Carousel'

export default function Swap({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

  const { t } = useTranslation()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens)
    })

  const { account } = useActiveWeb3React()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, /*currencyBalances,*/ parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = showWrap
    ? {
      [Field.INPUT]: parsedAmount,
      [Field.OUTPUT]: parsedAmount,
    }
    : {
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    }

  const { onSwitchTokens, onCurrencySelection, onUserInput, /*onChangeRecipient*/ } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  // const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  // const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, t])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash])

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)
  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />)

  const shouldShowSwapWarning = (swapCurrency) => {
    const isWarningToken = Object.entries(SwapWarningTokens).find((warningTokenConfig) => {
      const warningTokenData = warningTokenConfig[1]
      return swapCurrency.address === warningTokenData.address
    })
    return Boolean(isWarningToken)
  }

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      const showSwapWarning = shouldShowSwapWarning(inputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(inputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },
    [onCurrencySelection],
  )

  // const handleMaxInput = useCallback(() => {
  //   if (maxAmountInput) {
  //     onUserInput(Field.INPUT, maxAmountInput.toExact())
  //   }
  // }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      const showSwapWarning = shouldShowSwapWarning(outputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(outputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },

    [onCurrencySelection],
  )

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => history.push('/swap/')} />,
  )

  useEffect(() => {
    if (importTokensNotInDefault.length > 0) {
      onPresentImportTokenWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTokensNotInDefault.length])

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      customOnDismiss={handleConfirmDismiss}
    />,
    true,
    true,
    'confirmSwapModal',
  )

  const [isDark] = useThemeManager()
  const [rate, setRate] = useState(25)

  const clickRateBtn = (rate: number) => () => {
    setRate(rate)
  }

  return (
    <ColorProvider mode={isDark ? "dark" : "light"}>
      <Page>
        <Box className="best-rate-swap-container">
          <Carousel />
          <Box className="best-rate-swap-box mb-3">
            <Box className="flex flex-col relative">
              <CurrencyInput
                onCurrencySelect={handleInputSelect}
                title="You Pay"
                currency={currencies[Field.INPUT]}
                otherCurrency={currencies[Field.OUTPUT]}
                onChange={handleTypeInput}
                value={formattedAmounts[Field.INPUT]}
              />
              <Box className="buttons flex self-center mt-5">
                <button className={`percentage-btn ${rate === 25 ? "active" : ""}`} onClick={clickRateBtn(25)}> 25% </button>
                <button className={`percentage-btn ${rate === 50 ? "active" : ""}`} onClick={clickRateBtn(50)}> 50% </button>
                <button className={`percentage-btn ${rate === 75 ? "active" : ""}`} onClick={clickRateBtn(75)}> 75% </button>
                <button className={`percentage-btn ${rate === 100 ? "active" : ""}`} onClick={clickRateBtn(100)}> 100% </button>
              </Box>
              <Box className="divider">
                <Box
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                >
                  <img src="/images/img/icon-swap.3ee250e0.svg" alt="Swap position token icon" className="circle-swap" />
                </Box>
              </Box>
              <CurrencyInput
                onCurrencySelect={handleOutputSelect}
                title="You Recieve"
                currency={currencies[Field.OUTPUT]}
                otherCurrency={currencies[Field.INPUT]}
                disable
                onChange={handleTypeOutput}
                value={formattedAmounts[Field.OUTPUT]}
              />

              <TradePrice
                showInverted={showInverted}
                setShowInverted={setShowInverted}
                trade={trade}
                swapIsUnsupported={swapIsUnsupported}
                allowedSlippage={allowedSlippage}
              />
              <Box mt="1rem">
                {swapIsUnsupported ? (
                  <Button width="100%" disabled mb="4px"  >
                    {t('Unsupported Asset')}
                  </Button>
                ) : !account ? (
                  <ConnectWalletButton width="100%" className=" submit-btn connect-wallet" />
                ) : showWrap ? (
                  <Button width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                    {wrapInputError ??
                      (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                  </Button>
                ) : noRoute && userHasSpecifiedInputOutput ? (
                  <GreyCard style={{ textAlign: 'center' }}>
                    <Text color="textSubtle" mb="4px">
                      {t('Insufficient liquidity for this trade.')}
                    </Text>
                    {singleHopOnly && (
                      <Text color="textSubtle" mb="4px">
                        {t('Try enabling multi-hop trades.')}
                      </Text>
                    )}
                  </GreyCard>
                ) : showApproveFlow ? (
                  <RowBetween>
                    <Button
                      variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                      onClick={approveCallback}
                      disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                      width="48%"
                    >
                      {approval === ApprovalState.PENDING ? (
                        <AutoRow gap="6px" justify="center">
                          {t('Enabling')} <CircleLoader stroke="white" />
                        </AutoRow>
                      ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                        t('Enabled')
                      ) : (
                        t('Enable %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
                      )}
                    </Button>
                    <Button
                      variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            txHash: undefined,
                          })
                          onPresentConfirmModal()
                        }
                      }}
                      width="48%"
                      id="swap-button"
                      disabled={
                        !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                      }
                    >
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? t('Price Impact High')
                        : priceImpactSeverity > 2
                          ? t('Swap Anyway')
                          : t('Swap')}
                    </Button>
                  </RowBetween>
                ) : (
                  <Button
                    variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          txHash: undefined,
                        })
                        onPresentConfirmModal()
                      }
                    }}
                    id="swap-button"
                    width="100%"
                    disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  >
                    {swapInputError ||
                      (priceImpactSeverity > 3 && !isExpertMode
                        ? `Price Impact Too High`
                        : priceImpactSeverity > 2
                          ? t('Swap Anyway')
                          : t('Swap'))}
                  </Button>
                )}
                {showApproveFlow && (
                  <Column style={{ marginTop: '1rem' }}>
                    <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                  </Column>
                )}
                {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
              </Box>
              <Box className="flex justify-center w-full">
                {swapIsUnsupported && <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />}
              </Box>
            </Box>
          </Box>
          <Box className={`best-rate-routing-box mt-3 mb-3 ${!swapIsUnsupported ? "" : "slide-down"}`}>
            <Box className="flex justify-center items-center routings-box-title-wrap">
              <p className="title"> Best Rate AI Routing </p>
              <Box className="tag-version-wrap">Pre-V2.0</Box>
            </Box>
            <p className="text-xs pt-2 best-rate-routing-box-footer"> The Best Rate AI Swap route is optimizing from split trades, multiple hops, and gas cost. </p>
          </Box>
          <Box className={`total-trading-volume-box mt-3 mb-3 ${!swapIsUnsupported ? "" : "slide-down"}`}>
            <Box className="flex items-center">
              <img src="images/img/icon-head-warden.a2f41f3f.svg" alt="Avatar warden icon" className="mr-2" />
              <p className="title">Total Trading Volume</p>
            </Box>
            <span className="volume-text">$4,108,125,662</span>
          </Box>
        </Box>
      </Page>
    </ColorProvider>
  )
}
