/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Trade } from '@pancakeswap/sdk'
import { Box } from '@pancakeswap/uikit'
// import { StyledBalanceMaxMini } from './styleds'

interface TradePriceProps {
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
  allowedSlippage: number
  swapIsUnsupported: boolean
  trade: Trade
}

export default function TradePrice({ showInverted, setShowInverted, allowedSlippage, swapIsUnsupported, trade }: TradePriceProps) {
  const formattedPrice = showInverted ? trade?.executionPrice?.toSignificant(6) : trade?.executionPrice?.invert()?.toSignificant(6)

  const show = Boolean(trade?.executionPrice?.baseCurrency && trade?.executionPrice?.quoteCurrency)
  const label = showInverted
    ? `${trade?.executionPrice?.quoteCurrency?.symbol} per ${trade?.executionPrice?.baseCurrency?.symbol}`
    : `${trade?.executionPrice?.baseCurrency?.symbol} per ${trade?.executionPrice?.quoteCurrency?.symbol}`

  return (
    <Box className={`token-price-wrap ${!swapIsUnsupported && Boolean(trade) ? 'open' : ''}`}>
      <Box className="token-price-row">
        {show ? (
        <><span className="label">Price</span><Box className="flex items-center">
            <span className="price"> {formattedPrice ?? '-'} {label} </span>
            <Box className="p-ripple swap-invert-trade-price ml-2" onClick={() => setShowInverted(!showInverted)}>
              <img src="images/img/icon-swap-transparent.13797e12.svg" />
              <span className="p-ink" />
            </Box>
          </Box></>
        ) : (
          '-'
        )}
      </Box>
      <Box className="token-price-row">
        <span className="label">Slippage Tolerance</span>
        <Box className="flex items-center">
          <span data-testid="best-rate-swap--price-impact" className="price-impact green"> {allowedSlippage / 100}% </span>
        </Box>
      </Box>
    </Box>
  )
}
