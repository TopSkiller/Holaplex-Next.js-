import styled from 'styled-components';
import Image from 'next/image';
import GreenCheckIcon from '@/common/assets/images/green-check.svg';
import RedXClose from '@/common/assets/images/red-x-close.svg';
import { MintStatus, NFTValue } from 'pages/nfts/new';

const CheckWrapper = styled.div`
  position: relative;
  height: 24px;
  width: 24px;
  top: -68px;
  right: -42px;
`;

const ImageOverlay = styled.div<{ isFinished?: boolean; isCurrent?: boolean }>`
  height: 120px;
  width: 120px;
  border-radius: 4px;
  padding: 4px;
  ${({ isCurrent }) => (isCurrent ? 'border: 2px solid #d24089;;' : null)}
  ${({ isFinished }) => (isFinished ? 'opacity: 0.5;' : null)}
`;

const StyledRemoveNFT = styled.div`
  position: absolute;
  top: -9px;
  right: 4px;
  display: none;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;

  &:hover {
    ${StyledRemoveNFT} {
      display: block;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${(props: { width: number }) => '1fr '.repeat(props.width)};
  grid-template-rows: min-content min-content;
  column-gap: 8px;
  row-gap: 16px;
  max-height: 500px;
`;

interface Props {
  images: Array<File>;
  index?: number;
  width?: number;
  removeImage?: (id: string) => void;
  children?: any;
  isMintStep?: boolean;
  nftValues?: NFTValue[];
}

const getOverlayStatus = (index: number, nftValues?: NFTValue[]) => {
  const nftValue = nftValues && nftValues[index];
  const showFailedOverlay = nftValue && nftValue.mintStatus === MintStatus.FAILED;

  return showFailedOverlay ? (
    <CheckWrapper>
      <Image width={24} height={24} src={RedXClose} alt="failed" />
    </CheckWrapper>
  ) : (
    <CheckWrapper>
      <Image width={24} height={24} src={GreenCheckIcon} alt="green-check" />
    </CheckWrapper>
  );
};

export const NFTPreviewGrid = ({
  images,
  index = -1,
  width = 2,
  removeImage,
  children,
  isMintStep,
  nftValues,
}: Props) => {
  return (
    <Grid width={width}>
      {images.map((image, i) => (
        <ImageOverlay key={image.name} isFinished={i < index} isCurrent={i === index}>
          {removeImage ? (
            <ImageContainer key={image.name}>
              <Image
                width={120}
                height={120}
                src={URL.createObjectURL(image)}
                objectFit="cover"
                alt={image.name}
                unoptimized={true}
              />
              <StyledRemoveNFT onClick={() => removeImage(image.name)}>
                <Image width={24} height={24} src={RedXClose} alt="remove-nft" />
              </StyledRemoveNFT>
            </ImageContainer>
          ) : (
            <Image
              width={120}
              height={120}
              src={URL.createObjectURL(image)}
              objectFit="cover"
              alt={image.name}
              unoptimized={true}
            />
          )}
          {i < index && getOverlayStatus(i, nftValues)}
        </ImageOverlay>
      ))}
      {children}
    </Grid>
  );
};
