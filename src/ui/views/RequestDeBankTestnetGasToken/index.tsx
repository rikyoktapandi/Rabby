import { PageHeader } from '@/ui/component';
import { useAccount } from '@/ui/store-hooks';
import { useWallet } from '@/ui/utils';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useAsync, useAsyncFn } from 'react-use';
import styled from 'styled-components';
import imgInfo from 'ui/assets/faucet/info.svg';
import imgDeBankTestnet from 'ui/assets/faucet/debank-testnet.svg';
import imgUsd from 'ui/assets/faucet/usd.svg';
import imgLoading from 'ui/assets/faucet/loading.svg';

import { Button, Skeleton, message } from 'antd';
import { ClaimRabbyBadgeModal } from '../Dashboard/components/ClaimRabbyBadgeModal';
import { CurrentAccount } from '@/ui/component/CurrentAccout';

const Wrapper = styled.div`
  min-height: 100vh;
  height: 100vh;
  background: #f0f2f5;
  overflow: hidden;
  position: relative;
  z-index: 1;
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 400px;
    height: 217px;
    background: #ff6238;
    z-index: -1;
  }
  .body {
    padding: 0 20px;
  }
  .title {
    color: #fff;
    text-align: center;
    font-family: Roboto;
    font-size: 17px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 448px;
    flex-shrink: 0;
    border-radius: 8px;
    background: #fff;
    padding: 24px;
    margin-top: 40px;

    &.mintedRabbyBadge {
      height: 508px;
      margin-top: 24px;
    }

    .tip {
      margin: 24px 0;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #192945;
      font-size: 13px;
      font-weight: 400;
    }

    .claimBtn {
      margin-bottom: 28px;
      width: 169px;
      height: 38px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0px 8px 24px 0px rgba(57, 75, 180, 0.2);
    }

    .faucetBox {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 28px;
      border-top: 0.5px solid #d3d8e0;
      padding-top: 24px;
      margin: 0 auto;

      img.title {
        width: 240px;
        height: 40px;
      }
      img.usd {
        margin-top: 30px;
        margin-bottom: 16px;
        width: 52px;
        height: 52px;
      }
      .value {
        color: #ff6238;
        text-align: center;
        font-family: Roboto;
        font-size: 24px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
      }
      .time {
        margin-top: 8px;
        color: #6a7587;
        text-align: center;
        font-family: Roboto;
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      .requestedTip {
        margin-top: 48px;
        color: #3e495e;
        text-align: center;
        font-size: 15px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      .requestBtn {
        margin-top: 32px;
        width: 184px;
        height: 42px;
        border-radius: 6px;
        background: #ff6238;
        box-shadow: 0px 8px 16px 0px rgba(250, 91, 91, 0.16);
        display: inline-flex;
        padding: 12px 64px;
        justify-content: center;
        align-items: center;
        gap: 4px;
        border-color: transparent;
        &.ant-btn-primary[disabled] {
          border-color: transparent;
          opacity: 0.6;
          box-shadow: 0px 8px 16px 0px rgba(250, 91, 91, 0.16);
        }
      }
    }
  }
`;

const RequestDeBankTestnetGasToken = () => {
  const { t } = useTranslation();
  const [currentAccount] = useAccount();
  const wallet = useWallet();

  const {
    value: mintInfo,
    loading: badgeHasMintedLoading,
  } = useAsync(async () => {
    return wallet.openapi.badgeHasMinted(currentAccount?.address || '');
  }, [currentAccount?.address]);

  const {
    value: hasRequested,
    loading: hasRequestedLoading,
  } = useAsync(async () => {
    if (currentAccount?.address) {
      return wallet.openapi.userHasRequestedFaucet({
        chain_id: 'tdbk',
        user_addr: currentAccount?.address,
      });
    }
    return { has_requested: false };
  }, [currentAccount?.address]);

  const [{ value, loading, error }, requestFaucet] = useAsyncFn(async () => {
    return wallet.openapi.requestFaucet({
      chain_id: 'tdbk',
      user_addr: currentAccount!.address,
    });
  }, [currentAccount?.address]);

  const [minted, setMinted] = useState(false);

  const [badgeModalVisible, setBadgeModalVisible] = useState(false);

  const onMinted = React.useCallback(() => {
    setMinted(true);
  }, []);

  const initLoading = badgeHasMintedLoading || hasRequestedLoading;

  const mintedRabbyBadge = minted || !!mintInfo?.has_minted;

  const requested =
    error?.message === 'already requested faucet' ||
    !!value?.is_success ||
    !!hasRequested?.has_requested;

  console.log('value', { value, loading, error });

  useEffect(() => {
    if (error?.message) {
      message.error(String(error?.message));
    }
  }, [error]);

  return (
    <Wrapper>
      <div className="header-bg" />
      <div className="body">
        <PageHeader className="pt-[24px]" invertBack>
          <span className="title">Request DeBank Testnet Gas Token</span>
          {/* {t('page.RequestDebankTestnetGasToken.title')} */}
        </PageHeader>

        {initLoading && (
          <Skeleton.Input
            active
            className="bg-gray-bg w-full h-[508px] rounded-[8px]"
          />
        )}

        <div
          className={clsx(
            'container',
            !mintedRabbyBadge && 'mintedRabbyBadge',
            initLoading && 'hidden'
          )}
        >
          <CurrentAccount />
          <div className="tip">
            <img src={imgInfo} className="w-16" />
            <span>Request available for Rabby Badge holders only</span>
          </div>
          {!mintedRabbyBadge && (
            <Button
              className="claimBtn"
              type="primary"
              block
              onClick={() => setBadgeModalVisible(true)}
            >
              Claim Rabby Badge
            </Button>
          )}
          <div className="faucetBox">
            <img src={imgDeBankTestnet} className="title" />
            <img src={imgUsd} className="usd" />
            <div className="value">0.1 USD</div>
            <div className="time">Per day</div>

            {requested ? (
              <div className="requestedTip">You have requested today</div>
            ) : (
              <Button
                block
                className="requestBtn"
                type="primary"
                disabled={!mintedRabbyBadge || loading}
                onClick={requestFaucet}
              >
                <span>Request</span>{' '}
                {loading && (
                  <img src={imgLoading} className="animate-spin w-14" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      <ClaimRabbyBadgeModal
        visible={badgeModalVisible}
        onCancel={() => {
          setBadgeModalVisible(false);
        }}
        onClaimed={onMinted}
      />
    </Wrapper>
  );
};

export default RequestDeBankTestnetGasToken;
