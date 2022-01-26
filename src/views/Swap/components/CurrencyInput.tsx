/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/react-in-jsx-scope */
import { Box, ChevronDownIcon, useModal } from "@pancakeswap/uikit";
import { FC } from "react";
import { useCurrencyBalance } from "state/wallet/hooks";
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { Currency } from "@pancakeswap/sdk";
import { CurrencyLogo } from "components/Logo";
import SwapSearchModal from "./SwapSearchModal";

interface Props {
    title?: string
    currency?: Currency | null
    disableCurrencySelect?: boolean
    onCurrencySelect: (currency: Currency) => void
    otherCurrency?: Currency | null
    showCommonBases?: boolean
    disable?: boolean
    onChange: (value: string) => void,
    value: string
    // pair?: Pair | null
}


const CurrencyInput: FC<Props> = (props: Props) => {
    const { account } = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, props.currency ?? undefined)
    const { t } = useTranslation()

    const [onPresentCurrencyModal, _, setBackground] = useModal(
        <SwapSearchModal
            onCurrencySelect={props.onCurrencySelect}
            selectedCurrency={props.currency}
            otherSelectedCurrency={props.otherCurrency}
            showCommonBases={props.showCommonBases}
        />,
    )

    setBackground("rgba(0,0,0,0.5)");

    return <Box className="token-input-field-container" id="srcTokenInput" data-testid="token-a-input">
        <Box className="field-first-row">
            <span className="title">{props.title}</span>
            <span className="balance zero">
                {
                    t(
                        'Balance: %balance%',
                        {
                            balance: `${selectedCurrencyBalance?.toSignificant(6)} (~$0)` ?? t('Loading'),
                        }
                    )
                }
            </span>
        </Box>
        <Box className="field-wrap-input">
            <button type="button" className="token-toggle" onClick={() => {
                if (!props.disableCurrencySelect) {
                    onPresentCurrencyModal()
                }
            }}>
                <CurrencyLogo currency={props.currency} size="35px" style={{ marginRight: '0.5rem', borderRadius: 999 }} />
                <span className="symbol  mr-2">{(props.currency && props.currency.symbol && props.currency.symbol.length > 20
                    ? `${props.currency.symbol.slice(0, 4)}...${props.currency.symbol.slice(
                        props.currency.symbol.length - 5,
                        props.currency.symbol.length,
                    )}`
                    : props.currency?.symbol) || t('Select')}
                </span>
                {!props.disableCurrencySelect && <ChevronDownIcon />}
            </button>
            <Box className="flex relative w-full">
                <input
                    value={props.value}
                    onChange={(e) => {
                        props.onChange(e.target.value);
                    }}
                    type="number"
                    minLength={3}
                    maxLength={79}
                    disabled={props.disable}
                    spellCheck="false" placeholder="0.00" className="token-amount" />
                <span className="field-price-usd">~ $65,342.1</span>
            </Box>
        </Box>
    </Box>
}

export default CurrencyInput