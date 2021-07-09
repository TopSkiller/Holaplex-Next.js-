// @ts-nocheck 
import React from 'react';
import sv from '@/constants/Styles';
import styled from 'styled-components';
import { Label } from '@/constants/StyleComponents';

const Container = styled.div`
  ${sv.inputField};
`;

const Input = styled.input<{ hasRightText: boolean}>`
  flex: 1;
  width: 100%;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  height: 100%;
  text-align: ${props => props.hasRightText ? 'right' : 'left'};
  ::placeholder {
    color: ${sv.colors.cellDark};
  }
`;

const StyledLabel = styled(Label)`
  color: ${sv.colors.subtleText};
`;

const RootDomain = styled.div`
  margin-right: auto;
  font-size: ${sv.grid*3}px;
  color: ${sv.colors.subtleText};
`;

type Props = {
  label?: string,
  rootDomain?: string,
  value?: string,
  className?: string,
  placeholder?: string,
  onChange?: Function,
  meta?: object,
}

const TextInput = ({ rootDomain, label, value, onChange, placeholder, className, meta }: Props) => {
  const hasRightText = rootDomain || label
  return (
    <Container className={className}>
      {label && <StyledLabel noMargin>{label}</StyledLabel>}
      <Input
        hasRightText={hasRightText}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      {rootDomain && <RootDomain>{rootDomain}</RootDomain>}
    </Container>
  )
}

export default TextInput;
