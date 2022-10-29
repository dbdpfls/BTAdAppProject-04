import React from "react";
import { useState, useContext, useEffect } from 'react';
import SwapFormHeader from "./SwapFormHeader";
import SwapFormInput from "./SwapFormInput";
import SwapButton from "./SwapButton";
import ThemeContext from "../../context/theme-context";
import type {TokenList} from "../../types";
import type {SelectedToken} from "../../types";
import ChainContext from "../../context/chain-context";
import Moralis from "moralis";
import {useTranslation} from "react-i18next";
import SwitchContext from "../../context/switch-context";
import SwitchButton from "./SwitchButton";
import { ethers } from 'ethers';
// import { getPrice, runSwap } from '../../AlphaRouterService'

declare let window: any;

type SwapFormProps = {
    tokenList: TokenList;
    isLogin: boolean;
    setIsLogin(val: boolean): void;
    setLoginModalOpen(val: boolean): void;
    openTransactionModal(val: boolean): void;
    getTxHash(hash: string): void;
    getErrorMessage(message: string): void;
    setMadeTx(val: boolean): void;
};

const SwapForm = ({
                      tokenList,
                      isLogin,
                      setIsLogin,
                      setLoginModalOpen,
                      openTransactionModal,
                      getTxHash,
                      getErrorMessage,
                      setMadeTx,
                  }: SwapFormProps): JSX.Element => {
    const {isLight} = useContext(ThemeContext);
    const {chain} = useContext(ChainContext);
    const {isSwitch} = useContext(SwitchContext);
    const {t} = useTranslation();
    const [firstToken, setFirstToken] = useState<SelectedToken>({decimals: 0});
    const [secondToken, setSecondToken] = useState<SelectedToken>({decimals: 0});
    const [firstAmount, setFirstAmount] = useState<number | undefined | string>();
    const [secondAmount, setSecondAmount] = useState<number | undefined | string>();
    const [gas, setGas] = useState<number | undefined | string>();

    const [provider, setProvider] = useState<any>();
    const [signer, setSigner] = useState<any>();
    const [signerAddress, setSignerAddress] = useState("");
    const [ratio, setRatio] = useState<number | undefined | string>();
    const [transaction, setTransaction] = useState({});

    useEffect(() => {
        onLoad();
    }, []);
        
    const onLoad = async () => {
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const signer = provider.getSigner();
        setSigner(signer);

        signer.getAddress()
        .then(address => {
            setSignerAddress(address);
        })
    };
      
    const makeSwap = async () => {

        // try {
        //     const swap = getPrice(
        //         firstAmount,
        //         1, //slippageAmount
        //         Math.floor(Date.now()/1000 + (5 * 60)), //deadline
        //         signerAddress
        //     ).then(data => {
        //         setTransaction(data[0]);
        //     })
        //
        //     console.log(transaction);
        // } catch (error) {
        //     let message;
        //     if (error instanceof Error) message = error.message;
        //     else message = String((error as Error).message);
        //     getErrorMessage(message);
        // }
        //
        // runSwap(transaction, signer); //스왑 호출

        setFirstAmount("");
        setSecondAmount("");
        setGas("");
        /* const amount = Number(Number(firstAmount) * 10 ** firstToken.decimals);
        const address = await Moralis.User.current()?.get("ethAddress");
        openTransactionModal(true);
        try {
            const res = await Moralis.Plugins.oneInch.swap({
                chain: chain,
                fromTokenAddress: firstToken.address,
                toTokenAddress: secondToken.address,
                amount,
                fromAddress: address,
                slippage: 1,
            });
            openTransactionModal(true);
            getTxHash(res.transactionHash);
            setMadeTx(true);
        } catch (error) {
            let message;
            if (error instanceof Error) message = error.message;
            else message = String((error as Error).message);
            getErrorMessage(message);
        } */
    };

    const getQuoteFirst = async (val: string) => {
        const amount = Number(Number(val) * 10 ** firstToken.decimals);
        setFirstAmount(val);
        if (amount === 0 || amount === undefined) {
            setFirstAmount("");
            setSecondAmount("");
            setGas(undefined);
            setTimeout(() => {
                if (secondAmount !== "") {
                    setSecondAmount("");
                }
            }, 300);
        } else if (firstToken.address && secondToken.address) {
            const quote = await Moralis.Plugins.oneInch.quote({
                chain, // The blockchain you want to use (eth/bsc/polygon)
                fromTokenAddress: firstToken.address, // The token you want to swap
                toTokenAddress: secondToken.address, // The token you want to receive
                amount,
            });
            setSecondAmount(quote.toTokenAmount / 10 ** quote.toToken.decimals);
            setGas(quote.estimatedGas);
        }
    };

    const getQuoteSecond = async (val: string) => {
        const amount = Number(Number(val) * 10 ** secondToken.decimals);
        setSecondAmount(val);
        if (amount === 0 || amount === undefined) {
            setFirstAmount("");
            setSecondAmount("");
            setGas(undefined);
            setTimeout(() => {
                if (firstAmount !== "") {
                    setFirstAmount("");
                }
            }, 300);
        } else if (firstToken.address && secondToken.address) {
            const quote = await Moralis.Plugins.oneInch.quote({
                chain, // The blockchain you want to use (eth/bsc/polygon)
                fromTokenAddress: secondToken.address, // The token you want to swap
                toTokenAddress: firstToken.address, // The token you want to receive
                amount,
            });
            setFirstAmount(quote.toTokenAmount / 10 ** quote.toToken.decimals);
            setGas(quote.estimatedGas);
        }
    };

    return (
        <form className={isLight ? styles.light : styles.dark}>
            <div className="w-full rounded-3xl p-2 select-none ">
                <SwapFormHeader/>
                {
                    isSwitch ?
                        <div>
                            <SwapFormInput
                                initial={true}
                                tokenList={tokenList}
                                choose={setFirstToken}
                                selected={firstToken}
                                getQuote={getQuoteFirst}
                                value={firstAmount}
                                changeValue={setFirstAmount}
                                changeCounterValue={setSecondAmount}
                            />
                            <div className={"flex justify-center items-center "}>
                            <SwitchButton></SwitchButton>
                            </div>
                            <SwapFormInput
                                tokenList={tokenList}
                                choose={setSecondToken}
                                selected={secondToken}
                                getQuote={getQuoteSecond}
                                value={secondAmount}
                                changeValue={setFirstAmount}
                                changeCounterValue={setFirstAmount}
                            />
                        </div>
                :
                    <div>
                        <SwapFormInput
                            tokenList={tokenList}
                            choose={setSecondToken}
                            selected={secondToken}
                            getQuote={getQuoteSecond}
                            value={secondAmount}
                            changeValue={setFirstAmount}
                            changeCounterValue={setFirstAmount}
                        />
                        <div className={"flex justify-center items-center "}>
                            <SwitchButton></SwitchButton>
                        </div>
                        <SwapFormInput
                            initial={true}
                            tokenList={tokenList}
                            choose={setFirstToken}
                            selected={firstToken}
                            getQuote={getQuoteFirst}
                            value={firstAmount}
                            changeValue={setFirstAmount}
                            changeCounterValue={setSecondAmount}
                        />
                    </div>
                }
                        

                {gas && (
                    <div className="w-full h-3 flex items-center justify-center py-4">
                        <div className="w-[95%] h-full flex items-center justify-end text-sm text-white font-semibold">
                            {t("swap_form.estimated")}
                            {gas}
                        </div>
                    </div>
                )}
                <SwapButton setLoginModalOpen={setLoginModalOpen} isLogin={isLogin} setIsLogin={setIsLogin} trySwap={makeSwap}/>
            </div>
        </form>
    );
};

const styles = {
    light: "border-2 border-orange-400 bg-orange-400 rounded-3xl h-90 w-11/12 sm:w-[500px]",
    dark: "border-2 border-blue-700 bg-blue-700 rounded-3xl h-90 w-11/12 sm:w-[500px]",
};

export default SwapForm;
