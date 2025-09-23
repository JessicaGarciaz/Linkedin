import { useState, useEffect } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

function walletClientToSigner(walletClient: any): JsonRpcSigner {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);

  useEffect(() => {
    if (walletClient) {
      try {
        const newSigner = walletClientToSigner(walletClient);
        setSigner(newSigner);
      } catch (error) {
        console.error('Error creating signer:', error);
        setSigner(undefined);
      }
    } else {
      setSigner(undefined);
    }
  }, [walletClient]);

  return signer;
}