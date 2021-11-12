import NavContainer from '@/modules/nfts/components/wizard/NavContainer';
import { Divider, Input, Form, FormInstance, Row } from 'antd';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StepWizardChildProps } from 'react-step-wizard';
import styled from 'styled-components';
import Button from '@/common/components/elements/Button';
import XCloseIcon from '@/common/assets/images/x-close.svg';
import GreenCheckIcon from '@/common/assets/images/green-check.svg';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { FormValues, MintDispatch, NFTAttribute, NFTFormValue } from 'pages/nfts/new';
import { StyledClearButton } from '@/modules/nfts/components/wizard/RoyaltiesCreators';
import Text from 'antd/lib/typography/Text';
import { NFTPreviewGrid } from '@/common/components/elements/NFTPreviewGrid';

interface Props extends Partial<StepWizardChildProps> {
  images: Array<File>;
  index: number;
  form: FormInstance;
  clearForm: () => void;
  currentImage: File;
  isLast: boolean;
  dispatch: MintDispatch;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: min-content min-content;
  width: 216px;
  column-gap: 16px;
  row-gap: 16px;
  max-height: 500px;
`;

const StyledDivider = styled(Divider)`
  background-color: rgba(255, 255, 255, 0.1);
  height: 500px;
  margin: 0 46px;
`;

const FormWrapper = styled.div`
  width: 413px;

  .ant-form-item-label {
    font-weight: 900;
  }

  .ant-form-item-control-input-content {
    input,
    textarea {
      border-radius: 4px;
    }
    input {
      height: 50px;
    }
  }
`;

const StyledButton = styled(Button)`
  background: #1a1a1a;
  border-radius: 4px;
  width: 39px;
  height: 50px;

