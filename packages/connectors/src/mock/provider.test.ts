import { beforeEach, describe, expect, it } from 'vitest'

import { getSigners } from '../../test'
import { Signer } from '../types'
import { MockProvider } from './provider'

describe('MockProvider', () => {
  let provider: MockProvider
  let signer: Signer
  beforeEach(() => {
    const signers = getSigners()
    signer = signers[0]!
    provider = new MockProvider({
      chainId: 1,
      signer,
    })
  })

  it('constructor', () => {
    expect(provider).toBeDefined()
  })

  describe('connect', () => {
    it('succeeds', async () => {
      const accounts = await provider.enable()
      const account = signer.account.address
      expect(accounts[0]).toEqual(account)
    })

    it('fails', async () => {
      const signers = getSigners()
      signer = signers[0]!
      const provider = new MockProvider({
        chainId: 1,
        flags: { failConnect: true },
        signer,
      })
      await expect(
        provider.enable(),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"User rejected request"`)
    })
  })

  it('disconnect', async () => {
    await provider.enable()
    await provider.disconnect()
    const accounts = await provider.getAccounts()
    expect(accounts[0]).toEqual(undefined)
  })

  describe('getAccounts', () => {
    it('disconnected', async () => {
      const accounts = await provider.getAccounts()
      expect(accounts[0]).toEqual(undefined)
    })

    it('connected', async () => {
      await provider.enable()
      const account = signer.account.address
      const connected = await provider.getAccounts()
      expect(connected[0]).toEqual(account)
    })
  })

  describe('getSigner', () => {
    it('disconnected', () => {
      try {
        provider.getSigner()
      } catch (error) {
        expect(error).toMatchInlineSnapshot(`[Error: Signer not found]`)
      }
    })

    it('connected', async () => {
      await provider.enable()
      const { uid, ...signer } = provider.getSigner()
      expect(signer).toMatchInlineSnapshot(`
        {
          "account": {
            "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "type": "json-rpc",
          },
          "addChain": [Function],
          "chain": {
            "blockExplorers": {
              "default": {
                "name": "Etherscan",
                "url": "https://etherscan.io",
              },
              "etherscan": {
                "name": "Etherscan",
                "url": "https://etherscan.io",
              },
            },
            "contracts": {
              "ensRegistry": {
                "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
              },
              "ensUniversalResolver": {
                "address": "0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da",
                "blockCreated": 16773775,
              },
              "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11",
                "blockCreated": 14353601,
              },
            },
            "id": 1,
            "name": "Ethereum",
            "nativeCurrency": {
              "decimals": 18,
              "name": "Ether",
              "symbol": "ETH",
            },
            "network": "homestead",
            "rpcUrls": {
              "default": {
                "http": [
                  "http://127.0.0.1:8545",
                ],
                "webSocket": [
                  "ws://127.0.0.1:8545",
                ],
              },
              "public": {
                "http": [
                  "http://127.0.0.1:8545",
                ],
                "webSocket": [
                  "ws://127.0.0.1:8545",
                ],
              },
            },
          },
          "deployContract": [Function],
          "getAddresses": [Function],
          "getChainId": [Function],
          "getPermissions": [Function],
          "key": "wallet",
          "name": "Wallet Client",
          "pollingInterval": 4000,
          "request": [Function],
          "requestAddresses": [Function],
          "requestPermissions": [Function],
          "sendTransaction": [Function],
          "signMessage": [Function],
          "signTypedData": [Function],
          "switchChain": [Function],
          "transport": {
            "key": "custom",
            "name": "Custom Provider",
            "request": [Function],
            "retryCount": 0,
            "retryDelay": 150,
            "timeout": undefined,
            "type": "custom",
          },
          "type": "walletClient",
          "watchAsset": [Function],
          "writeContract": [Function],
        }
      `)
    })
  })

  describe('switchChain', () => {
    it('succeeds', async () => {
      await provider.switchChain(4)
      expect(provider.chainId).toEqual(4)
    })

    it('fails', async () => {
      const provider = new MockProvider({
        chainId: 1,
        flags: { failSwitchChain: true },
        signer,
      })
      await expect(
        provider.switchChain(4),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"User rejected request"`)
    })
  })

  it('watchAsset', async () => {
    expect(
      await provider.watchAsset({
        address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        decimals: 18,
        symbol: 'UNI',
      }),
    ).toEqual(true)
  })
})
