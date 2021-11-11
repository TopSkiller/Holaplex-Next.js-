import { Divider, Form, Row, Col, Space, Button } from 'antd';
import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { StepWizardChildProps } from 'react-step-wizard';
import styled from 'styled-components';
import GreenCheckIcon from '@/common/assets/images/green-check.svg';
import RedXClose from '@/common/assets/images/red-x-close.svg';
import Paragraph from 'antd/lib/typography/Paragraph';
import EmptySpinnerIcon from '@/common/assets/images/empty-spinner.svg';
import NavContainer from '@/modules/nfts/components/wizard/NavContainer';
import { Spinner } from '@/common/components/elements/Spinner';
import { Connection } from '@solana/web3.js';
import { actions } from '@metaplex/js';
import { MetadataFile, MetaDataContent } from 'pages/nfts/new';
import { Solana } from '@/modules/solana/types';

const APPROVAL_FAILED_CODE = 4001;
enum TransactionStep {
  SENDING_FAILED,
  APPROVAL_FAILED,
  APPROVING,
  SENDING,
  FINALIZING,
  SUCCESS,
}

interface Props extends Partial<StepWizardChildProps> {
  images: Array<File>;
  wallet: Solana;
  connection: Connection;
  metaDataFile: MetadataFile;
  metaDataContent: MetaDataContent;
  index: number;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
  row-gap: 16px;
  grid-template-rows: 100px 100px 100px 100px 100px;
`;

const StyledDivider = styled(Divider)`
  background-color: rgba(255, 255, 255, 0.1);
`;

const MintStep = ({
  text,
  isActive,
  isDone,
  failed,
}: {
  text: string;
  isActive: boolean;
  isDone: boolean;
  failed?: boolean;
}) => {
  let icon;

  if (isDone) {
    icon = <Image width={32} height={32} src={GreenCheckIcon} alt="green-check" />;
  } else if (isActive) {
    icon = <Spinner />;
  } else if (failed) {
    icon = <Image width={32} height={32} src={RedXClose} alt="red-x-close" />;
  } else {
    icon = <Image width={32} height={32} src={EmptySpinnerIcon} alt="green-check" />;
  }

  return (
    <Row style={{ marginBottom: 16 }}>
      <Space size={17}>
        {icon}
        <Paragraph
          style={{
            fontSize: 14,
            fontWeight: isActive ? 900 : 400,
            opacity: isActive ? 1 : 0.6,
            marginBottom: 6,
          }}
        >
          {text}
        </Paragraph>
      </Space>
    </Row>
  );
};

export default function MintInProgress({
  previousStep,
  goToStep,
  images,
  nextStep,
  isActive,
  metaDataFile,
  metaDataContent,
  wallet,
  connection,
  index,
}: Props) {
  const { mintNFT } = actions;

  const [transactionStep, setTransactionStep] = React.useState(TransactionStep.APPROVING);
  const [reset, setReset] = React.useState(false);

  const handleNext = useCallback(() => {
    setTransactionStep(TransactionStep.APPROVING);
    setReset(true);
    nextStep!();
  }, [nextStep, setTransactionStep]);

  const attemptMint = useCallback(() => {
    setTransactionStep(TransactionStep.APPROVING);
    mintNFT({
      connection,
      wallet,
      uri: metaDataFile.uri,
      maxSupply: metaDataContent.properties.maxSupply,
    })
      .then((mintResp) => {
        // TODO: How do we know if it's sending
        setTransactionStep(TransactionStep.FINALIZING);
        console.log('mintResp', mintResp);
        handleNext();
      })
      .catch((err) => {
        console.log('mintNFT err', err);
        if (err?.code === APPROVAL_FAILED_CODE) {
          setTransactionStep(TransactionStep.APPROVAL_FAILED);
        } else {
          setTransactionStep(TransactionStep.SENDING_FAILED);
        }
      });
  }, [metaDataFile, handleNext, metaDataContent, mintNFT, connection, wallet]);

  useEffect(() => {
    console.log('isActive', isActive);
    console.log('metadatacontent ', metaDataContent);
    console.log('metaDataFile', metaDataFile);
    if (isActive && metaDataFile && metaDataContent) {
      // console.log('!reset && index < 1', !reset && index < 1);
      // console.log('reset && index > 0', reset && index > 0);
      // if ((!reset && index < 1) || (reset && index > 0)) {
      console.log('index is now', index);
      attemptMint();
      // setReset(false);
      // }
    }
  }, [isActive, metaDataContent, attemptMint, metaDataFile, connection, reset, index]);

  return (
    <NavContainer
      title={`Minting ${index + 1} of ${images.length}`}
      previousStep={previousStep}
      goToStep={goToStep}
    >
      <Row>
        <Col style={{ marginRight: 224 }}>
          <Row>
            <Paragraph style={{ fontWeight: 900 }}>Progress</Paragraph>
          </Row>

          <Row style={{ marginTop: 37 }}>
            <Col style={{ minWidth: 237 }}>
              <MintStep
                text="Approving transaction"
                isActive={transactionStep === TransactionStep.APPROVING}
                isDone={transactionStep > TransactionStep.APPROVING}
                failed={transactionStep === TransactionStep.APPROVAL_FAILED}
              />
              <MintStep
                text="Sending transaction to Solana"
                isActive={transactionStep === TransactionStep.SENDING}
                isDone={transactionStep > TransactionStep.SENDING}
                failed={transactionStep === TransactionStep.SENDING_FAILED}
              />
              <MintStep
                text="Waiting for final confirmation"
                isActive={transactionStep === TransactionStep.FINALIZING}
                isDone={transactionStep === TransactionStep.SUCCESS}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 144 }}>
            {transactionStep === TransactionStep.SENDING_FAILED ||
              (transactionStep === TransactionStep.APPROVAL_FAILED && (
                <Paragraph style={{ fontSize: 14, color: '#D24040' }}>
                  {/* TODO: Show error */}
                  Mint #{index + 1} failed.
                </Paragraph>
              ))}
          </Row>
          <Row>
            <Space size={8}>
              <Button onClick={handleNext}>Skip</Button>
              <Button type="primary" onClick={attemptMint}>
                Try Again
              </Button>
            </Space>
          </Row>
        </Col>

        <StyledDivider type="vertical" style={{ margin: '0 46px', height: 500 }} />
        <Grid>
          {images.map((image) => (
            <Image
              width={100}
              height={100}
              src={URL.createObjectURL(image)}
              alt={image.name}
              unoptimized={true}
              key={image.name}
            />
          ))}
        </Grid>
      </Row>
    </NavContainer>
  );
}