  img {
    opacity: 0.5;
  }
`;

// TODO: Type the props
const AttributeClearButton = (props: any) => {
  return (
    <StyledButton {...props} noStyle={true}>
      <Image width={24} height={24} src={XCloseIcon} alt="remove-attribute" />
    </StyledButton>
  );
};

const ButtonFormItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    flex-direction: row-reverse;
  }
`;

const CheckWrapper = styled.div`
  position: relative;
  height: 24px;
  width: 24px;
  top: -68px;
  right: -42px;
`;

const ImageOverlay = styled.div<{ isFinished?: boolean; isCurrent?: boolean }>`
  height: 108px;
  width: 108px;
  border-radius: 4px;
  padding: 4px;
  ${({ isCurrent }) => (isCurrent ? 'border: 2px solid #d24089;;' : null)}
  ${({ isFinished }) => (isFinished ? 'opacity: 0.5;' : null)}
`;

export default function InfoScreen({
  previousStep,
  goToStep,
  images,
  index,
  nextStep,
  form,
  isActive,
  clearForm,
  isLast,
  dispatch,
  currentImage,
}: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const { TextArea } = Input;
  const nftNumber = `nft-${index}`;
  const nftNumberList = images.map((_, i) => `nft-${i}`);
  // useEffect(() => {
  //   if (isActive) {
  //     // const current = form.getFieldValue(nftNumber);
  //     // current.imageName = currentImage.name;
  //     // console.log('CURRENT IMAGE IS ', currentImage.name);
  //     // console.log('DEBUG CURRENT IS', current);
  //     // console.log('nftnumber is ', nftNumber);
  //     // form.setFieldsValue({ nftNumber: current });
  //   }
  // }, [isActive]);

  const values = form.getFieldsValue(nftNumberList) as FormValues;
  const previousNft: NFTFormValue | undefined = values[`nft-${index - 1}`];

  const handleNext = () => {
    const DUPLICATE_ATTRIBUTE_TYPE_ERROR = 'Duplicate attributes';
    form
      .validateFields([
        [nftNumber, 'name'],
        [nftNumber, 'attributes'],
      ])
      .then((v2: { [nftN: string]: { name: string; attributes: NFTAttribute[] } }) => {
        setErrors([]);

        const traitTypes = v2[nftNumber].attributes.map((a) => a.trait_type);
        const indexOfDuplicate = traitTypes.findIndex((a, i) => traitTypes.indexOf(a) !== i);

        if (indexOfDuplicate !== -1) {
          throw new Error(DUPLICATE_ATTRIBUTE_TYPE_ERROR);
        }

        if (isLast) {
          const arrayValues = Object.values(values).filter((v) => v !== undefined);
          console.log('array values are ', arrayValues);
          dispatch({ type: 'SET_FORM_VALUES', payload: arrayValues });

          // .then((values: FormValues) => {
          //   console.log('VALUES', values);
          //   const arrayValues = Object.values(values).filter((v) => v !== undefined);
          //   console.log('array values are ', arrayValues);
          //   dispatch({ type: 'SET_FORM_VALUES', payload: arrayValues });
          // })
          // .catch((err) => {
          //   console.log('err', err);
          // });
          // form.submit();
        }
        nextStep!();
      })
      .catch((errorInfo) => {
        if (errorInfo?.message === DUPLICATE_ATTRIBUTE_TYPE_ERROR) {
          setErrors(['Identical attribute types are not allowed']);
        } else {
          console.error(errorInfo);
        }
      });
  };

  const AttributeRow = ({
    remove,
    fieldsLength,
    field,
  }: {
    remove: (index: number | number[]) => void;
    fieldsLength: number;
    field: FormListFieldData;
  }) => (
    <Input.Group style={{ marginBottom: 18, display: 'flex', flexDirection: 'row' }}>
      <Form.Item name={[field.name, 'trait_type']}>
        <Input style={{ width: 178, marginRight: 10, borderRadius: 4 }} placeholder="e.g. Color" />
      </Form.Item>
      <Form.Item name={[field.name, 'value']}>
        <Input style={{ width: 178, marginRight: 8, borderRadius: 4 }} placeholder="e.g. Green" />
      </Form.Item>
      {fieldsLength > 1 && <AttributeClearButton onClick={() => remove(field.name)} />}
    </Input.Group>
  );

  return isActive ? (
    <NavContainer
      title={`Info for #${index + 1} of ${images.length}`}
      previousStep={previousStep}
      goToStep={goToStep}
      clearForm={clearForm}
    >
      <Row>
        <FormWrapper>
          <Form.Item name={`nft-${0}`}>
            <Form.Item
              name={[nftNumber, 'name']}
              initialValue={images[index]?.name || ''}
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="required" autoFocus />
            </Form.Item>
            <Form.Item
              name={[nftNumber, 'description']}
              label="Description"
              initialValue={previousNft ? previousNft.description : ''}
            >
              <TextArea placeholder="optional" autoSize={{ minRows: 3, maxRows: 8 }} />
            </Form.Item>
            <Form.Item
              name={[nftNumber, 'collection']}
              label="Collection"
              initialValue={previousNft ? previousNft.collection : ''}
            >
              <Input placeholder="e.g. Stylish Studs (optional)" />
            </Form.Item>
            <Form.Item
              label="Attributes"
              rules={[
                {
                  message: 'All attributes must be unique',
                  async validator(rule, value) {
                    console.log('Rule', {
                      rule,
                      value,
                    });
                  },
                },
              ]}
            >
              <Form.List
                name={[nftNumber, 'attributes']}
                initialValue={
                  previousNft
                    ? previousNft?.attributes.map((a) => ({
                        trait_type: a.trait_type,
                        value: undefined,
                      }))
                    : [{ trait_type: undefined, value: undefined }]
                }
              >
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <AttributeRow
                        key={field.key}
                        remove={remove}
                        fieldsLength={fields.length}
                        field={field}
                      />
                    ))}
                    {fields.length < 10 && (
                      <StyledClearButton onClick={() => add()} type="default" noStyle={true}>
                        Add Attribute
                      </StyledClearButton>
                    )}
                    <div>
                      <Text type="danger">{errors}</Text>
                    </div>
                  </>
                )}
              </Form.List>
            </Form.Item>
            <ButtonFormItem style={{ marginTop: 42 }}>
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            </ButtonFormItem>
          </Form.Item>
        </FormWrapper>
        <StyledDivider type="vertical" />
        <NFTPreviewGrid images={images} index={index} width={2} />
      </Row>
    </NavContainer>
  ) : null;
}
